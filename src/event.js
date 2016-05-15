(function () {

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

  exports.createEmitter = createEmitter;

})();
