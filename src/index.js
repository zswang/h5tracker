/*<remove>*/
require("./inline");
(function () {
  var name = 'h5t';
  window[name]('log', 'test');
  window[name]('set', 'debug', true);
  window.localStorage = null;
  window.sessionStorage = null;
})();
/*</remove>*/

(function(document, window) {

  /*<jdists encoding="ejs" data="../package.json">*/
  /**
   * @file <%- name %>
   *
   * <%- description %>
   * @author
       <% (author instanceof Array ? author : [author]).forEach(function (item) { %>
   *   <%- item.name %> (<%- item.url %>)
       <% }); %>
   * @version <%- version %>
       <% var now = new Date() %>
   * @date <%- [
        now.getFullYear(),
        now.getMonth() + 101,
        now.getDate() + 100
      ].join('-').replace(/-1/g, '-') %>
   */
  /*</jdists>*/

  /**
   '''<example>'''
   * @example h5tObjectName
    ```js
    console.log(!!window['h5t']);
    // > true

    console.log(app.get('debug'));
    // > true

    app.oldEntery('set', 'debug', false);
    console.log(app.get('debug'));
    // > false
    ```
   * @example entery
    ```js
    app.entery(document, window);
    ```
   * @example oldObject is null
    ```js
    delete window['h5t'];
    app.entery(document, window);
    ```
   * @example oldObject.queue null
    ```js
    window['h5t'] = {};
    app.entery(document, window);
    ```
   * @example window.h5t = [...]
    ```js
    window.h5t = ['log', 'desc'];
    ```
   * @example window.h5t = {...}
    ```js
    window.h5t = { 'log': 'desc', 'send': { page: 'home' } };
    ```
   '''</example>'''
   */

  var objectName = window.h5tObjectName || 'h5t';
  var oldObject = window[objectName];
  if (oldObject && oldObject.defined) { // 避免重复加载
    return;
  }
  var storageConfig = {
    // 兼容低端浏览器（比如：小米1 华为荣耀6）
    localStorageProxy: window.localStorage || {
      setItem: function(name, value) {
        this[name] = String(value);
      },
      removeItem: function(name) {
        delete this[name];
      }
    },
    sessionStorageProxy: window.sessionStorage || {},

    sessionExpires: 30,
    storageExpires: 10 * 24 * 60 * 60,
    storageMaxCount: 200
  };

  /*<jdists encoding="fndep" import="./app.js" depend="createApp">*/
  var createApp = require('./app').createApp;
  /*</jdists>*/

  var app = createApp(objectName, storageConfig);

  /*<remove>*/
  if (!window.localStorage) { // coverage
    storageConfig.localStorageProxy.setItem('h5t', 'true');
    storageConfig.localStorageProxy.removeItem('h5t', 'true');
  }

  app.entery = arguments.callee;
  app.oldEntery = oldObject;
  app.storageConfig = storageConfig;
  /*</remove>*/

  var instance = function() {
    app.cmd.apply(app, arguments);
  };
  instance.app = app;
  instance.defined = true;
  instance.h5t = true;
  if (oldObject) {
    // 处理临时 h5t 对象
    var items = oldObject.queue;
    instance.beginning = oldObject.beginning;
    oldObject.queue = null;
    instance.queue = { // 接管之前的定义
      push: function(args) {
        instance.apply(instance, args);
      }
    };
    items.forEach(function (args) {
      instance.apply(instance, args);
    });
  }
  window[objectName] = instance;
  app.init();

})(document, window);