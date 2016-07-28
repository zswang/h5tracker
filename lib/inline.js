(function(window, document, scriptText, name) {
  /* istanbul ignore if */
  if (!document.querySelector) { // 非 HTML5 环境
    return;
  }
  window.h5tObjectName = name;
  var push = window[name];
  /* istanbul ignore if */
  if (typeof push === 'function' && push.h5t) { // 已经加载过
    return;
  }
  push = function () {
    push.queue.push(arguments);
  };
  push.queue = [];
  push.h5t = true;
  push.beginning = Date.now();
  Object.defineProperty(window, name, {
    set: function (argv) {
      if (typeof argv === 'function') {
        // 替换原有 push 对象
        if (argv.h5t && argv.defined) {
          push = argv;
        }
      } else if (argv instanceof Array) {
        if (argv.length > 0) {
          push.apply(null, argv);
        }
      } else if (typeof argv === 'object') {
        Object.keys(argv).forEach(function (key) {
          push.apply(null, [key, argv[key]]);
        });
      }
    },
    get: function () {
      return push;
    }
  });
})(window, document, 'script', 'h5t');