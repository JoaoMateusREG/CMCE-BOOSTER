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
  // CPF
  if (dados.cpf) {
    const cpfInput = document.querySelector('p-inputmask[controllabel="CPF"] input');
    if (cpfInput) {
      cpfInput.value = dados.cpf;
      cpfInput.dispatchEvent(new Event('input', { bubbles: true }));
      cpfInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  
  // CNS
  if (dados.cns) {
    const cnsInput = document.querySelector('p-inputmask[controllabel="CNS"] input');
    if (cnsInput) {
      cnsInput.value = dados.cns;
      cnsInput.dispatchEvent(new Event('input', { bubbles: true }));
      cnsInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  
  // Nome Completo
  if (dados.nome) {
    const nomeInput = document.querySelector('input[controllabel="Nome Completo"]');
    if (nomeInput) {
      nomeInput.value = dados.nome;
      nomeInput.dispatchEvent(new Event('input', { bubbles: true }));
      nomeInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  
  // Nome da Mãe
  if (dados.nomeMae) {
    const nomeMaeInput = document.querySelector('input[controllabel="Nome da mãe"]');
    if (nomeMaeInput) {
      nomeMaeInput.value = dados.nomeMae;
      nomeMaeInput.dispatchEvent(new Event('input', { bubbles: true }));
      nomeMaeInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  
  // Data de Nascimento
  if (dados.dataNascimento) {
    const dataNascInput = document.querySelector('mvcommons-calendar[controllabel="Nascimento"] input');
    if (dataNascInput) {
      dataNascInput.value = dados.dataNascimento;
      dataNascInput.dispatchEvent(new Event('input', { bubbles: true }));
      dataNascInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  
  // Sexo
  if (dados.sexo) {
    const sexoValue = dados.sexo.toUpperCase().includes('MASCULINO') ? '1' : '2';
    const sexoRadios = document.querySelectorAll('p-radiobutton[name="sexo"] input[type="radio"]');
    sexoRadios.forEach(radio => {
      if (radio.value === sexoValue) {
        radio.click();
      }
    });
  }
  
  // Estrangeiro - sempre "Não"
  const estrangeiroRadios = document.querySelectorAll('p-radiobutton[name="flagEstrangeiro"] input[type="radio"]');
  estrangeiroRadios.forEach(radio => {
    if (radio.value === '0') {
      radio.click();
    }
  });
  
  // Raça/Cor - BRANCA
  setTimeout(() => {
    const racaCorDropdown = document.querySelector('mvcommons-dropdown[controllabel="Raça cor"] p-dropdown');
    if (racaCorDropdown) {
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
      cepInput.value = '55700-000';
      cepInput.dispatchEvent(new Event('input', { bubbles: true }));
      cepInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, 500);
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

// Observa as mudanças no DOM para remoção de carregamento
const observerCarregamento = new MutationObserver(removerTelaDeCarregamento);
observerCarregamento.observe(document.body, { childList: true, subtree: true });

// ============================================
// FUNCIONALIDADE 3: MONITOR DE ELEMENTOS
// ============================================
function exibirNotificacao(mensagem, persistente = false) {
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

function obterValor(elemento) {
  if (elemento.tagName === "SELECT") {
    const opcao = elemento.options[elemento.selectedIndex];
    return opcao ? opcao.text : "";
  }
  return elemento.value || "";
}

function verificarElemento(elemento) {
  const valor = obterValor(elemento).trim().toUpperCase();

  for (const regra of regras) {
    const valorEsperado = regra.valorEsperado.toUpperCase();

    const corresponde = regra.correspondenciaExata
      ? valor === valorEsperado
      : valor.includes(valorEsperado);

    if (corresponde) {
      exibirNotificacao(regra.mensagem);
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
  const statusCriticos = ['AGUARDANDO REGULAÇÃO', 'AUTORIZADO', 'OPINIÃO FORMATIVA'];
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
    console.log('Duplicidade encontrada!', duplicado);
    exibirNotificacao(
      `ALERTA DE DUPLICIDADE\n\nEste cidadão já possui uma solicitação de "${duplicado.item}" - ID: ${duplicado.id} com status "${duplicado.status}" em ${duplicado.data}.`,
      true
    );
  } else {
    console.log('Nenhuma duplicidade crítica encontrada no histórico.');
    // Se era uma notificação de duplicidade, removemos
    if (notificacaoPersistente) {
      removerNotificacao();
    }
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

  if (!encontrou) {
    removerNotificacao();
  }
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
// INICIALIZAÇÃO
// ============================================
function iniciar() {
  // Verifica formulário para busca CNS/CPF
  setInterval(verificarFormulario, 3000);
  verificarFormulario();
  
  // Inicializa a verificação automática de histórico
  setInterval(verificarHistoricoAutomatico, 3000);
  
  // Inicializa o espelhamento de campos (Hipótese -> Informação)
  inicializarEspelhamentoCampos();
  
  // Carrega estado da remoção de carregamento
  chrome.storage.local.get('removerAtivo', function(data) {
    if (data.removerAtivo !== undefined) {
      removerAtivo = data.removerAtivo;
      console.log('Estado inicial da remoção automática: ' + (removerAtivo ? 'ativada' : 'desativada'));
      removerTelaDeCarregamento();
    }
  });
  
  // Inicia monitoramento de elementos constante
  setInterval(verificarTodos, 2000);
  
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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciar);
} else {
  iniciar();
}