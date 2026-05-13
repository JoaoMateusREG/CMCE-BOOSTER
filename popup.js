document.addEventListener('DOMContentLoaded', function() {
  // ============================================
  // ELEMENTOS DO DOM
  // ============================================
  const cpfCnsInput = document.getElementById('cpf-cns');
  const buscarSisregBtn = document.getElementById('buscarSisreg');
  const toggleRemoverCheckbox = document.getElementById('toggleRemover');
  const okMessage = document.getElementById('ok-message');
  const adicionarMedicoBtn = document.getElementById('adicionarMedico');
  const adicionarRegraBtn = document.getElementById('adicionarRegra');
  const mostrarAtalhosBtn = document.getElementById('mostrarAtalhos');

  // ============================================
  // FUNCIONALIDADES DE BUSCA CNS/CPF
  // ============================================
  let mensagemTimeout;
  function mostrarMensagemOk(mensagem = 'OK!', tempo = 3000) {
    okMessage.textContent = mensagem;
    okMessage.style.display = 'block';
    if (mensagemTimeout) clearTimeout(mensagemTimeout);
    mensagemTimeout = setTimeout(() => {
      okMessage.style.display = 'none';
    }, tempo);
  }

  function enviarMensagem(action, valor) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0] && tabs[0].url.includes('regulador.saude.pe.gov.br')) {
        chrome.tabs.sendMessage(tabs[0].id, { action: action, valor: valor }, function(response) {
          if (chrome.runtime.lastError) {
            console.error('Erro ao enviar mensagem:', chrome.runtime.lastError);
          } else {
            mostrarMensagemOk();
          }
        });
      } else {
        alert('Esta extensão só funciona no site do CMCE');
      }
    });
  }

  buscarSisregBtn.addEventListener('click', function() {
    const valorRaw = cpfCnsInput.value.trim();
    const valor = valorRaw.replace(/\D/g, '');
    
    if (valor.length === 11) {
      // Se digitou CPF, busca CNS
      enviarBuscaSisreg('buscarCNS', valor);
    } else if (valor.length === 15) {
      // Se digitou CNS, busca CPF
      enviarBuscaSisreg('buscarCPF', valor);
    } else {
      alert('Digite um CPF (11 números) ou CNS (15 números) válido.');
    }
  });

  function enviarBuscaSisreg(action, valor) {
    try {
      cpfCnsInput.disabled = true;
      buscarSisregBtn.disabled = true;
      buscarSisregBtn.textContent = 'Buscando...';

      chrome.runtime.sendMessage({ action: action, valor: valor }, function(response) {
        cpfCnsInput.disabled = false;
        buscarSisregBtn.disabled = false;
        buscarSisregBtn.textContent = 'Buscar no SISREG';
      });
    } catch (error) {
      console.log('Erro ao enviar mensagem:', error);
      cpfCnsInput.disabled = false;
      buscarSisregBtn.disabled = false;
      buscarSisregBtn.textContent = 'Buscar no SISREG';
    }
  }

  // ============================================
  // FUNCIONALIDADE DE REMOÇÃO DE CARREGAMENTO
  // ============================================
  // Carrega o estado inicial do toggle
  chrome.storage.local.get('removerAtivo', function(data) {
    toggleRemoverCheckbox.checked = data.removerAtivo !== false; // Default true
  });

  // Listener para mudanças no toggle
  toggleRemoverCheckbox.addEventListener('change', function() {
    const novoEstado = toggleRemoverCheckbox.checked;
    
    chrome.storage.local.set({ 'removerAtivo': novoEstado }, function() {
      // Atualiza o menu de contexto
      const novoTitulo = novoEstado ? "Desativar Remoção Automática" : "Ativar Remoção Automática";
      chrome.contextMenus.update("toggleRemover", { title: novoTitulo });
      
      // Envia mensagem para o content script
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0] && tabs[0].url.includes('regulador.saude.pe.gov.br')) {
          chrome.tabs.sendMessage(tabs[0].id, { ativo: novoEstado });
        }
      });
      
      console.log('Remoção automática ' + (novoEstado ? 'ativada' : 'desativada') + ' via popup.');
    });
  });

  // ============================================
  // FUNCIONALIDADES EXTRAS
  // ============================================
  adicionarMedicoBtn.addEventListener('click', function() {
    const nome = prompt('Nome do médico (ex: DR JOÃO SILVA):');
    if (!nome) return;
    
    const crm = prompt('CRM (ex: CRM 12345):');
    if (!crm) return;
    
    const especialidade = prompt('Especialidade (ex: CARDIOLOGIA):');
    
    // Envia para o content script
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0] && tabs[0].url.includes('regulador.saude.pe.gov.br')) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'adicionarMedico', 
          dados: { nome, crm, especialidade: especialidade || '' } 
        });
        mostrarMensagemOk();
        alert(`Médico ${nome} adicionado com sucesso!`);
      } else {
        alert('Abra o site do CMCE para adicionar médicos');
      }
    });
  });

  adicionarRegraBtn.addEventListener('click', function() {
    const valorEsperado = prompt('Texto/CID a ser monitorado (ex: ENDOSCOPIA):');
    if (!valorEsperado) return;
    
    const mensagem = prompt('Aviso que aparecerá na tela (ex: Precisa de APAC):');
    if (!mensagem) return;
    
    // Envia para o content script
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0] && tabs[0].url.includes('regulador.saude.pe.gov.br')) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'adicionarRegra', 
          dados: { valorEsperado, mensagem } 
        });
        mostrarMensagemOk();
        alert(`Regra para "${valorEsperado}" adicionada com sucesso!`);
      } else {
        alert('Abra o site do CMCE para adicionar regras');
      }
    });
  });

  mostrarAtalhosBtn.addEventListener('click', function() {
    const atalhos = `
ATALHOS DISPONÍVEIS:

⌨️ ATALHOS DE TECLADO:
• Tab/Enter: Aceitar sugestão de médico
• Setas ↑↓: Navegar nas sugestões
• Esc: Fechar sugestões

🔍 AUTOCOMPLETE DE MÉDICOS:
• Digite "DR" ou "DRA" + nome
• Funciona automaticamente em campos de texto
• Base de dados expansível

🔧 FUNCIONALIDADES:
• Busca CNS/CPF no SISREG
• Remove telas de carregamento
• Monitora elementos da página
• Alertas automáticos por regras
    `;
    
    alert(atalhos);
  });

  // ============================================
  // FORMATAÇÃO DE INPUT
  // ============================================
  cpfCnsInput.addEventListener('input', function() {
    let valor = this.value.replace(/\D/g, '');
    
    // Se tem 11 dígitos, formata como CPF
    if (valor.length === 11) {
      valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    // Se tem 15 dígitos, formata como CNS
    else if (valor.length === 15) {
      valor = valor.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
    }
    
    this.value = valor;
  });
});