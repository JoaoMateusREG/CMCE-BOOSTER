// ============================================
// CONFIGURAÇÃO DAS REGRAS DE MONITORAMENTO
// ============================================
const regras = [];

// ============================================
// GESTÃO DE REGRAS E ARMAZENAMENTO DINÂMICO
// ============================================

/**
 * Carrega e sincroniza as regras do storage
 */
function carregarRegras() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      chrome.storage.local.get(['cidsCustomizados', 'procedimentosCustomizados'], (data) => {
        if (chrome.runtime.lastError) {
          console.warn('CMCE Booster - Erro ao ler regras do storage:', chrome.runtime.lastError.message);
          return;
        }
        
        const cids = data.cidsCustomizados || [];
        const procedimentos = data.procedimentosCustomizados || [];

        regras.length = 0;
        cids.forEach(r => regras.push(r));
        procedimentos.forEach(r => regras.push(r));
        console.log('Regras sincronizadas do storage:', regras.length);
      });
    } catch (e) {
      console.warn('CMCE Booster - Erro na execução de carregarRegras:', e);
    }
  }
}

// Escuta mudanças no storage para manter regras sincronizadas em tempo real
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.cidsCustomizados || changes.procedimentosCustomizados) {
          carregarRegras();
        }
      }
    });
  } catch (e) {
    console.warn('CMCE Booster - Erro ao registrar listener de mudanças nas regras:', e);
  }
}

// Carrega as regras ao iniciar
carregarRegras();