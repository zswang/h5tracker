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
 * @return {Object} 返回追踪器实例
 '''<example>'''
 * @example createTracker():base
  ```js
  var tracker = app.createTracker('base');
  var count = 0;
  tracker.error('error1');
  tracker.send({
    ht: 'pageview'
  });
  tracker.on('log', function (data) {
    console.log(count++);
    // > 0

    console.log(data.level);
    // > error

    console.log(data.message);
    // > error1
  });
  tracker.create({
    accept: 'http://host/path/to',
    data: {
      do: 'h5t.com',
      lo: '/home'
    },
    event: {
      send: function (data) {
        console.log(count++);
        // > 2

        console.log(data.do);
        // > h5t.com

        console.log(data.lo);
        // > /home
      },
      log: function (data) {
        console.log(count++);
        // > 1

        console.log(data.level);
        // > error

        console.log(data.message);
        // > error1
      }
    },
  });
  ```
 '''</example>'''
 */
function createTracker(name) {
  /**
   * 追踪器实例
   *
   * @type {Object}
   */
  var instance = createEmitter();
  instance.name = name;

  var storage = createStorage(name);

  /**
   * 是否被创建过
   */
  var created;

  /**
   * 字段列表
   *
   * @type {Object}
   */
  var fields = {};
  /**
   * 设置获取字段
   *
   '''<example>'''
   * @example set() & get():base
    ```js
    var tracker = app.createTracker('setter');
    tracker.set({
      x: 1,
      y: 2
    });
    tracker.get(function (y, x) {
      console.log(x, y);
      // > 1 2
    });

    ```
   '''</example>'''
   */
  instance.set = createSetter(instance, function (name, value) {
    fields[name] = value;
  }, true);
  instance.get = createGetter(instance, function (name) {
    return fields[name];
  }, true);


  /**
   * 行为数组
   *
   * @type {Array}
   */
  var actionList = [];
  /**
   * 配置项
   *
   * @type {Object}
   */
  var options;

  /**
   * 发送数据
   *
   * @param {Object} data 发送日志
   '''<example>'''
   * @example send():case 1
    ```js
    var tracker = app.createTracker('send_case_1');
    tracker.set({
      x: 1,
      y: 2
    });
    tracker.send({z: 3});
    tracker.send({z: null});
    tracker.create({
      accept: '/host/case1',
      data: {
        z: 'z3'
      }
    });

    var data = JSON.parse(localStorage.send_case_1_send);

    console.log(data[0].data.query);
    // > z=3&x=1&y=2

    console.log(data[1].data.query);
    // > x=1&y=2
    ```
   '''</example>'''
   */
  function send(data) {
    if (!created) {
      actionList.push({
        name: 'send',
        data: data
      });
      return;
    }
    // merge data
    var item = {};
    if (options.data) {
      Object.keys(options.data).forEach(function (key) {
        item[key] = options.data[key];
      });
    }
    Object.keys(fields).forEach(function (key) {
      item[key] = fields[key];
    });
    Object.keys(data).forEach(function (key) {
      item[key] = data[key];
    });
    instance.emit('send', item);
    storage.send(item, options.accept);
  }
  instance.send = send;
  /**
   * 打印日志
   *
   * @param {Object|String} data 日志参数
   */
  function log(data) {
    if (!created) {
      actionList.push({
        name: 'log',
        data: data
      });
      return;
    }
    if (typeof data === 'string') {
      data = {
        message: data,
        level: 'debug'
      };
    }
    if (!data.level) {
      console.error('log level is undefined.');
      return;
    }
    instance.emit('log', data);
    /*<debug>*/
    // console[data.level].call(console, data.message);
    /*</debug>*/
    storage.log(data);
  }
  instance.log = log;

  ['debug', 'info', 'warn', 'error', 'fatal'].forEach(function (level) {
    instance[level] = function (message) {
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
  function create(opts) {
    if (created) {
      console.error('h5tracker: is repeat created');
      return;
    }
    created = true;
    options = opts || {};

    // 绑定事件
    if (opts.event) {
      Object.keys(opts.event).forEach(function (key) {
        var fn = opts.event[key];
        if (typeof fn === 'function') {
          instance.on(key, fn);
        }
      });
    }

    actionList.forEach(function (item) {
      instance[item.name](item.data);
    });

    actionList = null;
  }
  instance.create = create;

  return instance;
}
/*</function>*/
exports.createTracker = createTracker;