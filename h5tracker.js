
(function(document, window) {
  /**
   * @file h5tracker
   *
   * Logs Tracker of Mobile
   * @author
   *   zswang (http://weibo.com/zswang)
   *   meglad (https://github.com/meglad)
   * @version 0.2.2
   * @date 2016-11-11
   */
  /**
   '''<example>'''
   * @example h5tObjectName
    ```js
    console.log(!!window['h5t']);
    // > true
    console.log(app.get('debug'));
    // > true
    app.oldEntery('set', 'debug', false);
    console.log(app.get('debug'));
    // > false
    ```
   * @example entery
    ```js
    app.entery(document, window);
    ```
   * @example oldObject is null
    ```js
    delete window['h5t'];
    app.entery(document, window);
    ```
   * @example oldObject.queue null
    ```js
    window['h5t'] = {};
    app.entery(document, window);
    ```
   * @example window.h5t = [...]
    ```js
    window.h5t = ['log', 'desc'];
    ```
   * @example window.h5t = {...}
    ```js
    window.h5t = { 'log': 'desc', 'send': { page: 'home' } };
    ```
   '''</example>'''
   */
  var objectName = window.h5tObjectName || 'h5t';
  var oldObject = window[objectName];
  if (oldObject && oldObject.defined) { // 避免重复加载
    return;
  }
  var storageConfig = {
    // 兼容低端浏览器（比如：小米1 华为荣耀6）
    localStorageProxy: window.localStorage || {
      setItem: function(name, value) {
        this[name] = String(value);
      },
      removeItem: function(name) {
        delete this[name];
      }
    },
    sessionStorageProxy: window.sessionStorage || {},
    sessionExpires: 30,
    storageExpires: 10 * 24 * 60 * 60,
    storageMaxCount: 200
  };
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
  /*<function name="newGuid">*/
  /**
   * 比较大的概率上，生成唯一 ID
   *
   * @return {string} 返回生成的 ID
   *
   * @example newGuid:base
    ```js
    console.log(/^[a-z0-9]+$/.test(app.newGuid()));
    // > true
    ```
   */
  var newGuid = (function() {
    var guid = parseInt(Math.random() * 36);
    return function newGuid() {
      return Date.now().toString(36) + (guid++ % 36).toString(36) + Math.random().toString(36).slice(2, 4);
    };
  })();
  /*</function>*/
  /*<function name="storageKeys">*/
  var storageKeys = (function () {
    var prefix = 'h5t@';
    return {
      userId: prefix + 'global/userId',
      scanTime: prefix + 'global/scanTime',
      sessionId: prefix + 'global/sessionId',
      sessionSeq: prefix + 'global/sessionSeq',
      sessionBirthday: prefix + 'global/sessionBirthday',
      sessionLiveTime: prefix + 'global/sessionLiveTime',
      storageList: prefix + 'storageList/#{app}/#{tracker}/#{name}',
      storageListTS: prefix + 'storageList/#{app}/#{tracker}/#{name}/ts',
    };
  })();
  /*</function>*/
  /*<function name="format">*/
  /**
   * 格式化字符串
   *
   * @param {string} template 字符模板
   * @param {Object} json 数据
   * @return {string} 返回格式化结果
   '''<example>'''
   * @example format:array
    ```js
    console.log(app.format('#{0} - #{1}', [2, 3]));
    // > 2 - 3
    ```
   * @example format:object
    ```js
    console.log(app.format('#{x} - #{y}', {x: 1, y: 2}));
    // > 1 - 2
    ```
   * @example format:field is undefined
    ```js
    console.log(app.format('[#{z}]', {x: 1, y: 2}));
    // > []
    ```
   '''</example>'''
   */
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
   * @param {Object} storageConfig 存储配置项
   * @return {Object} 返回存储列表对象
   '''<example>'''
   * @example createStorageList():localStorageProxy assigned
    ```js
    var localStorageProxy = {};
    var oldLocalStorageProxy = app.storageConfig.localStorageProxy;
    app.storageConfig.localStorageProxy = localStorageProxy;
    var sessionManager = app.createSessionManager(app.storageConfig);
    var storageList = app.createStorageList('h5t', 'base1', 'log', app.storageConfig);
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    var data = JSON.parse(localStorageProxy['h5t@storageList/h5t/base1/log']);
    console.log(data.length);
    // > 1
    app.storageConfig.localStorageProxy = oldLocalStorageProxy;
    ```
   * @example createStorageList():storageExpires => 10000
    ```js
    var oldStorageExpires = app.storageConfig.storageExpires;
    app.storageConfig.storageExpires = 10000;
    var localStorage = app.storageConfig.localStorageProxy;
    var storageList = app.createStorageList('h5t', 'base2', 'log', app.storageConfig);
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    var data = JSON.parse(localStorage['h5t@storageList/h5t/base2/log']);
    console.log(data[0].expires);
    // > 10000
    app.storageConfig.storageExpires = oldStorageExpires;
    ```
   '''</example>'''
   */
  function createStorageList(appName, trackerName, listName, storageConfig) {
    // 参数默认值
    var storageInstance = storageConfig.localStorageProxy;
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
          timestamp = storageInstance[storageListTSKey];
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
      var localStorage = app.storageConfig.localStorageProxy;
      var storageList = app.createStorageList('h5t', 'push_case_1', 'log', app.storageConfig);
      storageList.push({
        level: 'info',
        message: 'click button1'
      });
      storageList.push({
        level: 'info',
        message: 'click button2'
      });
      var data = JSON.parse(localStorage['h5t@storageList/h5t/push_case_1/log']);
      console.log(data.length);
      // > 2
      console.log(data[0].data.message);
      // > click button1
      console.log(data[1].data.message);
      // > click button2
      ```
     * @example push():storageMaxCount = 5
      ```js
      var localStorage = app.storageConfig.localStorageProxy;
      var oldStorageMaxCount = app.storageConfig.storageMaxCount;
      app.storageConfig.storageMaxCount = 5;
      var storageList = app.createStorageList('h5t', 'push_case_2', 'log', app.storageConfig);
      for (var i = 0; i < 6; i++ ) {
        storageList.push({
          level: 'info',
          message: 'click button' + i
        });
      }
      var data = JSON.parse(localStorage['h5t@storageList/h5t/push_case_2/log']);
      console.log(data.length);
      // > 5
      app.storageConfig.storageMaxCount = oldStorageMaxCount;
      ```
     '''</example>'''
     */
    function push(data) {
      load();
      var id = newGuid();
      var birthday = Date.now();
      while (list.length >= storageConfig.storageMaxCount) { // 清除历史数据
        list.shift();
      }
      list.push({
        id: id,
        birthday: birthday,
        expires: storageConfig.storageExpires,
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
      var localStorage = app.storageConfig.localStorageProxy;
      var storageList = app.createStorageList('h5t', 'toArray', 'log', app.storageConfig);
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
      var localStorage = app.storageConfig.localStorageProxy;
      var storageList = app.createStorageList('h5t', 'clean', 'log', app.storageConfig);
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
     * @example clean():localStorage JSON error
      ```js
      var localStorage = app.storageConfig.localStorageProxy;
      var storageList = app.createStorageList('h5t', 'clean_case2', 'log', app.storageConfig);
      localStorage['h5t@storageList/h5t/clean_case2/log'] = '#error';
      storageList.clean();
      var data = JSON.parse(localStorage['h5t@storageList/h5t/clean_case2/log']);
      console.log(data);
      // > []
      ```
     * @example clean():localStorage timestamp change
      ```js
      var localStorage = app.storageConfig.localStorageProxy;
      var storageList = app.createStorageList('h5t', 'clean_case3', 'log', app.storageConfig);
      storageList.push({
        level: 'info',
        message: 'click button1'
      });
      var data = JSON.parse(localStorage['h5t@storageList/h5t/clean_case3/log']);
      data[0].birthday = 0;
      localStorage['h5t@storageList/h5t/clean_case3/log'] = JSON.stringify(data);
      localStorage['h5t@storageList/h5t/clean_case3/log/ts'] = 0;
      storageList.clean();
      data = JSON.parse(localStorage['h5t@storageList/h5t/clean_case3/log']);
      console.log(data);
      // > []
      console.log(localStorage['h5t@storageList/h5t/clean_case3/log/ts'] !== '0');
      // > true
      ```
     * @example clean():×2
      ```js
      var storageList = app.createStorageList('h5t', 'clean_case4', 'log', app.storageConfig);
      storageList.clean();
      storageList.clean();
      ```
     * @example clean():minExpiresTime
      ```js
      var localStorage = app.storageConfig.localStorageProxy;
      var storageList = app.createStorageList('h5t', 'clean_case5', 'log', app.storageConfig);
      storageList.push({
        level: 'info',
        message: 'click button1'
      });
      storageList.push({
        level: 'info',
        message: 'click button2'
      });
      var data = JSON.parse(localStorage['h5t@storageList/h5t/clean_case5/log']);
      data[0].expires = 0.001;
      localStorage['h5t@storageList/h5t/clean_case5/log'] = JSON.stringify(data);
      storageList.clean();
      storageList.clean();
      setTimeout(function () {
        storageList.clean();
        data = JSON.parse(localStorage['h5t@storageList/h5t/clean_case5/log']);
        console.log(data.length);
        // > 1
        // * done
      }, 100);
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
      var localStorage = app.storageConfig.localStorageProxy;
      var storageList = app.createStorageList('h5t', 'remove', 'log', app.storageConfig);
      var id1 = storageList.push({
        level: 'info',
        message: 'click button1'
      });
      var id2 = storageList.push({
        level: 'info',
        message: 'click button2'
      });
      storageList.clean();
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
          if (item.birthday + item.expires * 1000 === minExpiresTime) {
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
      var localStorage = app.storageConfig.localStorageProxy;
      var storageList = app.createStorageList('h5t', 'update', 'send', app.storageConfig);
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
     * @example update():not exists
      ```js
      var localStorage = app.storageConfig.localStorageProxy;
      var storageList = app.createStorageList('h5t', 'update_case2', 'send', app.storageConfig);
      var id1 = storageList.push({
        level: 'info',
        message: 'click button1'
      });
      storageList.update('null', {
        level: 'debug'
      });
      var data = JSON.parse(localStorage['h5t@storageList/h5t/update_case2/send']);
      console.log(data[0].data.level);
      // > info
      ```
     '''</example>'''
     */
    function update(id, item) {
      var data = instance.get(id);
      if (!data) {
        return;
      }
      Object.keys(item).forEach(function(key) {
        data[key] = item[key];
      });
      save();
      return true;
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
      var localStorage = app.storageConfig.localStorageProxy;
      var storageList = app.createStorageList('h5t', 'get', 'send', app.storageConfig);
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
  /*<function name="queryFrom">*/
  /**
   * 拼装 URL 调用参数
   *
   * @param {Object} data 参数
   * @return {string} 返回拼接的字符串
   * @example queryFrom:field is null
    ```js
    console.log(app.queryFrom({x: 1, y: null}));
    // x=1
    ```
   * @example queryFrom:field is undefined
    ```js
    console.log(app.queryFrom({x: 1, y: undefined}));
    // x=1
    ```
   * @example queryFrom:field is space
    ```js
    console.log(app.queryFrom({x: " "}));
    // x=%20
    ```
   */
  function queryFrom(data) {
    var result = [];
    Object.keys(data).forEach(function(key) {
      if (data[key] === null || data[key] === undefined) {
        return;
      }
      result.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    });
    return result.join('&');
  }
  /*</function>*/
  /*<function name="createStorage" depend="createStorageList,createEmitter,queryFrom">*/
  /**
   * 创建存储器
   *
   * @param {string} appName 应用名
   * @param {string} trackerName 追踪器名
   * @param {Object} storageConfig 存储配置
   * @return {Object} 返回存储器
   */
  function createStorage(appName, trackerName, storageConfig) {
    var instance = createEmitter();
    var storageListSend = createStorageList(appName, trackerName, 'send', storageConfig);
    var storageListLog = createStorageList(appName, trackerName, 'log', storageConfig);
    /**
     * 记录日志
     *
     * @param {Object} data 日志数据
     * @return {string} 返回记录 ID
     */
    function log(data) {
      storageListLog.clean();
      var result = storageListLog.push(data);
      instance.emit('log');
      return result;
    }
    instance.log = log;
    /**
     * 发送数据
     *
     * @param {Object} data 发送数据
     * @param {string} accept 接收地址
     * @return {string} 返回记录 ID
     '''<example>'''
     * @example send():base
      ```js
      var localStorage = app.storageConfig.localStorageProxy;
      var storage = app.createStorage('h5t', 'send', app.storageConfig);
      var id = storage.send({
        hisType: 'pageview'
      }, '/host/path/to/t.gif');
      var data = JSON.parse(localStorage['h5t@storageList/h5t/send/send']);
      console.log(data[0].data.accept);
      // > /host/path/to/t.gif
      console.log(data[0].data.query);
      // > hisType=pageview
      console.log(id === data[0].id);
      // > true
      ```
     * @example send():acceptStyle
      ```js
      var localStorage = app.storageConfig.localStorageProxy;
      var storage = app.createStorage('h5t', 'send2', app.storageConfig);
      storage.send({
        hisType: 'pageview'
      }, '/host/path/to/t.gif', 'path');
      var data = JSON.parse(localStorage['h5t@storageList/h5t/send2/send']);
      console.log(data[0].data.acceptStyle);
      // > path
      ```
     * @example send():accept is undefined
      ```js
      var storage = app.createStorage('h5t', 'send3', app.storageConfig);
      storage.send({
        hisType: 'pageview'
      });
      ```
     '''</example>'''
     */
    function send(data, accept, acceptStyle) {
      storageListSend.clean();
      var id = storageListSend.push({
        accept: accept,
        acceptStyle: acceptStyle, // 发送格式 "path" | "query"
        query: queryFrom(data),
      });
      instance.emit('send');
      return id;
    }
    instance.send = send;
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
  /*<function name="createTracker" depend="createEmitter,createGetter,createSetter,createStorage,newGuid">*/
  /**
   * 创建追踪器
   *
   * @param {string} name 追踪器名称
   * @return {Object} 返回追踪器实例
   '''<example>'''
   * @example createTracker():base
    ```js
    var tracker = app.createTracker('h5t', 'base', app.sessionManager, app.storageSender, app.storageConfig);
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
  function createTracker(appName, trackerName, sessionManager, storageSender, storageConfig) {
    /**
     * 追踪器实例
     *
     * @type {Object}
     */
    var instance = createEmitter();
    instance.name = trackerName;
    var storage = createStorage(appName, trackerName, storageConfig);
    storage.on('send', function() { // 立即触发日志发送
      storageSender.scan();
    });
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
      var tracker = app.createTracker('h5t', 'setter', app.sessionManager, app.storageSender, app.storageConfig);
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
    instance.set = createSetter(instance, function(name, value) {
      fields[name] = value;
    }, true);
    instance.get = createGetter(instance, function(name) {
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
      var localStorage = app.storageConfig.localStorageProxy;
      var tracker = app.createTracker('h5t', 'send_case_1', app.sessionManager, app.storageSender, app.storageConfig);
      tracker.set({
        x: 1,
        y: 2,
        rid: null,
        uid: null,
        sid: null,
        seq: null,
        time: null
      });
      tracker.send({z: 3});
      tracker.send({
        z: null,
        rid: null
      });
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
     * @example send():accept is null
      ```js
      var localStorage = app.storageConfig.localStorageProxy;
      var tracker = app.createTracker('h5', 'send_case_2', app.sessionManager, app.storageSender, app.storageConfig);
      tracker.send({z: 3});
      tracker.create({});
      console.log(typeof localStorage['h5t@storageList/h5t/send_case_2/send']);
      // > undefined
      ```
     * @example send():event {}
      ```js
      var localStorage = app.storageConfig.localStorageProxy;
      var tracker = app.createTracker('h5t', 'send_case_3', app.sessionManager, app.storageSender, app.storageConfig);
      tracker.send({message: 'case_3'});
      tracker.create({
        accept: '/host/case3',
        event: {}
      });
      ```
     * @example send():string
      ```js
      var localStorage = app.storageConfig.localStorageProxy;
      var tracker = app.createTracker('h5t', 'send_case_4', app.sessionManager, app.storageSender, app.storageConfig);
      tracker.send('pageview');
      tracker.create({
        accept: '/host/case4'
      });
      var data = JSON.parse(localStorage['h5t@storageList/h5t/send_case_4/send']);
      console.log(/ht=pageview/.test(data[0].data.query));
      // > true
      ```
     '''</example>'''
     */
    function send(data) {
      if (actionList) {
        actionList.push({
          name: 'send',
          data: data
        });
        return;
      }
      // merge data
      var item = {
        rid: newGuid(), // record id
        uid: sessionManager.get('uid'),
        sid: sessionManager.get('sid'),
        seq: sessionManager.get('seq'),
        time: (Date.now() - sessionManager.get('birthday')).toString(36)
      };
      if (options.data) {
        Object.keys(options.data).forEach(function(key) {
          item[key] = options.data[key];
        });
      }
      Object.keys(fields).forEach(function(key) {
        item[key] = fields[key];
      });
      if (typeof data === 'string') {
        data = {
          ht: data // hit type // "event" | "pageview" | "appview"
        };
      }
      Object.keys(data).forEach(function(key) {
        item[key] = data[key];
      });
      emitEvent('send', item);
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
      var localStorage = app.storageConfig.localStorageProxy;
      var tracker = app.createTracker('h5t', 'log_case_1', app.sessionManager, app.storageSender, app.storageConfig);
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
      tracker.create({});
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
     * @example log():level is undefined
      ```js
      var tracker = app.createTracker('h5t', 'log_case_2', app.sessionManager, app.storageSender, app.storageConfig);
      tracker.log({});
      tracker.create({});
      ```
     * @example log():event {}
      ```js
      var tracker = app.createTracker('h5t', 'log_case_3', app.sessionManager, app.storageSender, app.storageConfig);
      tracker.log('case3');
      tracker.create({
        event: {}
      });
      ```
     '''</example>'''
     */
    function log(data) {
      if (typeof data === 'string') {
        data = {
          message: data,
          level: 'debug'
        };
      }
      if (actionList) {
        actionList.push({
          name: 'log',
          data: data
        });
        return;
      }
      var item = {};
      Object.keys(data).forEach(function(key) {
        item[key] = data[key];
      });
      emitEvent('log', item);
      storage.log(item);
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
     * @param {Object} options 配置对象
     '''<example>'''
     * @example create():opts in undefined
      ```js
      var tracker = app.createTracker('h5t', 'create_case_1', app.sessionManager, app.storageSender, app.storageConfig);
      tracker.create();
      ```
     * @example create():duplicate create
      ```js
      var tracker = app.createTracker('h5t', 'create_case_2', app.sessionManager, app.storageSender, app.storageConfig);
      tracker.create({});
      tracker.create({});
      ```
     '''</example>'''
     */
    function create(opts) {
      options = opts;
      var temp = actionList;
      actionList = null;
      temp.forEach(function(item) {
        instance[item.name](item.data);
      });
    }
    instance.create = create;
    /**
     * 配置事件通知
     */
    function emitEvent(name) {
      if (options && options.event) {
        var fn = options.event[name];
        if (typeof fn === 'function') {
          fn.apply(instance, [].slice.call(arguments, 1));
        }
      }
      instance.emit.apply(instance, arguments);
    }
    instance.emitEvent = emitEvent;
    return instance;
  }
  /*</function>*/
  /*<function name="createStorageSender" depend="createStorageList">*/
  /**
   * 创建发送器
   *
   '''<example>'''
   * @example createStorageSender():base
    ```js
    var localStorage = app.storageConfig.localStorageProxy;
    Object.keys(localStorage).forEach(function (key) {
      if (/\/send($|\ts)/.test(key)) {
        delete localStorage[key];
      }
    });
    var storageList = app.createStorageList('h5t', 'sender1', 'send', app.storageConfig);
    storageList.push({
      accept: 'http://host/path/to?from=timeline',
      query: 'level=info&message=click%20button1'
    });
    var sender = app.createStorageSender(app.storageConfig);
    sender.scan();
    setTimeout(function(){
      console.log(localStorage['h5t@storageList/h5t/sender1/send']);
      // > []
      // * done
    }, 500);
    ```
   * @example createStorageSender():acceptStyle
    ```js
    var localStorage = app.storageConfig.localStorageProxy;
    Object.keys(localStorage).forEach(function (key) {
      if (/\/send($|\ts)/.test(key)) {
        delete localStorage[key];
      }
    });
    var storageList = app.createStorageList('h5t', 'sender2', 'send', app.storageConfig);
    storageList.push({
      accept: 'http://host/path/to/?from=timeline',
      acceptStyle: 'path',
      query: 'level=info&message=click%20button1'
    });
    var sender = app.createStorageSender(app.storageConfig);
    sender.scan();
    setTimeout(function(){
      console.log(localStorage['h5t@storageList/h5t/sender2/send']);
      // > []
      // * done
    }, 500);
    ```
   * @example createStorageSender():acceptStyle2
    ```js
    var localStorage = app.storageConfig.localStorageProxy;
    Object.keys(localStorage).forEach(function (key) {
      if (/\/send($|\ts)/.test(key)) {
        delete localStorage[key];
      }
    });
    var storageList = app.createStorageList('h5t', 'sender2_1', 'send', app.storageConfig);
    storageList.push({
      accept: 'http://host/path/to',
      acceptStyle: 'path',
      query: 'level=info&message=click%20button1'
    });
    var sender = app.createStorageSender(app.storageConfig);
    sender.scan();
    setTimeout(function(){
      console.log(localStorage['h5t@storageList/h5t/sender2_1/send']);
      // > []
      // * done
    }, 500);
    ```
   * @example createStorageSender():accept Error
    ```js
    var localStorage = app.storageConfig.localStorageProxy;
    Object.keys(localStorage).forEach(function (key) {
      if (/\/send($|\ts)/.test(key)) {
        delete localStorage[key];
      }
    });
    var storageList = app.createStorageList('h5t', 'sender3', 'send', app.storageConfig);
    storageList.push({
      accept: '/host/path#error',
      query: 'level=info&message=click%20button1'
    });
    var sender = app.createStorageSender(app.storageConfig);
    sender.scan();
    setTimeout(function(){
      console.log(!!localStorage['h5t@storageList/h5t/sender3/send']);
      // > true
      // * done
    }, 1100);
    ```
   * @example createStorageSender():accept is undefined
    ```js
    var localStorage = app.storageConfig.localStorageProxy;
    Object.keys(localStorage).forEach(function (key) {
      if (/\/send($|\ts)/.test(key)) {
        delete localStorage[key];
      }
    });
    var storageList = app.createStorageList('h5t', 'sender4', 'send', app.storageConfig);
    storageList.push({
      query: 'level=info&message=click%20button1'
    });
    var sender = app.createStorageSender(app.storageConfig);
    sender.scan();
    ```
   '''</example>'''
   */
  function createStorageSender(storageConfig) {
    var instance = {};
    var storageSends;
    var storageListDict = {};
    var timer;
    function scan(delay) {
      delay = delay || 0;
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(function() {
        timer = null;
        storageSends = [];
        Object.keys(storageConfig.localStorageProxy).forEach(function(key) {
          var match = key.match(/^h5t@storageList\/(\w+)\/(\w+)\/send$/);
          if (match) {
            var appName = match[1];
            var trackerName = match[2];
            var storageListSend = storageListDict[[appName, trackerName]];
            if (!storageListSend) {
              storageListDict[[appName, trackerName]] =
                storageListSend =
                createStorageList(appName, trackerName, 'send', storageConfig);
            }
            var list = storageListSend.toArray();
            list.forEach(function(item) {
              item.storageDict = [appName, trackerName].toString();
            });
            storageSends = storageSends.concat(list);
          }
        });
        if (storageSends.length <= 0) {
          return;
        }
        // 发送策略，优先尝试次数少的，再次创建最近的
        storageSends.sort(function(a, b) {
          if (a.tried === b.tried) {
            return b.birthday - a.birthday;
          } else {
            return a.tried - b.tried;
          }
        });
        // console.log(JSON.stringify(storageSends, null, '  '));
        var item = storageSends.shift();
        // 更新发送尝试次数
        storageListDict[item.storageDict].update(item.id, {
          tried: (item.tried || 0) + 1
        });
        if (!item.data.accept) {
          console.error('accept is undefined.');
          return;
        }
        var img = document.createElement('img');
        img.onload = function() {
          storageListDict[item.storageDict].remove(item.id);
          delete instance[item.id];
          scan(1000); // 发送成功 // 一秒后扫描
        };
        img.onerror = function() {
          delete instance[item.id];
          scan(5 * 60 * 1000); // 发送失败 // 五分钟后扫描
        };
        // accept = 'host/path/to.gif'
        // accept = 'host/path/to.gif?from=qq'
        var match = item.data.accept.match(/^([^?]+)(?:\?(.*))?$/);
        var path = match[1];
        var query = match[2];
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
    instance.scan = scan;
    return instance;
  }
  /*</function>*/
  /*<function name="createSessionManager" depend="storageKeys,createEmitter,createGetter">*/
  /**
   * 创建 Session 管理器
   *
   * @param {Object} storageConfig 存储配置
   * @return {Object} 返回管理器会话实例
   '''<example>'''
   * @example createSessionManager():base
    ```js
    var sessionStorage = app.storageConfig.sessionStorageProxy;
    var sessionManager = app.createSessionManager(app.storageConfig);
    var sessionId = sessionStorage['h5t@global/sessionId'];
    var sessionSeq = sessionStorage['h5t@global/sessionSeq'];
    var birthday = sessionStorage['h5t@global/sessionBirthday'];
    var liveTime = sessionStorage['h5t@global/sessionLiveTime'];
    console.log(sessionSeq >= 0);
    // > true
    console.log(Math.abs(birthday - liveTime) < 10);
    // > true
    console.log(sessionId === sessionManager.get('sid'));
    // > true
    console.log(sessionSeq === sessionManager.get('seq'));
    // > true
    console.log(birthday === sessionManager.get('birthday'));
    // > true
    console.log(liveTime === sessionManager.get('liveTime'));
    // > true
    ```
    * @example createSessionManager():sessionExpires => 1
    ```js
    var timeout = 1;
    var oldSesssionExpires = app.storageConfig.sessionExpires;
    app.storageConfig.sessionExpires = timeout;
    var sessionManager = app.createSessionManager(app.storageConfig);
    setTimeout(function(){
      app.storageConfig.sessionExpires = oldSesssionExpires;
      console.log(Date.now() - sessionManager.get('liveTime') > timeout * 1000);
      // > true
      // * done
    }, 1500);
    ```
   '''</example>'''
   */
  function createSessionManager(storageConfig) {
    var instance = createEmitter();
    var storageInstance = storageConfig.sessionStorageProxy;
    var fieldsKey = {
      sid: storageKeys.sessionId,
      seq: storageKeys.sessionSeq,
      birthday: storageKeys.sessionBirthday,
      liveTime: storageKeys.sessionLiveTime,
    };
    var userId = storageConfig.localStorageProxy[storageKeys.userId];
    if (!userId) {
      userId = storageConfig.localStorageProxy[storageKeys.userId] = newGuid();
    }
    /**
     * 获取 session 字段
     *
     * @param {string} name
     * @return {string} 返回字段值
     '''<example>'''
     * @example get():base
      ```js
      var sessionStorage = app.storageConfig.sessionStorageProxy;
      var sessionManager = app.createSessionManager(app.storageConfig);
      console.log(sessionStorage['h5t@global/sessionId'] === sessionManager.get('sid'));
      // > true
      ```
     * @example get():safe
      ```js
      var sessionStorage = app.storageConfig.sessionStorageProxy;
      var sessionManager = app.createSessionManager(app.storageConfig);
      delete sessionStorage['h5t@global/sessionId'];
      sessionManager.get('sid');
      console.log(typeof sessionStorage['h5t@global/sessionId']);
      // > string
      ```
     '''</example>'''
     */
    instance.get = createGetter(instance, function (name) {
      if (name === 'uid') {
        return userId;
      }
      if (typeof storageInstance[storageKeys.sessionId] === 'undefined') {
        console.info('sessionManager get createSession');
        createSession();
      }
      return storageInstance[fieldsKey[name]];
    }, true);
    /**
     * 创建 Session
     '''<example>'''
     * @example createSession():base
      ```js
      var sessionManager = app.createSessionManager(app.storageConfig);
      var sessionId = sessionManager.get('sid');
      console.log(!!sessionId);
      // > true
      sessionManager.createSession();
      console.log(!!sessionManager.get('sid'));
      // > true
      console.log(sessionId !== sessionManager.get('sid'));
      // > true
      ```
     '''</example>'''
     */
    function createSession() {
      if (storageInstance[storageKeys.sessionId]) {
        instance.emit('destroySession');
      }
      var now = Date.now();
      storageInstance[storageKeys.sessionId] = newGuid();
      if (storageInstance[storageKeys.sessionSeq] === null || isNaN(storageInstance[storageKeys.sessionSeq])) {
        storageInstance[storageKeys.sessionSeq] = 0;
      } else {
        storageInstance[storageKeys.sessionSeq] = parseInt(storageInstance[storageKeys.sessionSeq]) + 1;
      }
      storageInstance[storageKeys.sessionBirthday] = now;
      storageInstance[storageKeys.sessionLiveTime] = now;
      instance.emit('createSession');
    }
    instance.createSession = createSession;
    /**
     * 释放 Session
     '''<example>'''
     * @example destroySession():base
      ```js
      var sessionStorage = app.storageConfig.sessionStorageProxy;
      var sessionManager = app.createSessionManager(app.storageConfig);
      console.log(!!sessionManager.get('sid'));
      // > true
      sessionManager.destroySession();
      sessionManager.destroySession();
      console.log(typeof sessionStorage['h5t@global/sessionId']);
      // > undefined
      ```
     '''</example>'''
     */
    function destroySession() {
      if (storageInstance[storageKeys.sessionId]) {
        delete storageInstance[storageKeys.sessionId];
        delete storageInstance[storageKeys.sessionBirthday];
        delete storageInstance[storageKeys.sessionLiveTime];
        instance.emit('destroySession');
      }
    }
    instance.destroySession = destroySession;
    /**
     * 初始化 session
     */
    function init() {
      if (!storageInstance[storageKeys.sessionId]) {
        createSession();
      }
    }
    instance.init = init;
    /**
     * 用户活跃事件处理
     *
     * @param {Object} e
     */
    function inputHandler(e) {
      var now = Date.now();
      if (now - storageInstance[storageKeys.sessionLiveTime] >= storageConfig.sessionExpires * 1000) {
        createSession();
      } else {
        // setTimeout 避免多个 app 实例互相影响
        setTimeout(function () {
          storageInstance[storageKeys.sessionLiveTime] = now;
        });
      }
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
  /*<function name="createApp" depend="createEmitter,createTracker,newGuid,format,queryFrom,storageKeys,createSessionManager,createStorageSender,createStorage,createStorageList">*/
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
   * @param {number} sessionExpires 回话过期时间，单位：秒，默认 30
   * @return {Object} 返回应用追踪器实例
   '''<example>'''
   * @example createApp():base
    ```js
    var appInstance = app.createApp('cctv1', app.storageConfig);
    console.log(appInstance.name);
    // > cctv1
    var appInstance = app.createApp('', app.storageConfig);
    console.log(appInstance.name);
    // > h5t
    ```
   * @example createApp():sessionExpires => 1
    ```js
    var oldSessionExpires = app.storageConfig.sessionExpires;
    app.storageConfig.sessionExpires = 1;
    var appInstance = app.createApp('cctv2', app.storageConfig);
    appInstance.once('createSession', function () {
      app.storageConfig.sessionExpires = oldSessionExpires;
      console.log(appInstance.name);
      // > cctv2
      // * done
    });
    setTimeout(function () {
      document.dispatchEvent('mousemove');
    }, 1500);
    ```
   '''</example>'''
   */
  function createApp(appName, storageConfig) {
    appName = appName || 'h5t';
    var storageSender = createStorageSender(storageConfig);
    var sessionManager = createSessionManager(storageConfig);
    sessionManager.on('createSession', function() {
      Object.keys(trackers).forEach(function(key) {
        trackers[key].emitEvent('createSession');
      });
    });
    sessionManager.on('destroySession', function() {
      Object.keys(trackers).forEach(function(key) {
        trackers[key].emitEvent('destroySession');
      });
    });
    var instance = createTracker(appName, appName, sessionManager, storageSender, storageConfig);
    trackers[appName] = instance;
    var commandArgvList = [];
    /**
     * 初始化应用
     */
    function init() {
      instance.emit('init');
      sessionManager.init();
      var items = commandArgvList;
      commandArgvList = null;
      items.forEach(function (argv) {
        cmd.apply(instance, argv);
      });
      storageSender.scan();
    }
    instance.init = init;
    /**
     * 执行命令
     *
     * @param {string} line "[trackerName.]methodName"
     '''<example>'''
     * @example cmd():set
      ```js
      app.cmd('tracker1.set', 'x', 2);
      console.log(app.cmd('tracker1.get', 'x'));
      // > 2
      ```
     * @example cmd():default set
      ```js
      app.cmd('set', 'x', 3);
      console.log(app.cmd('get', 'x'));
      // > 3
      ```
     * @example cmd():type error
      ```js
      app.cmd(112);
      ```
     * @example cmd():invalid format
      ```js
      app.cmd('^tt^.set', 'x', 1);
      ```
     * @example cmd():method is invalid
      ```js
      app.cmd('hello');
      ```
     * @example cmd():"send" method
      ```js
      app.cmd('send', {
        event: 'click'
      });
      app.cmd('create', {
        accept: '/host/path/to'
      });
      var localStorage = app.storageConfig.localStorageProxy;
      var list = JSON.parse(localStorage['h5t@storageList/h5t/h5t/send']);
      console.log(/event=click/.test(list[0].data.query));
      // > true
      ```
      '''</example>'''
     */
    function cmd(line) {
      var match = line.match(/^(?:([\w$_]+)\.)?(\w+)$/);
      var trackerName = match[1];
      var methodName = match[2];
      // console.log('trackerName: %s, methodName: %s', trackerName, methodName);
      var tracker;
      if (trackerName) {
        tracker = trackers[trackerName];
        if (!tracker) {
          tracker = trackers[trackerName] = createTracker(appName, trackerName, sessionManager, storageSender, storageConfig);
        }
      } else {
        tracker = instance;
      }
      if (typeof tracker[methodName] === 'function') {
        if (methodName === 'send' || methodName === 'log') {
          if (commandArgvList) {
            commandArgvList.push(arguments);
            return;
          }
        }
        return tracker[methodName].apply(tracker, [].slice.call(arguments, 1));
      } else {
        console.error('Tracker method "%s" is invalid.', methodName);
      }
    }
    instance.cmd = cmd;
    return instance;
  }
  /*</function>*/
  var app = createApp(objectName, storageConfig);
  var instance = function() {
    app.cmd.apply(app, arguments);
  };
  instance.app = app;
  instance.defined = true;
  instance.h5t = true;
  if (oldObject) {
    // 处理临时 h5t 对象
    var items = oldObject.queue;
    instance.beginning = oldObject.beginning;
    oldObject.queue = null;
    instance.queue = { // 接管之前的定义
      push: function(args) {
        instance.apply(instance, args);
      }
    };
    items.forEach(function (args) {
      instance.apply(instance, args);
    });
  }
  window[objectName] = instance;
  app.init();
})(document, window);