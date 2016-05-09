(function(window, document, name) {

  if (!document.querySelector) { // 非 HTML5 环境
    return;
  }
  window.h5tObjectName = name;

  window[name] = window[name] || function(cmd, src) {
    if (cmd === 'cdn') {
      var lastScript = document.querySelector('script');
      var script = document.createElement('script');
      script.async = true;
      script.src = src;
      lastScript.parentNode.insertBefore(script, lastScript);
    } else {
      (window[name].q = window[name].q || []).push(arguments);
    }
  };

 try{
    var config = JSON.parse(document.querySelector('[h5t-config]').getAttribute('h5t-config'));
    window[name]('cdn', config.cdn);
  }catch(ex){}

  window[name].l = window[name].l || Date.now();

})(window, document, 'h5t');

