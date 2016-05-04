(function(window, document, name, cdn) {

  if (!document.querySelector) { // 非 HTML5 环境
    return;
  }
  window.h5tObjectName = name;
  var lastScript = document.querySelector('script');
  var script = document.createElement('script');
  script.async = true;
  script.src = cdn;
  lastScript.parentNode.insertBefore(script, lastScript);
  window[name] = window[name] || function () {
    (window[name].q = window[name].q || []).push(arguments);
  };
  window[name].l = window[name].l || Date.now();

})(window, document, 'h5t', '../h5tracker.js');