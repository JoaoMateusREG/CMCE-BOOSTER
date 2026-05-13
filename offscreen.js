chrome.runtime.onMessage.addListener(handleMessages);

async function handleMessages(message) {
  if (message.target !== 'offscreen') {
    return false;
  }

  if (message.type === 'copy-to-clipboard') {
    copiarParaAreaTransferencia(message.data);
  }
}

function copiarParaAreaTransferencia(text) {
  const textEl = document.createElement('textarea');
  textEl.value = text;
  document.body.appendChild(textEl);
  textEl.select();
  document.execCommand('copy');
  document.body.removeChild(textEl);
  console.log('Texto copiado via offscreen document:', text);
}
