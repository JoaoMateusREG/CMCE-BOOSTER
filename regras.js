// ============================================
// CONFIGURAÇÃO DAS REGRAS DE MONITORAMENTO
// ============================================
// Aqui você define quais textos quer monitorar e quais mensagens exibir

const regras = [
  {
    // seletor: Define QUAIS elementos da página serão monitorados (inputs, selects, textareas)
    seletor: "select, input, textarea",

    // valorEsperado: O texto que você quer detectar
    valorEsperado: "IFP - COLONOSCOPIA",

    // mensagem: A mensagem que aparecerá na tela quando o texto for detectado
    // Use \n para criar parágrafos/quebras de linha
    mensagem:
      "Lembre-se que o paciente precisa levar o parecer cardiológico caso tenha entre 60 e 65 anos.\n\nFaixa etária: 18 a 65 anos.\n\nPrecisa-se de APAC.",

    // correspondenciaExata:
    // - false = detecta se o texto CONTÉM a frase (ex: "C.ONSULTA EM OFTALMOLOGIA GERAL URGENTE" também funciona)
    // - true = detecta apenas se o texto for EXATAMENTE igual
    correspondenciaExata: false,
  },
  {
    seletor: "select, input, textarea",
    valorEsperado: "ALFA - COLONOSCOPIA",
    mensagem: "Faixa etária entre 14 e 69 anos.\n\nPrecisa-se de APAC.",
    correspondenciaExata: false,
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
    valorEsperado: "C.ONSULTA PRÉ NATAL DE ALTO RISCO",
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
// GESTÃO DE REGRAS CUSTOMIZADAS
// ============================================

/**
 * Adiciona uma nova regra à base e salva no storage
 * @param {Object} dados - { valorEsperado, mensagem }
 */
function adicionarRegra(dados) {
  const novaRegra = {
    seletor: "select, input, textarea",
    valorEsperado: dados.valorEsperado,
    mensagem: dados.mensagem,
    correspondenciaExata: false
  };
  
  regras.push(novaRegra);
  
  // Salva no storage local para persistência
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get('regrasCustomizadas', (data) => {
      const regrasCustomizadas = data.regrasCustomizadas || [];
      regrasCustomizadas.push(novaRegra);
      chrome.storage.local.set({ regrasCustomizadas }, () => {
        console.log('Nova regra salva no storage:', novaRegra.valorEsperado);
        // Dispara uma verificação imediata na tela
        if (typeof verificarTodos === 'function') {
          verificarTodos();
        }
      });
    });
  }
}

/**
 * Carrega regras customizadas do storage
 */
function carregarRegrasCustomizadas() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get('regrasCustomizadas', (data) => {
      const regrasCustomizadas = data.regrasCustomizadas || [];
      regrasCustomizadas.forEach(regra => {
        // Evita duplicatas se já estiver na base (por recarregamento do script)
        if (!regras.find(r => r.valorEsperado === regra.valorEsperado && r.mensagem === regra.mensagem)) {
          regras.push(regra);
        }
      });
      console.log(`${regrasCustomizadas.length} regras customizadas carregadas.`);
    });
  }
}

// Carrega as regras ao iniciar
carregarRegrasCustomizadas();