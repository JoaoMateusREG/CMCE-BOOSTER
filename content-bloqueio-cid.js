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

let cidDocumentClickListenerAtivo = false;

function inicializarBloqueioCid() {
  const cidInput = document.querySelector('p-inputmask[formcontrolname="codigoCidPrincipal"] input');
  const hipotese = document.querySelector('textarea[controllabel="Hipótese Diagnóstica"]');
  
  if (!cidInput || !hipotese) return;
  
  if (cidInput.dataset.boosterCidAtivo === 'true') return;
  cidInput.dataset.boosterCidAtivo = 'true';

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
    if (!cidDocumentClickListenerAtivo) {
      document.addEventListener('click', (e) => {
        if (e.target.closest('.ui-autocomplete-list-item') || e.target.closest('li.ui-autocomplete-list-item')) {
          setTimeout(() => verificarCidPrincipalPreenchido(), 500);
        }
      }, true);
      cidDocumentClickListenerAtivo = true;
    }

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
