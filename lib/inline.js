(function(window, document, scriptText, name) {
  if (!document.querySelector) { // 非 HTML5 环境
    return;
  }
  window.h5tObjectName = name;
  window[name] = window[name] || function(cmd, src) {
    if (cmd === 'cdn') {
      var lastScript = document.querySelector(scriptText);
      var script = document.createElement(scriptText);
      script.async = true;
      script.src = src;
      lastScript.parentNode.insertBefore(script, lastScript);
    } else {
      (window[name].q = window[name].q || []).push(arguments);
    }
  };
  var script = document.querySelector(scriptText + '[h5t-config]');
  if (script) {
    try {
      var config = JSON.parse(script.getAttribute('h5t-config'));
      window[name]('cdn', config.cdn);
    } catch (ex) {
      console.error(ex.message);
    }
  }
  window[name].l = window[name].l || Date.now();
})(window, document, 'script', 'h5t');