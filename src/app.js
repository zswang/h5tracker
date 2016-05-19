(function() {
  'use strict';

  /*<jdists encoding="fndep" import="./common.js" depend="newGuid,format,queryFrom">*/
  var newGuid = require('./common').newGuid;
  var format = require('./common').format;
  var queryFrom = require('./common').queryFrom;
  /*</jdists>*/

  /*<jdists encoding="fndep" import="./event.js" depend="createEmitter">*/
  var createEmitter = require('./event').createEmitter;
  /*</jdists>*/

  /*<jdists encoding="fndep" import="./tracker.js" depend="createTracker">*/
  var createTracker = require('./tracker').createTracker;
  /*</jdists>*/

  /*<jdists encoding="fndep" import="./storage.js" depend="createStorage">*/
  var createStorage = require('./storage').createStorage;
  /*</jdists>*/

  /*<jdists encoding="fndep" import="./storage-keys.js" depend="storageKeys">*/
  var storageKeys = require('./storage-keys').storageKeys;
  /*</jdists>*/

  /*<jdists encoding="fndep" import="./session-manager.js" depend="createSessionManager">*/
  var createSessionManager = require('./session-manager').createSessionManager;
  /*</jdists>*/

  /*<jdists encoding="fndep" import="./storage-sender.js" depend="createStorageSender">*/
  var createStorageSender = require('./storage-sender').createStorageSender;
  /*</jdists>*/

  /*<jdists encoding="fndep" import="./storage-list.js" depend="createStorageList">*/
  var createStorageList = require('./storage-list').createStorageList;
  /*</jdists>*/

  /*=== 初始化 ===*/
  /*<function name="createApp" depend="createEmitter,createTracker,newGuid,format,queryFrom,storageKeys,createSessionManager,createStorageSender,createStorage,createStorageList">*/
  /**
   * 追踪器实例
   *
   * @type {Object}
   */
  var trackers = {};

  /**
   * 创建应用追踪器
   *
   * @param {string} appName 应用名
   * @param {number} sessionExpires 回话过期时间，单位：秒，默认 30
   * @return {Object} 返回应用追踪器实例
   '''<example>'''
   * @example createApp():base
    ```js
    var appInstance = app.createApp('cctv1');
    console.log(appInstance.name);
    // > cctv1

    var appInstance = app.createApp();
    console.log(appInstance.name);
    // > h5t
    ```
   * @example createApp():sessionExpires => 1
    ```js
    var appInstance = app.createApp('cctv2', 1);
    appInstance.on('createSession', function () {
      console.log(appInstance.name);
      // > cctv2
      // * done
    });
    setTimeout(function () {
      document.dispatchEvent('mousemove');
    }, 1500);
    ```
   '''</example>'''
   */
  function createApp(appName, sessionExpires) {
    appName = appName || 'h5t';
    /*<remove trigger="release">*/
    console.log('createApp() appName: %s', appName);
    /*</remove>*/

    var userId = localStorage[storageKeys.userId];
    if (!userId) {
      userId = localStorage[storageKeys.userId] = newGuid();
    }
    var instance = createTracker(appName, appName);

    /*<remove trigger="release">*/
    instance.createEmitter = createEmitter;
    instance.createStorage = createStorage;
    instance.createStorageList = createStorageList;
    instance.createTracker = createTracker;
    instance.newGuid = newGuid;
    instance.format = format;
    instance.queryFrom = queryFrom;
    instance.storageKeys = storageKeys;
    instance.createApp = createApp;
    instance.createSessionManager = createSessionManager;
    instance.createStorageSender = createStorageSender;
    /*</remove>*/

    trackers[appName] = instance;

    var sessionManager = createSessionManager(sessionExpires);
    sessionManager.on('createSession', function() {
      Object.keys(trackers).forEach(function(key) {
        trackers[key].emitEvent('createSession');
      });
    });

    sessionManager.on('destroySession', function() {
      Object.keys(trackers).forEach(function(key) {
        trackers[key].emitEvent('destroySession');
      });
    });

    var commandArgvList = [];
    /**
     * 初始化应用
     */
    function init() {
      sessionManager.init();
      var items = commandArgvList;
      commandArgvList = null;
      items.forEach(function (argv) {
        cmd.apply(instance, argv);
      });
    }
    instance.init = init;

    /**
     * 执行命令
     *
     * @param {string} line "[trackerName.]methodName"
     '''<example>'''
     * @example cmd():set
      ```js
      app.cmd('tracker1.set', 'x', 2);

      console.log(app.cmd('tracker1.get', 'x'));
      // > 2
      ```
     * @example cmd():default set
      ```js
      app.cmd('set', 'x', 3);

      console.log(app.cmd('get', 'x'));
      // > 3
      ```
     * @example cmd():type error
      ```js
      app.cmd(112);
      ```
     * @example cmd():invalid format
      ```js
      app.cmd('^tt^.set', 'x', 1);
      ```
     * @example cmd():method is invalid
      ```js
      app.cmd('hello');
      ```
     * @example cmd():"send" method
      ```js
      app.cmd('send', {
        event: 'click'
      });
      app.cmd('create', {
        accept: '/host/path/to'
      });
      var list = JSON.parse(localStorage['h5t@storageList/h5t/h5t/send']);
      console.log(/event=click/.test(list[0].data.query));
      // > true
      ```
      '''</example>'''
     */
    function cmd(line) {
      /*<safe>*/
      if (typeof line !== 'string') {
        console.error('Parameter "line" is not a string type.');
        return;
      }
      /*</safe>*/

      var match = line.match(/^(?:([\w$_]+)\.)?(\w+)$/);
      /*<safe>*/
      if (!match) {
        console.error('Parameter "line" is invalid format.');
        return;
      }
      /*</safe>*/
      var trackerName = match[1];
      var methodName = match[2];

      var methodArgs = [].slice.call(arguments, 1);

      // console.log('trackerName: %s, methodName: %s', trackerName, methodName);
      var tracker;
      if (trackerName) {
        tracker = trackers[trackerName];
        if (!tracker) {
          tracker = trackers[trackerName] = createTracker(appName, trackerName);
        }
      } else {
        tracker = instance;
      }

      if (typeof tracker[methodName] === 'function') {
        if (methodName === 'send' || methodName === 'log') {
          if (commandArgvList) {
            commandArgvList.push(arguments);
            return;
          }

          tracker.set({
            uid: userId,
            sid: sessionManager.get('sid'),
            seq: sessionManager.get('seq'),
            time: (Date.now() - sessionManager.get('birthday')).toString(36)
          });
        }
        return tracker[methodName].apply(tracker, methodArgs);
      } else {
        console.error('Tracker method "%s" is invalid.', methodName);
      }
    }
    instance.cmd = cmd;

    return instance;
  }
  /*</function>*/

  exports.createApp = createApp;
})();