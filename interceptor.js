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

      if (this._url && this._url.includes('getAllCidadaoCompletePageable')) {
        try {
          const response = JSON.parse(this.responseText);
          window.dispatchEvent(new CustomEvent('CMCE_PESQUISA_CIDADAO', { 
            detail: response 
          }));
        } catch (e) {
          console.error('CMCE BOOSTER - Erro ao capturar pesquisa de cidadao:', e);
        }
      }
    });
    return send.apply(this, arguments);
  };
  
  const originalFetch = window.fetch;
  window.fetch = async function() {
    const response = await originalFetch.apply(this, arguments);
    try {
      const url = arguments[0] instanceof Request ? arguments[0].url : arguments[0];
      if (url && typeof url === 'string' && url.includes('getAllCidadaoCompletePageable')) {
        response.clone().json().then(data => {
          window.dispatchEvent(new CustomEvent('CMCE_PESQUISA_CIDADAO', { detail: data }));
        }).catch(e => console.error('CMCE BOOSTER - Erro parse fetch:', e));
      }
    } catch (e) {
      console.error('CMCE BOOSTER - Erro intercept fetch:', e);
    }
    return response;
  };

  console.log('CMCE BOOSTER - Interceptor de rede ativado');
})();
