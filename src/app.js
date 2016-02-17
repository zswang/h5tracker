/*<jdists encoding="fndep" import="./common.js" depend="newGuid">*/
var common = require('./common');
var newGuid = common.newGuid;
/*</jdists>*/

/*=== 初始化 ===*/

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

  function cmd(action) {

  }

  /*==== 事件 ===*/

  /**
   * 绑定事件
   *
   * @param {string} event
   * @param {Function} callback
   */
  function on(event, callback) {

  }

  /**
   * 绑定事件
   *
   * @param {string} event
   * @param {Object...} data
   */
  function emit(event, data) {

  }
  return instance;
}

exports.createApp = createApp;

/*<remove>*/
console.log(newGuid());
/*</remove>*/

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