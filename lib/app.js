/*<function name="newGuid">*/
function newGuid() {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}
/*</function>*/
function newGuid() {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}
/*=== 初始化 ===*/
/*<function name="init">*/
function init(argv) {
	argv = argv || {};
}
/*</function>*/
exports.init = init;
/*=== 生命周期 ===*/
var sessionTime;
var sessionId;
function start() {
}
function resume() {
}
function pause() {
}
function exit() {
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
