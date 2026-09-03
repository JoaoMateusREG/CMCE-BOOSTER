// ============================================
// FUNCIONALIDADE 3: MONITOR DE ELEMENTOS
// ============================================
function exibirNotificacao(mensagem, persistente = false, ehErro = false) {
  if (fechadaManualmente && mensagemAtual === mensagem) {
    return;
  }

  if (notificacaoAtual) {
    if (mensagemAtual === mensagem && document.body.contains(notificacaoAtual)) {
      // Já está mostrando a mesma notificação, não recriar
      return;
    }
    notificacaoAtual.remove();
  }

  fechadaManualmente = false;
  mensagemAtual = mensagem;
  notificacaoPersistente = persistente;

  const notificacao = document.createElement("div");
  notificacao.className = "monitor-notificacao";

  const icone = document.createElement("span");
  icone.className = "monitor-icone";
  icone.textContent = "⚠️";

  const textoMensagem = document.createElement("div");
  textoMensagem.className = "monitor-texto";

  const paragrafos = mensagem.split("\n");
  paragrafos.forEach((paragrafo) => {
    const p = document.createElement("p");
    p.textContent = paragrafo;
    textoMensagem.appendChild(p);
  });

  const botaoFechar = document.createElement("button");
  botaoFechar.className = "monitor-botao-fechar";
  botaoFechar.textContent = "×";
  botaoFechar.title = "Fechar";

  botaoFechar.addEventListener("click", (e) => {
    e.stopPropagation();
    fechadaManualmente = true;
    if (notificacaoAtual) {
      notificacaoAtual.remove();
      notificacaoAtual = null;
    }
  });

  notificacao.appendChild(icone);
  notificacao.appendChild(textoMensagem);
  notificacao.appendChild(botaoFechar);

  if (ehErro === true || ehErro === 'erro') {
    notificacao.classList.add('erro');
  } else if (ehErro === 'aviso') {
    notificacao.classList.add('aviso');
  }

  document.body.appendChild(notificacao);
  notificacaoAtual = notificacao;

  setTimeout(() => {
    notificacao.classList.add("mostrar");
  }, 10);
}

function removerNotificacao() {
  if (notificacaoAtual) {
    notificacaoAtual.classList.remove("mostrar");

    setTimeout(() => {
      if (notificacaoAtual) {
        notificacaoAtual.remove();
        notificacaoAtual = null;
      }
    }, 300);
  }

  fechadaManualmente = false;
  mensagemAtual = null;
  notificacaoPersistente = false;
}

function verificarBloqueios(notificar = false) {
  if (isPacienteVilaUrucuba || isPacienteCidadeInvalida) {
    bloquearCamposGlobais();
    if (notificar) {
      if (isPacienteCidadeInvalida) {
        exibirNotificacao("ATENÇÃO!\n\nO paciente não pertence à cidade de LIMOEIRO. Solicitação bloqueada.", true, true);
      } else if (isPacienteVilaUrucuba) {
        exibirNotificacao("ATENÇÃO!\n\nO endereço do paciente deve ser atualizado para prosseguir com a solicitação.", true, true);
      }
    }
  } else {
    desbloquearCamposGlobais();
  }
}

function bloquearCamposGlobais() {
  const inputs = document.querySelectorAll('form.form-solicitacao input, form.form-solicitacao textarea, form.form-solicitacao select, form.form-solicitacao p-dropdown, form.form-solicitacao mvcommons-autocomplete, form.form-solicitacao p-calendar, form.form-solicitacao mvcommons-calendar, form.form-solicitacao p-checkbox, form.form-solicitacao p-inputmask');
  inputs.forEach(el => {
    el.style.pointerEvents = 'none';
    el.style.opacity = '0.5';
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
      el.disabled = true;
    }
  });

  const btnSalvar = document.querySelector('button[title="Salvar"]');
  if (btnSalvar) {
    btnSalvar.disabled = true;
    btnSalvar.style.pointerEvents = 'none';
    btnSalvar.style.opacity = '0.5';
  }

  // Garantir que o botão pesquisar NUNCA seja bloqueado
  const btnPesquisar = document.querySelector('button.btn-pesquisar');
  if (btnPesquisar) {
    btnPesquisar.disabled = false;
    btnPesquisar.style.pointerEvents = 'auto';
    btnPesquisar.style.opacity = '1';
    // Se ele estiver dentro de um container bloqueado (como mvcommons-autocomplete), precisamos garantir
    const parent = btnPesquisar.closest('mvcommons-autocomplete');
    if (parent) {
      parent.style.pointerEvents = 'auto';
      parent.style.opacity = '1';
    }
  }
}

function desbloquearCamposGlobais() {
  const inputs = document.querySelectorAll('form.form-solicitacao input, form.form-solicitacao textarea, form.form-solicitacao select, form.form-solicitacao p-dropdown, form.form-solicitacao mvcommons-autocomplete, form.form-solicitacao p-calendar, form.form-solicitacao mvcommons-calendar, form.form-solicitacao p-checkbox, form.form-solicitacao p-inputmask');
  inputs.forEach(el => {
    el.style.pointerEvents = '';
    el.style.opacity = '';
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
      el.disabled = false;
    }
  });

  const btnSalvar = document.querySelector('button[title="Salvar"]');
  if (btnSalvar) {
    btnSalvar.disabled = false;
    btnSalvar.style.pointerEvents = '';
    btnSalvar.style.opacity = '';
  }
}

function obterCidadeDoPaciente() {
  const inputCidade = document.querySelector('input[formcontrolname="descricaoMunicipio"]');
  if (inputCidade && inputCidade.value) {
    return inputCidade.value.trim().toUpperCase();
  }
  return null;
}

function obterValor(elemento) {
  if (elemento.tagName === "SELECT") {
    const opcao = elemento.options[elemento.selectedIndex];
    return opcao ? opcao.text : "";
  }
  return elemento.value || "";
}

function calcularIdade(dataNascimentoStr) {
  if (!dataNascimentoStr) return null;
  const cleanDate = dataNascimentoStr.replace(/[^\d/]/g, '').trim();
  const partes = cleanDate.split('/');
  if (partes.length !== 3) return null;
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const ano = parseInt(partes[2], 10);
  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null;
  
  const hoje = new Date();
  const nascimento = new Date(ano, mes, dia);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}

function obterIdadeDoPaciente() {
  const inputNasc = document.querySelector('mvcommons-calendar[controllabel="Nascimento"] input') ||
                    document.querySelector('app-aba-dados-cidadao mvcommons-calendar p-calendar span input') ||
                    document.querySelector('app-aba-dados-cidadao mvcommons-calendar input') ||
                    document.querySelector('mvcommons-calendar input');
  if (inputNasc && inputNasc.value) {
    return calcularIdade(inputNasc.value);
  }
  return null;
}

function verificarElemento(elemento) {
  const valor = obterValor(elemento).trim().toUpperCase();
  const idade = obterIdadeDoPaciente();
  const isMenor14 = (idade !== null && idade < 14);
  const prefixoIdade = isMenor14 ? `ATENÇÃO: Paciente é menor de 14 anos.\n\n` : "";

  for (const regra of regras) {
    const valorEsperado = regra.valorEsperado.toUpperCase();

    const corresponde = regra.correspondenciaExata
      ? valor === valorEsperado
      : valor.includes(valorEsperado);

    if (corresponde) {
      const temFaixaEtaria = (regra.idadeMin !== undefined && regra.idadeMax !== undefined);
      const isColonoscopia = regra.valorEsperado.toUpperCase().includes("COLONOSCOPIA");

      if (temFaixaEtaria || isColonoscopia) {
        const minIdade = regra.idadeMin !== undefined ? regra.idadeMin : (valorEsperado.includes("ALFA") ? 14 : 18);
        const maxIdade = regra.idadeMax !== undefined ? regra.idadeMax : (valorEsperado.includes("ALFA") ? 69 : 65);
        
        const idade = obterIdadeDoPaciente();
        let msg = regra.mensagem;
        let estErro = false;

        if (idade !== null) {
          const ultrapassouLimite = (idade > maxIdade || idade < minIdade);

          if (ultrapassouLimite) {
            // Se passar da idade, mostra mensagem simplificada e direta
            msg = `IDADE DO PACIENTE: ${idade} anos\n\nO paciente ultrapassa a faixa etária permitida para este procedimento (${minIdade} a ${maxIdade} anos).`;
          } else {
            // Se adequado à faixa etária, mostra a idade e toda a mensagem correta
            msg = `IDADE DO PACIENTE: ${idade} anos\n\n${regra.mensagem}`;
          }

          if (isColonoscopia) {
            // Caso especial colonoscopia:
            // - Ultrapassou ambas (idade > 69) -> vermelho
            // - Ultrapassou apenas uma (idade > 65 e <= 69) -> amarelo
            // - Igual ou 1 ano mais novo que o limite do procedimento selecionado -> amarelo
            // - Resto -> verde
            if (idade > 69) {
              estErro = 'erro';
            } else if (idade >= 64 && idade <= 69) {
              estErro = 'aviso';
            } else {
              estErro = false;
            }
          } else {
            // Lógica geral para outros procedimentos com faixa etária:
            // - Se ultrapassou o limite -> vermelho
            // - Se igual ou apenas 1 ano mais novo que o máximo -> amarelo
            // - Resto -> verde
            if (ultrapassouLimite) {
              estErro = 'erro';
            } else if (idade === maxIdade || idade === (maxIdade - 1)) {
              estErro = 'aviso';
            } else {
              estErro = false;
            }
          }
        }
        exibirNotificacao(prefixoIdade + msg, false, estErro ? estErro : (isMenor14 ? 'aviso' : false));
      } else {
        let msgFinal = regra.mensagem;
        if (idade !== null) {
          msgFinal = `IDADE DO PACIENTE: ${idade} anos\n\n` + msgFinal;
        }
        exibirNotificacao(prefixoIdade + msgFinal, false, isMenor14 ? 'aviso' : false);
      }
      return true;
    }
  }

  return false;
}

function inicializarEspelhamentoCampos() {
  document.addEventListener('input', (e) => {
    const source = e.target;
    if (source.tagName === 'TEXTAREA' && source.getAttribute('controllabel') === 'Hipótese Diagnóstica') {
      const target = document.querySelector('textarea[controllabel="Informação Complementar"]');
      if (target) {
        target.value = source.value;
        // Dispara eventos para o Angular detectar a mudança
        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }, true);
}
