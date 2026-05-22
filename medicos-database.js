// ============================================
// BASE DE DADOS DE MÉDICOS
// ============================================
// Esta base pode ser expandida conforme necessário
// Formato: { nome: "Nome completo", crm: "CRM XXXXX", especialidades: ["esp1", "esp2"] }

const medicosDatabase = [
  {
    nome: "GABRIEL SALES",
    crm: "CRM 24410",
    especialidade: "OFTALMOLOGISTA",
    busca: "GAB GABRIEL SALES OFTA OFTALMOLOGISTA 24410"
  },
  {
    nome: "TANASHY FAVA",
    crm: "CRM 19296",
    especialidade: "OFTALMOLOGISTA",
    busca: "TAN TANASHY FAVA OFTA OFTALMOLOGISTA 19296"
  },
  {
    nome: "THIAGO JACOME",
    crm: "CRM 22282",
    especialidade: "OFTALMOLOGISTA",
    busca: "THI THIAGO JACOME OFTA OFTALMOLOGISTA 22282"
  },
  {
    nome: "THYAGO PARANHOS",
    crm: "CRM 18825",
    especialidade: "OFTALMOLOGISTA",
    busca: "THY THYAGO PARANHOS OFTA OFTALMOLOGISTA 18825"
  },
  {
    nome: "GISELLE FERREIRA",
    crm: "CRM 20109",
    especialidade: "OFTALMOLOGISTA",
    busca: "GIS GISELLE FERREIRA OFTA OFTALMOLOGISTA 20109"
  },
  {
    nome: "MARIA DE LOURDES",
    crm: "CRM 25243",
    especialidade: "OFTALMOLOGISTA",
    busca: "MAR MARIA LOURDES OFTA OFTALMOLOGISTA 25243"
  },
  {
    nome: "THALES FARIAS",
    crm: "CRM 22483",
    especialidade: "VASCULAR",
    busca: "THA THALES FARIAS VASC VACULAR 22483"
  },
  {
    nome: "LUCAS FRANCA",
    crm: "CRM 30767",
    especialidade: "ORTOPEDISTA",
    busca: "LUC LUCAS FRANCA OFTA OFTALMOLOGISTA 30767"
  },
  {
    nome: "APOLIANNY ANJOS",
    crm: "CRM 24741",
    especialidade: "GINECOLOGISTA",
    busca: "APOL APOLIANNY ANJOS GINE GINECOLOGISTA 24741"
  },
  {
    nome: "RODRIGO PLACIDO",
    crm: "CRM 15932",
    especialidade: "VASCULAR",
    busca: "RODR  RODRIGO PLACIDO VASC VASCULAR 15932"
  },
  {
    nome: "MANOEL GOUVEIA",
    crm: "CRM 39648",
    especialidade: "CLINICO",
    busca: "MANO  MANOEL GOUVEIA 39648"
  },
  {
    nome: "SUZANA BERNARDO",
    crm: "CRM 29474",
    especialidade: "PROCTOLOGISTA",
    busca: "SUZ SUZANA BERNARDO PROC PROCTOLOGISTA 29474"
  },
  {
    nome: "MANUELA ALVES",
    crm: "CRM 36242",
    especialidade: "CLINICO",
    busca: "MANU MANUELA ALVES 36242"
  },
  {
    nome: "DOMINGOS CASTRO",
    crm: "CRM 13304",
    especialidade: "OTORRINO",
    busca: "DOMI DOMINDOS CASTRO OTORR OTORRINO 13304"
  },
  {
    nome: "ALINE QUENTAL",
    crm: "CRM 18758",
    especialidade: "GASTRO E HEPATOLOGISTA",
    busca: "ALI ALINE QUENTAL GASTRO HEPATO HEPATOLOGISTA 18758"
  },
  {
    nome: "LUCIANO DE SOUSA",
    crm: "CRM 13005",
    especialidade: "UROLOGISTA",
    busca: "LUCI LUCIANO SOUSA URO UROLOGISTA 13005"
  },
  {
    nome: "MARCELO XAVIER",
    crm: "CRM 13084",
    especialidade: "OFTALMOLOGISTA",
    busca: "MARC MARCELO XAVIER OFTA OFTALMOLOGISTA 13084"
  },
  {
    nome: "LUANNA SILVEIRA",
    crm: "CRM 32426",
    especialidade: "GINECOLOGISTA",
    busca: "LUA LUANNA SILVEIRA GINE GINECOLOGISTA 32426"
  },
  {
    nome: "OSWALDO NETO",
    crm: "CRM 37401",
    especialidade: "CLINICO",
    busca: "OSW OSWALDO NETO 37401"
  },
  {
    nome: "KALINE RABELO",
    crm: "CRM 14343",
    especialidade: "OTORRINO",
    busca: "KAL KALINE RABELO OTOR OTORRINO 14343"
  },
  {
    nome: "ANA MARIA DUARTE",
    crm: "CRM 6405",
    especialidade: "PEDIATRA",
    busca: "ANA MARIA DUARTE PED PEDIATRA 6405"
  },
  {
    nome: "MURILO SALVIANO",
    crm: "CRM 11497",
    especialidade: "OFTALMOLOGISTA",
    busca: "MURI MURILO SALVIANO OFTA OFTALMOLOGISTA 11497"
  },
    {
    nome: "DAYRON BRING",
    crm: "RMS 2605652",
    especialidade: "CLINICO",
    busca: "DAY DAYRON BRING 2605652"
  },
  {
    nome: "DANIELLE ARCOVERDE",
    crm: "CRM 14655",
    especialidade: "OFTALMOLOGISTA",
    busca: "DANI DANIELLE ARCOVERDE OFTA OFTALMOLOGISTA 14655"
  },
  {
    nome: "IJACIEL SOARES",
    crm: "CRM 17726",
    especialidade: "ORTOPEDISTA",
    busca: "IJAC IJACIEL SOARES ORTO ORTOPEDISTA 17726"
  },
  {
    nome: "TALITA VIEIRA",
    crm: "CRM 29653",
    especialidade: "CLINICO",
    busca: "TALI TALITA VIEIRA 29653"
  },
  {
    nome: "FAGNER DO NASCIMENTO",
    crm: "RMS 2605702",
    especialidade: "CLINICO",
    busca: "FAG FAGNER NASCIMENTO 2605702"
  },
  {
    nome: "GEYCIANE SILVA",
    crm: "RMS 2605407",
    especialidade: "CLINICO",
    busca: "GEYC GEYCIANE SILVA 2605407"
  },
  {
    nome: "CARLOS EDUARDO",
    crm: "CRM 38377",
    especialidade: "CLINICO",
    busca: "CARL  CARLOS EDUARDO CRM 38377"
  },
  {
    nome: "IGOR DANIEL",
    crm: "CRM 35225",
    especialidade: "CLINICO",
    busca: "IGOR DANIEL 35225"
  },
  {
    nome: "BRUNA PRISCILA",
    crm: "CRM 33952",
    especialidade: "CLINICO",
    busca: "BRU BRUNA PRISCILA 33952"
  },
  {
    nome: "RODOLFO RAMOS",
    crm: "CRM 2605776",
    especialidade: "CLINICO",
    busca: "RODO RODOLFO RAMOS 2605776"
  },
  {
    nome: "DAYMARELIS PEREZ",
    crm: "RMS 2605652",
    especialidade: "CLINICO",
    busca: "DAY DAYMARELIS PEREZ 2605652"
  },
  {
    nome: "AMANDA MAYARA",
    crm: "CRM 37100",
    especialidade: "CLINICO",
    busca: "AMAN AMANDA MAYARA 37100"
  },
  {
    nome: "ROGER BENJAMIM",
    crm: "CRM 36627",
    especialidade: "CLINICO",
    busca: "ROGER BENJAMIM 36627"
  },
  {
    nome: "DOUGLAS SAVIO",
    crm: "CRM 30932",
    especialidade: "CLINICO",
    busca: "DOUG DOUGLAS SAVIO 30932"
  },
  {
    nome: "MAYANE PORTILHO",
    crm: "CRM 35631",
    especialidade: "CLINICO",
    busca: "MAYA MAYANE PORTILHO 35631"
  },
    {
    nome: "MARIA CELIA",
    crm: "CRM 7197",
    especialidade: "CLINICO",
    busca: "MARIA CELIA 7197"
  },
  {
    nome: "JOYCE SILVA",
    crm: "CRM 35272",
    especialidade: "CLINICO",
    busca: "JOYCE SILVA 35272"
  },
  {
    nome: "GISELLY DANIELLY",
    crm: "RMS 2605908",
    especialidade: "CLINICO",
    busca: "GISE GISELLY DANIELLY 2605908"
  },
  {
    nome: "AILTON RODRIGUES",
    crm: "RMS 2605667",
    especialidade: "CLINICO",
    busca: "AILT AILTON RODRIGUES 2605667"
  },
  {
    nome: "MARGARET JOSE",
    crm: "RMS 2605957",
    especialidade: "CLINICO",
    busca: "MARG MARGARET JOSE 2605957"
  },
  {
    nome: "BERNARDO LUSTOSA",
    crm: "RMS 2605680",
    especialidade: "CLINICO",
    busca: "BERN BERNARDO LUSTOSA 2605680"
  },
  {
    nome: "THIAGO CABRAL",
    crm: "CRM 30571",
    especialidade: "CLINICO",
    busca: "THI THIAGO CABRAL 30571"
  },
  {
    nome: "JOSUE HENRIQUE",
    crm: "CRM 11558",
    especialidade: "MASTOLOGISTA",
    busca: "JOS JOSUE HENRIQUE 11558"
  },
  {
    nome: "HELDER VINICIUS",
    crm: "CRM 16810",
    especialidade: "OFTALMOLOGISTA",
    busca: "HELDER HELDER VINICIUS 16810"
  },
  {
    nome: "DANIELLE VALADARES",
    crm: "CRM 20613",
    especialidade: "GASTRO",
    busca: "DANIE DANIELLE VALADARES 20613"
  },
  {
    nome: "CARLOS EDUARDO",
    crm: "CRM 14950",
    especialidade: "MASTOLOGISTA",
    busca: "CARL CARLOS EDUARDO 14950"
  },
  {
    nome: "FABIANA MOURA",
    crm: "CRM 26896",
    especialidade: "OTORRINO",
    busca: "FABI FABIANA MOURA 26896"
  },
  {
    nome: "FERNANDA VARJAL",
    crm: "CRM 14458",
    especialidade: "OTORRINO",
    busca: "FERN FERNANDA VARJAL 14458"
  },
  {
    nome: "BRUNO CESAR",
    crm: "CRM 20330",
    especialidade: "UROLOGISTA",
    busca: "BRU BRUNO CESAR 20330"
  },
  {
    nome: "GABRIELA MARIA",
    crm: "CRM 5848",
    especialidade: "GINECOLOGISTA",
    busca: "GABRI GABRIELA MARIA 5848"
  },
  {
    nome: "PATRICIA MORAIS CRM",
    crm: "CRM 9793",
    especialidade: "OTORRINO",
    busca: "PATR PATRICIA MORAIS CRM 9793"
  },
  
];

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
    const encontrouBusca = medico.busca.includes(textoBusca);
    // Busca no nome completo
    const encontrouNome = medico.nome.toUpperCase().includes(textoBusca);
    // Busca no CRM
    const encontrouCRM = medico.crm.toUpperCase().includes(textoBusca);
    // Busca na especialidade (agora string única)
    const encontrouEsp = medico.especialidade.includes(textoBusca);
    
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
 * Adiciona novo médico à base (para expansão futura)
 * @param {Object} novoMedico - Dados do novo médico
 */
function adicionarMedico(novoMedico) {
  // Gera campo de busca automaticamente
  novoMedico.busca = `${novoMedico.nome} ${novoMedico.crm} ${novoMedico.especialidade}`.toUpperCase();
  medicosDatabase.push(novoMedico);
  
  // Salva no storage local para persistência
  chrome.storage.local.get('medicosCustomizados', (data) => {
    const medicosCustomizados = data.medicosCustomizados || [];
    medicosCustomizados.push(novoMedico);
    chrome.storage.local.set({ medicosCustomizados });
  });
}

/**
 * Carrega médicos customizados do storage
 */
function carregarMedicosCustomizados() {
  chrome.storage.local.get('medicosCustomizados', (data) => {
    const medicosCustomizados = data.medicosCustomizados || [];
    medicosCustomizados.forEach(medico => {
      if (!medicosDatabase.find(m => m.nome === medico.nome)) {
        medicosDatabase.push(medico);
      }
    });
  });
}

// Carrega médicos customizados ao inicializar
if (typeof chrome !== 'undefined' && chrome.storage) {
  carregarMedicosCustomizados();
}