(function(document, window) {
  /**
   * @file h5tracker
   *
   * Logs Tracker of Mobile
   * @author
   *   zswang (http://weibo.com/zswang)
   *   meglad (https://github.com/meglad)
   * @version 0.0.111
   * @date 2016-05-14
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
/*<function name="storageKeys">*/
var storageKeys = (function () {
  var prefix = 'h5t@';
  return {
    userId: prefix + 'global/userId',
    scanTime: prefix + 'global/scanTime',
    sessionId: prefix + 'global/sessionId',
    sessionBirthday: prefix + 'global/sessionBirthday',
    sessionLiveTime: prefix + 'global/sessionLiveTime',
    storageList: prefix + 'storageList/#{app}/#{tracker}/#{name}',
    storageListTS: prefix + 'storageList/#{app}/#{tracker}/#{name}/ts',
  };
})();
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
var newGuid = (function() {
  var guid = parseInt(Math.random() * 36);
  return function newGuid() {
    return Date.now().toString(36) + (guid++ % 36).toString(36) + Math.random().toString(36).slice(2, 4);
  }
})();
/*</function>*/
/*<function name="format">*/
function format(template, json) {
  return template.replace(/#\{(.*?)\}/g, function(all, key) {
    return json && (key in json) ? json[key] : "";
  });
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
/*<function name="createStorageList" depend="newGuid,format,storageKeys,createGetter">*/
/**
 * 创建存储列表
 *
 * @param {string} appName 应用名
 * @param {string} trackerName 追踪器名
 * @param {string} listName 列表名称
 * @param {Object} storageInstance 存储实例 localStorage | sessionStorage
 * @return {Object} 返回存储列表对象
   '''<example>'''
   * @example createStorageList():storageInstance => sessionStorage
    ```js
    var storageList = app.createStorageList('h5t', 'base1', 'log', sessionStorage);
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    var data = JSON.parse(sessionStorage['h5t@storageList/h5t/base1/log']);
    console.log(data.length);
    // > 1
    ```
   * @example createStorageList():storageExpires => 10000
    ```js
    var storageList = app.createStorageList('h5t', 'base2', 'log', localStorage, 10000);
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    var data = JSON.parse(localStorage['h5t@storageList/h5t/base2/log']);
    console.log(data[0].expires);
    // > 10000
    ```
   '''</example>'''
 */
function createStorageList(appName, trackerName, listName, storageInstance, storageExpires) {
  // 参数默认值
  storageInstance = storageInstance || localStorage;
  storageExpires = storageExpires || 864000; // 10 * 24 * 60 * 60
  var instance = {};
  var scope = {
    name: listName,
    app: appName,
    tracker: trackerName,
  };
  /**
   * 时间戳字段名
   */
  var storageListTSKey = format(storageKeys.storageListTS, scope);
  var storageListKey = format(storageKeys.storageList, scope);
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
    if (storageInstance[storageListTSKey] !== timestamp) {
      list = null;
    }
    if (!list) {
      try {
        list = JSON.parse(storageInstance[storageListKey] || '[]');
      } catch (ex) {
        list = [];
      }
    }
  }
  /**
   * 保存列表
   */
  function save() {
    storageInstance[storageListTSKey] = newGuid();
    storageInstance[storageListKey] = JSON.stringify(list);
  }
  /**
   * 追加数据到列表中
   *
   * @param {Object} data 保存数据
   * @param {Number} expire 过期时间，单位：秒
   '''<example>'''
   * @example push():base
    ```js
    var storageList = app.createStorageList('h5t', 'push', 'log');
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    storageList.push({
      level: 'info',
      message: 'click button2'
    });
    var data = JSON.parse(localStorage['h5t@storageList/h5t/push/log']);
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
      tried: 0, // 尝试发送次数
      data: data
    });
    save();
    return id;
  }
  instance.push = push;
  /**
   * 列表数组
   *
   * @return {Object} 返回最后一个元素，如果列表为空则返回 undefined
   '''<example>'''
   * @example toArray():base
    ```js
    var storageList = app.createStorageList('h5t', 'toArray', 'log');
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    storageList.push({
      level: 'info',
      message: 'click button2'
    });
    var data = JSON.parse(localStorage['h5t@storageList/h5t/toArray/log']);
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
    var storageList = app.createStorageList('h5t', 'clean', 'log');
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
    var data = JSON.parse(localStorage['h5t@storageList/h5t/clean/log']);
    data[1].birthday = 0;
    localStorage['h5t@storageList/h5t/clean/log'] = JSON.stringify(data);
    storageList.clean();
    data = JSON.parse(localStorage['h5t@storageList/h5t/clean/log']);
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
    list = list.filter(function(item) {
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
    var storageList = app.createStorageList('h5t', 'remove', 'log');
    var id1 = storageList.push({
      level: 'info',
      message: 'click button1'
    });
    var id2 = storageList.push({
      level: 'info',
      message: 'click button2'
    });
    storageList.remove(id1);
    var data = JSON.parse(localStorage['h5t@storageList/h5t/remove/log']);
    console.log(data.length);
    // > 1
    console.log(data[0].id === id2);
    // > true
    ```
   '''</example>'''
   */
  function remove(id) {
    load();
    list = list.filter(function(item) {
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
  /**
   * 更新数据
   *
   * @param {string} id 记录标识
   * @param {Object} item 修改项
   * @return {boolean} 返回是否修改成功
   '''<example>'''
   * @example update():base
    ```js
    var storageList = app.createStorageList('h5t', 'update', 'send');
    var id1 = storageList.push({
      level: 'info',
      message: 'click button1'
    });
    storageList.update(id1, {
      tried: 2
    });
    var data = JSON.parse(localStorage['h5t@storageList/h5t/update/send']);
    console.log(data[0].tried === 2);
    // > true
    ```
   '''</example>'''
   */
  function update(id, item) {
    var data = instance.get(id);
    if (data) {
      Object.keys(data).forEach(function(key) {
        if (item[key]) {
          data[key] = item[key];
        }
      });
      save();
      return true;
    }
    return false;
  }
  instance.update = update;
  /**
   * 查询数据
   *
   * @param {string} id 记录标识
   * @return {boolean} 返回记录数据
   '''<example>'''
   * @example get():base
    ```js
    var storageList = app.createStorageList('h5t', 'get', 'send');
    var id1 = storageList.push({
      level: 'info',
      message: 'click button1'
    });
    var item = storageList.get(id1);
    var data = JSON.parse(localStorage['h5t@storageList/h5t/get/send']);
    console.log(item.id === id1);
    // > true
    ```
   '''</example>'''
   */
  instance.get = createGetter(instance, function(id) {
    load();
    var result;
    list.some(function(item) {
      if (id === item.id) {
        result = item;
        return item;
      }
    });
    return result;
  }, true);
  return instance;
}
/*</function>*/
/*<function name="createStorage" depend="createStorageList">*/
/**
 * 创建存储器
 *
 * @param {string} appName 应用名
 * @param {string} trackerName 追踪器名
 * @return {Object} 返回存储器
 */
function createStorage(appName, trackerName) {
  var instance = {};
  var storageListSend = createStorageList(appName, trackerName, 'send');
  var storageListLog = createStorageList(appName, trackerName, 'log');
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
    var storage = app.createStorage('h5t', 'scan');
    storage.send({
      hisType: 'pageview'
    }, '/host/path/to/t.gif');
    var data = JSON.parse(localStorage['h5t@storageList/h5t/scan/send']);
    console.log(data[0].data.accept);
    // > /host/path/to/t.gif
    console.log(data[0].data.query);
    // > hisType=pageview
    ```
   * @example send():acceptStyle
    ```js
    var storage = app.createStorage('h5t', 'scan2');
    storage.send({
      hisType: 'pageview'
    }, '/host/path/to/t.gif', 'path');
    var data = JSON.parse(localStorage['h5t@storageList/h5t/scan2/send']);
    console.log(data[0].data.acceptStyle);
    // > path
    ```
   '''</example>'''
   */
  function send(data, accept, acceptStyle) {
    var id = storageListSend.push({
      accept: accept,
      acceptStyle: acceptStyle, // 发送格式 "path" | "query"
      query: queryFrom(data),
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
    // acceptStyle = 'path';
    // acceptStyle = 'query';
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
      var match = item.data.accept.match(/^([^?]+)(?:\?(.*))?$/);
      var path = match[0];
      var query = match[1];
      var url;
      if (item.data.acceptStyle === 'path') {
        url = path + (/\/$/.test(path) ? '' : '/') + item.data.query.replace(/[&=]/g, '/') + (query ? '?' + query : '');
      } else {
        url = path + '?' + item.data.query + (query ? '&' + query : '');
      }
      img.src = url;
      // var accept = item.data.accept;
      // img.src = accept + (accept.indexOf('?') < 0 ? '?' : '&') + item.data.query;
      instance[item.id] = img;
    }
  }
  instance.scan = scan;
  return instance;
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
/*<function name="createStorageSender" depend="createStorageList">*/
/**
 * 创建发送器
 *
   '''<example>'''
   * @example createStorageSender():base
    ```js
    var storageList = app.createStorageList('h5t', 'sender', 'send');
    storageList.push({
      accept: 'http://host/path/to',
      query: 'level=info&message=click%20button1'
    });
    app.createStorageSender();
    setTimeout(function(){
      console.log(localStorage['h5t@storageList/h5t/sender/send']);
      // > []
      //done();
    }, 1100);
    ```
   '''</example>'''
 */
var createStorageSender = function() {
  var instance = {};
  var storageSends;
  var StorageListDict = {};
  var timer;
  send();
  function send(delay) {
    delay = delay || 0;
    if (timer) {
      clearTimeout(timer);
    }
    storageSends = [];
    timer = setTimeout(function() {
      timer = null;
      Object.keys(localStorage).forEach(function(key) {
        var match = key.match(/^h5t@storageList\/(\w+)\/(\w+)\/send$/);
        if (match) {
          var appName = match[1];
          var trackerName = match[2];
          var storageListSend = StorageListDict[[appName, trackerName]];
          if (!storageListSend) {
            StorageListDict[[appName, trackerName]] =
              storageListSend =
              createStorageList(appName, trackerName, 'send');
            var list = storageListSend.toArray();
            list.forEach(function(item) {
              item.StorageDict = [appName, trackerName].toString();
            });
          }
          storageSends = storageSends.concat(list);
        }
      });
      // 发送策略，优先尝试次数少的，再次创建最近的
      storageSends.sort(function(a, b) {
        if (a.tried === b.tried) {
          return b.birthday - a.birthday;
        } else {
          return a.tried - b.tried;
        }
      });
      var item = storageSends.shift();
      if (!item) {
        return;
      }
      // 更新发送尝试次数
      StorageListDict[item.StorageDict].update(item.id, {
        tried: ++item.tried
      });
      if (!item.data.accept) {
        console.error('accept is undefined.');
        return;
      }
      var img = document.createElement('img');
      img.onload = function() {
        StorageListDict[item.StorageDict].remove(item.id);
        delete instance[item.id];
        send(1000);
      };
      img.onerror = function() {
        delete instance[item.id];
        send(60 * 1000);
      };
      // accept = 'host/path/to.gif'
      // accept = 'host/path/to.gif?from=qq'
      var match = item.data.accept.match(/^([^?]+)(?:\?(.*))?$/);
      var path = match[0];
      var query = match[1];
      var url;
      if (item.data.acceptStyle === 'path') {
        url = path + (/\/$/.test(path) ? '' : '/') + item.data.query.replace(/[&=]/g, '/') + (query ? '?' + query : '');
      } else {
        url = path + '?' + item.data.query + (query ? '&' + query : '');
      }
      img.src = url;
      instance[item.id] = img;
    }, delay);
  }
  instance.send = send;
};
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
    // > 1
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
        // > 0
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
function createTracker(appName, trackerName) {
  /**
   * 追踪器实例
   *
   * @type {Object}
   */
  var instance = createEmitter();
  instance.name = trackerName;
  var storage = createStorage(appName, trackerName);
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
   * @example send():field is null
    ```js
    var tracker = app.createTracker('h5t', 'send_case_1');
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
    var data = JSON.parse(localStorage['h5t@storageList/h5t/send_case_1/send']);
    console.log(data[0].data.query);
    // > z=3&x=1&y=2
    console.log(data[1].data.query);
    // > x=1&y=2
    ```
   * @example send():field is null
    ```js
    var tracker = app.createTracker('h5', 'send_case_2');
    tracker.send({z: 3});
    tracker.create({});
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
    if (!options.accept) {
      console.error('options.accept is undefined.');
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
    if (options.event) {
      var fn = options.event['send'];
      if (typeof fn === 'function') {
        fn.call(instance, item);
      }
    }
    instance.emit('send', item);
    storage.send(item, options.accept, options.acceptStyle);
  }
  instance.send = send;
  /**
   * 打印日志
   *
   * @param {Object|String} data 日志参数
   '''<example>'''
   * @example log():case 1
    ```js
    var tracker = app.createTracker('h5t', 'log_case_1');
    tracker.set({
      x: 1,
      y: 2
    });
    tracker.log('default log.');
    tracker.log({
      'level': 'warn',
      'message': 'hello'
    });
    tracker.debug('debug log.');
    tracker.info('info log.');
    tracker.warn('warn log.');
    tracker.fatal('fatal log.');
    tracker.create({
    });
    var data = JSON.parse(localStorage['h5t@storageList/h5t/log_case_1/log']);
    data.forEach(function (item) {
      console.log(item.data.level, item.data.message);
    });
    // > debug default log.
    // > warn hello
    // > debug debug log.
    // > info info log.
    // > warn warn log.
    // > fatal fatal log.
    ```
   '''</example>'''
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
    var item = {};
    Object.keys(data).forEach(function (key) {
      item[key] = data[key];
    });
    if (options.event) {
      var fn = options.event['log'];
      if (typeof fn === 'function') {
        fn.call(instance, item);
      }
    }
    instance.emit('log', item);
    storage.log(item);
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
   * @param {Object} options 配置对象
   '''<example>'''
   * @example create():opts in undefined
    ```js
    var tracker = app.createTracker('create_case_1');
    tracker.create();
    ```
   * @example create():duplicate create
    ```js
    var tracker = app.createTracker('create_case_2');
    tracker.create({});
    tracker.create({});
    ```
   '''</example>'''
   */
  function create(opts) {
    if (created) {
      console.error('Cannot duplicate create tracker.');
      return;
    }
    if (!opts) {
      console.error('Parameter "opts" cannot be empty.');
      return;
    }
    created = true;
    options = opts;
    actionList.forEach(function (item) {
      instance[item.name](item.data);
    });
    actionList = null;
  }
  instance.create = create;
  return instance;
}
/*</function>*/
/*<function name="createSessionManager" depend="storageKeys,createEmitter,createGetter">*/
/**
 * 创建 Session 管理器
 *
 * @param {Number} sessionExpires 过期时间 30 秒
 * @return {Object} 返回管理器会话实例
 '''<example>'''
 * @example createSessionManager():base
  ```js
  var sessionManager = app.createSessionManager();
  var sessionId = sessionStorage['h5t@global/sessionId'];
  var birthday = sessionStorage['h5t@global/sessionBirthday'];
  var liveTime = sessionStorage['h5t@global/sessionLiveTime'];
  console.log(!!sessionId && !!birthday && !!liveTime);
  // > true
  console.log(sessionId === sessionManager.get('id'));
  // > true
  console.log(birthday === sessionManager.get('birthday'));
  // > true
  console.log(liveTime === sessionManager.get('liveTime'));
  // > true
  ```
  * @example createSessionManager():sessionExpires => 3
  ```js
  var timeout = 3;
  var sessionManager = app.createSessionManager(timeout);
  setTimeout(function(){
    console.log(Date.now() - sessionManager.get('liveTime') > timeout * 1000);
    // > true
    //done();
  }, 3500);
  ```
 '''</example>'''
 */
function createSessionManager(sessionExpires) {
  sessionExpires = sessionExpires || 30;
  var instance = createEmitter();
  var fieldsKey = {
    id: storageKeys.sessionId,
    birthday: storageKeys.sessionBirthday,
    liveTime: storageKeys.sessionLiveTime,
  };
  instance.get = createGetter(instance, function (name) {
    return sessionStorage[fieldsKey[name]];
  }, true);
  /**
   * 创建 Session
   '''<example>'''
   * @example createSession():base
    ```js
    var sessionManager = app.createSessionManager();
    var sessionId = sessionManager.get('id');
    console.log(!!sessionId);
    // > true
    sessionManager.createSession();
    console.log(!!sessionManager.get('id'));
    // > true
    console.log(sessionId != sessionManager.get('id'));
    // > true
    ```
   '''</example>'''
   */
  function createSession() {
    if (sessionStorage[storageKeys.sessionId]) {
      instance.emit('destroySession');
    }
    var now = Date.now();
    sessionStorage[storageKeys.sessionId] = newGuid();
    sessionStorage[storageKeys.sessionBirthday] = now;
    sessionStorage[storageKeys.sessionLiveTime] = now;
    instance.emit('createSession');
  }
  instance.createSession = createSession;
  /**
   * 释放 Session
   '''<example>'''
   * @example destroySession():base
    ```js
    var sessionManager = app.createSessionManager();
    console.log(!!sessionManager.get('id'));
    // > true
    sessionManager.destroySession();
    console.log(!!sessionManager.get('id'));
    // > false
    ```
   '''</example>'''
   */
  function destroySession() {
    if (sessionStorage[storageKeys.sessionId]) {
      delete sessionStorage[storageKeys.sessionId];
      delete sessionStorage[storageKeys.sessionBirthday];
      delete sessionStorage[storageKeys.sessionLiveTime];
      instance.emit('destroySession');
    }
  }
  instance.destroySession = destroySession;
  if (!sessionStorage[storageKeys.sessionId]) {
    createSession();
  }
  var timer;
  function inputHandler() {
    if (timer) {
      return;
    }
    var now = Date.now();
    timer = setTimeout(function() {
      if (Date.now() - sessionStorage[storageKeys.liveTime] >= sessionExpires * 1000) {
        createSession();
      } else {
        sessionStorage[storageKeys.sessionLiveTime] = now;
      }
      timer = null;
    }, 1000);
  }
  [
    'keydown', 'input', 'keyup',
    'click', 'contextmenu', 'mousemove',
    'touchstart', 'touchend', 'touchmove'
  ].forEach(function(name) {
    document.addEventListener(name, inputHandler, false);
  });
  return instance;
}
/*</function>*/
/*<function name="createApp" depend="createEmitter,createTracker,newGuid,format,storageKeys,createSessionManager,createStorageSender">*/
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
 '''<example>'''
 * @example test done
 ```js
  setTimeout(function() {
    console.log('hello');
    // > hello
    //done();
  }, 1000);
 ```
 '''</example>'''
  */
function createApp(appName) {
  /*<remove trigger="release">*/
  console.log('createApp() appName: %s', appName);
  /*</remove>*/
  var userId = localStorage[storageKeys.userId];
  if (!userId) {
    userId = localStorage[storageKeys.userId] = newGuid();
  }
  var instance = createTracker('main');
  instance.set({
    user: userId
  });
  instance.createEmitter = createEmitter;
  instance.createStorage = createStorage;
  instance.createStorageList = createStorageList;
  instance.createTracker = createTracker;
  instance.newGuid = newGuid;
  instance.storageKeys = storageKeys;
  instance.createApp = createApp;
  instance.createSessionManager = createSessionManager;
  instance.createStorageSender = createStorageSender;
  trackers[instance.name] = instance;
  var sessionManager = createSessionManager();
  sessionManager.on('createSession', function () {
    instance.emit('createSession');
  });
  sessionManager.on('destroySession', function() {
    instance.emit('destroySession');
  });
  /*=== 生命周期 ===*/
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
        tracker = trackers[trackerName] = createTracker(appName, trackerName);
        tracker.set({
          user: userId
        });
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