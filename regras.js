// ============================================
// CONFIGURAÇÃO DAS REGRAS DE MONITORAMENTO
// ============================================
// Aqui você define quais textos quer monitorar e quais mensagens exibir

const regras = [
  {
    // seletor: Define QUAIS elementos da página serão monitorados (inputs, selects, textareas)
    seletor: "select, input, textarea",

    // valorEsperado: O texto que você quer detectar
    valorEsperado: "IFP - COLONOSCOPIA (COLOSCOPIA)",

    // mensagem: A mensagem que aparecerá na tela quando o texto for detectado
    // Use \n para criar parágrafos/quebras de linha
    mensagem:
      "Lembre-se que o paciente precisa levar o parecer cardiológico caso tenha entre 60 e 65 anos.\n\nFaixa etária: 18 a 65 anos.\n\nPrecisa-se de APAC.",

    // correspondenciaExata:
    // - false = detecta se o texto CONTÉM a frase (ex: "C.ONSULTA EM OFTALMOLOGIA GERAL URGENTE" também funciona)
    // - true = detecta apenas se o texto for EXATAMENTE igual
    correspondenciaExata: true,
    idadeMin: 18,
    idadeMax: 65
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "ALFA - COLONOSCOPIA (COLOSCOPIA)",
    mensagem: "Faixa etária entre 14 e 69 anos.\n\nPrecisa-se de APAC.",
    correspondenciaExata: true,
    idadeMin: 14,
    idadeMax: 69
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "GENETICA",
    mensagem:
      "Encaminhamentos para geneticista devem ser regulados pelo link da GRAMB.",
    correspondenciaExata: false,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "CONSULTA PRÉ NATAL DE ALTO RISCO",
    mensagem:
      "Médicos que atendem PNAR: \n\nDr Dirce Luiza Pereira dos Santos\nDr Thiago Cesar Parente Saraiva.",
    correspondenciaExata: false,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "RESSONANCIA MAGNETICA",
    mensagem: "Precisa-se de APAC.",
    correspondenciaExata: false,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "TOMOGRAFIA COMPUTADORIZADA",
    mensagem: "Precisa-se de APAC.",
    correspondenciaExata: false,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "DENSITOMETRIA OSSEA",
    mensagem: "Precisa-se de APAC.",
    correspondenciaExata: false,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "ELETRONEUROMIOGRAFIA",
    mensagem: "Precisa-se de APAC.",
    correspondenciaExata: false,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "ELETROENCEFALOGRAMA",
    mensagem: "Precisa-se de APAC.",
    correspondenciaExata: false,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "RETINOPATIA DIABÉTICA",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: false,
  },
    {
    seletor: "select, input, textarea",
    valorEsperado: "Esse CID é compatível com OCI do IOP.",
    mensagem: "Precisa-se de APAC.",
    correspondenciaExata: false,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "ESTRABISMO",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: false,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.360",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },      
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.00",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.01",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.02",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.03",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.04",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.05",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.06",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.10",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.11",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.13",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.15",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.16",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.17",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.18",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.19",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.20",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.21",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.22",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.25",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.26",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.27",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.28",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.30",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },

  {
    seletor: "select, input, textarea",
    valorEsperado: "H.31",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.32",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.33",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.34",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.35",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.36",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.40",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.42",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.43",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.44",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.45",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.46",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.47",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.48",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.49",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.50",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.51",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.52",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.53",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.54",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.55",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.56",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.57",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.58",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "H.59",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "C.69",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "C.690",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "C.691",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "C.692",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "C.693",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "C.694",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "C.695",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "C.696",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "C.697",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "C.698",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "C.699",
    mensagem: "Esse CID é compatível com OCI do IOP.",
    correspondenciaExata: true,
  },
];

// ============================================
// GESTÃO DE REGRAS E ARMAZENAMENTO DINÂMICO
// ============================================

/**
 * Carrega e sincroniza as regras do storage (CIDs e Procedimentos separados)
 */
function carregarRegras() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      chrome.storage.local.get(['cidsCustomizados', 'procedimentosCustomizados', 'regrasDefaultsMigrated'], (data) => {
        if (chrome.runtime.lastError) {
          console.warn('CMCE Booster - Erro ao ler regras do storage:', chrome.runtime.lastError.message);
          return;
        }
        
        const cids = data.cidsCustomizados;
        const procedimentos = data.procedimentosCustomizados;
        const migrated = data.regrasDefaultsMigrated;

        if (!migrated) {
          // Se não foi migrado, fazemos o merge dos padrões com os do storage (se houver algum)
          const cidsExistentes = cids || [];
          const procedimentosExistentes = procedimentos || [];
          
          const novosCids = [...cidsExistentes];
          const novosProcedimentos = [...procedimentosExistentes];

          regras.forEach(regra => {
            const valor = regra.valorEsperado.toUpperCase();
            const ehCID = valor.includes('.') || 
                          valor === "RETINOPATIA DIABÉTICA" || 
                          valor === "ESTRABISMO" || 
                          valor.includes("CID ");
            
            if (ehCID) {
              const jaExiste = novosCids.some(r => r.valorEsperado === regra.valorEsperado);
              if (!jaExiste) novosCids.push(regra);
            } else {
              const jaExiste = novosProcedimentos.some(r => r.valorEsperado === regra.valorEsperado);
              if (!jaExiste) novosProcedimentos.push(regra);
            }
          });

          chrome.storage.local.set({
            cidsCustomizados: novosCids,
            procedimentosCustomizados: novosProcedimentos,
            regrasDefaultsMigrated: true
          }, () => {
            if (chrome.runtime.lastError) {
              console.warn('CMCE Booster - Erro ao salvar regras iniciais:', chrome.runtime.lastError.message);
              return;
            }
            regras.length = 0;
            novosCids.forEach(r => regras.push(r));
            novosProcedimentos.forEach(r => regras.push(r));
            console.log('Regras padrões migradas e mescladas no storage:', regras.length);
          });
        } else {
          // Carrega do storage
          regras.length = 0;
          if (cids) cids.forEach(r => regras.push(r));
          if (procedimentos) procedimentos.forEach(r => regras.push(r));
          console.log('Regras sincronizadas do storage:', regras.length);
        }
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