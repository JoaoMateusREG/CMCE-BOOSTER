// ============================================
// FUNCIONALIDADE 1: BUSCA CNS/CPF
// ============================================
function verificarFormulario() {
  const botaoAdicionarFoto = document.querySelector('button.btn-add-foto');
  
  if (botaoAdicionarFoto && !botoesInjetados) {
    console.log('Formulário detectado! Injetando botões...');
    injetarBotoes();
    botoesInjetados = true;
  } else if (!botaoAdicionarFoto && botoesInjetados) {
    const container = document.getElementById('cmce-booster-buttons');
    if (container) {
      container.remove();
      botoesInjetados = false;
      // Reseta controle de bloqueio CID ao sair do formulário
      observerCidAtivo = false;
      cidPrincipalPreenchido = false;
      codigoCidAtual = '';
      descricaoCidAtual = '';
      console.log('Formulário fechado, botões removidos');
    }
  }
}

function injetarBotoes() {
  const container = document.createElement('div');
  container.id = 'cmce-booster-buttons';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: white;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  // Botão de fechar (X)
  const btnFechar = document.createElement('button');
  btnFechar.textContent = '✕';
  btnFechar.style.cssText = `
    position: absolute;
    top: -8px;
    right: -8px;
    width: 20px;
    height: 20px;
    padding: 0;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 10px;
    font-weight: bold;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  `;
  btnFechar.onmouseover = () => btnFechar.style.background = '#d32f2f';
  btnFechar.onmouseout = () => btnFechar.style.background = '#f44336';
  btnFechar.onclick = () => {
    container.remove();
    botoesInjetados = false;
    console.log('Botões removidos manualmente');
  };
  
  // Botão Buscar CNS
  const btnBuscarCNS = document.createElement('button');
  btnBuscarCNS.textContent = 'Buscar CNS';
  btnBuscarCNS.style.cssText = `
    padding: 8px 16px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  `;
  btnBuscarCNS.onmouseover = () => btnBuscarCNS.style.background = '#1565c0';
  btnBuscarCNS.onmouseout = () => btnBuscarCNS.style.background = '#1976d2';
  btnBuscarCNS.onclick = () => buscarCNS();
  
  // Botão Buscar CPF
  const btnBuscarCPF = document.createElement('button');
  btnBuscarCPF.textContent = 'Buscar CPF';
  btnBuscarCPF.style.cssText = `
    padding: 8px 16px;
    background: #058d49;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  `;
  btnBuscarCPF.onmouseover = () => btnBuscarCPF.style.background = '#047a3f';
  btnBuscarCPF.onmouseout = () => btnBuscarCPF.style.background = '#058d49';
  btnBuscarCPF.onclick = () => buscarCPF();
  
  // Botão Preencher Completo
  const btnPreencherCompleto = document.createElement('button');
  btnPreencherCompleto.textContent = 'Preencher Completo';
  btnPreencherCompleto.style.cssText = `
    padding: 8px 16px;
    background: #d32f2f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  `;
  btnPreencherCompleto.onmouseover = () => btnPreencherCompleto.style.background = '#c62828';
  btnPreencherCompleto.onmouseout = () => btnPreencherCompleto.style.background = '#d32f2f';
  btnPreencherCompleto.onclick = () => preencherCompleto();
  
  container.appendChild(btnFechar);
  container.appendChild(btnBuscarCNS);
  container.appendChild(btnBuscarCPF);
  container.appendChild(btnPreencherCompleto);
  
  document.body.appendChild(container);
  console.log('Botões injetados com sucesso!');
}

function preencherCampoExtracao(seletor, valor) {
    const input = document.querySelector(seletor);
    if (!input) return false;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    input.focus();
    nativeInputValueSetter.call(input, valor);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
    input.blur();
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    return true;
}

function preencherMotivoExtrato(valor) {
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    
    const hipotese = document.querySelector('textarea[controllabel="Hipótese Diagnóstica"]');
    if (hipotese) {
        hipotese.focus();
        const espaco = hipotese.value ? '\n\n' : '';
        nativeTextAreaValueSetter.call(hipotese, hipotese.value + espaco + valor);
        hipotese.dispatchEvent(new Event('input', { bubbles: true }));
        hipotese.dispatchEvent(new Event('change', { bubbles: true }));
        hipotese.blur();
    }
    
    const info = document.querySelector('textarea[controllabel="Informação Complementar"]');
    if (info) {
        info.focus();
        const espaco = info.value ? '\n\n' : '';
        nativeTextAreaValueSetter.call(info, info.value + espaco + valor);
        info.dispatchEvent(new Event('input', { bubbles: true }));
        info.dispatchEvent(new Event('change', { bubbles: true }));
        info.blur();
    }
}

function preencherCidExtrato(cid) {
    const seletor = 'p-inputmask[controllabel="CID principal"] input';
    const input = document.querySelector(seletor);
    if (input) {
        preencherCampoExtracao(seletor, cid);
        input.focus();
        input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Tab', code: 'Tab', keyCode: 9 }));
        // Verifica CID após preenchimento programático para desbloquear hipótese/informação
        setTimeout(() => verificarCidPrincipalPreenchido(), 1000);
    } else {
        alert('Campo CID não encontrado');
    }
}

function preencherCampoDataExtrato(dataStr) {
    const dataNascInput = document.querySelector('mvcommons-calendar[controllabel="Data de nascimento"] input') || 
                          document.querySelector('mvcommons-calendar[controllabel="Nascimento"] input');
    if (!dataNascInput) {
        alert('Campo de data não encontrado');
        return;
    }
    dataNascInput.focus();
    dataNascInput.value = '';
    dataNascInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    let i = 0;
    function digitarProximoCaractere() {
        if (i < dataStr.length) {
            const char = dataStr[i];
            dataNascInput.value += char;
            dataNascInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: char, code: 'Key' + char.toUpperCase() }));
            dataNascInput.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: char, code: 'Key' + char.toUpperCase() }));
            dataNascInput.dispatchEvent(new Event('input', { bubbles: true }));
            dataNascInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: char, code: 'Key' + char.toUpperCase() }));
            i++;
            setTimeout(digitarProximoCaractere, 15);
        } else {
            dataNascInput.dispatchEvent(new Event('change', { bubbles: true }));
            dataNascInput.blur();
            dataNascInput.dispatchEvent(new Event('blur', { bubbles: true }));
        }
    }
    digitarProximoCaractere();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'inserir_cpf') {
        const valorLimpo = request.valor.replace(/\D/g, '');
        if (valorLimpo.length <= 11) {
            // É CPF
            const seletorCpf = 'p-inputmask[controllabel="CPF"] input, p-inputmask[formcontrolname="cpf"] input, input[formcontrolname="cpf"]';
            const preencheu = preencherCampoExtracao(seletorCpf, valorLimpo);
            if (!preencheu) alert('Campo CPF não encontrado na página.');
        } else {
            // É CNS
            const seletorCns = 'p-inputmask[controllabel="Cartão SUS"] input, p-inputmask[formcontrolname="cartaoSus"] input, input[formcontrolname="cns"]';
            const preencheu = preencherCampoExtracao(seletorCns, valorLimpo);
            if (!preencheu) alert('Campo Cartão SUS (CNS) não encontrado na página.');
        }
    } else if (request.action === 'inserir_nome') {
        if(!preencherCampoExtracao('input[controllabel="Cidadão"]', request.valor)) {
            preencherCampoExtracao('input[controllabel="Nome Completo"]', request.valor);
        }
    } else if (request.action === 'inserir_data') {
        preencherCampoDataExtrato(request.valor);
    } else if (request.action === 'inserir_cid') {
        preencherCidExtrato(request.valor);
    } else if (request.action === 'inserir_profissional') {
        const dadosProf = request.valor; // { nome, crm }
        const textoParaInserir = dadosProf.nome + (dadosProf.crm ? ' - ' + dadosProf.crm : '');
        
        const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        
        const hipotese = document.querySelector('textarea[controllabel="Hipótese Diagnóstica"]');
        if (hipotese) {
            const espaco = hipotese.value ? '\n' : '';
            nativeTextAreaValueSetter.call(hipotese, hipotese.value + espaco + textoParaInserir);
            hipotese.dispatchEvent(new Event('input', { bubbles: true }));
            hipotese.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        const info = document.querySelector('textarea[controllabel="Informação Complementar"]');
        if (info) {
            const espaco = info.value ? '\n' : '';
            nativeTextAreaValueSetter.call(info, info.value + espaco + textoParaInserir);
            info.dispatchEvent(new Event('input', { bubbles: true }));
            info.dispatchEvent(new Event('change', { bubbles: true }));
        }
    } else if (request.action === 'inserir_motivo') {
        preencherMotivoExtrato(request.valor);
    }
});

function buscarCNS() {
  console.log('Buscar CNS clicado');
  const cpfInput = document.querySelector('p-inputmask[controllabel="CPF"] input');
  if (cpfInput && cpfInput.value) {
    const cpfValue = cpfInput.value.replace(/\D/g, '');
    try {
      chrome.runtime.sendMessage({ action: 'buscarCNS', valor: cpfValue });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro: Recarregue a página e tente novamente');
    }
  } else {
    alert('CPF não encontrado no formulário');
  }
}

function buscarCPF() {
  console.log('Buscar CPF clicado');
  const cnsInput = document.querySelector('p-inputmask[controllabel="CNS"] input');
  if (cnsInput && cnsInput.value) {
    const cnsValue = cnsInput.value.replace(/\D/g, '');
    try {
      chrome.runtime.sendMessage({ action: 'buscarCPF', valor: cnsValue });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro: Recarregue a página e tente novamente');
    }
  } else {
    alert('CNS não encontrado no formulário');
  }
}

function preencherCompleto() {
  console.log('Preencher Completo clicado');
  
  const cpfInput = document.querySelector('p-inputmask[controllabel="CPF"] input');
  if (cpfInput && cpfInput.value && cpfInput.value.trim()) {
    const cpfValue = cpfInput.value.replace(/\D/g, '');
    buscarDadosCompletos(cpfValue);
    return;
  }
  
  const cnsInput = document.querySelector('p-inputmask[controllabel="CNS"] input');
  if (cnsInput && cnsInput.value && cnsInput.value.trim()) {
    const cnsValue = cnsInput.value.replace(/\D/g, '');
    buscarDadosCompletos(cnsValue);
    return;
  }
  
  alert('CPF ou CNS não encontrado no formulário');
}

function buscarDadosCompletos(valor) {
  try {
    chrome.runtime.sendMessage({ action: 'preencherCompleto', valor: valor });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    alert('Erro: Recarregue a página e tente novamente');
  }
}

function preencherDadosNoFormulario(dados) {
  // Helper para preencher inputs de forma que o Angular reconheça
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  
  function preencherInput(input, valor) {
    if (!input || !valor) return;

    const valorAtual = (input.value || '').trim().toUpperCase();
    const valorNovo = String(valor).trim().toUpperCase();
    const apenasNumAtual = valorAtual.replace(/\D/g, '');
    const apenasNumNovo = valorNovo.replace(/\D/g, '');

    if (valorAtual === valorNovo) return;
    if (apenasNumNovo.length >= 8 && apenasNumAtual === apenasNumNovo) return;

    input.focus();
    nativeInputValueSetter.call(input, valor);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
    input.blur();
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  // CPF
  if (dados.cpf) {
    const cpfInput = document.querySelector('p-inputmask[controllabel="CPF"] input');
    preencherInput(cpfInput, dados.cpf);
  }
  
  // CNS
  if (dados.cns) {
    const cnsInput = document.querySelector('p-inputmask[controllabel="CNS"] input');
    preencherInput(cnsInput, dados.cns);
  }
  
  // Nome Completo
  if (dados.nome) {
    const nomeInput = document.querySelector('input[controllabel="Nome Completo"]');
    preencherInput(nomeInput, dados.nome);
  }
  
  // Nome da Mãe
  if (dados.nomeMae) {
    const nomeMaeInput = document.querySelector('input[controllabel="Nome da mãe"]');
    preencherInput(nomeMaeInput, dados.nomeMae);
  }
  

  
  // Sexo
  if (dados.sexo) {
    const sexoValue = dados.sexo.toUpperCase().includes('MASCULINO') ? '1' : '2';
    const sexoRadios = document.querySelectorAll('p-radiobutton[name="sexo"] input[type="radio"]');
    sexoRadios.forEach(radio => {
      if (radio.value === sexoValue && !radio.checked) {
        radio.click();
      }
    });
  }
  
  // Estrangeiro - sempre "Não"
  const estrangeiroRadios = document.querySelectorAll('p-radiobutton[name="flagEstrangeiro"] input[type="radio"]');
  estrangeiroRadios.forEach(radio => {
    if (radio.value === '0' && !radio.checked) {
      radio.click();
    }
  });
  
  // Raça/Cor - BRANCA
  setTimeout(() => {
    const racaCorDropdown = document.querySelector('mvcommons-dropdown[controllabel="Raça cor"] p-dropdown');
    if (racaCorDropdown) {
      const currentLabel = racaCorDropdown.querySelector('.ui-dropdown-label');
      if (currentLabel && currentLabel.textContent.trim() === 'BRANCA') {
        return;
      }
      const dropdownDiv = racaCorDropdown.querySelector('.ui-dropdown');
      if (dropdownDiv) {
        dropdownDiv.click();
        
        setTimeout(() => {
          const brancaOption = Array.from(document.querySelectorAll('.ui-dropdown-item')).find(el => 
            el.textContent.trim() === 'BRANCA'
          );
          if (brancaOption) {
            brancaOption.click();
          }
        }, 300);
      }
    }
  }, 500);

  // CEP - 55700-000 se vazio
  setTimeout(() => {
    const cepInput = document.querySelector('p-inputmask[controllabel="CEP"] input');
    if (cepInput && (!cepInput.value || cepInput.value.trim() === '')) {
      preencherInput(cepInput, '55700-000');
    }

    // Limpar campos de Logradouro e Bairro logo após preencher o CEP
    setTimeout(() => {
      function limparCampo(seletor) {
        const el = document.querySelector(seletor);
        if (el) {
          nativeInputValueSetter.call(el, '');
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      
      limparCampo('input[controllabel="Logradouro"]');
      limparCampo('input[controllabel="Bairro"]');
    }, 300); // Delay curto para o Angular
  }, 500);

  // ============================================
  // Data de Nascimento - PREENCHIMENTO POR ÚLTIMO
  // ============================================
  // Esperamos todos os outros campos serem preenchidos e o Angular estabilizar,
  // depois simulamos a digitação caractere a caractere para enganar o p-calendar.
  if (dados.dataNascimento) {
    setTimeout(() => {
      const dataNascInput = document.querySelector('mvcommons-calendar[controllabel="Nascimento"] input');
      if (dataNascInput) {
        if (dataNascInput.value && dataNascInput.value.trim() === dados.dataNascimento.trim()) return;

        dataNascInput.focus();
        dataNascInput.value = '';
        dataNascInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        const dataStr = dados.dataNascimento;
        let i = 0;
        
        function digitarProximoCaractere() {
          if (i < dataStr.length) {
            const char = dataStr[i];
            dataNascInput.value += char;
            
            dataNascInput.dispatchEvent(new KeyboardEvent('keydown', { 
              bubbles: true, key: char, code: 'Key' + char.toUpperCase(), charCode: char.charCodeAt(0)
            }));
            dataNascInput.dispatchEvent(new KeyboardEvent('keypress', { 
              bubbles: true, key: char, code: 'Key' + char.toUpperCase(), charCode: char.charCodeAt(0)
            }));
            dataNascInput.dispatchEvent(new Event('input', { bubbles: true }));
            dataNascInput.dispatchEvent(new KeyboardEvent('keyup', { 
              bubbles: true, key: char, code: 'Key' + char.toUpperCase(), charCode: char.charCodeAt(0)
            }));
            
            i++;
            setTimeout(digitarProximoCaractere, 15);
          } else {
            // Após digitar tudo, dispara change e blur para validar
            dataNascInput.dispatchEvent(new Event('change', { bubbles: true }));
            dataNascInput.blur();
            dataNascInput.dispatchEvent(new Event('blur', { bubbles: true }));
          }
        }
        
        digitarProximoCaractere();
      }
    }, 1000);
  }

  // ============================================
  // Naturalidade - LIMOEIRO - PE
  // ============================================
  // Espera tudo estabilizar, digita LIMOEIRO e seleciona "LIMOEIRO - PE"
  // Depois re-preenche os campos que o CMCE pode limpar ao clicar no autocomplete
   /* setTimeout(() => {
    // Salva os valores atuais de todos os campos antes de mexer na naturalidade
    const camposSalvos = {};
    const cpfEl = document.querySelector('p-inputmask[controllabel="CPF"] input');
    const cnsEl = document.querySelector('p-inputmask[controllabel="CNS"] input');
    const nomeEl = document.querySelector('input[controllabel="Nome Completo"]');
    const nomeMaeEl = document.querySelector('input[controllabel="Nome da mãe"]');
    const cepEl = document.querySelector('p-inputmask[controllabel="CEP"] input');
    
    if (cpfEl) camposSalvos.cpf = cpfEl.value;
    if (cnsEl) camposSalvos.cns = cnsEl.value;
    if (nomeEl) camposSalvos.nome = nomeEl.value;
    if (nomeMaeEl) camposSalvos.nomeMae = nomeMaeEl.value;
    if (cepEl) camposSalvos.cep = cepEl.value;

    const naturalidadeInput = document.querySelector('mvcommons-autocomplete[controllabel="Naturalidade"] input');
    if (naturalidadeInput) {
      naturalidadeInput.focus();
      naturalidadeInput.value = '';
      naturalidadeInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      const texto = 'LIMOEIRO';
      let i = 0;
      
      function digitarNaturalidade() {
        if (i < texto.length) {
          const char = texto[i];
          naturalidadeInput.value += char;
          
          naturalidadeInput.dispatchEvent(new KeyboardEvent('keydown', { 
            bubbles: true, key: char, code: 'Key' + char.toUpperCase(), charCode: char.charCodeAt(0)
          }));
          naturalidadeInput.dispatchEvent(new KeyboardEvent('keypress', { 
            bubbles: true, key: char, code: 'Key' + char.toUpperCase(), charCode: char.charCodeAt(0)
          }));
          naturalidadeInput.dispatchEvent(new Event('input', { bubbles: true }));
          naturalidadeInput.dispatchEvent(new KeyboardEvent('keyup', { 
            bubbles: true, key: char, code: 'Key' + char.toUpperCase(), charCode: char.charCodeAt(0)
          }));
          
          i++;
          setTimeout(digitarNaturalidade, 15);
        } else {
          // Polling para esperar o dropdown aparecer
          let tentativas = 0;
          const maxTentativas = 40;
          const intervalo = setInterval(() => {
            tentativas++;
            const opcoes = document.querySelectorAll('.ui-autocomplete-list-item');
            if (opcoes.length > 0) {
              for (const opcao of opcoes) {
                if (opcao.textContent.trim() === 'LIMOEIRO - PE') {
                  clearInterval(intervalo);
                  setTimeout(() => {
                    opcao.click();
                    
                    // Após o clique, espera o Angular processar e restaura campos que foram limpos
                    setTimeout(() => {
                      restaurarCamposSeNecessario(camposSalvos);
                    }, 500);
                  }, 100);
                  return;
                }
              }
            }
            if (tentativas >= maxTentativas) {
              clearInterval(intervalo);
            }
          }, 250);
        }
      }
      
      digitarNaturalidade();
    }
  }, 2500); */
}

// Função para restaurar campos que o CMCE pode ter limpado
function restaurarCamposSeNecessario(salvos) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  
  function restaurar(seletor, valorSalvo) {
    if (!valorSalvo) return;
    const el = document.querySelector(seletor);
    if (el && (!el.value || el.value.trim() === '' || el.value.replace(/\D/g, '') === '')) {
      nativeInputValueSetter.call(el, valorSalvo);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  
  restaurar('p-inputmask[controllabel="CPF"] input', salvos.cpf);
  restaurar('p-inputmask[controllabel="CNS"] input', salvos.cns);
  restaurar('input[controllabel="Nome Completo"]', salvos.nome);
  restaurar('input[controllabel="Nome da mãe"]', salvos.nomeMae);
  restaurar('p-inputmask[controllabel="CEP"] input', salvos.cep);
  
  // Sexo - re-clica se necessário
  const sexoAtivo = document.querySelector('p-radiobutton[name="sexo"] .ui-state-active');
  if (!sexoAtivo) {
    const sexoRadios = document.querySelectorAll('p-radiobutton[name="sexo"] input[type="radio"]');
    sexoRadios.forEach(radio => {
      if (radio.value === '1') radio.click();
    });
  }
  
  // Estrangeiro - re-clica "Não" se necessário
  const estrangeiroAtivo = document.querySelector('p-radiobutton[name="flagEstrangeiro"] .ui-state-active');
  if (!estrangeiroAtivo) {
    const estrangeiroRadios = document.querySelectorAll('p-radiobutton[name="flagEstrangeiro"] input[type="radio"]');
    estrangeiroRadios.forEach(radio => {
      if (radio.value === '0') radio.click();
    });
  }

  }
