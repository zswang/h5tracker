(function(document, window) {
  var objectName = window.h5tObjectName || 'h5t';
  var oldObject = window[objectName];
  if (oldObject && oldObject.defined) { // 避免重复加载
    return;
  }
  oldObject.defined = true;
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
/*<function name="createTracker">*/
/**
 * 创建追踪器
 *
 * @param {string} name 追踪器名称
 * @param {string} acceptUrl 接收地址
 * @return {Object} 返回追踪器实例
 */
function createTracker(name, acceptUrl) {
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
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  function log(params) {
  }
  ['debug', 'info', 'warn', 'error', 'fatal'].forEach(function (level) {
    instance[level] = function (message) {
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
var trackers = {};
/**
 * 创建应用追踪器
 *
 * @param {string} appName 应用名
 * @param {Object} argv 配置项
 * @return {Object} 返回应用追踪器实例
 */
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
  function config() {
  }
  instance.config = config;
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
    var method = match[2];
    console.log('trackerName: %s, method: %s', trackerName, method);
    //             args[0] = method; // 'hunter.send' -> 'send'
    //             command.apply(entry.tracker(trackerName), args);
    // var args = [].slice.call(arguments, 1);
    //     if (this.created || /^(on|un|set|get|create)$/.test(method)) {
    //         var methodFunc = Tracker.prototype[method];
    //         var params = [];
    //         for (var i = 1, len = args.length; i < len; i++) {
    //             params.push(args[i]);
    //         }
    //         if (typeof methodFunc === 'function') {
    //             methodFunc.apply(this, params);
    //         }
    //     }
    //     else { // send|fire // 实例创建以后才能调用的方法
    //         this.argsList.push(args);
    //     }
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