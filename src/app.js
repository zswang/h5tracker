/*<jdists encoding="fndep" import="./common.js" depend="newGuid">*/
var newGuid = require('./common').newGuid;
/*</jdists>*/

/*<jdists encoding="fndep" import="./event.js" depend="createEmitter">*/
var createEmitter = require('./event').createEmitter;
/*</jdists>*/

/*<jdists encoding="fndep" import="./tracker.js" depend="createTracker">*/
var createTracker = require('./tracker').createTracker;
/*</jdists>*/

/*=== 初始化 ===*/
/*<function name="createApp" depend="createEmitter,createTracker,newGuid">*/
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
 * @param {Object} argv 配置项
 * @return {Object} 返回应用追踪器实例
 */
function createApp(appName) {
  console.log('createApp() appName: %s', appName);

  var instance = createTracker('main');

  instance.createEmitter = createEmitter;
  instance.createStorage = createStorage;
  instance.createStorageList = createStorageList;
  instance.createTracker = createTracker;
  instance.newGuid = newGuid;
  instance.createApp = createApp;

  trackers[instance.name] = instance;

  /*=== 生命周期 ===*/

  /**
   * session 创建的时间
   *
   * @type {number}
   */
  var sessionTime;
  /**
   * session ID
   *
   * @type {string}
   */
  var sessionId;

  function start() {
    sessionId = newGuid();
    sessionTime = Date.now();
    emit('start');
  }

  function resume() {
    emit('resume');
  }

  function pause() {
    emit('pasue');
  }

  function exit() {
    emit('exit');
  }

  function config() {

  }
  instance.config = config;

  /**
   * 执行命令
   *
   * @param {string} line "[trackerName.]methodName"
   * @return {[type]}      [description]
   */
  function cmd(line) {
    if (typeof line !== 'string') {
      console.error('Parameter "line" is not a string type.');
      return;
    }

    var match = line.match(/^(?:([\w$_]+)\.)?(\w+)$/);
    if (!match) {
      console.error('Parameter "line" is invalid format.');
      return;
    }
    var trackerName = match[1];
    var methodName = match[2];

    var methodArgs = [].slice.call(arguments, 1);

    // console.log('trackerName: %s, methodName: %s', trackerName, methodName);
    if (!trackerName) {
      if (typeof app[methodName] === 'function') {
        return app[methodName].apply(app, methodArgs);
      } else {
        console.error('App method "%s" is invalid.', methodName);
      }
    } else {
      var tracker = trackers[trackerName];
      if (!tracker) {
        tracker = trackers[trackerName] = createTracker(appName + '_' + trackerName);
      }
      if (typeof tracker[methodName] === 'function') {
        return tracker[methodName].apply(tracker, methodArgs);
      } else {
        console.error('Tracker method "%s" is invalid.', methodName);
      }
    }
  }
  instance.cmd = cmd;

  return instance;
}
/*</function>*/

exports.createApp = createApp;