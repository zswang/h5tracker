/*<jdists encoding="fndep" import="./common.js" depend="newGuid">*/
var newGuid = require('./common').newGuid;
/*</jdists>*/

/*<jdists encoding="fndep" import="./event.js" depend="createEmitter">*/
var createEmitter = require('./event').createEmitter;
/*</jdists>*/

/*<jdists encoding="fndep" import="./storage-keys.js" depend="storageKeys,createEmitter,newGuid">*/
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
 */
function createSessionManager(sessionExpires) {
  sessionExpires = sessionExpires || 30;

  var instance = createEmitter();

  var fieldsKey = {
    id: storageKeys.sessionId,
    birthday: storageKeys.sessionBirthday,
    liveTime: storageKeys.sessionLiveTime,
  };

  instance.get = createGetter(instance, function (name) {
    return sessionStorage[fieldsKey[name]];
  }, true);

  /**
   * 创建 Session
   */
  function createSession() {
    if (sessionStorage[storageKeys.sessionId]) {
      instance.emit('destroySession');
    }
    var now = Date.now();
    sessionStorage[storageKeys.sessionId] = newGuid();
    sessionStorage[storageKeys.sessionBirthday] = now;
    sessionStorage[storageKeys.sessionLiveTime] = now;
    instance.emit('createSession');
  }
  instance.createSession = createSession;

  /**
   * 创建 Session
   */
  function destroySession() {
    if (sessionStorage[storageKeys.sessionId]) {
      delete sessionStorage[storageKeys.sessionId];
      delete sessionStorage[storageKeys.sessionBirthday];
      delete sessionStorage[storageKeys.sessionLiveTime];
      instance.emit('destroySession');
    }
  }
  instance.createSession = createSession;

  if (!sessionStorage[storageKeys.sessionId]) {
    createSession();
  }

  var timer;

  function inputHandler() {
    if (timer) {
      return;
    }
    var now = Date.now();
    timer = setTimeout(function() {
      if (Date.now() - sessionStorage[storageKeys.liveTime] >= sessionExpires) {
        createSession();
      } else {
        sessionStorage[storageKeys.sessionLiveTime] = liveTime;
      }
      timer = null;
    }, 1000);
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