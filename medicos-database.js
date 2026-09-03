// ============================================
// BASE DE DADOS DE MÉDICOS
// ============================================
// Esta base pode ser expandida conforme necessário
// Formato: { nome: "Nome completo", crm: "CRM XXXXX", especialidades: ["esp1", "esp2"] }

const medicosDatabase = [];

// ============================================
// FUNÇÕES DE BUSCA E AUTOCOMPLETE
// ============================================

/**
 * Busca médicos baseado no texto digitado
 * @param {string} texto - Texto digitado pelo usuário
 * @returns {Array} Array de médicos que correspondem à busca
 */
function buscarMedicos(texto) {
  if (!texto || texto.length < 2) return [];
  
  const textoBusca = texto.toUpperCase().trim();
  
  const resultados = medicosDatabase.filter(medico => {
    // Busca no campo de busca otimizado
    const encontrouBusca = medico.busca && medico.busca.includes(textoBusca);
    // Busca no nome completo
    const encontrouNome = medico.nome.toUpperCase().includes(textoBusca);
    // Busca no CRM
    const encontrouCRM = medico.crm.toUpperCase().includes(textoBusca);
    // Busca na especialidade
    const encontrouEsp = medico.especialidade && medico.especialidade.includes(textoBusca);
    
    return encontrouBusca || encontrouNome || encontrouCRM || encontrouEsp;
  }).slice(0, 5); // Limita a 5 resultados
  
  return resultados;
}

/**
 * Formata a sugestão para exibição
 * @param {Object} medico - Objeto do médico
 * @returns {string} Texto formatado para exibição
 */
function formatarSugestao(medico) {
  return `${medico.nome} - ${medico.especialidade}`;
}

/**
 * Adiciona novo médico à base
 * @param {Object} novoMedico - Dados do novo médico
 */
function adicionarMedico(novoMedico) {
  novoMedico.busca = `${novoMedico.nome} ${novoMedico.crm} ${novoMedico.especialidade}`.toUpperCase();
  medicosDatabase.push(novoMedico);
  
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      chrome.storage.local.get('medicosCustomizados', (data) => {
        if (chrome.runtime.lastError) return;
        const medicosCustomizados = data.medicosCustomizados || [];
        medicosCustomizados.push(novoMedico);
        chrome.storage.local.set({ medicosCustomizados });
      });
    } catch (e) {
      console.warn('CMCE Booster - Erro ao adicionar médico no storage:', e);
    }
  }
}

/**
 * Carrega médicos customizados do storage
 */
function carregarMedicosCustomizados() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      chrome.storage.local.get(['medicosCustomizados'], (data) => {
        if (chrome.runtime.lastError) {
          console.warn('CMCE Booster - Erro ao ler médicos do storage:', chrome.runtime.lastError.message);
          return;
        }
        
        let medicos = data.medicosCustomizados || [];

        medicosDatabase.length = 0;
        medicos.forEach(m => {
          if (!m.busca) {
            m.busca = `${m.nome} ${m.crm} ${m.especialidade}`.toUpperCase();
          }
          medicosDatabase.push(m);
        });
        console.log('Médicos carregados do storage:', medicosDatabase.length);
      });
    } catch (e) {
      console.warn('CMCE Booster - Erro na execução de carregarMedicosCustomizados:', e);
    }
  }
}

// Escuta mudanças no storage para manter a base atualizada em tempo real
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.medicosCustomizados) {
        const novosMedicos = changes.medicosCustomizados.newValue || [];
        medicosDatabase.length = 0;
        novosMedicos.forEach(m => {
          if (!m.busca) {
            m.busca = `${m.nome} ${m.crm} ${m.especialidade}`.toUpperCase();
          }
          medicosDatabase.push(m);
        });
      }
    });
  } catch (e) {
    console.warn('CMCE Booster - Erro ao registrar listener de mudanças nos médicos:', e);
  }
}

// Carrega médicos customizados ao inicializar
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
  carregarMedicosCustomizados();
}