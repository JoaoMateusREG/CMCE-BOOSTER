console.log('CMCE BOOSTER - Background script carregado');

// ============================================
// INICIALIZAÇÃO DA EXTENSÃO
// ============================================
chrome.runtime.onInstalled.addListener(() => {
  // Define o estado inicial da remoção de carregamento como ativado
  chrome.storage.local.set({ 'removerAtivo': true }, () => {
    chrome.contextMenus.create({
      id: "toggleRemover",
      title: "Desativar Remoção Automática",
      contexts: ["page"]
    });
  });
});

// ============================================
// MENU DE CONTEXTO PARA REMOÇÃO DE CARREGAMENTO
// ============================================
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "toggleRemover") {
    chrome.storage.local.get('removerAtivo', (data) => {
      const novoEstado = !data.removerAtivo;
      chrome.storage.local.set({ 'removerAtivo': novoEstado }, () => {
        const novoTitulo = novoEstado ? "Desativar Remoção Automática" : "Ativar Remoção Automática";
        chrome.contextMenus.update("toggleRemover", { title: novoTitulo });
        chrome.tabs.sendMessage(tab.id, { ativo: novoEstado });
        console.log('Remoção automática ' + (novoEstado ? 'ativada' : 'desativada') + ' via menu de contexto.');
      });
    });
  }
});

// Atualiza o título do menu de contexto quando a extensão é iniciada
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get('removerAtivo', (data) => {
    const tituloInicial = data.removerAtivo ? "Desativar Remoção Automática" : "Ativar Remoção Automática";
    chrome.contextMenus.update("toggleRemover", { title: tituloInicial });
  });
});

// ============================================
// FUNCIONALIDADES DE BUSCA CNS/CPF
// ============================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      let tabId = sender.tab ? sender.tab.id : null;
      if (!tabId) {
        const tabs = await chrome.tabs.query({ url: "*://regulador.saude.pe.gov.br/*" });
        if (tabs.length > 0) {
          tabId = tabs[0].id;
        }
      }
      
      if (!tabId) {
        console.error("Nenhuma aba do CMCE encontrada para receber o resultado.");
        sendResponse({ sucesso: false, erro: "Aba do CMCE não encontrada" });
        return;
      }
      
      if (request.action === 'buscarCNS') {
        const resultado = await buscarNoSisregAsync(request.valor, 'cns', tabId);
        sendResponse({ sucesso: true, resultado });
      } else if (request.action === 'buscarCPF') {
        const resultado = await buscarNoSisregAsync(request.valor, 'cpf', tabId);
        sendResponse({ sucesso: true, resultado });
      } else if (request.action === 'preencherCompleto') {
        buscarDadosCompletos(request.valor, tabId);
        sendResponse({ sucesso: true });
      } else {
        sendResponse({ sucesso: false });
      }
    } catch (e) {
      sendResponse({ sucesso: false, erro: e.message });
    }
  })();
  
  return true; // Mantém o canal de mensagem aberto
});

function buscarNoSisregAsync(valor, tipo, tabCmceId) {
  return new Promise((resolveResult) => {
    chrome.tabs.query({ url: "*://sisregiii.saude.gov.br/*" }, (tabs) => {
      if (tabs.length === 0) {
        console.error('Aba do SISREG não encontrada');
        resolveResult(null);
        return;
      }
      
      const tabSisregId = tabs[0].id;
      
      chrome.scripting.executeScript({
        target: { tabId: tabSisregId },
        func: (valor, tipoBusca) => {
        return new Promise((resolve) => {
          const iframe = document.getElementById('f_main');
          const link = document.querySelector('a[href="/cgi-bin/cadweb50?url=/cgi-bin/marcar"]');
          
          if (link) {
            link.click();
            iframe.onload = function() {
              executarBusca();
              iframe.onload = null;
            };
          } else {
            executarBusca();
          }
          
          function executarBusca() {
            if (iframe && iframe.contentDocument) {
              const input = iframe.contentDocument.querySelector('input[name="nu_cns"]');
              const botao = iframe.contentDocument.querySelector('input[name="btn_pesquisar"]');
              
              if (input && botao) {
                input.value = valor;
                botao.click();
                
                let tentativas = 0;
                const maxTentativas = 40; // 20 segundos para conexões lentas do SISREG
                const intervalo = setInterval(() => {
                  tentativas++;
                  let texto = '';
                  
                  if (tipoBusca === 'cns') {
                    const resultado = iframe.contentDocument.evaluate(
                      '/html/body/div[2]/form/center[1]/table/tbody/tr[3]/td/font/b',
                      iframe.contentDocument,
                      null,
                      XPathResult.FIRST_ORDERED_NODE_TYPE,
                      null
                    ).singleNodeValue;
                    if (resultado) {
                      texto = resultado.textContent;
                    }
                  } else if (tipoBusca === 'cpf') {
                    const bodyText = iframe.contentDocument.body.innerText || "";
                    const matchRegex = bodyText.match(/CPF[\s:\-]*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/i);
                    
                    if (matchRegex) {
                      texto = matchRegex[1].replace(/\D/g, '');
                    } else {
                      const cpfLabel = iframe.contentDocument.evaluate(
                        "//b[contains(text(),'CPF')]",
                        iframe.contentDocument,
                        null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE,
                        null
                      ).singleNodeValue;
                      if (cpfLabel) {
                        const tr = cpfLabel.closest('tr');
                        if (tr && tr.nextElementSibling) {
                          const td = tr.nextElementSibling.querySelector('td');
                          if (td) {
                            texto = td.textContent.trim().replace(/\D/g, '');
                          }
                        }
                      }
                    }
                  }
                  
                  if (texto) {
                    clearInterval(intervalo);
                    resolve(texto);
                  } else if (tentativas >= maxTentativas) {
                    clearInterval(intervalo);
                    resolve(null);
                  }
                }, 500);
              } else {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          }
        });
      },
      args: [valor, tipo]
    }, (results) => {
      const textoEncontrado = results && results[0] && results[0].result;
      if (textoEncontrado) {
        copiarParaClipboardSeguro(textoEncontrado);
        
        if (tipo === 'cns') {
          chrome.tabs.sendMessage(tabCmceId, { action: 'inserirCNS', valor: textoEncontrado }).catch(() => {});
        } else if (tipo === 'cpf') {
          chrome.tabs.sendMessage(tabCmceId, { action: 'inserirCPF', valor: textoEncontrado }).catch(() => {});
        }
      }
      resolveResult(textoEncontrado);
    });
    });
  });
}

function buscarDadosCompletos(valor, tabCmceId) {
  chrome.tabs.query({ url: "*://sisregiii.saude.gov.br/*" }, (tabs) => {
    if (tabs.length === 0) {
      console.error('Aba do SISREG não encontrada');
      return;
    }
    
    const tabSisregId = tabs[0].id;
    
    chrome.scripting.executeScript({
      target: { tabId: tabSisregId },
      func: (valor) => {
        return new Promise((resolve) => {
          const iframe = document.getElementById('f_main');
          const link = document.querySelector('a[href="/cgi-bin/cadweb50?url=/cgi-bin/marcar"]');
          
          if (link) {
            link.click();
            iframe.onload = function() {
              executarBusca();
              iframe.onload = null;
            };
          } else {
            executarBusca();
          }
          
          function executarBusca() {
            if (iframe && iframe.contentDocument) {
              const input = iframe.contentDocument.querySelector('input[name="nu_cns"]');
              const botao = iframe.contentDocument.querySelector('input[name="btn_pesquisar"]');
              
              if (input && botao) {
                input.value = valor;
                botao.click();
                
                let tentativas = 0;
                const maxTentativas = 20;
                const intervalo = setInterval(() => {
                  tentativas++;
                  const dados = {};
                  
                  // CNS
                  const cnsNode = iframe.contentDocument.evaluate(
                    '/html/body/div[2]/form/center[1]/table/tbody/tr[3]/td/font/b',
                    iframe.contentDocument,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                  ).singleNodeValue;
                  if (cnsNode) dados.cns = cnsNode.textContent.trim();
                  
                  // CPF
                  const bodyText = iframe.contentDocument.body.innerText || "";
                  const matchRegex = bodyText.match(/CPF[\s:\-]*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/i);
                  
                  if (matchRegex) {
                    dados.cpf = matchRegex[1].replace(/\D/g, '');
                  } else {
                    const cpfLabel = iframe.contentDocument.evaluate(
                      "//b[contains(text(),'CPF')]",
                      iframe.contentDocument,
                      null,
                      XPathResult.FIRST_ORDERED_NODE_TYPE,
                      null
                    ).singleNodeValue;
                    if (cpfLabel) {
                      const tr = cpfLabel.closest('tr');
                      if (tr && tr.nextElementSibling) {
                        const td = tr.nextElementSibling.querySelector('td');
                        if (td) dados.cpf = td.textContent.trim().replace(/\D/g, '');
                      }
                    }
                  }
                  
                  // Nome
                  const nomeLabel = iframe.contentDocument.evaluate(
                    "//b[text()='Nome:']",
                    iframe.contentDocument,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                  ).singleNodeValue;
                  if (nomeLabel) {
                    const tr = nomeLabel.closest('tr');
                    if (tr && tr.nextElementSibling) {
                      const td = tr.nextElementSibling.querySelector('td');
                      if (td) dados.nome = td.textContent.trim();
                    }
                  }
                  
                  // Nome da Mãe
                  const nomeMaeLabel = iframe.contentDocument.evaluate(
                    "//b[text()='Nome da Mãe:']",
                    iframe.contentDocument,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                  ).singleNodeValue;
                  if (nomeMaeLabel) {
                    const tr = nomeMaeLabel.closest('tr');
                    if (tr && tr.nextElementSibling) {
                      const td = tr.nextElementSibling.querySelector('td');
                      if (td) dados.nomeMae = td.textContent.trim();
                    }
                  }
                  
                  // Data de Nascimento
                  const dataNascLabel = iframe.contentDocument.evaluate(
                    "//b[text()='Data de Nascimento:']",
                    iframe.contentDocument,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                  ).singleNodeValue;
                  if (dataNascLabel) {
                    const tr = dataNascLabel.closest('tr');
                    if (tr && tr.nextElementSibling) {
                      const td = tr.nextElementSibling.querySelector('td');
                      if (td) {
                        const texto = td.textContent.trim();
                        const match = texto.match(/(\d{2}\/\d{2}\/\d{4})/);
                        if (match) dados.dataNascimento = match[1];
                      }
                    }
                  }
                  
                  // Sexo
                  const sexoLabel = iframe.contentDocument.evaluate(
                    "//b[text()='Sexo:']",
                    iframe.contentDocument,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                  ).singleNodeValue;
                  if (sexoLabel) {
                    const tr = sexoLabel.closest('tr');
                    if (tr && tr.nextElementSibling) {
                      const td = tr.nextElementSibling.querySelector('td');
                      if (td) dados.sexo = td.textContent.trim();
                    }
                  }
                  
                  if (dados.nome && dados.dataNascimento) {
                    clearInterval(intervalo);
                    resolve(dados);
                  } else if (tentativas >= maxTentativas) {
                    clearInterval(intervalo);
                    resolve(null);
                  }
                }, 500);
              } else {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          }
        });
      },
      args: [valor]
    }, (results) => {
      const dadosCompletos = results && results[0] && results[0].result;
      
      if (dadosCompletos) {
        chrome.tabs.sendMessage(tabCmceId, { action: 'preencherDados', dados: dadosCompletos });
      }
    });
  });
}

// ============================================
// CÓPIA CONFIÁVEL PARA ÁREA DE TRANSFERÊNCIA
// ============================================
async function copiarParaClipboardSeguro(texto) {
  try {
    // Tenta criar o documento offscreen (pode já existir)
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['CLIPBOARD'],
      justification: 'Copiar CNS/CPF para área de transferência'
    });
  } catch (e) {
    // Ignora erro se o documento já estiver aberto
    if (!e.message.includes('Only a single offscreen document')) {
      console.error('Erro ao criar offscreen document:', e);
    }
  }
  
  // Envia a mensagem para o offscreen document realizar a cópia
  chrome.runtime.sendMessage({
    type: 'copy-to-clipboard',
    target: 'offscreen',
    data: texto
  });
}