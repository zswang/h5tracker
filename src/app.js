/*<jdists encoding="fndep" import="./common.js" depend="newGuid">*/
var common = require('./common');
var newGuid = common.newGuid;
/*</jdists>*/

/*<jdists encoding="fndep" import="./event.js" depend="createEmitter">*/
var createEmitter = require('./event').createEmitter;
/*</jdists>*/

exports.createEmitter = createEmitter;

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
        tracker = trackers[trackerName] = createTracker(trackerName);
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


/*<remove>
console.log(newGuid());
</remove>*/

// App.init(argv)

// // 生命周期
// App.start()
// App.resume()
// App.pause()
// App.exit()

// App.command();



// import Storage from "src/storage";


// class App {
// 	constructor(args) {
// 		// code
// 	}
// 	// methods
// }

// h5t('init', {
// 	post: '',
// 	sessionTime: 30000
// });

// h5t('pv.parser', {
// 	'title': 't',
// 	'time': false
// });

// h5t('set', 'title', '');

// h5t('pv.init', {
// 	post: ''
// });

// h5t('pv.send', 'pageview', {
// 	title: ''
// });

// h5t('pv.on', 'createSesstion', function () {
// 	this.send('pageview');
// });

// h5t('pv.on', 'destroySession', function () {

// });
//
//


