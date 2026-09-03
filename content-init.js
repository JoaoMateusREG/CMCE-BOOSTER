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