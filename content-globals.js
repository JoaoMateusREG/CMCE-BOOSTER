console.log('CMCE BOOSTER - Content script carregado');

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
// Busca CNS/CPF
let botoesInjetados = false;

// Monitor de elementos
let notificacaoAtual = null;
let timeoutVerificacao = null;
let fechadaManualmente = false;
let mensagemAtual = null;

// Remoção de carregamento
let removerAtivo = false;

// Controle de verificação de histórico
let processandoHistorico = false;
let ultimoItemVerificado = null;
let notificacaoPersistente = false;
let dadosHistoricoBrutos = [];

// Controle de Bloqueios (Vila Uruçuba / Cidade / Duplicidade)
let isPacienteVilaUrucuba = false;
let isPacienteCidadeInvalida = false;
let isDuplicidade = false;

// Controle de Pesquisa
window.cidadaosIncompletos = new Set();

// Controle de bloqueio CID → Hipótese/Informação
let cidPrincipalPreenchido = false;
let observerCidAtivo = false;
let codigoCidAtual = '';       // Código CID atualmente confirmado (ex: "A123")
let descricaoCidAtual = '';    // Descrição inserida nos campos (para find/replace)

// Pré Diagnósticos
let prediagnosticosGlobais = [];

chrome.storage.local.get('prediagnosticosCustomizados', (data) => {
  prediagnosticosGlobais = data.prediagnosticosCustomizados || [];
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.prediagnosticosCustomizados) {
    prediagnosticosGlobais = changes.prediagnosticosCustomizados.newValue || [];
  }
});

// Injeta o interceptor de rede para capturar JSONs do sistema
function injetarInterceptor() {
  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('interceptor.js');
    (document.head || document.documentElement).appendChild(script);
    script.onload = () => script.remove();
  } catch (e) {
    console.error('CMCE BOOSTER - Erro ao injetar interceptor:', e);
  }
}

// Escuta os dados do histórico vindos do interceptor (interceptor.js -> window -> content.js)
window.addEventListener('CMCE_HISTORY_DATA', (event) => {
  dadosHistoricoBrutos = event.detail;
  console.log('CMCE BOOSTER - Dados brutos do histórico capturados:', dadosHistoricoBrutos.length, 'itens');
});

window.addEventListener('CMCE_CIDADAO_DATA', (event) => {
  isDuplicidade = false;
  const dados = event.detail;
  
  if (dados && dados.logradouro && dados.logradouro.toUpperCase().includes('VILA URUÇUBA')) {
    isPacienteVilaUrucuba = true;
  } else {
    isPacienteVilaUrucuba = false;
  }

  let cidade = '';
  if (dados && dados.municipio && dados.municipio.descricaoMunicipio) {
    cidade = dados.municipio.descricaoMunicipio.toUpperCase();
  } else if (dados && dados.cidade) {
    cidade = dados.cidade.toUpperCase();
  }
  
  if (cidade && !cidade.includes('LIMOEIRO')) {
    isPacienteCidadeInvalida = true;
  } else {
    isPacienteCidadeInvalida = false;
  }

  verificarBloqueios(true);
});

window.addEventListener('CMCE_PESQUISA_CIDADAO', (event) => {
  const data = event.detail;
  if (data && data.content && Array.isArray(data.content)) {
    window.cidadaosIncompletos.clear();
    data.content.forEach(c => {
      let isInc = false;
      
      // Regras de incompletude garantidas pelo payload
      if (!c.cpf) isInc = true;
      if (!c.cartaoSus) isInc = true;
      if (!c.tipoLogradouro) isInc = true;
      if (c.logradouro && c.logradouro.toUpperCase().includes('VILA URUÇUBA')) isInc = true;
      if (c.municipio && c.municipio.descricaoMunicipio && !c.municipio.descricaoMunicipio.toUpperCase().includes('LIMOEIRO')) isInc = true;
      
      // Regras dinâmicas (se os campos existirem no JSON)
      if ('raca' in c && !c.raca) isInc = true;
      if ('racaCor' in c && !c.racaCor) isInc = true;
      if ('naturalidade' in c && !c.naturalidade) isInc = true;
      if ('telefoneCelular' in c && !c.telefoneCelular) isInc = true;
      if ('celular' in c && !c.celular) isInc = true;
      
      if (isInc) {
        window.cidadaosIncompletos.add(String(c.id));
      }
    });
  }
});

// Inicializa a injeção
injetarInterceptor();
