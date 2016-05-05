(function(document, window) {

  var objectName = window.h5tObjectName || 'h5t';
  var oldObject = window[objectName];
  if (oldObject && oldObject.defined) { // 避免重复加载
    return;
  }

  oldObject.defined = true;

  /*<jdists encoding="fndep" import="./app.js" depend="createApp">*/
  var createApp = require('./app').createApp;
  /*</jdists>*/

  var app = createApp();

  var instance = function() {
    app.cmd.apply(app, arguments);
  };
  if (oldObject) {
    // 处理临时 h5t 对象
    var items = [].concat(oldObject.p || [], oldObject.q || []);
    oldObject.p = oldObject.q = null; // 清理内存
    instance.p = instance.q = { // 接管之前的定义
      push: function(args) {
        instance.apply(instance, args);
      }
    };
    items.forEach(function (args) {
      instance.apply(instance, args);
    });
  }
  window[objectName] = instance;

})(document, window);