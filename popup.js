document.addEventListener('DOMContentLoaded', function() {
  // ============================================
  // TAB NAVIGATION
  // ============================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContainers = document.querySelectorAll('.tab-container');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContainers.forEach(container => container.classList.remove('active'));

      button.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });

  // ============================================
  // TAB 1: GERAL (SISREG & CONFIGURAÇÕES)
  // ============================================
  const cpfCnsInput = document.getElementById('cpf-cns');
  const buscarSisregBtn = document.getElementById('buscarSisreg');
  const toggleRemoverCheckbox = document.getElementById('toggleRemover');
  const okMessage = document.getElementById('ok-message');
  const mostrarAtalhosBtn = document.getElementById('mostrarAtalhos');

  let mensagemTimeout;
  function mostrarMensagemOk(mensagem = 'OK!', tempo = 3000) {
    okMessage.textContent = mensagem;
    okMessage.style.display = 'block';
    if (mensagemTimeout) clearTimeout(mensagemTimeout);
    mensagemTimeout = setTimeout(() => {
      okMessage.style.display = 'none';
    }, tempo);
  }

  // Formatar CPF/CNS enquanto digita
  cpfCnsInput.addEventListener('input', function() {
    let valor = this.value.replace(/\D/g, '');
    if (valor.length === 11) {
      valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (valor.length === 15) {
      valor = valor.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
    }
    this.value = valor;
  });

  // Ação Buscar no SISREG
  buscarSisregBtn.addEventListener('click', function() {
    const valorRaw = cpfCnsInput.value.trim();
    const valor = valorRaw.replace(/\D/g, '');
    
    if (valor.length === 11) {
      enviarBuscaSisreg('buscarCNS', valor);
    } else if (valor.length === 15) {
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
        buscarSisregBtn.textContent = '🔍 Buscar no SISREG';
        mostrarMensagemOk('Busca iniciada!');
      });
    } catch (error) {
      console.log('Erro ao enviar mensagem:', error);
      cpfCnsInput.disabled = false;
      buscarSisregBtn.disabled = false;
      buscarSisregBtn.textContent = '🔍 Buscar no SISREG';
    }
  }

  // Configurações de Remoção de Carregamento
  chrome.storage.local.get('removerAtivo', function(data) {
    toggleRemoverCheckbox.checked = data.removerAtivo !== false;
  });

  toggleRemoverCheckbox.addEventListener('change', function() {
    const novoEstado = toggleRemoverCheckbox.checked;
    chrome.storage.local.set({ 'removerAtivo': novoEstado }, function() {
      // Envia para a tab ativa do CMCE
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0] && tabs[0].url.includes('regulador.saude.pe.gov.br')) {
          chrome.tabs.sendMessage(tabs[0].id, { ativo: novoEstado });
        }
      });
      mostrarMensagemOk('Configuração salva!');
    });
  });

  // Mostrar atalhos
  mostrarAtalhosBtn.addEventListener('click', function() {
    alert(`
ATALHOS DISPONÍVEIS:

⌨️ ATALHOS DE TECLADO (Médicos):
• Tab/Enter: Aceitar sugestão de médico
• Setas ↑↓: Navegar nas sugestões
• Esc: Fechar sugestões

🔍 AUTOCOMPLETE DE MÉDICOS:
• Digite "DR" ou "DRA" + nome
• Funciona automaticamente em qualquer campo de texto
• Base de dados atualizada em tempo real!
    `);
  });


  // ============================================
  // TAB 2: MÉDICOS
  // ============================================
  const btnToggleMedico = document.getElementById('btn-toggle-medico');
  const formMedico = document.getElementById('form-medico');
  const listMedicos = document.getElementById('list-medicos');
  const searchMedicos = document.getElementById('search-medicos');
  
  const medicoNome = document.getElementById('medico-nome');
  const medicoCrm = document.getElementById('medico-crm');
  const medicoEsp = document.getElementById('medico-esp');
  const btnSalvarMedico = document.getElementById('btn-salvar-medico');
  const btnCancelarMedico = document.getElementById('btn-cancelar-medico');
  const editMedicoIdx = document.getElementById('edit-medico-idx');

  // Toggle Form Médico
  btnToggleMedico.addEventListener('click', () => {
    formMedico.classList.toggle('open');
    if (formMedico.classList.contains('open')) {
      btnToggleMedico.textContent = 'Fechar';
      btnToggleMedico.className = 'btn btn-danger btn-toggle-form';
      resetFormMedico();
    } else {
      btnToggleMedico.textContent = '+ Novo Médico';
      btnToggleMedico.className = 'btn btn-success btn-toggle-form';
    }
  });

  btnCancelarMedico.addEventListener('click', (e) => {
    e.preventDefault();
    formMedico.classList.remove('open');
    btnToggleMedico.textContent = '+ Novo Médico';
    btnToggleMedico.className = 'btn btn-success btn-toggle-form';
    resetFormMedico();
  });

  function resetFormMedico() {
    medicoNome.value = '';
    medicoCrm.value = '';
    medicoEsp.value = '';
    editMedicoIdx.value = '';
    btnSalvarMedico.textContent = 'Salvar';
  }

  // Carregar e renderizar Médicos
  function renderMedicos() {
    const query = searchMedicos.value.toLowerCase().trim();
    chrome.storage.local.get('medicosCustomizados', (data) => {
      const medicos = data.medicosCustomizados || [];
      listMedicos.innerHTML = '';

      const filtered = medicos.filter(m => 
        m.nome.toLowerCase().includes(query) || 
        m.crm.toLowerCase().includes(query) || 
        (m.especialidade && m.especialidade.toLowerCase().includes(query))
      );

      if (filtered.length === 0) {
        listMedicos.innerHTML = `<div style="text-align:center; padding:20px; font-size:12px; color:#94a3b8;">Nenhum médico encontrado.</div>`;
        return;
      }

      filtered.forEach((medico) => {
        // Encontra o index real no array original
        const origIndex = medicos.findIndex(m => m.nome === medico.nome && m.crm === medico.crm);

        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
          <div class="item-info">
            <h3>${medico.nome}</h3>
            <p>${medico.crm} • ${medico.especialidade || 'SEM ESPECIALIDADE'}</p>
          </div>
          <div class="item-actions">
            <button class="btn-action btn-action-edit" data-idx="${origIndex}" title="Editar">✏️</button>
            <button class="btn-action btn-action-delete" data-idx="${origIndex}" title="Excluir">❌</button>
          </div>
        `;
        listMedicos.appendChild(card);
      });

      // Listeners de Edit e Delete
      listMedicos.querySelectorAll('.btn-action-edit').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = btn.getAttribute('data-idx');
          preencherEditMedico(idx, medicos[idx]);
        });
      });

      listMedicos.querySelectorAll('.btn-action-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = btn.getAttribute('data-idx');
          if (confirm(`Deseja realmente excluir o(a) Dr(a). ${medicos[idx].nome}?`)) {
            excluirMedico(idx, medicos);
          }
        });
      });
    });
  }

  function preencherEditMedico(idx, medico) {
    formMedico.classList.add('open');
    btnToggleMedico.textContent = 'Fechar';
    btnToggleMedico.className = 'btn btn-danger btn-toggle-form';

    medicoNome.value = medico.nome;
    medicoCrm.value = medico.crm;
    medicoEsp.value = medico.especialidade || '';
    editMedicoIdx.value = idx;
    btnSalvarMedico.textContent = 'Salvar Alterações';
  }

  btnSalvarMedico.addEventListener('click', (e) => {
    e.preventDefault();
    const nome = medicoNome.value.trim().toUpperCase();
    const crm = medicoCrm.value.trim().toUpperCase();
    const especialidade = medicoEsp.value.trim().toUpperCase();
    const idx = editMedicoIdx.value;

    if (!nome || !crm) {
      alert('Nome e CRM são obrigatórios.');
      return;
    }

    chrome.storage.local.get('medicosCustomizados', (data) => {
      const medicos = data.medicosCustomizados || [];
      const novoMedico = {
        nome,
        crm,
        especialidade,
        busca: `${nome} ${crm} ${especialidade}`.toUpperCase()
      };

      if (idx === '') {
        // Novo médico
        medicos.push(novoMedico);
      } else {
        // Editar existente
        medicos[idx] = novoMedico;
      }

      chrome.storage.local.set({ medicosCustomizados: medicos }, () => {
        resetFormMedico();
        formMedico.classList.remove('open');
        btnToggleMedico.textContent = '+ Novo Médico';
        btnToggleMedico.className = 'btn btn-success btn-toggle-form';
        renderMedicos();
      });
    });
  });

  function excluirMedico(idx, medicos) {
    medicos.splice(idx, 1);
    chrome.storage.local.set({ medicosCustomizados: medicos }, () => {
      renderMedicos();
    });
  }

  searchMedicos.addEventListener('input', renderMedicos);


  // ============================================
  // TAB 3: PROCEDIMENTOS
  // ============================================
  const btnToggleProc = document.getElementById('btn-toggle-proc');
  const formProc = document.getElementById('form-proc');
  const listProcedimentos = document.getElementById('list-procedimentos');
  const searchProc = document.getElementById('search-proc');

  const procTermo = document.getElementById('proc-termo');
  const procMin = document.getElementById('proc-min');
  const procMax = document.getElementById('proc-max');
  const procExato = document.getElementById('proc-exato');
  const procMsg = document.getElementById('proc-msg');
  const btnSalvarProc = document.getElementById('btn-salvar-proc');
  const btnCancelarProc = document.getElementById('btn-cancelar-proc');
  const editProcIdx = document.getElementById('edit-proc-idx');

  btnToggleProc.addEventListener('click', () => {
    formProc.classList.toggle('open');
    if (formProc.classList.contains('open')) {
      btnToggleProc.textContent = 'Fechar';
      btnToggleProc.className = 'btn btn-danger btn-toggle-form';
      resetFormProc();
    } else {
      btnToggleProc.textContent = '+ Novo Procedimento';
      btnToggleProc.className = 'btn btn-success btn-toggle-form';
    }
  });

  btnCancelarProc.addEventListener('click', (e) => {
    e.preventDefault();
    formProc.classList.remove('open');
    btnToggleProc.textContent = '+ Novo Procedimento';
    btnToggleProc.className = 'btn btn-success btn-toggle-form';
    resetFormProc();
  });

  function resetFormProc() {
    procTermo.value = '';
    procMin.value = '';
    procMax.value = '';
    procExato.checked = false;
    procMsg.value = '';
    editProcIdx.value = '';
    btnSalvarProc.textContent = 'Salvar';
  }

  function renderProcedimentos() {
    const query = searchProc.value.toLowerCase().trim();
    chrome.storage.local.get('procedimentosCustomizados', (data) => {
      const procedimentos = data.procedimentosCustomizados || [];
      listProcedimentos.innerHTML = '';

      const filtered = procedimentos.filter(p => 
        p.valorEsperado.toLowerCase().includes(query) || 
        p.mensagem.toLowerCase().includes(query)
      );

      if (filtered.length === 0) {
        listProcedimentos.innerHTML = `<div style="text-align:center; padding:20px; font-size:12px; color:#94a3b8;">Nenhum procedimento encontrado.</div>`;
        return;
      }

      filtered.forEach((proc) => {
        const origIndex = procedimentos.findIndex(p => p.valorEsperado === proc.valorEsperado && p.mensagem === proc.mensagem);
        const hasAge = (proc.idadeMin !== undefined && proc.idadeMax !== undefined);
        const ageLabel = hasAge ? `${proc.idadeMin} a ${proc.idadeMax} anos` : 'Sem restrição';

        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
          <div class="item-info">
            <h3>${proc.valorEsperado}</h3>
            <p>${proc.mensagem.replace(/\n/g, ' ')}</p>
            <span class="item-badge">${ageLabel}</span>
            <span class="item-badge item-badge-warning">${proc.correspondenciaExata ? 'Exato' : 'Contém'}</span>
          </div>
          <div class="item-actions">
            <button class="btn-action btn-action-edit" data-idx="${origIndex}" title="Editar">✏️</button>
            <button class="btn-action btn-action-delete" data-idx="${origIndex}" title="Excluir">❌</button>
          </div>
        `;
        listProcedimentos.appendChild(card);
      });

      listProcedimentos.querySelectorAll('.btn-action-edit').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = btn.getAttribute('data-idx');
          preencherEditProc(idx, procedimentos[idx]);
        });
      });

      listProcedimentos.querySelectorAll('.btn-action-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = btn.getAttribute('data-idx');
          if (confirm(`Deseja excluir o procedimento "${procedimentos[idx].valorEsperado}"?`)) {
            excluirProc(idx, procedimentos);
          }
        });
      });
    });
  }

  function preencherEditProc(idx, proc) {
    formProc.classList.add('open');
    btnToggleProc.textContent = 'Fechar';
    btnToggleProc.className = 'btn btn-danger btn-toggle-form';

    procTermo.value = proc.valorEsperado;
    procMin.value = proc.idadeMin !== undefined ? proc.idadeMin : '';
    procMax.value = proc.idadeMax !== undefined ? proc.idadeMax : '';
    procExato.checked = proc.correspondenciaExata === true;
    procMsg.value = proc.mensagem;
    editProcIdx.value = idx;
    btnSalvarProc.textContent = 'Salvar Alterações';
  }

  btnSalvarProc.addEventListener('click', (e) => {
    e.preventDefault();
    const termo = procTermo.value.trim().toUpperCase();
    const minVal = procMin.value.trim();
    const maxVal = procMax.value.trim();
    const exato = procExato.checked;
    const mensagem = procMsg.value.trim();
    const idx = editProcIdx.value;

    if (!termo || !mensagem) {
      alert('Termo do procedimento e mensagem são obrigatórios.');
      return;
    }

    chrome.storage.local.get('procedimentosCustomizados', (data) => {
      const procedimentos = data.procedimentosCustomizados || [];
      const novoProc = {
        seletor: "select, input, textarea",
        valorEsperado: termo,
        mensagem: mensagem,
        correspondenciaExata: exato
      };

      if (minVal !== '' && maxVal !== '') {
        novoProc.idadeMin = parseInt(minVal, 10);
        novoProc.idadeMax = parseInt(maxVal, 10);
      }

      if (idx === '') {
        procedimentos.push(novoProc);
      } else {
        procedimentos[idx] = novoProc;
      }

      chrome.storage.local.set({ procedimentosCustomizados: procedimentos }, () => {
        resetFormProc();
        formProc.classList.remove('open');
        btnToggleProc.textContent = '+ Novo Procedimento';
        btnToggleProc.className = 'btn btn-success btn-toggle-form';
        renderProcedimentos();
      });
    });
  });

  function excluirProc(idx, procedimentos) {
    procedimentos.splice(idx, 1);
    chrome.storage.local.set({ procedimentosCustomizados: procedimentos }, () => {
      renderProcedimentos();
    });
  }

  searchProc.addEventListener('input', renderProcedimentos);


  // ============================================
  // TAB 4: CIDS
  // ============================================
  const btnToggleCid = document.getElementById('btn-toggle-cid');
  const formCid = document.getElementById('form-cid');
  const listCids = document.getElementById('list-cids');
  const searchCid = document.getElementById('search-cid');

  const cidCodigo = document.getElementById('cid-codigo');
  const cidExato = document.getElementById('cid-exato');
  const cidMsg = document.getElementById('cid-msg');
  const btnSalvarCid = document.getElementById('btn-salvar-cid');
  const btnCancelarCid = document.getElementById('btn-cancelar-cid');
  const editCidIdx = document.getElementById('edit-cid-idx');

  btnToggleCid.addEventListener('click', () => {
    formCid.classList.toggle('open');
    if (formCid.classList.contains('open')) {
      btnToggleCid.textContent = 'Fechar';
      btnToggleCid.className = 'btn btn-danger btn-toggle-form';
      resetFormCid();
    } else {
      btnToggleCid.textContent = '+ Novo CID';
      btnToggleCid.className = 'btn btn-success btn-toggle-form';
    }
  });

  btnCancelarCid.addEventListener('click', (e) => {
    e.preventDefault();
    formCid.classList.remove('open');
    btnToggleCid.textContent = '+ Novo CID';
    btnToggleCid.className = 'btn btn-success btn-toggle-form';
    resetFormCid();
  });

  function resetFormCid() {
    cidCodigo.value = '';
    cidExato.checked = true;
    cidMsg.value = '';
    editCidIdx.value = '';
    btnSalvarCid.textContent = 'Salvar';
  }

  function renderCIDs() {
    const query = searchCid.value.toLowerCase().trim();
    chrome.storage.local.get('cidsCustomizados', (data) => {
      const cids = data.cidsCustomizados || [];
      listCids.innerHTML = '';

      const filtered = cids.filter(c => 
        c.valorEsperado.toLowerCase().includes(query) || 
        c.mensagem.toLowerCase().includes(query)
      );

      if (filtered.length === 0) {
        listCids.innerHTML = `<div style="text-align:center; padding:20px; font-size:12px; color:#94a3b8;">Nenhum CID encontrado.</div>`;
        return;
      }

      filtered.forEach((cid) => {
        const origIndex = cids.findIndex(c => c.valorEsperado === cid.valorEsperado && c.mensagem === cid.mensagem);

        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
          <div class="item-info">
            <h3>${cid.valorEsperado}</h3>
            <p>${cid.mensagem}</p>
            <span class="item-badge item-badge-warning">${cid.correspondenciaExata ? 'Exato' : 'Contém'}</span>
          </div>
          <div class="item-actions">
            <button class="btn-action btn-action-edit" data-idx="${origIndex}" title="Editar">✏️</button>
            <button class="btn-action btn-action-delete" data-idx="${origIndex}" title="Excluir">❌</button>
          </div>
        `;
        listCids.appendChild(card);
      });

      listCids.querySelectorAll('.btn-action-edit').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = btn.getAttribute('data-idx');
          preencherEditCid(idx, cids[idx]);
        });
      });

      listCids.querySelectorAll('.btn-action-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = btn.getAttribute('data-idx');
          if (confirm(`Deseja excluir o CID/Regra "${cids[idx].valorEsperado}"?`)) {
            excluirCid(idx, cids);
          }
        });
      });
    });
  }

  function preencherEditCid(idx, cid) {
    formCid.classList.add('open');
    btnToggleCid.textContent = 'Fechar';
    btnToggleCid.className = 'btn btn-danger btn-toggle-form';

    cidCodigo.value = cid.valorEsperado;
    cidExato.checked = cid.correspondenciaExata === true;
    cidMsg.value = cid.mensagem;
    editCidIdx.value = idx;
    btnSalvarCid.textContent = 'Salvar Alterações';
  }

  btnSalvarCid.addEventListener('click', (e) => {
    e.preventDefault();
    const codigo = cidCodigo.value.trim().toUpperCase();
    const exato = cidExato.checked;
    const mensagem = cidMsg.value.trim();
    const idx = editCidIdx.value;

    if (!codigo || !mensagem) {
      alert('Código/termo do CID e mensagem são obrigatórios.');
      return;
    }

    chrome.storage.local.get('cidsCustomizados', (data) => {
      const cids = data.cidsCustomizados || [];
      const novoCid = {
        seletor: "select, input, textarea",
        valorEsperado: codigo,
        mensagem: mensagem,
        correspondenciaExata: exato
      };

      if (idx === '') {
        cids.push(novoCid);
      } else {
        cids[idx] = novoCid;
      }

      chrome.storage.local.set({ cidsCustomizados: cids }, () => {
        resetFormCid();
        formCid.classList.remove('open');
        btnToggleCid.textContent = '+ Novo CID';
        btnToggleCid.className = 'btn btn-success btn-toggle-form';
        renderCIDs();
      });
    });
  });

  function excluirCid(idx, cids) {
    cids.splice(idx, 1);
    chrome.storage.local.set({ cidsCustomizados: cids }, () => {
      renderCIDs();
    });
  }

  searchCid.addEventListener('input', renderCIDs);


  // ============================================
  // STORAGE LISTENER & FIRST RENDER
  // ============================================
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.medicosCustomizados) {
          renderMedicos();
        }
        if (changes.procedimentosCustomizados) {
          renderProcedimentos();
        }
        if (changes.cidsCustomizados) {
          renderCIDs();
        }
      }
    });
  }

  // ============================================
  // IMPORTAÇÃO / EXPORTAÇÃO
  // ============================================
  function exportarDados(dados, nomeArquivo) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", nomeArquivo + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  function setupImportExport(btnExportId, btnImportId, fileInputId, storageKey, duplicateCheckFn, renderFn) {
    const btnExport = document.getElementById(btnExportId);
    const btnImport = document.getElementById(btnImportId);
    const fileInput = document.getElementById(fileInputId);

    if (!btnExport || !btnImport || !fileInput) return;

    btnExport.addEventListener('click', () => {
      chrome.storage.local.get(storageKey, (data) => {
        const items = data[storageKey] || [];
        exportarDados(items, storageKey);
        mostrarMensagemOk('Exportação concluída!');
      });
    });

    btnImport.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedItems = JSON.parse(event.target.result);
          if (!Array.isArray(importedItems)) {
            alert("Formato de arquivo inválido. O arquivo deve conter uma lista (array) de itens.");
            return;
          }

          const substituir = confirm("Deseja SUBSTITUIR a base atual?\n\n[OK] = Substituir toda a base existente\n[Cancelar] = Apenas adicionar/mesclar os itens novos (ignorando duplicatas)");

          chrome.storage.local.get(storageKey, (data) => {
            let currentItems = data[storageKey] || [];
            
            if (substituir) {
              currentItems = importedItems;
            } else {
              importedItems.forEach(importItem => {
                const isDuplicate = currentItems.some(currItem => duplicateCheckFn(currItem, importItem));
                if (!isDuplicate) {
                  currentItems.push(importItem);
                }
              });
            }

            chrome.storage.local.set({ [storageKey]: currentItems }, () => {
              mostrarMensagemOk('Importação concluída com sucesso!');
              renderFn();
            });
          });
        } catch (err) {
          alert("Erro ao ler o arquivo JSON: " + err.message);
        }
        fileInput.value = '';
      };
      reader.readAsText(file);
    });
  }

  setupImportExport('btn-export-medico', 'btn-import-medico', 'file-import-medico', 'medicosCustomizados', 
    (a, b) => a.nome === b.nome && a.crm === b.crm, renderMedicos);
    
  setupImportExport('btn-export-proc', 'btn-import-proc', 'file-import-proc', 'procedimentosCustomizados', 
    (a, b) => a.valorEsperado === b.valorEsperado && a.mensagem === b.mensagem, renderProcedimentos);
    
  setupImportExport('btn-export-cid', 'btn-import-cid', 'file-import-cid', 'cidsCustomizados', 
    (a, b) => a.valorEsperado === b.valorEsperado && a.mensagem === b.mensagem, renderCIDs);

  // Render inicial após pequeno delay para garantir que os scripts de banco inicializaram
  setTimeout(() => {
    renderMedicos();
    renderProcedimentos();
    renderCIDs();
  }, 100);

  // ============================================
  // EXTRATOR IA
  // ============================================
  const extratorPdfInput = document.getElementById('extrator-pdf-input');
  const btnSelecionarPdf = document.getElementById('btn-selecionar-pdf');
  const extratorLoading = document.getElementById('extrator-loading');
  const extratorErro = document.getElementById('extrator-erro');
  const extratorResultados = document.getElementById('extrator-resultados');
  const botoesExtrator = document.getElementById('botoes-extrator');

  // Recupera dados extraídos caso o usuário tenha fechado e aberto o popup
  chrome.storage.local.get('extratorDados', (data) => {
    if (data.extratorDados) {
      renderizarBotoesIA(data.extratorDados);
    }
  });

  if (btnSelecionarPdf && extratorPdfInput) {
    btnSelecionarPdf.addEventListener('click', () => extratorPdfInput.click());

    extratorPdfInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      extratorLoading.style.display = 'block';
      extratorErro.style.display = 'none';
      extratorResultados.style.display = 'none';
      botoesExtrator.innerHTML = '';

      const formData = new FormData();
      formData.append('pdf', file);

      try {
        const response = await fetch('http://127.0.0.1:5000/extrair', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Falha na API: ' + response.statusText);
        const dados = await response.json();

        // Salva os dados localmente para quando o usuário fechar/abrir o popup
        chrome.storage.local.set({ extratorDados: dados }, () => {
          renderizarBotoesIA(dados);
        });
      } catch (err) {
        extratorErro.textContent = 'Erro ao processar: Servidor Python está rodando na porta 5000?';
        extratorErro.style.display = 'block';
      } finally {
        extratorLoading.style.display = 'none';
        extratorPdfInput.value = '';
      }
    });
  }

  function renderizarBotoesIA(dados) {
    extratorResultados.style.display = 'flex';
    
    function criarBotao(label, actionName, valorStr) {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.style.cssText = `
        padding: 6px 10px;
        background: #f8f9fa;
        color: #333;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        text-align: left;
        transition: background 0.2s;
        margin-bottom: 4px;
        width: 100%;
      `;
      btn.onmouseover = () => btn.style.background = '#e9ecef';
      btn.onmouseout = () => btn.style.background = '#f8f9fa';
      
      btn.onclick = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: actionName, valor: valorStr });
            mostrarMensagemOk('Preenchendo...');
          }
        });
      };
      return btn;
    }

    if (dados.cpf_cns) {
      const isCpf = dados.cpf_cns.replace(/\D/g, '').length <= 11;
      const rotulo = isCpf ? 'Inserir CPF: ' : 'Inserir CNS: ';
      botoesExtrator.appendChild(criarBotao(rotulo + dados.cpf_cns, 'inserir_cpf', dados.cpf_cns));
    }
    if (dados.nome_cidadao) {
      botoesExtrator.appendChild(criarBotao('Inserir Nome: ' + dados.nome_cidadao, 'inserir_nome', dados.nome_cidadao));
    }
    if (dados.data_nascimento) {
      botoesExtrator.appendChild(criarBotao('Inserir Nascimento: ' + dados.data_nascimento, 'inserir_data', dados.data_nascimento));
    }
    if (dados.cid10) {
      const codigoCid = dados.cid10.split(' - ')[0].trim();
      botoesExtrator.appendChild(criarBotao('Inserir CID: ' + codigoCid, 'inserir_cid', codigoCid));
    }
    if (dados.profissional) {
      const profTexto = dados.profissional + (dados.crm ? ' - ' + dados.crm : '');
      botoesExtrator.appendChild(criarBotao('Inserir Profissional: ' + profTexto, 'inserir_profissional', {
          nome: dados.profissional,
          crm: dados.crm
      }));
    }
    if (dados.motivo) {
      botoesExtrator.appendChild(criarBotao('Inserir Motivo (Preenche ambos)', 'inserir_motivo', dados.motivo));
    }
  }
});