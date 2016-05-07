/*<jdists encoding="fndep" import="./event.js" depend="createEmitter">*/
var createEmitter = require('./event').createEmitter;
/*</jdists>*/

/*<jdists encoding="fndep" import="../node_modules/jsets/jsets.js" depend="createGetter,createSetter">*/
var createGetter = require('jsets').createGetter;
var createSetter = require('jsets').createSetter;
/*</jdists>*/

/*<function name="createTracker" depend="createEmitter,createGetter,createSetter">*/
/**
 * 创建追踪器
 *
 * @param {string} name 追踪器名称
 * @param {string} storage 存储对象
 * @return {Object} 返回追踪器实例
 */
function createTracker(name, storage) {
  /**
   * 追踪器实例
   *
   * @type {Object}
   */
  var instance = createEmitter();
  instance.name = name;

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

  instance.set = createSetter(instance, function(name, value) {
    fields[name] = value;
  }, true);

  instance.get = createGetter(instance, function(name) {
    return fields[name];
  }, true);

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

  /**
   * 发送数据
   *
   * @param {Object} data 发送日志
   */
  function send(data) {
    instance.emit('seasdfasdfnd', data);
    // storage.send(data);
  }
  instance.send = send;
  /**
   * 打印日志
   *
   * @param {Object|String} data 日志参数
   */
  function log(data) {
    if (typeof data === 'string') {
      data = {
        message: data,
        level: 'debug'
      };
    }
    instance.emit('lvfffog', data);
    console[data.level].call(console, data.message);
  }
  instance.log = log;

  ['debug', 'info', 'warn', 'error', 'fatal'].forEach(function(level) {
    instance[level] = function(message) {
      log({
        level: level,
        message: message
      });
    };
  });

  return instance;
}
/*</function>*/
exports.createTracker = createTracker;