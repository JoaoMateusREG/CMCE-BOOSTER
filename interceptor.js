(function() {
  const XHR = XMLHttpRequest.prototype;
  const send = XHR.send;
  const open = XHR.open;

  XHR.open = function(method, url) {
    this._url = url;
    return open.apply(this, arguments);
  };

  XHR.send = function() {
    this.addEventListener('load', function() {
      if (this._url && this._url.includes('list-solicitacao-procedimento-dependente-por-cidadaos')) {
        try {
          const response = JSON.parse(this.responseText);
          window.dispatchEvent(new CustomEvent('CMCE_HISTORY_DATA', { 
            detail: response 
          }));
        } catch (e) {
          console.error('CMCE BOOSTER - Erro ao capturar JSON de histórico:', e);
        }
      }
      
      if (this._url && this._url.includes('cidadao-completo-com-validacao-dados-sensiveis')) {
        try {
          const response = JSON.parse(this.responseText);
          window.dispatchEvent(new CustomEvent('CMCE_CIDADAO_DATA', { 
            detail: response 
          }));
        } catch (e) {
          console.error('CMCE BOOSTER - Erro ao capturar JSON de cidadao:', e);
        }
      }
    });
    return send.apply(this, arguments);
  };
  
  console.log('CMCE BOOSTER - Interceptor de rede ativado');
})();
