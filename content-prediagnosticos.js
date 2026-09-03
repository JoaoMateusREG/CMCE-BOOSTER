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
