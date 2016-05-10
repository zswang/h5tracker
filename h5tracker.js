(function(document, window) {
  /**
   * @file h5tracker
   *
   * Logs Tracker of Mobile
   * @author
   *   zswang (http://weibo.com/zswang)
   *   meglad (https://github.com/meglad)
   * @version 0.0.42
   * @date 2016-05-10
   */
  var objectName = window.h5tObjectName || 'h5t';
  var oldObject = window[objectName];
  if (oldObject && oldObject.defined) { // 避免重复加载
    return;
  }
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
/*<function name="newGuid">*/
/**
 * 比较大的概率上，生成唯一 ID
 *
 * @return {string} 返回生成的 ID
 *
 '''<example>'''
 * @example newGuid:base
  ```js
  console.log(/^[a-z0-9]+$/.test(app.newGuid()));
  // > true
  ```
 '''</example>'''
 */
function newGuid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}
/*</function>*/
  /*<function name="createEmitter">*/
  /**
   * 创建事件对象
   '''<example>'''
   * @example base
    ```js
    var emitter = app.createEmitter();
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
    emitter.on('click2', function (data) {
      console.log('on', data);
    });
    emitter.emit('click2', 'hello 1');
    // > on hello 1
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
      callbacks.filter(function (item) {
        return item.event === event;
      }).forEach(function (item) {
        item.fn.apply(instance, argv);
      });
      return instance;
    }
    instance.emit = emit;
    return instance;
  }
  /*</function>*/
/*<function name="createStorageList" depend="newGuid">*/
/**
 * 创建存储列表
 *
 * @param {string} listName 列表名称
 * @param {Object} storageInstance 存储实例 localStorage | sessionStorage
 * @return {Object} 返回存储列表对象
   '''<example>'''
   * @example createStorageList():storageInstance => sessionStorage
    ```js
    var storageList = app.createStorageList('h5t_base1_log', sessionStorage);
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    var data = JSON.parse(sessionStorage.h5t_base1_log);
    console.log(data.length);
    // > 1
    ```
   * @example createStorageList():storageExpires => 10000
    ```js
    var storageList = app.createStorageList('h5t_base2_log', localStorage, 10000);
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    var data = JSON.parse(localStorage.h5t_base2_log);
    console.log(data[0].expires);
    // > 10000
    ```
   '''</example>'''
 */
function createStorageList(listName, storageInstance, storageExpires) {
  // 参数默认值
  storageInstance = storageInstance || localStorage;
  storageExpires = storageExpires || 864000; // 10 * 24 * 60 * 60
  var instance = {};
  /**
   * 时间戳字段名
   */
  var timestampKey = listName + '_ts';
  /**
   * 记录列表
   */
  var list;
  /**
   * 更新时间戳
   *
   * @type {[type]}
   */
  var timestamp = null;
  /**
   * 记录最小过期时间
   *
   * @type {Number}
   */
  var minExpiresTime = null;
  /**
   * 加载列表
   */
  function load() {
    if (storageInstance[timestampKey] !== timestamp) {
      list = null;
    }
    if (!list) {
      try {
        list = JSON.parse(storageInstance[listName] || '[]');
      } catch(ex) {
        list = [];
      }
    }
  }
  /**
   * 保存列表
   */
  function save() {
    storageInstance[timestampKey] = newGuid();
    storageInstance[listName] = JSON.stringify(list);
  }
  /**
   * 追加数据到列表中
   *
   * @param {Object} data 保存数据
   * @param {Number} expire 过期时间，单位：秒
   '''<example>'''
   * @example push():base
    ```js
    var storageList = app.createStorageList('h5t_push_log');
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    storageList.push({
      level: 'info',
      message: 'click button2'
    });
    var data = JSON.parse(localStorage.h5t_push_log);
    console.log(data.length);
    // > 2
    console.log(data[0].data.message);
    // > click button1
    console.log(data[1].data.message);
    // > click button2
    ```
   '''</example>'''
   */
  function push(data) {
    load();
    var id = newGuid();
    var birthday = Date.now();
    list.push({
      id: id,
      birthday: birthday,
      expires: storageExpires,
      data: data
    });
    save();
    return id;
  }
  instance.push = push;
  /**
   * 去列表的最后一个元素
   *
   * @return {Object} 返回最后一个元素，如果列表为空则返回 undefined
   '''<example>'''
   * @example toArray():base
    ```js
    var storageList = app.createStorageList('h5t_pop_log');
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    storageList.push({
      level: 'info',
      message: 'click button2'
    });
    var data = JSON.parse(localStorage.h5t_pop_log);
    var items = storageList.toArray();
    console.log(items.pop().data.message);
    // > click button2
    console.log(items.pop().data.message);
    // > click button1
    ```
   '''</example>'''
   */
  function toArray() {
    load();
    return list.slice();
  }
  instance.toArray = toArray;
  /**
   * 清除清除过期数据
   *
   * @return {Number} 返回被清除的记录数
   '''<example>'''
   * @example clean():base
    ```js
    var storageList = app.createStorageList('h5t_clean_log');
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    storageList.push({
      level: 'info',
      message: 'click button2'
    });
    storageList.push({
      level: 'info',
      message: 'click button3'
    });
    var data = JSON.parse(localStorage.h5t_clean_log);
    data[1].birthday = 0;
    localStorage.h5t_clean_log = JSON.stringify(data);
    storageList.clean();
    data = JSON.parse(localStorage.h5t_clean_log);
    console.log(data.length);
    // > 2
    console.log(data[0].data.message);
    // > click button1
    console.log(data[1].data.message);
    // > click button3
    ```
   '''</example>'''
   */
  function clean() {
    load();
    var count = 0;
    var now = Date.now();
    if (minExpiresTime !== null) {
      if (minExpiresTime < now) { // 有记录要过期
        minExpiresTime = null;
      } else { // 没有记录需要清除
        return count;
      }
    }
    list = list.filter(function (item) {
      var expiresTime = item.birthday + item.expires * 1000;
      if (expiresTime < now) { // 已经过期
        count++;
        return false;
      }
      if (minExpiresTime !== null) {
        minExpiresTime = Math.min(minExpiresTime, expiresTime);
      } else {
        minExpiresTime = expiresTime;
      }
      return true;
    });
    save();
    return count;
  }
  instance.clean = clean;
  /**
   * 移除记录
   *
   * @param {string} id 记录标识
   * @return {boolean} 返回是否移除成功
   '''<example>'''
   * @example remove():base
    ```js
    var storageList = app.createStorageList('h5t_remove_log');
    var id1 = storageList.push({
      level: 'info',
      message: 'click button1'
    });
    var id2 = storageList.push({
      level: 'info',
      message: 'click button2'
    });
    storageList.remove(id1);
    var data = JSON.parse(localStorage.h5t_remove_log);
    console.log(data.length);
    // > 1
    console.log(data[0].id === id2);
    // > true
    ```
   '''</example>'''
   */
  function remove(id) {
    load();
    list = list.filter(function (item) {
      if (id === item.id) {
        if (item.birthday + item.expires === minExpiresTime) {
          minExpiresTime = null;
        }
        return false;
      }
      return true;
    });
    save();
  }
  instance.remove = remove;
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
/*<function name="createStorage" depend="createStorageList">*/
/**
 * 创建存储器
 *
 * @param {Object} argv 配置项
 * @return {Object} 返回存储器
 */
function createStorage(trackerName) {
  var instance = {};
  var storageListSend = createStorageList(trackerName + '_send');
  var storageListLog = createStorageList(trackerName + '_log');
  /**
   * 记录日志
   *
   * @param {Object} data 日志数据
   * @return {string} 返回记录 ID
   */
  function log(data) {
    return storageListLog.push(data);
  }
  instance.log = log;
  /**
   * 拼装 URL 调用参数
   *
   * @param {Object} data 参数
   * @return {string} 返回拼接的字符串
   */
  function queryFrom(data) {
    var result = [];
    Object.keys(data).forEach(function(key) {
      if (data[key] === null) {
        return;
      }
      result.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    });
    return result.join('&');
  }
  /**
   * 发送数据
   *
   * @param {Object} data 发送数据
   * @param {string} accept 接收地址
   * @return {string} 返回记录 ID
   '''<example>'''
   * @example send():base
    ```js
    var storage = app.createStorage('h5t_scan');
    storage.send({
      hisType: 'pageview'
    }, '/host/path/to/t.gif');
    var data = JSON.parse(localStorage.h5t_scan_send);
    console.log(data[0].data.accept);
    // > /host/path/to/t.gif
    console.log(data[0].data.query);
    // > hisType=pageview
    ```
   '''</example>'''
   */
  function send(data, accept) {
    var id = storageListSend.push({
      accept: accept,
      query: queryFrom(data)
    });
    scan();
  }
  instance.send = send;
  /**
   * 清除过期数据
   *
   '''<example>'''
   * @example scan():base
    ```js
    var storage = app.createStorage('h5t_scan');
    storage.send({
      hisType: 'pageview'
    }, '/host/path/to/t.gif');
    ```
   '''</example>'''
  */
  function scan() {
    storageListLog.clean();
    storageListSend.clean();
    var item = storageListSend.toArray().pop();
    if (item) {
      var img = document.createElement('img');
      img.onload = function () {
        storageListSend.remove(item.id);
        delete instance[item.id];
        setTimeout(function () {
          scan();
        }, 1000);
      };
      // accept = 'host/path/to.gif'
      // accept = 'host/path/to.gif?from=qq'
      var accept = item.data.accept;
      img.src = accept + (accept.indexOf('?') < 0 ? '?' : "&") + item.data.query;
      instance[item.id] = img;
    }
  }
  instance.scan = scan;
  return instance;
}
/*</function>*/
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
  var app = createApp(objectName);
  var instance = function() {
    app.cmd.apply(app, arguments);
  };
  instance.app = app;
  instance.defined = true
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