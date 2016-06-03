(function () {

  /*<jdists encoding="fndep" import="./common.js" depend="queryFrom">*/
  var queryFrom = require('./common').queryFrom;
  /*</jdists>*/

  /*<jdists encoding="fndep" import="./storage-list.js" depend="createStorageList">*/
  var createStorageList = require('./storage-list').createStorageList;
  /*</jdists>*/

  /*<jdists encoding="fndep" import="./event.js" depend="createEmitter">*/
  var createEmitter = require('./event').createEmitter;
  /*</jdists>*/

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
      /*<safe>*/
      if (!accept) {
        console.error('accept is undefined.');
        return;
      }
      /*</safe>*/

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

  exports.createStorage = createStorage;

})();