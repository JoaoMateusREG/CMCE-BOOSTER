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
