/*<function name="createTracker">*/
/**
 * 创建追踪器
 *
 * @param {string} name 追踪器名称
 * @param {string} acceptUrl 接收地址
 * @return {Object} 返回追踪器实例
 */
function createTracker(name, acceptUrl) {
  /*<jdists encoding="fndep" import="./event.js" depend="createEmitter">*/
  var createEmitter = require('./event').createEmitter;
  /*</jdists>*/

	/**
	 * 追踪器实例
	 *
	 * @type {Object}
	 */
	var instance = createEmitter();
  trakers[name] = instance;

	/**
	 * 日志接收地址
	 *
	 * @type {string}
	 */
	var acceptUrl;
	/**
	 * 字段列表
	 *
	 * @type {Object}
	 */
	var fields = {};

	/**
	 * 设置或获取接收地址
	 *
	 * @param {string} url 接收地址
	 * @return {string=} 没有参数则返回接收地址
	 */
	function accept(url) {
		if (arguments.length === 0) {
			return acceptUrl;
		}
		acceptUrl = url;
	}
  instance.accept = accept;

  /**
   * 数据别名转换
   *
   * @param {Object} dict 处理函数
   * @return {Function} 没有参数则返回回调
   */
  function parser(handler) {

  }
  instance.parser = parser;

	/**
	 * 设置或获取字段
	 *
	 * @param {string} name 字段名
	 * @param {Any=} value 字段值
	 * @return {string} 如果没有字段则返回字段值
	 */
	function field(name, value) {
		if (arguments.length <= 1) {
			return fields[name];
		}
		fields[name] = value;
	}

  function send(data) {

  }

  function getTracker(name) {
    return trakers[name];
  }

  instance.getTracker = getTracker;
	return instance;
}
/*</function>*/
exports.createTracker = createTracker;
