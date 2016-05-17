(function () {

  /*<jdists encoding="fndep" import="./common.js" depend="newGuid">*/
  var newGuid = require('./common').newGuid;
  /*</jdists>*/

  /*<jdists encoding="fndep" import="./event.js" depend="createEmitter">*/
  var createEmitter = require('./event').createEmitter;
  /*</jdists>*/

  /*<jdists encoding="fndep" import="./storage-keys.js" depend="storageKeys">*/
  var storageKeys = require('./storage-keys').storageKeys;
  /*</jdists>*/

  /*<jdists encoding="fndep" import="../node_modules/jsets/jsets.js" depend="createGetter">*/
  var createGetter = require('jsets').createGetter;
  /*</jdists>*/

  /*<function name="createSessionManager" depend="storageKeys,createEmitter,createGetter">*/
  /**
   * 创建 Session 管理器
   *
   * @param {Number} sessionExpires 过期时间 30 秒
   * @return {Object} 返回管理器会话实例
   '''<example>'''
   * @example createSessionManager():base
    ```js
    var sessionManager = app.createSessionManager();
    var sessionId = sessionStorage['h5t@global/sessionId'];
    var sessionSeq = sessionStorage['h5t@global/sessionSeq'];
    var birthday = sessionStorage['h5t@global/sessionBirthday'];
    var liveTime = sessionStorage['h5t@global/sessionLiveTime'];

    console.log(sessionSeq >= 0);
    // > true

    console.log(birthday && birthday === liveTime);
    // > true

    console.log(sessionId === sessionManager.get('sid'));
    // > true

    console.log(sessionSeq === sessionManager.get('seq'));
    // > true

    console.log(birthday === sessionManager.get('birthday'));
    // > true

    console.log(liveTime === sessionManager.get('liveTime'));
    // > true
    ```
    * @example createSessionManager():sessionExpires => 1
    ```js
    var timeout = 1;
    var sessionManager = app.createSessionManager(timeout);

    setTimeout(function(){
      console.log(Date.now() - sessionManager.get('liveTime') > timeout * 1000);
      // > true
      // * done
    }, 1500);
    ```
   '''</example>'''
   */
  function createSessionManager(sessionExpires) {
    var storageInstance = sessionStorage;
    sessionExpires = sessionExpires || 30;
    var instance = createEmitter();

    var fieldsKey = {
      sid: storageKeys.sessionId,
      seq: storageKeys.sessionSeq,
      birthday: storageKeys.sessionBirthday,
      liveTime: storageKeys.sessionLiveTime,
    };

    instance.get = createGetter(instance, function (name) {
      return storageInstance[fieldsKey[name]];
    }, true);

    /**
     * 创建 Session
     '''<example>'''
     * @example createSession():base
      ```js
      var sessionManager = app.createSessionManager();
      var sessionId = sessionManager.get('sid');

      console.log(!!sessionId);
      // > true

      sessionManager.createSession();
      console.log(!!sessionManager.get('sid'));
      // > true

      console.log(sessionId !== sessionManager.get('sid'));
      // > true
      ```
     '''</example>'''
     */
    function createSession() {
      if (storageInstance[storageKeys.sessionId]) {
        instance.emit('destroySession');
      }
      var now = Date.now();
      storageInstance[storageKeys.sessionId] = newGuid();
      if (storageInstance[storageKeys.sessionSeq] === null || isNaN(storageInstance[storageKeys.sessionSeq])) {
        storageInstance[storageKeys.sessionSeq] = 0;
      } else {
        storageInstance[storageKeys.sessionSeq] = parseInt(storageInstance[storageKeys.sessionSeq]) + 1;
      }
      storageInstance[storageKeys.sessionBirthday] = now;
      storageInstance[storageKeys.sessionLiveTime] = now;
      instance.emit('createSession');
    }
    instance.createSession = createSession;

    /**
     * 释放 Session
     '''<example>'''
     * @example destroySession():base
      ```js
      var sessionManager = app.createSessionManager();

      console.log(!!sessionManager.get('sid'));
      // > true

      sessionManager.destroySession();
      sessionManager.destroySession();

      console.log(!!sessionManager.get('sid'));
      // > false
      ```
     '''</example>'''
     */
    function destroySession() {
      if (storageInstance[storageKeys.sessionId]) {
        delete storageInstance[storageKeys.sessionId];
        delete storageInstance[storageKeys.sessionBirthday];
        delete storageInstance[storageKeys.sessionLiveTime];
        instance.emit('destroySession');
      }
    }
    instance.destroySession = destroySession;

    if (!storageInstance[storageKeys.sessionId]) {
      createSession();
    }

    function inputHandler(e) {
      var now = Date.now();

      if (now - storageInstance[storageKeys.sessionLiveTime] >= sessionExpires * 1000) {
        createSession();
      } else {
        // setTimeout 避免多个 app 实例互相影响
        setTimeout(function () {
          storageInstance[storageKeys.sessionLiveTime] = now;
        });
      }
    }

    [
      'keydown', 'input', 'keyup',
      'click', 'contextmenu', 'mousemove',
      'touchstart', 'touchend', 'touchmove'
    ].forEach(function(name) {
      document.addEventListener(name, inputHandler, false);
    });

    return instance;
  }
  /*</function>*/
  exports.createSessionManager = createSessionManager;

})();