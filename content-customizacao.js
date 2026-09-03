// ============================================
// CUSTOMIZAÇÃO DO SISTEMA
// ============================================
function atualizarHeaderSistema() {
  // Injeta a fonte Honk se ainda não estiver na página
  if (!document.getElementById('fonte-honk-booster')) {
    const link1 = document.createElement('link');
    link1.rel = 'preconnect';
    link1.href = 'https://fonts.googleapis.com';
    
    const link2 = document.createElement('link');
    link2.rel = 'preconnect';
    link2.href = 'https://fonts.gstatic.com';
    link2.crossOrigin = 'anonymous';
    
    const link3 = document.createElement('link');
    link3.id = 'fonte-honk-booster';
    link3.rel = 'stylesheet';
    link3.href = 'https://fonts.googleapis.com/css2?family=Honk:MORF@15&display=swap';
    
    document.head.appendChild(link1);
    document.head.appendChild(link2);
    document.head.appendChild(link3);
  }

  const labels = document.querySelectorAll('label.system-name');
  labels.forEach(label => {
    if (!label.dataset.boosterModificado) {
      // Verifica se é exatamente o texto original para não sobrescrever caso mude ou já tenha modificado
      if (label.textContent.trim() === 'Central de Marcação de Consultas e Exames' || !label.innerHTML.includes('CMCE BOOSTER')) {
        label.dataset.boosterModificado = 'true';
        label.innerHTML = 'Central de Marcação de Consultas e Exames + CMCE BOOSTER - <span style="font-family: \'Honk\', system-ui; font-optical-sizing: auto; font-weight: 400; font-style: normal; font-variation-settings: \'MORF\' 15, \'SHLN\' 50; font-size: 1.5em;"> Made by: João Mateus</span>';
      }
    }
  });
}

// ============================================
// SUBSTITUIÇÃO DE FOTO DO CIDADÃO
// ============================================
const imagensAssets = ['dog.jpg', 'gato.jpg'];
for (let i = 2; i <= 30; i++) {
  imagensAssets.push(`gato${i}.jpg`);
}

let blockImageReplacement = false;

function substituirFotoCidadao() {
  if (blockImageReplacement) return;
  
  // Pega apenas as fotos que ainda não tentamos alterar
  const fotos = document.querySelectorAll('img.foto-cidadao:not([data-booster-foto-alterada])');
  fotos.forEach(img => {
    if (img.src && img.src.includes('cidadaoFotoPlaceHolder.png')) {
      // Marca a imagem para não tentar substituir novamente, evitando loops infinitos
      img.setAttribute('data-booster-foto-alterada', 'true');
      const idx = Math.floor(Math.random() * imagensAssets.length);
      try {
        if (!chrome || !chrome.runtime || !chrome.runtime.id) {
          throw new Error("API do Chrome indisponível");
        }
        img.src = chrome.runtime.getURL(`assets/${imagensAssets[idx]}`);
      } catch (error) {
        blockImageReplacement = true;
        if (!error.message.includes("Extension context invalidated") && !error.message.includes("API do Chrome")) {
          console.warn('CMCE BOOSTER: Erro fatal ao substituir foto. Funcionalidade desativada temporariamente.', error);
        }
      }
    }
  });
}
