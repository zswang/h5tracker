/*<jdists encoding="fndep" import="./event.js" depend="createEmitter">*/
var createEmitter = require('./event').createEmitter;
/*</jdists>*/

/*<jdists encoding="fndep" import="../node_modules/jsets/jsets.js" depend="createGetter,createSetter">*/
var createGetter = require('jsets').createGetter;
var createSetter = require('jsets').createSetter;
/*</jdists>*/

/*<jdists encoding="fndep" import="./storage.js" depend="createStorage">*/
var createStorage = require('./storage').createStorage;
/*</jdists>*/

/*<function name="createTracker" depend="createEmitter,createGetter,createSetter,createStorage">*/
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

  var storage = createStorage(name);

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
   * 事件列表
   * @type {Object}
   */
  var event = {};
  /**
   * 行为数组
   * @type {Array}
   */
  var actionList = [];

  var baseData = {};
  /**
   * 事件回调方法
   * @param  {String} name 事件名称
   * @param  {} data 数据
   */
  function eventBackCall(name, data) {
    if (acceptUrl === undefined) {
      actionList.push({
        name: name,
        data: data
      });
      return false;
    }
    event[name](data);
    return true;
  }

  /**
   * 发送数据
   *
   * @param {Object} data 发送日志
   */
  function send(data) {
    if(!eventBackCall('send', data)){
      return;
    }
    instance.emit('send', data);
    storage.send(data);
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
    if(!eventBackCall('log', data)){
      return;
    }
    instance.emit('log', data);
    console[data.level].call(console, data.message);
    storage.log(data);
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

  // h5t('tracker.error', 'eraaesfads')
  /**
   * 创建
   *
   * @param {Object} options 配置对象
   */
  function create(options) {
    acceptUrl = options.accept;
    event = options.event || {};
    baseData = options.data || {};

    (actionList || []).forEach(function(action) {
      var actionEvent = event[action.name];
      if (actionEvent) {
        actionEvent(action.data);
      }
    });
    actionList = null;
  }
  instance.create = create;

  return instance;
}
/*</function>*/
exports.createTracker = createTracker;
