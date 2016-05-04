/*<jdists encoding="fndep" import="./common.js" depend="newGuid">*/
var common = require('./common');
var newGuid = common.newGuid;
/*</jdists>*/

/*<jdists encoding="fndep" import="./event.js" depend="createEmitter">*/
var event = require('./event');
var createEmitter = event.createEmitter;
/*</jdists>*/

exports.createEmitter = createEmitter;

/*<jdists encoding="fndep" import="./tracker.js" depend="createTracker">*/
var event = require('./tracker');
var createTracker = tracker.createTracker;
/*</jdists>*/

/*=== 初始化 ===*/
/*<function name="createApp" depend="createEmitter,createTracker,newGuid">*/
var trackers = {};

/**
 * 创建应用追踪器
 *
 * @param {string} appName 应用名
 * @param {Object} argv 配置项
 * @return {Object} 返回应用追踪器实例
 */
function createApp(appName, argv) {
  argv = argv || {};

  var instance = createTracker('main');

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
    var method = match[2];

    console.log('trackerName: %s, method: %s', trackerName, method);
    //             args[0] = method; // 'hunter.send' -> 'send'
    //             command.apply(entry.tracker(trackerName), args);

    // var args = [].slice.call(arguments, 1);



    //     if (this.created || /^(on|un|set|get|create)$/.test(method)) {
    //         var methodFunc = Tracker.prototype[method];
    //         var params = [];
    //         for (var i = 1, len = args.length; i < len; i++) {
    //             params.push(args[i]);
    //         }
    //         if (typeof methodFunc === 'function') {
    //             methodFunc.apply(this, params);
    //         }
    //     }
    //     else { // send|fire // 实例创建以后才能调用的方法
    //         this.argsList.push(args);
    //     }
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


