(function(document, window) {
  var objectName = window.h5tObjectName || 'h5t';
  var oldObject = window[objectName];
  if (oldObject && oldObject.defined) { // 避免重复加载
    return;
  }
  oldObject.defined = true;
  /*<function name="camelCase">*/
  /**
   * 将目标字符串进行驼峰化处理
   *
   * @see https://github.com/BaiduFE/Tangram2/blob/master/src/baidu/string/toCamelCase.js
   * @param {string} text 传入字符串
   * @return {string} 驼峰化处理后的字符串
   '''<example>'''
   * @example camelCase():base
    ```js
    console.log(jsets.camelCase('do-ready'));
    // > doReady
    console.log(jsets.camelCase('on-status-change'));
    // > onStatusChange
    console.log(jsets.camelCase('on-statusChange'));
    // > onStatusChange
    ```
    '''</example>'''
   */
  var camelCache = {}; // 缓存
  function camelCase(text) {
    if (!text || typeof text !== 'string') { // 非字符串直接返回
      return text;
    }
    var result = camelCache[text];
    if (result) {
      return result;
    }
    if (text.indexOf('-') < 0 && text.indexOf('_') < 0) {
      result = text;
    }
    else {
      result = text.replace(/[-_]+([a-z])/ig, function (all, letter) {
        return letter.toUpperCase();
      });
    }
    camelCache[text] = result;
    return result;
  }
  /*</function>*/
  /*<function name="createEmitter">*/
  /**
   * 创建事件对象
   '''<example>'''
   * @example base
    ```js
    var emitter = h5tracker.createEmitter();
    emitter.on('click', function (data) {
      console.log('on', data);
    });
    emitter.once('click', function (data) {
      console.log('once', data);
    });
    function bee(data) {
      console.log('bee', data);
    }
    emitter.on('click', bee);
    emitter.emit('click', 'hello 1');
    // > on hello 1
    // > once hello 1
    // > bee hello 1
    emitter.emit('click', 'hello 2');
    // > on hello 2
    // > bee hello 2
    emitter.off('click', bee);
    emitter.emit('click', 'hello 3');
    // > on hello 3
    ```
   '''</example>'''
   */
  function createEmitter() {
    /**
     * 事件对象实例
     *
     * @type {Object}
     */
    var instance = {};
    /**
     * 事件列表
     *
     * @type {Array}
     * @param {string} item.event 事件名
     * @param {Function} item.fn 回调函数
     */
    var callbacks = [];
    /**
     * 事件绑定
     *
     * @param {string} event 事件名
     * @param {Function} fn 回调函数
     * @return {Object} 返回事件实例
     */
    function on(event, fn) {
      callbacks.push({
        event: event,
        fn: fn
      });
      return instance;
    }
    instance.on = on;
    /**
     * 取消事件绑定
     *
     * @param {string} event 事件名
     * @param {Function} fn 回调函数
     * @return {Object} 返回事件实例
     */
    function off(event, fn) {
      callbacks = callbacks.filter(function (item) {
        return !(item.event === event && item.fn === fn);
      });
      return instance;
    }
    instance.off = off;
    /**
     * 事件绑定，只触发一次
     *
     * @param {string} event 事件名
     * @param {Function} fn 回调函数
     * @return {Object} 返回事件实例
     */
    function once(event, fn) {
      function handler() {
        off(event, handler);
        fn.apply(instance, arguments);
      }
      on(event, handler);
      return instance;
    }
    instance.once = once;
    /**
     * 触发事件
     *
     * @param {string} event 事件名
     * @param {Function} fn 回调函数
     * @return {Object} 返回事件实例
     */
    function emit(event) {
      var argv = [].slice.call(arguments, 1);
      callbacks.forEach(function (item) {
        item.fn.apply(instance, argv);
      });
      return instance;
    }
    instance.emit = emit;
    return instance;
  }
  /*</function>*/
  /*<function name="createGetter" depend="camelCase">*/
  /**
   * 创建读取键值的方法
   *
   * @param {Object} target 目标对象
   * @param {Function} getter 读取一个键值函数
   *  getter -> function(name, fn)
   '''<example>'''
   * @example createGetter():base
    ```js
    var dict = { a: 1, b: 2, c: 3 };
    var food = {};
    food.get = jsets.createGetter(food, function(name) {
        return dict[name];
    });
    console.log(JSON.stringify(food.get('a')));
    // > 1
    food.get('a', function(a) {
      console.log(JSON.stringify(a));
      // > 1
    });
    food.get(function(c, b, a) {
      console.log(JSON.stringify([a, b, c]));
      // > [1,2,3]
    });
    food.get(['a', 'b'], function(a, b) {
        console.log(JSON.stringify(a));
        // > 1
        console.log(JSON.stringify(b));
        // > 2
    });
    console.log(JSON.stringify(food.get(['a', 'b'])));
    // > {"a":1,"b":2}
    ```
    '''</example>'''
   */
  function createGetter(target, getter, camel) {
    var method = function (name, fn) {
      var result;
      var keys;
      if (typeof name === 'function') {
        keys = name['-jsets-params'];
        if (!keys) { // 优先从缓存中获取
          keys = [];
          String(name).replace(/\(\s*([^()]+?)\s*\)/,
            function (all, names) {
              keys = names.split(/\s*,\s*/);
            }
          );
          name['-jsets-params'] = keys;
        }
        return method(keys, name);
      }
      if (typeof name === 'string' || typeof name === 'number') {
        name = camel ? camelCase(name) : name;
        if (typeof fn === 'function') {
          fn.call(target, getter(name));
          return target;
        }
        return getter(name);
      }
      if (typeof name === 'object') {
        if (name instanceof Array) {
          if (typeof fn === 'function') {
            result = [];
            name.forEach(function (n) {
              result.push(getter(camel ? camelCase(n) : n));
            });
            fn.apply(target, result);
            return target;
          }
          result = {};
          name.forEach(function (n) {
            result[n] = getter(camel ? camelCase(n) : n);
          });
          return result;
        }
        var key;
        if (typeof fn === 'function') {
          result = [];
          for (key in name) {
            result.push(getter(camel ? camelCase(key) : key) || name[key]);
          }
          return target;
        }
        result = {};
        for (key in name) {
          result[key] = getter(camel ? camelCase(key) : key) || name[key];
        }
        return result;
      }
    };
    return method;
  }
  /*</function>*/
  /*<function name="createSetter" depend="camelCase">*/
  /**
   * 创建设置键值的方法
   *
   * @param {Object} target 目标对象
   * @param {Function} setter 设置一个键值函数
   *  setter -> function(name, value)
   * @param {boolean} camel 键值是否需要驼峰化
   '''<example>'''
   * @example createSetter():base
    ```js
    var dict = {};
    var food = {};
    food.set = jsets.createSetter(food, function(name, value) {
      dict[name] = value;
    });
    food.set('a', 1);
    console.log(JSON.stringify(dict));
    // > {"a":1}
    food.set({
      b: 2,
      c: 3
    });
    console.log(JSON.stringify(dict));
    // > {"a":1,"b":2,"c":3}
    ```
    '''</example>'''
   */
  function createSetter(target, setter, camel) {
    return function (name, value) {
      if (typeof name === 'string' || typeof name === 'number') {
        setter(camel ? camelCase(name) : name, value);
      }
      else if (typeof name === 'object') {
        if (name instanceof Array) {
          name.forEach(function (n, i) {
            setter(i, n);
          });
        }
        else {
          for (var key in name) {
            setter(camel ? camelCase(key) : key, name[key]);
          }
        }
      }
      return target;
    };
  }
  /*</function>*/
/*<function name="createTracker" depend="createEmitter,createGetter,createSetter">*/
/**
 * 创建追踪器
 *
 * @param {string} name 追踪器名称
 * @param {string} acceptUrl 接收地址
 * @return {Object} 返回追踪器实例
 */
function createTracker(name, acceptUrl) {
  /**
   * 追踪器实例
   *
   * @type {Object}
   */
  var instance = createEmitter();
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
  function send(data) {
  }
  /**
   * 打印日志
   *
   * @param {Object|String} params 日志参数
   */
  function log(params) {
    if (typeof params === 'string') {
      params.message = params;
      params.level = 'debug';
    }
    console[params.level].call(console, params.message);
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
/*<function name="newGuid">*/
/**
 * 比较大的概率上，生成唯一 ID
 *
 * @return {string} 返回生成的 ID
 */
function newGuid() {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}
/*</function>*/
/*<function name="createApp" depend="createEmitter,createTracker,newGuid">*/
/**
 * 追踪器实例
 *
 * @type {Object}
 */
var trackers = {};
/**
 * 追踪器参数缓存，当追踪器未创建时保存
 *
 * @type {Object}
 */
var argvList = {};
/**
 * 创建应用追踪器
 *
 * @param {string} appName 应用名
 * @param {Object} argv 配置项
 * @return {Object} 返回应用追踪器实例
 */
function createApp(appName, argv) {
  argv = argv || {};
  console.log('createApp() appName: %s', appName);
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
  var app = createApp();
  var instance = function() {
    app.cmd.apply(app, arguments);
  };
  if (oldObject) {
    // 处理临时 h5t 对象
    var items = [].concat(oldObject.p || [], oldObject.q || []);
    oldObject.p = oldObject.q = null; // 清理内存
    instance.p = instance.q = { // 接管之前的定义
      push: function(args) {
        instance.apply(instance, args);
      }
    };
    items.forEach(function (args) {
      instance.apply(instance, args);
    });
  }
  window[objectName] = instance;
})(document, window);