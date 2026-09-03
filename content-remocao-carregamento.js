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
