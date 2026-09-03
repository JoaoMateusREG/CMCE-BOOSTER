// ============================================
// FUNCIONALIDADE 4: VALIDAÇÃO DE DUPLICIDADE
// ============================================

function verificarHistoricoAutomatico() {
  const inputItem = document.querySelector('mvcommons-autocomplete[formcontrolname="itemAgendamento"] input');
  
  if (!inputItem || inputItem.dataset.boosterValidated) return;

  inputItem.dataset.boosterValidated = 'true';
  console.log('CMCE BOOSTER - Monitorando campo de item de agendamento');

  // Monitora quando um item é selecionado ou alterado
  const handler = () => {
    const itemSelecionado = inputItem.value.trim().toUpperCase();
    
    if (itemSelecionado.length < 3 || itemSelecionado === ultimoItemVerificado) return;
    
    ultimoItemVerificado = itemSelecionado;
    executarBuscaEValidacao(itemSelecionado);
  };

  inputItem.addEventListener('change', handler);
  inputItem.addEventListener('blur', handler);
}

function executarBuscaEValidacao(itemAlvo) {
  const btnPesquisar = document.querySelector('app-historico-solicitacao button[title="Pesquisar"]');
  if (!btnPesquisar) {
    console.log('Botão de pesquisar histórico não encontrado');
    return;
  }

  console.log('CMCE BOOSTER - Iniciando busca de histórico para:', itemAlvo);
  btnPesquisar.click();

  // Aguarda a tabela atualizar (polling simples para facilitar)
  let tentativas = 0;
  const maxTentativas = 10; // 5 segundos (500ms * 10)
  
  const intervalo = setInterval(() => {
    tentativas++;
    const rows = document.querySelectorAll('app-historico-solicitacao p-table .ui-table-tbody tr:not(.empty-row)');
    
    // Se encontrou linhas ou se as tentativas acabaram
    if (rows.length > 0 || tentativas >= maxTentativas) {
      clearInterval(intervalo);
      validarDuplicidade(itemAlvo, Array.from(rows));
    }
  }, 500);
}

function validarDuplicidade(itemAlvo, rows) {
  const statusCriticos = ['AGUARDANDO REGULAÇÃO', 'AUTORIZADO', 'OPINIÃO FORMATIVA', 'MARCADO'];
  let duplicado = null;

  rows.forEach(row => {
    const colunas = row.querySelectorAll('td');
    if (colunas.length >= 3) {
      const itemHistorico = colunas[1].textContent.trim().toUpperCase();
      const statusHistorico = colunas[2].textContent.trim().toUpperCase();
      const dataHistorico = colunas[0].textContent.trim();

      if (itemHistorico === itemAlvo && statusCriticos.some(s => statusHistorico.includes(s))) {
        // Tenta encontrar o ID nos dados brutos capturados pelo interceptor
        let idSolicitacao = 'Não encontrado';
        if (dadosHistoricoBrutos && dadosHistoricoBrutos.length > 0) {
          const matchingData = dadosHistoricoBrutos.find(d => {
            const itemMatch = d.descricaoItemAgendamento.toUpperCase() === itemHistorico;
            // Formata data do JSON (2026-04-20T...) para o formato da tabela (20/04/2026)
            const dateParts = d.dataSolicitacao.split('T')[0].split('-');
            const dateMatch = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` === dataHistorico;
            return itemMatch && dateMatch;
          });
          if (matchingData) {
            idSolicitacao = matchingData.idSolicitacaoProcedimento;
          }
        }

        duplicado = { 
          item: itemHistorico, 
          status: statusHistorico, 
          data: dataHistorico,
          id: idSolicitacao 
        };
      }
    }
  });

  if (duplicado) {
    isDuplicidade = true;
    console.log('Duplicidade encontrada!', duplicado);
    exibirNotificacao(
      `ALERTA DE DUPLICIDADE\n\nEste cidadão já possui uma solicitação para esse item com status "${duplicado.status}" em ${duplicado.data}\n\nID: ${duplicado.id}.`,
      true,
      'aviso'
    );
    verificarBloqueios(false);
  } else {
    isDuplicidade = false;
    console.log('Nenhuma duplicidade crítica encontrada no histórico.');
    // Se era uma notificação de duplicidade, removemos
    if (notificacaoPersistente) {
      removerNotificacao();
    }
    verificarBloqueios(false);
  }
}

function aoPararDeDigitar(evento) {
  if (timeoutVerificacao) {
    clearTimeout(timeoutVerificacao);
  }

  timeoutVerificacao = setTimeout(() => {
    verificarTodos();
  }, 1000);
}

function verificarTodos() {

  let encontrou = false;

  regras.forEach((regra) => {
    const elementos = document.querySelectorAll(regra.seletor);

    for (const elemento of elementos) {
      if (verificarElemento(elemento)) {
        encontrou = true;
        break;
      }
    }
  });

  const cidadeDom = obterCidadeDoPaciente();
  if (cidadeDom) {
    if (!cidadeDom.includes('LIMOEIRO')) {
      isPacienteCidadeInvalida = true;
    } else {
      isPacienteCidadeInvalida = false;
    }
  } else {
    // Se o cadastro foi limpo (cidade sumiu), não tem cidade inválida nem vila uruçuba
    isPacienteCidadeInvalida = false;
    isPacienteVilaUrucuba = false;
    isDuplicidade = false;
  }

  const inputItem = document.querySelector('mvcommons-autocomplete[formcontrolname="itemAgendamento"] input');
  if (!inputItem || inputItem.value.trim().length < 3) {
    isDuplicidade = false;
  }

  const idade = obterIdadeDoPaciente();
  const isMenor14 = (idade !== null && idade < 14);
  const isInModalCadastro = document.querySelector('app-pesquisa-cadastro-cidadao-dialog') !== null;

  if (!encontrou && !isPacienteVilaUrucuba && !isPacienteCidadeInvalida && !isDuplicidade) {
    if (isMenor14 && !isInModalCadastro) {
      exibirNotificacao(`IDADE DO PACIENTE: ${idade} anos\n\nATENÇÃO: Paciente é menor de 14 anos.`, false, 'aviso');
    } else {
      removerNotificacao();
    }
  }
  
  verificarBloqueios(false);
  verificarPreDiagnosticos();

  if (typeof verificarCidPrincipalPreenchido === 'function') {
    verificarCidPrincipalPreenchido();
  }

  // Garante que os campos de hipótese/informação continuem bloqueados
  // caso o Angular tente re-habilitá-los durante a renderização
  if (!cidPrincipalPreenchido) {
    bloquearCamposHipoteseInfo();
  }
}
