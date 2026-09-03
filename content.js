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

// ============================================
// FUNCIONALIDADE 1: BUSCA CNS/CPF
// ============================================
function verificarFormulario() {
  const botaoAdicionarFoto = document.querySelector('button.btn-add-foto');
  
  if (botaoAdicionarFoto && !botoesInjetados) {
    console.log('Formulário detectado! Injetando botões...');
    injetarBotoes();
    botoesInjetados = true;
  } else if (!botaoAdicionarFoto && botoesInjetados) {
    const container = document.getElementById('cmce-booster-buttons');
    if (container) {
      container.remove();
      botoesInjetados = false;
      // Reseta controle de bloqueio CID ao sair do formulário
      observerCidAtivo = false;
      cidPrincipalPreenchido = false;
      codigoCidAtual = '';
      descricaoCidAtual = '';
      console.log('Formulário fechado, botões removidos');
    }
  }
}

function injetarBotoes() {
  const container = document.createElement('div');
  container.id = 'cmce-booster-buttons';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: white;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  // Botão de fechar (X)
  const btnFechar = document.createElement('button');
  btnFechar.textContent = '✕';
  btnFechar.style.cssText = `
    position: absolute;
    top: -8px;
    right: -8px;
    width: 20px;
    height: 20px;
    padding: 0;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 10px;
    font-weight: bold;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  `;
  btnFechar.onmouseover = () => btnFechar.style.background = '#d32f2f';
  btnFechar.onmouseout = () => btnFechar.style.background = '#f44336';
  btnFechar.onclick = () => {
    container.remove();
    botoesInjetados = false;
    console.log('Botões removidos manualmente');
  };
  
  // Botão Buscar CNS
  const btnBuscarCNS = document.createElement('button');
  btnBuscarCNS.textContent = 'Buscar CNS';
  btnBuscarCNS.style.cssText = `
    padding: 8px 16px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  `;
  btnBuscarCNS.onmouseover = () => btnBuscarCNS.style.background = '#1565c0';
  btnBuscarCNS.onmouseout = () => btnBuscarCNS.style.background = '#1976d2';
  btnBuscarCNS.onclick = () => buscarCNS();
  
  // Botão Buscar CPF
  const btnBuscarCPF = document.createElement('button');
  btnBuscarCPF.textContent = 'Buscar CPF';
  btnBuscarCPF.style.cssText = `
    padding: 8px 16px;
    background: #058d49;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  `;
  btnBuscarCPF.onmouseover = () => btnBuscarCPF.style.background = '#047a3f';
  btnBuscarCPF.onmouseout = () => btnBuscarCPF.style.background = '#058d49';
  btnBuscarCPF.onclick = () => buscarCPF();
  
  // Botão Preencher Completo
  const btnPreencherCompleto = document.createElement('button');
  btnPreencherCompleto.textContent = 'Preencher Completo';
  btnPreencherCompleto.style.cssText = `
    padding: 8px 16px;
    background: #d32f2f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  `;
  btnPreencherCompleto.onmouseover = () => btnPreencherCompleto.style.background = '#c62828';
  btnPreencherCompleto.onmouseout = () => btnPreencherCompleto.style.background = '#d32f2f';
  btnPreencherCompleto.onclick = () => preencherCompleto();
  
  container.appendChild(btnFechar);
  container.appendChild(btnBuscarCNS);
  container.appendChild(btnBuscarCPF);
  container.appendChild(btnPreencherCompleto);
  
  document.body.appendChild(container);
  console.log('Botões injetados com sucesso!');
}

function preencherCampoExtracao(seletor, valor) {
    const input = document.querySelector(seletor);
    if (!input) return false;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    input.focus();
    nativeInputValueSetter.call(input, valor);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
    input.blur();
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    return true;
}

function preencherMotivoExtrato(valor) {
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    
    const hipotese = document.querySelector('textarea[controllabel="Hipótese Diagnóstica"]');
    if (hipotese) {
        hipotese.focus();
        const espaco = hipotese.value ? '\n\n' : '';
        nativeTextAreaValueSetter.call(hipotese, hipotese.value + espaco + valor);
        hipotese.dispatchEvent(new Event('input', { bubbles: true }));
        hipotese.dispatchEvent(new Event('change', { bubbles: true }));
        hipotese.blur();
    }
    
    const info = document.querySelector('textarea[controllabel="Informação Complementar"]');
    if (info) {
        info.focus();
        const espaco = info.value ? '\n\n' : '';
        nativeTextAreaValueSetter.call(info, info.value + espaco + valor);
        info.dispatchEvent(new Event('input', { bubbles: true }));
        info.dispatchEvent(new Event('change', { bubbles: true }));
        info.blur();
    }
}

function preencherCidExtrato(cid) {
    const seletor = 'p-inputmask[controllabel="CID principal"] input';
    const input = document.querySelector(seletor);
    if (input) {
        preencherCampoExtracao(seletor, cid);
        input.focus();
        input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Tab', code: 'Tab', keyCode: 9 }));
        // Verifica CID após preenchimento programático para desbloquear hipótese/informação
        setTimeout(() => verificarCidPrincipalPreenchido(), 1000);
    } else {
        alert('Campo CID não encontrado');
    }
}

function preencherCampoDataExtrato(dataStr) {
    const dataNascInput = document.querySelector('mvcommons-calendar[controllabel="Data de nascimento"] input') || 
                          document.querySelector('mvcommons-calendar[controllabel="Nascimento"] input');
    if (!dataNascInput) {
        alert('Campo de data não encontrado');
        return;
    }
    dataNascInput.focus();
    dataNascInput.value = '';
    dataNascInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    let i = 0;
    function digitarProximoCaractere() {
        if (i < dataStr.length) {
            const char = dataStr[i];
            dataNascInput.value += char;
            dataNascInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: char, code: 'Key' + char.toUpperCase() }));
            dataNascInput.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: char, code: 'Key' + char.toUpperCase() }));
            dataNascInput.dispatchEvent(new Event('input', { bubbles: true }));
            dataNascInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: char, code: 'Key' + char.toUpperCase() }));
            i++;
            setTimeout(digitarProximoCaractere, 15);
        } else {
            dataNascInput.dispatchEvent(new Event('change', { bubbles: true }));
            dataNascInput.blur();
            dataNascInput.dispatchEvent(new Event('blur', { bubbles: true }));
        }
    }
    digitarProximoCaractere();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'inserir_cpf') {
        const valorLimpo = request.valor.replace(/\D/g, '');
        if (valorLimpo.length <= 11) {
            // É CPF
            const seletorCpf = 'p-inputmask[controllabel="CPF"] input, p-inputmask[formcontrolname="cpf"] input, input[formcontrolname="cpf"]';
            const preencheu = preencherCampoExtracao(seletorCpf, valorLimpo);
            if (!preencheu) alert('Campo CPF não encontrado na página.');
        } else {
            // É CNS
            const seletorCns = 'p-inputmask[controllabel="Cartão SUS"] input, p-inputmask[formcontrolname="cartaoSus"] input, input[formcontrolname="cns"]';
            const preencheu = preencherCampoExtracao(seletorCns, valorLimpo);
            if (!preencheu) alert('Campo Cartão SUS (CNS) não encontrado na página.');
        }
    } else if (request.action === 'inserir_nome') {
        if(!preencherCampoExtracao('input[controllabel="Cidadão"]', request.valor)) {
            preencherCampoExtracao('input[controllabel="Nome Completo"]', request.valor);
        }
    } else if (request.action === 'inserir_data') {
        preencherCampoDataExtrato(request.valor);
    } else if (request.action === 'inserir_cid') {
        preencherCidExtrato(request.valor);
    } else if (request.action === 'inserir_profissional') {
        const dadosProf = request.valor; // { nome, crm }
        const textoParaInserir = dadosProf.nome + (dadosProf.crm ? ' - ' + dadosProf.crm : '');
        
        const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        
        const hipotese = document.querySelector('textarea[controllabel="Hipótese Diagnóstica"]');
        if (hipotese) {
            const espaco = hipotese.value ? '\n' : '';
            nativeTextAreaValueSetter.call(hipotese, hipotese.value + espaco + textoParaInserir);
            hipotese.dispatchEvent(new Event('input', { bubbles: true }));
            hipotese.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        const info = document.querySelector('textarea[controllabel="Informação Complementar"]');
        if (info) {
            const espaco = info.value ? '\n' : '';
            nativeTextAreaValueSetter.call(info, info.value + espaco + textoParaInserir);
            info.dispatchEvent(new Event('input', { bubbles: true }));
            info.dispatchEvent(new Event('change', { bubbles: true }));
        }
    } else if (request.action === 'inserir_motivo') {
        preencherMotivoExtrato(request.valor);
    }
});

function buscarCNS() {
  console.log('Buscar CNS clicado');
  const cpfInput = document.querySelector('p-inputmask[controllabel="CPF"] input');
  if (cpfInput && cpfInput.value) {
    const cpfValue = cpfInput.value.replace(/\D/g, '');
    try {
      chrome.runtime.sendMessage({ action: 'buscarCNS', valor: cpfValue });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro: Recarregue a página e tente novamente');
    }
  } else {
    alert('CPF não encontrado no formulário');
  }
}

function buscarCPF() {
  console.log('Buscar CPF clicado');
  const cnsInput = document.querySelector('p-inputmask[controllabel="CNS"] input');
  if (cnsInput && cnsInput.value) {
    const cnsValue = cnsInput.value.replace(/\D/g, '');
    try {
      chrome.runtime.sendMessage({ action: 'buscarCPF', valor: cnsValue });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro: Recarregue a página e tente novamente');
    }
  } else {
    alert('CNS não encontrado no formulário');
  }
}

function preencherCompleto() {
  console.log('Preencher Completo clicado');
  
  const cpfInput = document.querySelector('p-inputmask[controllabel="CPF"] input');
  if (cpfInput && cpfInput.value && cpfInput.value.trim()) {
    const cpfValue = cpfInput.value.replace(/\D/g, '');
    buscarDadosCompletos(cpfValue);
    return;
  }
  
  const cnsInput = document.querySelector('p-inputmask[controllabel="CNS"] input');
  if (cnsInput && cnsInput.value && cnsInput.value.trim()) {
    const cnsValue = cnsInput.value.replace(/\D/g, '');
    buscarDadosCompletos(cnsValue);
    return;
  }
  
  alert('CPF ou CNS não encontrado no formulário');
}

function buscarDadosCompletos(valor) {
  try {
    chrome.runtime.sendMessage({ action: 'preencherCompleto', valor: valor });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    alert('Erro: Recarregue a página e tente novamente');
  }
}

function preencherDadosNoFormulario(dados) {
  // Helper para preencher inputs de forma que o Angular reconheça
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  
  function preencherInput(input, valor) {
    if (!input || !valor) return;

    const valorAtual = (input.value || '').trim().toUpperCase();
    const valorNovo = String(valor).trim().toUpperCase();
    const apenasNumAtual = valorAtual.replace(/\D/g, '');
    const apenasNumNovo = valorNovo.replace(/\D/g, '');

    if (valorAtual === valorNovo) return;
    if (apenasNumNovo.length >= 8 && apenasNumAtual === apenasNumNovo) return;

    input.focus();
    nativeInputValueSetter.call(input, valor);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
    input.blur();
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  // CPF
  if (dados.cpf) {
    const cpfInput = document.querySelector('p-inputmask[controllabel="CPF"] input');
    preencherInput(cpfInput, dados.cpf);
  }
  
  // CNS
  if (dados.cns) {
    const cnsInput = document.querySelector('p-inputmask[controllabel="CNS"] input');
    preencherInput(cnsInput, dados.cns);
  }
  
  // Nome Completo
  if (dados.nome) {
    const nomeInput = document.querySelector('input[controllabel="Nome Completo"]');
    preencherInput(nomeInput, dados.nome);
  }
  
  // Nome da Mãe
  if (dados.nomeMae) {
    const nomeMaeInput = document.querySelector('input[controllabel="Nome da mãe"]');
    preencherInput(nomeMaeInput, dados.nomeMae);
  }
  

  
  // Sexo
  if (dados.sexo) {
    const sexoValue = dados.sexo.toUpperCase().includes('MASCULINO') ? '1' : '2';
    const sexoRadios = document.querySelectorAll('p-radiobutton[name="sexo"] input[type="radio"]');
    sexoRadios.forEach(radio => {
      if (radio.value === sexoValue && !radio.checked) {
        radio.click();
      }
    });
  }
  
  // Estrangeiro - sempre "Não"
  const estrangeiroRadios = document.querySelectorAll('p-radiobutton[name="flagEstrangeiro"] input[type="radio"]');
  estrangeiroRadios.forEach(radio => {
    if (radio.value === '0' && !radio.checked) {
      radio.click();
    }
  });
  
  // Raça/Cor - BRANCA
  setTimeout(() => {
    const racaCorDropdown = document.querySelector('mvcommons-dropdown[controllabel="Raça cor"] p-dropdown');
    if (racaCorDropdown) {
      const currentLabel = racaCorDropdown.querySelector('.ui-dropdown-label');
      if (currentLabel && currentLabel.textContent.trim() === 'BRANCA') {
        return;
      }
      const dropdownDiv = racaCorDropdown.querySelector('.ui-dropdown');
      if (dropdownDiv) {
        dropdownDiv.click();
        
        setTimeout(() => {
          const brancaOption = Array.from(document.querySelectorAll('.ui-dropdown-item')).find(el => 
            el.textContent.trim() === 'BRANCA'
          );
          if (brancaOption) {
            brancaOption.click();
          }
        }, 300);
      }
    }
  }, 500);

  // CEP - 55700-000 se vazio
  setTimeout(() => {
    const cepInput = document.querySelector('p-inputmask[controllabel="CEP"] input');
    if (cepInput && (!cepInput.value || cepInput.value.trim() === '')) {
      preencherInput(cepInput, '55700-000');
    }

    // Limpar campos de Logradouro e Bairro logo após preencher o CEP
    setTimeout(() => {
      function limparCampo(seletor) {
        const el = document.querySelector(seletor);
        if (el) {
          nativeInputValueSetter.call(el, '');
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      
      limparCampo('input[controllabel="Logradouro"]');
      limparCampo('input[controllabel="Bairro"]');
    }, 300); // Delay curto para o Angular
  }, 500);

  // ============================================
  // Data de Nascimento - PREENCHIMENTO POR ÚLTIMO
  // ============================================
  // Esperamos todos os outros campos serem preenchidos e o Angular estabilizar,
  // depois simulamos a digitação caractere a caractere para enganar o p-calendar.
  if (dados.dataNascimento) {
    setTimeout(() => {
      const dataNascInput = document.querySelector('mvcommons-calendar[controllabel="Nascimento"] input');
      if (dataNascInput) {
        if (dataNascInput.value && dataNascInput.value.trim() === dados.dataNascimento.trim()) return;

        dataNascInput.focus();
        dataNascInput.value = '';
        dataNascInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        const dataStr = dados.dataNascimento;
        let i = 0;
        
        function digitarProximoCaractere() {
          if (i < dataStr.length) {
            const char = dataStr[i];
            dataNascInput.value += char;
            
            dataNascInput.dispatchEvent(new KeyboardEvent('keydown', { 
              bubbles: true, key: char, code: 'Key' + char.toUpperCase(), charCode: char.charCodeAt(0)
            }));
            dataNascInput.dispatchEvent(new KeyboardEvent('keypress', { 
              bubbles: true, key: char, code: 'Key' + char.toUpperCase(), charCode: char.charCodeAt(0)
            }));
            dataNascInput.dispatchEvent(new Event('input', { bubbles: true }));
            dataNascInput.dispatchEvent(new KeyboardEvent('keyup', { 
              bubbles: true, key: char, code: 'Key' + char.toUpperCase(), charCode: char.charCodeAt(0)
            }));
            
            i++;
            setTimeout(digitarProximoCaractere, 15);
          } else {
            // Após digitar tudo, dispara change e blur para validar
            dataNascInput.dispatchEvent(new Event('change', { bubbles: true }));
            dataNascInput.blur();
            dataNascInput.dispatchEvent(new Event('blur', { bubbles: true }));
          }
        }
        
        digitarProximoCaractere();
      }
    }, 1000);
  }

  // ============================================
  // Naturalidade - LIMOEIRO - PE
  // ============================================
  // Espera tudo estabilizar, digita LIMOEIRO e seleciona "LIMOEIRO - PE"
  // Depois re-preenche os campos que o CMCE pode limpar ao clicar no autocomplete
   /* setTimeout(() => {
    // Salva os valores atuais de todos os campos antes de mexer na naturalidade
    const camposSalvos = {};
    const cpfEl = document.querySelector('p-inputmask[controllabel="CPF"] input');
    const cnsEl = document.querySelector('p-inputmask[controllabel="CNS"] input');
    const nomeEl = document.querySelector('input[controllabel="Nome Completo"]');
    const nomeMaeEl = document.querySelector('input[controllabel="Nome da mãe"]');
    const cepEl = document.querySelector('p-inputmask[controllabel="CEP"] input');
    
    if (cpfEl) camposSalvos.cpf = cpfEl.value;
    if (cnsEl) camposSalvos.cns = cnsEl.value;
    if (nomeEl) camposSalvos.nome = nomeEl.value;
    if (nomeMaeEl) camposSalvos.nomeMae = nomeMaeEl.value;
    if (cepEl) camposSalvos.cep = cepEl.value;

    const naturalidadeInput = document.querySelector('mvcommons-autocomplete[controllabel="Naturalidade"] input');
    if (naturalidadeInput) {
      naturalidadeInput.focus();
      naturalidadeInput.value = '';
      naturalidadeInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      const texto = 'LIMOEIRO';
      let i = 0;
      
      function digitarNaturalidade() {
        if (i < texto.length) {
          const char = texto[i];
          naturalidadeInput.value += char;
          
          naturalidadeInput.dispatchEvent(new KeyboardEvent('keydown', { 
            bubbles: true, key: char, code: 'Key' + char.toUpperCase(), charCode: char.charCodeAt(0)
          }));
          naturalidadeInput.dispatchEvent(new KeyboardEvent('keypress', { 
            bubbles: true, key: char, code: 'Key' + char.toUpperCase(), charCode: char.charCodeAt(0)
          }));
          naturalidadeInput.dispatchEvent(new Event('input', { bubbles: true }));
          naturalidadeInput.dispatchEvent(new KeyboardEvent('keyup', { 
            bubbles: true, key: char, code: 'Key' + char.toUpperCase(), charCode: char.charCodeAt(0)
          }));
          
          i++;
          setTimeout(digitarNaturalidade, 15);
        } else {
          // Polling para esperar o dropdown aparecer
          let tentativas = 0;
          const maxTentativas = 40;
          const intervalo = setInterval(() => {
            tentativas++;
            const opcoes = document.querySelectorAll('.ui-autocomplete-list-item');
            if (opcoes.length > 0) {
              for (const opcao of opcoes) {
                if (opcao.textContent.trim() === 'LIMOEIRO - PE') {
                  clearInterval(intervalo);
                  setTimeout(() => {
                    opcao.click();
                    
                    // Após o clique, espera o Angular processar e restaura campos que foram limpos
                    setTimeout(() => {
                      restaurarCamposSeNecessario(camposSalvos);
                    }, 500);
                  }, 100);
                  return;
                }
              }
            }
            if (tentativas >= maxTentativas) {
              clearInterval(intervalo);
            }
          }, 250);
        }
      }
      
      digitarNaturalidade();
    }
  }, 2500); */
}

// Função para restaurar campos que o CMCE pode ter limpado
function restaurarCamposSeNecessario(salvos) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  
  function restaurar(seletor, valorSalvo) {
    if (!valorSalvo) return;
    const el = document.querySelector(seletor);
    if (el && (!el.value || el.value.trim() === '' || el.value.replace(/\D/g, '') === '')) {
      nativeInputValueSetter.call(el, valorSalvo);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  
  restaurar('p-inputmask[controllabel="CPF"] input', salvos.cpf);
  restaurar('p-inputmask[controllabel="CNS"] input', salvos.cns);
  restaurar('input[controllabel="Nome Completo"]', salvos.nome);
  restaurar('input[controllabel="Nome da mãe"]', salvos.nomeMae);
  restaurar('p-inputmask[controllabel="CEP"] input', salvos.cep);
  
  // Sexo - re-clica se necessário
  const sexoAtivo = document.querySelector('p-radiobutton[name="sexo"] .ui-state-active');
  if (!sexoAtivo) {
    const sexoRadios = document.querySelectorAll('p-radiobutton[name="sexo"] input[type="radio"]');
    sexoRadios.forEach(radio => {
      if (radio.value === '1') radio.click();
    });
  }
  
  // Estrangeiro - re-clica "Não" se necessário
  const estrangeiroAtivo = document.querySelector('p-radiobutton[name="flagEstrangeiro"] .ui-state-active');
  if (!estrangeiroAtivo) {
    const estrangeiroRadios = document.querySelectorAll('p-radiobutton[name="flagEstrangeiro"] input[type="radio"]');
    estrangeiroRadios.forEach(radio => {
      if (radio.value === '0') radio.click();
    });
  }

  }

// ============================================
// FUNCIONALIDADE 2: REMOÇÃO DE CARREGAMENTO
// ============================================
function removerTelaDeCarregamento() {
  if (removerAtivo) {
    const elementoParaRemover = document.querySelector('div.loading-container.ng-star-inserted');
    if (elementoParaRemover) {
      elementoParaRemover.remove();
      console.log('Tela de carregamento removida.');
    }
  }
}

// Remoção de carregamento agora é feita pelo observerDOMInstantaneo (observer unificado)

// ============================================
// FUNCIONALIDADE 3: MONITOR DE ELEMENTOS
// ============================================
function exibirNotificacao(mensagem, persistente = false, ehErro = false) {
  if (fechadaManualmente && mensagemAtual === mensagem) {
    return;
  }

  if (notificacaoAtual) {
    if (mensagemAtual === mensagem && document.body.contains(notificacaoAtual)) {
      // Já está mostrando a mesma notificação, não recriar
      return;
    }
    notificacaoAtual.remove();
  }

  fechadaManualmente = false;
  mensagemAtual = mensagem;
  notificacaoPersistente = persistente;

  const notificacao = document.createElement("div");
  notificacao.className = "monitor-notificacao";

  const icone = document.createElement("span");
  icone.className = "monitor-icone";
  icone.textContent = "⚠️";

  const textoMensagem = document.createElement("div");
  textoMensagem.className = "monitor-texto";

  const paragrafos = mensagem.split("\n");
  paragrafos.forEach((paragrafo) => {
    const p = document.createElement("p");
    p.textContent = paragrafo;
    textoMensagem.appendChild(p);
  });

  const botaoFechar = document.createElement("button");
  botaoFechar.className = "monitor-botao-fechar";
  botaoFechar.textContent = "×";
  botaoFechar.title = "Fechar";

  botaoFechar.addEventListener("click", (e) => {
    e.stopPropagation();
    fechadaManualmente = true;
    if (notificacaoAtual) {
      notificacaoAtual.remove();
      notificacaoAtual = null;
    }
  });

  notificacao.appendChild(icone);
  notificacao.appendChild(textoMensagem);
  notificacao.appendChild(botaoFechar);

  if (ehErro === true || ehErro === 'erro') {
    notificacao.classList.add('erro');
  } else if (ehErro === 'aviso') {
    notificacao.classList.add('aviso');
  }

  document.body.appendChild(notificacao);
  notificacaoAtual = notificacao;

  setTimeout(() => {
    notificacao.classList.add("mostrar");
  }, 10);
}

function removerNotificacao() {
  if (notificacaoAtual) {
    notificacaoAtual.classList.remove("mostrar");

    setTimeout(() => {
      if (notificacaoAtual) {
        notificacaoAtual.remove();
        notificacaoAtual = null;
      }
    }, 300);
  }

  fechadaManualmente = false;
  mensagemAtual = null;
  notificacaoPersistente = false;
}

function verificarBloqueios(notificar = false) {
  if (isPacienteVilaUrucuba || isPacienteCidadeInvalida || isDuplicidade) {
    bloquearCamposGlobais();
    if (notificar) {
      if (isPacienteCidadeInvalida) {
        exibirNotificacao("ATENÇÃO!\n\nO paciente não pertence à cidade de LIMOEIRO. Solicitação bloqueada.", true, true);
      } else if (isPacienteVilaUrucuba) {
        exibirNotificacao("ATENÇÃO!\n\nO endereço do paciente deve ser atualizado para prosseguir com a solicitação.", true, true);
      }
    }
  } else {
    desbloquearCamposGlobais();
  }
}

function bloquearCamposGlobais() {
  const inputs = document.querySelectorAll('form.form-solicitacao input, form.form-solicitacao textarea, form.form-solicitacao select, form.form-solicitacao p-dropdown, form.form-solicitacao mvcommons-autocomplete, form.form-solicitacao p-calendar, form.form-solicitacao mvcommons-calendar, form.form-solicitacao p-checkbox, form.form-solicitacao p-inputmask');
  inputs.forEach(el => {
    el.style.pointerEvents = 'none';
    el.style.opacity = '0.5';
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
      el.disabled = true;
    }
  });

  const btnSalvar = document.querySelector('button[title="Salvar"]');
  if (btnSalvar) {
    btnSalvar.disabled = true;
    btnSalvar.style.pointerEvents = 'none';
    btnSalvar.style.opacity = '0.5';
  }

  // Garantir que o botão pesquisar NUNCA seja bloqueado
  const btnPesquisar = document.querySelector('button.btn-pesquisar');
  if (btnPesquisar) {
    btnPesquisar.disabled = false;
    btnPesquisar.style.pointerEvents = 'auto';
    btnPesquisar.style.opacity = '1';
    // Se ele estiver dentro de um container bloqueado (como mvcommons-autocomplete), precisamos garantir
    const parent = btnPesquisar.closest('mvcommons-autocomplete');
    if (parent) {
      parent.style.pointerEvents = 'auto';
      parent.style.opacity = '1';
    }
  }
}

function desbloquearCamposGlobais() {
  const inputs = document.querySelectorAll('form.form-solicitacao input, form.form-solicitacao textarea, form.form-solicitacao select, form.form-solicitacao p-dropdown, form.form-solicitacao mvcommons-autocomplete, form.form-solicitacao p-calendar, form.form-solicitacao mvcommons-calendar, form.form-solicitacao p-checkbox, form.form-solicitacao p-inputmask');
  inputs.forEach(el => {
    el.style.pointerEvents = '';
    el.style.opacity = '';
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
      el.disabled = false;
    }
  });

  const btnSalvar = document.querySelector('button[title="Salvar"]');
  if (btnSalvar) {
    btnSalvar.disabled = false;
    btnSalvar.style.pointerEvents = '';
    btnSalvar.style.opacity = '';
  }
}

function obterCidadeDoPaciente() {
  const inputCidade = document.querySelector('input[formcontrolname="descricaoMunicipio"]');
  if (inputCidade && inputCidade.value) {
    return inputCidade.value.trim().toUpperCase();
  }
  return null;
}

function obterValor(elemento) {
  if (elemento.tagName === "SELECT") {
    const opcao = elemento.options[elemento.selectedIndex];
    return opcao ? opcao.text : "";
  }
  return elemento.value || "";
}

function calcularIdade(dataNascimentoStr) {
  if (!dataNascimentoStr) return null;
  const cleanDate = dataNascimentoStr.replace(/[^\d/]/g, '').trim();
  const partes = cleanDate.split('/');
  if (partes.length !== 3) return null;
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const ano = parseInt(partes[2], 10);
  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null;
  
  const hoje = new Date();
  const nascimento = new Date(ano, mes, dia);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}

function obterIdadeDoPaciente() {
  const inputNasc = document.querySelector('mvcommons-calendar[controllabel="Nascimento"] input') ||
                    document.querySelector('app-aba-dados-cidadao mvcommons-calendar p-calendar span input') ||
                    document.querySelector('app-aba-dados-cidadao mvcommons-calendar input') ||
                    document.querySelector('mvcommons-calendar input');
  if (inputNasc && inputNasc.value) {
    return calcularIdade(inputNasc.value);
  }
  return null;
}

function verificarElemento(elemento) {
  const valor = obterValor(elemento).trim().toUpperCase();
  const idade = obterIdadeDoPaciente();
  const isMenor14 = (idade !== null && idade < 14);
  const prefixoIdade = isMenor14 ? `ATENÇÃO: Paciente é menor de 14 anos.\n\n` : "";

  for (const regra of regras) {
    const valorEsperado = regra.valorEsperado.toUpperCase();

    const corresponde = regra.correspondenciaExata
      ? valor === valorEsperado
      : valor.includes(valorEsperado);

    if (corresponde) {
      const temFaixaEtaria = (regra.idadeMin !== undefined && regra.idadeMax !== undefined);
      const isColonoscopia = regra.valorEsperado.toUpperCase().includes("COLONOSCOPIA");

      if (temFaixaEtaria || isColonoscopia) {
        const minIdade = regra.idadeMin !== undefined ? regra.idadeMin : (valorEsperado.includes("ALFA") ? 14 : 18);
        const maxIdade = regra.idadeMax !== undefined ? regra.idadeMax : (valorEsperado.includes("ALFA") ? 69 : 65);
        
        const idade = obterIdadeDoPaciente();
        let msg = regra.mensagem;
        let estErro = false;

        if (idade !== null) {
          const ultrapassouLimite = (idade > maxIdade || idade < minIdade);

          if (ultrapassouLimite) {
            // Se passar da idade, mostra mensagem simplificada e direta
            msg = `IDADE DO PACIENTE: ${idade} anos\n\nO paciente ultrapassa a faixa etária permitida para este procedimento (${minIdade} a ${maxIdade} anos).`;
          } else {
            // Se adequado à faixa etária, mostra a idade e toda a mensagem correta
            msg = `IDADE DO PACIENTE: ${idade} anos\n\n${regra.mensagem}`;
          }

          if (isColonoscopia) {
            // Caso especial colonoscopia:
            // - Ultrapassou ambas (idade > 69) -> vermelho
            // - Ultrapassou apenas uma (idade > 65 e <= 69) -> amarelo
            // - Igual ou 1 ano mais novo que o limite do procedimento selecionado -> amarelo
            // - Resto -> verde
            if (idade > 69) {
              estErro = 'erro';
            } else if (idade >= 64 && idade <= 69) {
              estErro = 'aviso';
            } else {
              estErro = false;
            }
          } else {
            // Lógica geral para outros procedimentos com faixa etária:
            // - Se ultrapassou o limite -> vermelho
            // - Se igual ou apenas 1 ano mais novo que o máximo -> amarelo
            // - Resto -> verde
            if (ultrapassouLimite) {
              estErro = 'erro';
            } else if (idade === maxIdade || idade === (maxIdade - 1)) {
              estErro = 'aviso';
            } else {
              estErro = false;
            }
          }
        }
        exibirNotificacao(prefixoIdade + msg, false, estErro ? estErro : (isMenor14 ? 'aviso' : false));
      } else {
        let msgFinal = regra.mensagem;
        if (idade !== null) {
          msgFinal = `IDADE DO PACIENTE: ${idade} anos\n\n` + msgFinal;
        }
        exibirNotificacao(prefixoIdade + msgFinal, false, isMenor14 ? 'aviso' : false);
      }
      return true;
    }
  }

  return false;
}

function inicializarEspelhamentoCampos() {
  document.addEventListener('input', (e) => {
    const source = e.target;
    if (source.tagName === 'TEXTAREA' && source.getAttribute('controllabel') === 'Hipótese Diagnóstica') {
      const target = document.querySelector('textarea[controllabel="Informação Complementar"]');
      if (target) {
        target.value = source.value;
        // Dispara eventos para o Angular detectar a mudança
        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }, true);
}

// ============================================
// FUNCIONALIDADE 4: VALIDAÇÃO DE DUPLICIDADE
// ============================================

function verificarHistoricoAutomatico() {
  const inputItem = document.querySelector('mvcommons-autocomplete[formcontrolname="itemAgendamento"] input');
  
  if (!inputItem || inputItem.dataset.boosterValidated) return;

  inputItem.dataset.boosterValidated = 'true';
  console.log('CMCE BOOSTER - Monitorando campo de item de agendamento');

  // Monitora quando um item é selecionado ou alterado
  const handler = () => {
    const itemSelecionado = inputItem.value.trim().toUpperCase();
    
    if (itemSelecionado.length < 3 || itemSelecionado === ultimoItemVerificado) return;
    
    ultimoItemVerificado = itemSelecionado;
    executarBuscaEValidacao(itemSelecionado);
  };

  inputItem.addEventListener('change', handler);
  inputItem.addEventListener('blur', handler);
}

function executarBuscaEValidacao(itemAlvo) {
  const btnPesquisar = document.querySelector('app-historico-solicitacao button[title="Pesquisar"]');
  if (!btnPesquisar) {
    console.log('Botão de pesquisar histórico não encontrado');
    return;
  }

  console.log('CMCE BOOSTER - Iniciando busca de histórico para:', itemAlvo);
  btnPesquisar.click();

  // Aguarda a tabela atualizar (polling simples para facilitar)
  let tentativas = 0;
  const maxTentativas = 10; // 5 segundos (500ms * 10)
  
  const intervalo = setInterval(() => {
    tentativas++;
    const rows = document.querySelectorAll('app-historico-solicitacao p-table .ui-table-tbody tr:not(.empty-row)');
    
    // Se encontrou linhas ou se as tentativas acabaram
    if (rows.length > 0 || tentativas >= maxTentativas) {
      clearInterval(intervalo);
      validarDuplicidade(itemAlvo, Array.from(rows));
    }
  }, 500);
}

function validarDuplicidade(itemAlvo, rows) {
  const statusCriticos = ['AGUARDANDO REGULAÇÃO', 'AUTORIZADO', 'OPINIÃO FORMATIVA', 'MARCADO'];
  let duplicado = null;

  rows.forEach(row => {
    const colunas = row.querySelectorAll('td');
    if (colunas.length >= 3) {
      const itemHistorico = colunas[1].textContent.trim().toUpperCase();
      const statusHistorico = colunas[2].textContent.trim().toUpperCase();
      const dataHistorico = colunas[0].textContent.trim();

      if (itemHistorico === itemAlvo && statusCriticos.some(s => statusHistorico.includes(s))) {
        // Tenta encontrar o ID nos dados brutos capturados pelo interceptor
        let idSolicitacao = 'Não encontrado';
        if (dadosHistoricoBrutos && dadosHistoricoBrutos.length > 0) {
          const matchingData = dadosHistoricoBrutos.find(d => {
            const itemMatch = d.descricaoItemAgendamento.toUpperCase() === itemHistorico;
            // Formata data do JSON (2026-04-20T...) para o formato da tabela (20/04/2026)
            const dateParts = d.dataSolicitacao.split('T')[0].split('-');
            const dateMatch = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` === dataHistorico;
            return itemMatch && dateMatch;
          });
          if (matchingData) {
            idSolicitacao = matchingData.idSolicitacaoProcedimento;
          }
        }

        duplicado = { 
          item: itemHistorico, 
          status: statusHistorico, 
          data: dataHistorico,
          id: idSolicitacao 
        };
      }
    }
  });

  if (duplicado) {
    isDuplicidade = true;
    console.log('Duplicidade encontrada!', duplicado);
    exibirNotificacao(
      `ALERTA DE DUPLICIDADE\n\nEste cidadão já possui uma solicitação para esse item com status "${duplicado.status}" em ${duplicado.data}\n\nID: ${duplicado.id}.`,
      true,
      'aviso'
    );
    verificarBloqueios(false);
  } else {
    isDuplicidade = false;
    console.log('Nenhuma duplicidade crítica encontrada no histórico.');
    // Se era uma notificação de duplicidade, removemos
    if (notificacaoPersistente) {
      removerNotificacao();
    }
    verificarBloqueios(false);
  }
}

function aoPararDeDigitar(evento) {
  if (timeoutVerificacao) {
    clearTimeout(timeoutVerificacao);
  }

  timeoutVerificacao = setTimeout(() => {
    verificarTodos();
  }, 1000);
}

function verificarTodos() {
  // Se houver uma notificação persistente (duplicidade), não removemos automaticamente
  if (notificacaoPersistente) return;

  let encontrou = false;

  regras.forEach((regra) => {
    const elementos = document.querySelectorAll(regra.seletor);

    for (const elemento of elementos) {
      if (verificarElemento(elemento)) {
        encontrou = true;
        break;
      }
    }
  });

  const cidadeDom = obterCidadeDoPaciente();
  if (cidadeDom) {
    if (!cidadeDom.includes('LIMOEIRO')) {
      isPacienteCidadeInvalida = true;
    } else {
      isPacienteCidadeInvalida = false;
    }
  } else {
    // Se o cadastro foi limpo (cidade sumiu), não tem cidade inválida nem vila uruçuba
    isPacienteCidadeInvalida = false;
    isPacienteVilaUrucuba = false;
    isDuplicidade = false;
  }

  const idade = obterIdadeDoPaciente();
  const isMenor14 = (idade !== null && idade < 14);
  const isInModalCadastro = document.querySelector('app-pesquisa-cadastro-cidadao-dialog') !== null;

  if (!encontrou && !isPacienteVilaUrucuba && !isPacienteCidadeInvalida) {
    if (isMenor14 && !isInModalCadastro) {
      exibirNotificacao(`IDADE DO PACIENTE: ${idade} anos\n\nATENÇÃO: Paciente é menor de 14 anos.`, false, 'aviso');
    } else {
      removerNotificacao();
    }
  }
  
  verificarBloqueios(false);
  verificarPreDiagnosticos();

  // Garante que os campos de hipótese/informação continuem bloqueados
  // caso o Angular tente re-habilitá-los durante a renderização
  if (observerCidAtivo && !cidPrincipalPreenchido) {
    bloquearCamposHipoteseInfo();
  }
}

// ============================================
// PRÉ DIAGNÓSTICOS
// ============================================
function verificarPreDiagnosticos() {
  const inputItem = document.querySelector('mvcommons-autocomplete[formcontrolname="itemAgendamento"] input') || 
                    document.querySelector('input[formcontrolname="itemAgendamento"]') ||
                    document.querySelector('p-inputmask[formcontrolname="itemAgendamento"] input');
  
  const hipoteseTextarea = document.querySelector('textarea[controllabel="Hipótese Diagnóstica"]');
  if (!hipoteseTextarea) return;

  let matchPrediag = null;
  if (inputItem && inputItem.value) {
    const valorItem = inputItem.value.trim().toUpperCase();
    if (valorItem.length >= 3) {
      matchPrediag = prediagnosticosGlobais.find(p => {
        const ag = p.itemAgendamento.toUpperCase();
        return valorItem === ag; // Apenas correspondência exata (após clicar no dropdown)
      });
    }
  }

  let btnPrediag = document.getElementById('cmce-prediag-btn');

  if (matchPrediag) {
    if (!btnPrediag) {
      btnPrediag = document.createElement('div');
      btnPrediag.id = 'cmce-prediag-btn';
      btnPrediag.title = 'Adicionar Pré Diagnóstico';
      btnPrediag.textContent = 'HD';
      btnPrediag.style.cssText = `
        position: absolute;
        top: -8px;
        right: 6px;
        width: 24px;
        height: 24px;
        background-color: #28a745;
        color: white;
        font-weight: bold;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        cursor: pointer;
        z-index: 100;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      `;
      const parent = hipoteseTextarea.parentElement;
      if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }
      parent.appendChild(btnPrediag);
    }

    btnPrediag.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      abrirModalPreDiagnosticos(matchPrediag.diagnosticos);
    };
  } else {
    if (btnPrediag) {
      btnPrediag.remove();
    }
  }
}

function abrirModalPreDiagnosticos(diagnosticos) {
  let modal = document.getElementById('cmce-prediag-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'cmce-prediag-modal';
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 320px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: Arial, sans-serif;
  `;

  const header = document.createElement('div');
  header.style.cssText = `
    background: #28a745;
    color: white;
    padding: 12px;
    font-weight: bold;
    text-align: center;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  
  const spanTitle = document.createElement('span');
  spanTitle.textContent = 'Pré Diagnósticos';
  const spanClose = document.createElement('span');
  spanClose.textContent = '✕';
  spanClose.style.cursor = 'pointer';
  spanClose.onclick = () => modal.remove();
  
  header.appendChild(spanTitle);
  header.appendChild(spanClose);
  
  const list = document.createElement('div');
  list.style.cssText = `
    max-height: 300px;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `;

  diagnosticos.forEach(diag => {
    const diagUpper = diag.toUpperCase();
    const item = document.createElement('div');
    item.textContent = diagUpper;
    item.style.cssText = `
      padding: 10px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.2s;
    `;
    item.onmouseover = () => item.style.background = '#e9ecef';
    item.onmouseout = () => item.style.background = '#f8f9fa';
    item.onclick = () => {
      const hipotese = document.querySelector('textarea[controllabel="Hipótese Diagnóstica"]');
      if (hipotese) {
        hipotese.focus();
        const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        const espaco = hipotese.value ? '\n' : '';
        nativeTextAreaValueSetter.call(hipotese, hipotese.value + espaco + diagUpper);
        hipotese.dispatchEvent(new Event('input', { bubbles: true }));
        hipotese.dispatchEvent(new Event('change', { bubbles: true }));
      }
      modal.remove();
    };
    list.appendChild(item);
  });

  modal.appendChild(header);
  modal.appendChild(list);
  document.body.appendChild(modal);
}

// ============================================
// LISTENERS DE MENSAGENS
// ============================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Busca CNS/CPF
  if (request.action === 'preencherDados') {
    preencherDadosNoFormulario(request.dados);
  } else if (request.action === 'inserirCNS') {
    const cnsInput = document.querySelector('p-inputmask[controllabel="CNS"] input');
    if (cnsInput) {
      cnsInput.value = request.valor;
      cnsInput.dispatchEvent(new Event('input', { bubbles: true }));
      cnsInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } else if (request.action === 'inserirCPF') {
    const cpfInput = document.querySelector('p-inputmask[controllabel="CPF"] input');
    if (cpfInput) {
      cpfInput.value = request.valor;
      cpfInput.dispatchEvent(new Event('input', { bubbles: true }));
      cpfInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  
  // Remoção de carregamento
  if (request.ativo !== undefined) {
    removerAtivo = request.ativo;
    console.log('Remoção automática ' + (removerAtivo ? 'ativada' : 'desativada'));
  }
  
  // Adicionar médico
  if (request.action === 'adicionarMedico') {
    const { nome, crm, especialidade } = request.dados;
    
    if (window.medicoAutocomplete) {
      window.medicoAutocomplete.adicionarMedicoRapido(nome, crm, especialidade || '');
    }
  }

  // Adicionar regra personalizada
  if (request.action === 'adicionarRegra') {
    if (typeof adicionarRegra === 'function') {
      adicionarRegra(request.dados);
    }
  }
});

// ============================================
// CUSTOMIZAÇÃO DO SISTEMA
// ============================================
function atualizarHeaderSistema() {
  // Injeta a fonte Honk se ainda não estiver na página
  if (!document.getElementById('fonte-honk-booster')) {
    const link1 = document.createElement('link');
    link1.rel = 'preconnect';
    link1.href = 'https://fonts.googleapis.com';
    
    const link2 = document.createElement('link');
    link2.rel = 'preconnect';
    link2.href = 'https://fonts.gstatic.com';
    link2.crossOrigin = 'anonymous';
    
    const link3 = document.createElement('link');
    link3.id = 'fonte-honk-booster';
    link3.rel = 'stylesheet';
    link3.href = 'https://fonts.googleapis.com/css2?family=Honk:MORF@15&display=swap';
    
    document.head.appendChild(link1);
    document.head.appendChild(link2);
    document.head.appendChild(link3);
  }

  const labels = document.querySelectorAll('label.system-name');
  labels.forEach(label => {
    if (!label.dataset.boosterModificado) {
      // Verifica se é exatamente o texto original para não sobrescrever caso mude ou já tenha modificado
      if (label.textContent.trim() === 'Central de Marcação de Consultas e Exames' || !label.innerHTML.includes('CMCE BOOSTER')) {
        label.dataset.boosterModificado = 'true';
        label.innerHTML = 'Central de Marcação de Consultas e Exames + CMCE BOOSTER - <span style="font-family: \'Honk\', system-ui; font-optical-sizing: auto; font-weight: 400; font-style: normal; font-variation-settings: \'MORF\' 15, \'SHLN\' 50; font-size: 1.5em;"> Made by: João Mateus</span>';
      }
    }
  });
}

// ============================================
// SUBSTITUIÇÃO DE FOTO DO CIDADÃO
// ============================================
const imagensAssets = ['dog.jpg', 'gato.jpg'];
for (let i = 2; i <= 30; i++) {
  imagensAssets.push(`gato${i}.jpg`);
}

let blockImageReplacement = false;

function substituirFotoCidadao() {
  if (blockImageReplacement) return;
  
  // Pega apenas as fotos que ainda não tentamos alterar
  const fotos = document.querySelectorAll('img.foto-cidadao:not([data-booster-foto-alterada])');
  fotos.forEach(img => {
    if (img.src && img.src.includes('cidadaoFotoPlaceHolder.png')) {
      // Marca a imagem para não tentar substituir novamente, evitando loops infinitos
      img.setAttribute('data-booster-foto-alterada', 'true');
      const idx = Math.floor(Math.random() * imagensAssets.length);
      try {
        if (!chrome || !chrome.runtime || !chrome.runtime.id) {
          throw new Error("API do Chrome indisponível");
        }
        img.src = chrome.runtime.getURL(`assets/${imagensAssets[idx]}`);
      } catch (error) {
        blockImageReplacement = true;
        if (!error.message.includes("Extension context invalidated") && !error.message.includes("API do Chrome")) {
          console.warn('CMCE BOOSTER: Erro fatal ao substituir foto. Funcionalidade desativada temporariamente.', error);
        }
      }
    }
  });
}

// ============================================
// OBSERVER UNIFICADO (substitui observerCarregamento + observerDOMInstantaneo + setIntervals)
// ============================================
let observerThrottled = false;

const observerUnificado = new MutationObserver((mutations) => {
  // Verifica tipo de mutação
  let mudouEstrutura = false;
  let mudouImgSrc = false;
  for (const mut of mutations) {
    if (mut.type === 'childList' && mut.addedNodes.length > 0) {
      mudouEstrutura = true;
      mudouImgSrc = true;
      break;
    } else if (mut.type === 'attributes' && mut.target.tagName === 'IMG') {
      mudouImgSrc = true;
    }
  }

  // Foto: reage imediatamente a mudanças de src (muito leve)
  if (mudouImgSrc) {
    substituirFotoCidadao();
  }

  // Remoção de carregamento: reage imediatamente (muito leve, 1 querySelector)
  removerTelaDeCarregamento();

  // Para o resto, usa throttle via requestAnimationFrame
  // Evita rodar 100x por segundo durante re-renders pesados do Angular
  if (mudouEstrutura && !observerThrottled) {
    observerThrottled = true;
    requestAnimationFrame(() => {
      observerThrottled = false;

      // Funções que antes eram setInterval separados
      verificarFormulario();
      verificarHistoricoAutomatico();

      // Funções visuais/estruturais
      atualizarHeaderSistema();
      destacarCidadaosIncompletos();
      adicionarBotaoContinuar();
      inicializarBloqueioCid();

      // Autoclick na tela inicial se vier do botão "Continuar Cadastrando"
      if (sessionStorage.getItem('boosterAutoNovoCadastro') === 'true') {
        const btnNovo = Array.from(document.querySelectorAll('button')).find(b => b.title === 'Solicitação de procedimento');
        if (btnNovo && !btnNovo.disabled) {
          sessionStorage.removeItem('boosterAutoNovoCadastro');
          setTimeout(() => btnNovo.click(), 100);
        }
      }
    });
  }
});

// ============================================
// DESTAQUE DE CIDADÃOS INCOMPLETOS
// ============================================
function destacarCidadaosIncompletos() {
  if (!window.cidadaosIncompletos || window.cidadaosIncompletos.size === 0) return;
  
  const rows = document.querySelectorAll('app-pesquisa-cidadao p-table .ui-table-tbody tr:not(.empty-row)');
  rows.forEach(row => {
    const tdId = row.querySelector('td:nth-child(1)');
    const tdNome = row.querySelector('td:nth-child(3)');
    if (tdId && tdNome) {
      // Extrai apenas os números para não bugar quando a tag for inserida junto do código
      const idStr = tdId.textContent.replace(/\D/g, '').trim();
      
      if (window.cidadaosIncompletos.has(idStr)) {
        if (!tdId.querySelector('.badge-incompleto')) {
          // Limpa resquícios no nome (se ainda tiver)
          const badgeAntigo = tdNome.querySelector('.badge-incompleto');
          if (badgeAntigo) badgeAntigo.remove();

          const badge = document.createElement('span');
          badge.className = 'badge-incompleto';
          badge.textContent = 'INCOMPLETO';
          badge.style.color = 'white';
          badge.style.backgroundColor = '#dc3545';
          badge.style.padding = '2px 6px';
          badge.style.borderRadius = '4px';
          badge.style.marginLeft = '8px'; // Margem a esquerda pois fica depois do código
          badge.style.fontSize = '0.85em';
          badge.style.fontWeight = 'bold';
          
          // Muda a cor do texto para destacar
          tdNome.style.color = '#dc3545';
          tdNome.style.fontWeight = 'bold';
          tdId.style.color = '#dc3545';
          tdId.style.fontWeight = 'bold';
          
          tdId.appendChild(badge); // Adiciona após o código
        }
        
        // Impede o duplo clique se estiver incompleto
        if (!row.dataset.bloqueioDblClick) {
          row.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            e.preventDefault();
            alert('CMCE BOOSTER: Cadastro INCOMPLETO!\nPor favor, selecione com um clique apenas e utilize o botão "Editar" (ícone de arquivo) logo abaixo para corrigir as informações pendentes antes de prosseguir.');
          }, true);
          row.dataset.bloqueioDblClick = 'true';
        }
      } else {
        const badgeId = tdId.querySelector('.badge-incompleto');
        if (badgeId) badgeId.remove();
        const badgeNome = tdNome.querySelector('.badge-incompleto');
        if (badgeNome) badgeNome.remove();
      }
    }
  });
}

// ============================================
// CONTINUAR CADASTRO (EVITAR SAIR DA PÁGINA)
// ============================================
function adicionarBotaoContinuar() {
  const dialog = document.querySelector('app-dialog-impressao-relatorio');
  if (dialog && !document.getElementById('btn-continuar-booster')) {
    const botaoNaoOriginal = Array.from(dialog.querySelectorAll('button')).find(btn => btn.textContent.includes('Não'));
    
    const btn = document.createElement('button');
    btn.id = 'btn-continuar-booster';
    btn.className = 'ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only';
    btn.style.backgroundColor = '#28a745';
    btn.style.borderColor = '#28a745';
    btn.style.color = '#fff';
    btn.style.setProperty('margin-left', '15px', 'important');
    btn.style.setProperty('padding', '0', 'important');
    btn.style.setProperty('display', 'inline-flex', 'important');
    btn.style.setProperty('align-items', 'center', 'important');
    btn.style.setProperty('justify-content', 'center', 'important');
    
    const span = document.createElement('span');
    span.className = 'ui-button-text ui-clickable';
    span.textContent = 'Continuar Cadastrando';
    span.style.fontWeight = 'bold';
    span.style.padding = '0.5em 1em';
    span.style.textAlign = 'center';
    
    btn.appendChild(span);
    
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      sessionStorage.setItem('boosterAutoNovoCadastro', 'true');
      if (botaoNaoOriginal) {
        botaoNaoOriginal.click();
      } else {
        const dialogElement = dialog.closest('.ui-dialog');
        if (dialogElement) {
          const closeBtn = dialogElement.querySelector('.ui-dialog-titlebar-close');
          if (closeBtn) closeBtn.click();
        }
      }
    });

    // Procura o elemento que contém o código/texto de solicitação
    let elementoAlvo = null;
    const labels = dialog.querySelectorAll('label, span, div, p, h1, h2, h3, h4, h5, b, strong');
    for (const el of labels) {
      if (el.children.length === 0 && (el.textContent.toLowerCase().includes('solicita') || el.textContent.toLowerCase().includes('código') || el.textContent.match(/\d{5,}/))) {
        elementoAlvo = el;
      }
    }

    if (elementoAlvo) {
      // Coloca ao lado do texto da solicitação
      const parent = elementoAlvo.parentElement;
      parent.style.display = 'flex';
      parent.style.alignItems = 'center';
      parent.style.justifyContent = 'center';
      parent.style.flexWrap = 'wrap';
      parent.appendChild(btn);
    } else {
      // Fallback: anexa no topo do corpo do modal
      const content = dialog.closest('.ui-dialog').querySelector('.ui-dialog-content');
      if (content) {
        const wrap = document.createElement('div');
        wrap.style.display = 'flex';
        wrap.style.justifyContent = 'center';
        wrap.style.marginBottom = '15px';
        wrap.appendChild(btn);
        content.insertBefore(wrap, content.firstChild);
      }
    }
  }
}

// ============================================
// BLOQUEIO DE HIPÓTESE/INFORMAÇÃO ATÉ CID PRINCIPAL
// ============================================
function criarAvisoCidBloqueado() {
  // Remove aviso existente se houver
  const avisoExistente = document.getElementById('cmce-aviso-cid-bloqueado');
  if (avisoExistente) avisoExistente.remove();

  const hipotese = document.querySelector('textarea[controllabel="Hipótese Diagnóstica"]');
  if (!hipotese) return;

  const container = hipotese.closest('.hipotese-diagnostica') || hipotese.parentElement;
  if (!container) return;

  const aviso = document.createElement('span');
  aviso.id = 'cmce-aviso-cid-bloqueado';
  aviso.textContent = '⚠ Preencha o CID primeiro';
  aviso.style.cssText = `
    display: inline-block;
    margin-left: 10px;
    padding: 2px 8px;
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffc107;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    vertical-align: middle;
    animation: cmce-pulsar 2s ease-in-out infinite;
  `;

  // Injeta animação CSS se não existir
  if (!document.getElementById('cmce-aviso-cid-style')) {
    const style = document.createElement('style');
    style.id = 'cmce-aviso-cid-style';
    style.textContent = `
      @keyframes cmce-pulsar {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
    `;
    document.head.appendChild(style);
  }

  // Insere ao lado do label
  const label = container.querySelector('label');
  if (label) {
    label.insertAdjacentElement('afterend', aviso);
  } else {
    container.insertBefore(aviso, hipotese);
  }
}

function removerAvisoCidBloqueado() {
  const aviso = document.getElementById('cmce-aviso-cid-bloqueado');
  if (aviso) aviso.remove();
}

// Prevenção agressiva de eventos (captura global)
document.addEventListener('keydown', (e) => {
  if (e.target && e.target.dataset && e.target.dataset.bloqueadoPeloBooster === 'true') {
    e.preventDefault();
    e.stopPropagation();
  }
}, true);

document.addEventListener('paste', (e) => {
  if (e.target && e.target.dataset && e.target.dataset.bloqueadoPeloBooster === 'true') {
    e.preventDefault();
    e.stopPropagation();
  }
}, true);

document.addEventListener('cut', (e) => {
  if (e.target && e.target.dataset && e.target.dataset.bloqueadoPeloBooster === 'true') {
    e.preventDefault();
    e.stopPropagation();
  }
}, true);

function bloquearCamposHipoteseInfo() {
  const hipotese = document.querySelector('textarea[controllabel="Hipótese Diagnóstica"]');
  const info = document.querySelector('textarea[controllabel="Informação Complementar"]');

  [hipotese, info].forEach(campo => {
    if (campo) {
      campo.disabled = true;
      campo.readOnly = true;
      campo.tabIndex = -1;
      campo.style.pointerEvents = 'none';
      campo.style.opacity = '0.5';
      campo.style.backgroundColor = '#f0f0f0';
      campo.dataset.bloqueadoPeloBooster = 'true';
    }
  });

  criarAvisoCidBloqueado();
}

function desbloquearCamposHipoteseInfo() {
  const hipotese = document.querySelector('textarea[controllabel="Hipótese Diagnóstica"]');
  const info = document.querySelector('textarea[controllabel="Informação Complementar"]');

  [hipotese, info].forEach(campo => {
    if (campo) {
      campo.disabled = false;
      campo.readOnly = false;
      campo.tabIndex = 0;
      campo.style.pointerEvents = '';
      campo.style.opacity = '';
      campo.style.backgroundColor = '';
      campo.dataset.bloqueadoPeloBooster = 'false';
    }
  });

  removerAvisoCidBloqueado();
}

function atualizarTextareaCid(textarea, descricaoAnterior, descricaoNova) {
  if (!textarea) return;

  const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
  let valorAtual = textarea.value || '';

  if (descricaoAnterior && valorAtual.includes(descricaoAnterior)) {
    // SUBSTITUIR ou REMOVER a descrição anterior
    if (descricaoNova) {
      valorAtual = valorAtual.replace(descricaoAnterior, descricaoNova);
    } else {
      // Remove a descrição e limpa quebras de linha extras
      valorAtual = valorAtual.replace(descricaoAnterior, '').replace(/^\n+|\n+$/g, '').replace(/\n{3,}/g, '\n\n');
    }
  } else if (descricaoNova) {
    // INSERIR nova descrição (primeira vez ou descrição anterior não encontrada)
    const espaco = valorAtual.trim() ? '\n\n' : '';
    valorAtual = valorAtual + espaco + descricaoNova;
  }

  nativeTextAreaValueSetter.call(textarea, valorAtual);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));
}

function aplicarDescricaoCidNosCampos(descricaoAnterior, descricaoNova) {
  const hipotese = document.querySelector('textarea[controllabel="Hipótese Diagnóstica"]');

  // Atualiza apenas a hipótese. 
  // O espelhamento (inicializarEspelhamentoCampos) vai copiar tudo automaticamente
  // para a informação complementar ao disparar o evento 'input'
  atualizarTextareaCid(hipotese, descricaoAnterior, descricaoNova);
}

function obterDescricaoCidPrincipal() {
  const acInput = document.querySelector('mvcommons-autocomplete[formcontrolname="cidPrincipal"] input');
  if (acInput && acInput.value && acInput.value.trim().length > 0) {
    return acInput.value.trim().toUpperCase();
  }
  return null;
}

function obterCodigoCidAtual() {
  const cidInput = document.querySelector('p-inputmask[formcontrolname="codigoCidPrincipal"] input');
  if (!cidInput) return '';
  return (cidInput.value || '').replace(/[\s._-]/g, '');
}

function verificarCidPrincipalPreenchido() {
  const codigoNovo = obterCodigoCidAtual();
  const temCid = codigoNovo.length >= 3;

  // Caso 1: CID preenchido pela primeira vez
  if (temCid && !cidPrincipalPreenchido) {
    cidPrincipalPreenchido = true;
    codigoCidAtual = codigoNovo;

    setTimeout(() => {
      const descricaoNova = obterDescricaoCidPrincipal();
      desbloquearCamposHipoteseInfo();

      if (descricaoNova) {
        aplicarDescricaoCidNosCampos('', descricaoNova);
        descricaoCidAtual = descricaoNova;
      }
      console.log('CMCE BOOSTER - CID preenchido:', codigoNovo, '→', descricaoNova);
    }, 800);
    return;
  }

  // Caso 2: CID mudou para outro
  if (temCid && cidPrincipalPreenchido && codigoNovo !== codigoCidAtual) {
    const descricaoAnterior = descricaoCidAtual;
    codigoCidAtual = codigoNovo;

    setTimeout(() => {
      const descricaoNova = obterDescricaoCidPrincipal();

      if (descricaoNova && descricaoNova !== descricaoAnterior) {
        aplicarDescricaoCidNosCampos(descricaoAnterior, descricaoNova);
        descricaoCidAtual = descricaoNova;
        console.log('CMCE BOOSTER - CID alterado:', descricaoAnterior, '→', descricaoNova);
      }
    }, 800);
    return;
  }

  // Caso 3: CID removido
  if (!temCid && cidPrincipalPreenchido) {
    const descricaoAnterior = descricaoCidAtual;
    cidPrincipalPreenchido = false;
    codigoCidAtual = '';

    // Remove a descrição dos campos
    if (descricaoAnterior) {
      aplicarDescricaoCidNosCampos(descricaoAnterior, '');
      descricaoCidAtual = '';
      console.log('CMCE BOOSTER - CID removido. Descrição removida:', descricaoAnterior);
    }

    bloquearCamposHipoteseInfo();
  }
}

function inicializarBloqueioCid() {
  if (observerCidAtivo) return;

  const cidInput = document.querySelector('p-inputmask[formcontrolname="codigoCidPrincipal"] input');
  const hipotese = document.querySelector('textarea[controllabel="Hipótese Diagnóstica"]');
  
  if (!cidInput || !hipotese) return;

  observerCidAtivo = true;

  // Verifica estado inicial
  const codigoInicial = obterCodigoCidAtual();
  if (codigoInicial.length >= 3) {
    cidPrincipalPreenchido = true;
    codigoCidAtual = codigoInicial;
    // Tenta capturar a descrição já presente
    const descInicial = obterDescricaoCidPrincipal();
    if (descInicial) descricaoCidAtual = descInicial;
  } else {
    cidPrincipalPreenchido = false;
    bloquearCamposHipoteseInfo();
  }

  // Monitora o campo de CÓDIGO do CID (blur = clicou fora ou Tab)
  cidInput.addEventListener('blur', () => {
    verificarCidPrincipalPreenchido();
  });

  // Monitora o campo de DESCRIÇÃO/autocomplete do CID
  const acInput = document.querySelector('mvcommons-autocomplete[formcontrolname="cidPrincipal"] input');
  if (acInput) {
    // Observa cliques nos itens do autocomplete (seleção)
    document.addEventListener('click', (e) => {
      if (e.target.closest('.ui-autocomplete-list-item') || e.target.closest('li.ui-autocomplete-list-item')) {
        setTimeout(() => verificarCidPrincipalPreenchido(), 500);
      }
    }, true);

    // Monitora mudanças no campo de código (preenchimento programático)
    const observerCodigo = new MutationObserver(() => {
      setTimeout(() => verificarCidPrincipalPreenchido(), 500);
    });
    observerCodigo.observe(cidInput, { attributes: true, attributeFilter: ['value'] });

    // Backup: monitora input/change no campo de código
    cidInput.addEventListener('input', () => {
      setTimeout(() => verificarCidPrincipalPreenchido(), 500);
    });
    cidInput.addEventListener('change', () => {
      setTimeout(() => verificarCidPrincipalPreenchido(), 500);
    });
  }

  console.log('CMCE BOOSTER - Monitoramento de CID (bloqueio + mudança + remoção) ativado.');
}

// ============================================
// ATALHOS DE TECLADO
// ============================================
function inicializarAtalhos() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+S → Salvar
    if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === 's') {
      const btnSalvar = document.querySelector('button[title="Salvar"]');
      if (btnSalvar && !btnSalvar.disabled) {
        e.preventDefault(); // Impede o "Salvar página" do navegador
        btnSalvar.click();
        console.log('CMCE BOOSTER - Atalho Ctrl+S: Botão Salvar clicado');
      }
    }
  }, true);
}

// ============================================
// INICIALIZAÇÃO
// ============================================
function iniciar() {
  // Execuções iniciais (primeira rodada antes de qualquer observer/interval)
  verificarFormulario();
  atualizarHeaderSistema();
  substituirFotoCidadao();
  
  // Inicializa funcionalidades baseadas em eventos (rodam 1x)
  inicializarEspelhamentoCampos();
  inicializarAtalhos();
  inicializarBloqueioCid();
  
  // Carrega estado da remoção de carregamento
  chrome.storage.local.get('removerAtivo', function(data) {
    if (data.removerAtivo !== undefined) {
      removerAtivo = data.removerAtivo;
      console.log('Estado inicial da remoção automática: ' + (removerAtivo ? 'ativada' : 'desativada'));
      removerTelaDeCarregamento();
    }
  });
  
  // ============================================
  // OBSERVER UNIFICADO — reage a mudanças no DOM em tempo real
  // Substitui: observerCarregamento + observerDOMInstantaneo
  // Absorve: verificarFormulario + verificarHistoricoAutomatico
  // ============================================
  observerUnificado.observe(document.body, { 
    childList: true, 
    subtree: true, 
    attributes: true, 
    attributeFilter: ['src'] 
  });
  
  // ============================================
  // FALLBACK ÚNICO (3s) — pega edge cases que o Observer pode perder
  // Substitui: setInterval(verificarFormulario, 3000)
  //          + setInterval(verificarHistoricoAutomatico, 3000)
  //          + setInterval(verificarTodos, 2000)
  // ============================================
  setInterval(() => {
    verificarFormulario();
    verificarHistoricoAutomatico();
    verificarTodos();
  }, 3000);
  
  // ============================================
  // DEBOUNCE REATIVO — verificarTodos ao parar de digitar/alterar campos
  // (mais responsivo que o fallback de 3s para ações do usuário)
  // ============================================
  document.addEventListener("input", aoPararDeDigitar, true);
  
  document.addEventListener(
    "change",
    (e) => {
      if (e.target.matches("select, input, textarea")) {
        if (timeoutVerificacao) {
          clearTimeout(timeoutVerificacao);
        }

        timeoutVerificacao = setTimeout(() => {
          verificarTodos();
        }, 1000);
      }
    },
    true
  );
  
  console.log('CMCE BOOSTER - Inicializado com observer unificado + fallback 3s + debounce reativo');
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciar);
} else {
  iniciar();
}