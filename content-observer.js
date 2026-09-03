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
