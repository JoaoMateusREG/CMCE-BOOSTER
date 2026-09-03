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
