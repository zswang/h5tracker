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

  /*<jdists encoding="fndep" import="./storage-sender.js" depend="createStorageSender">*/
  var createStorageSender = require('./storage-sender').createStorageSender;
  /*</jdists>*/

  /*<function name="createStorage" depend="createStorageList,createEmitter,createStorageSender,queryFrom">*/
  var storageSender = createStorageSender();

  /**
   * 创建存储器
   *
   * @param {string} appName 应用名
   * @param {string} trackerName 追踪器名
   * @return {Object} 返回存储器
   */
  function createStorage(appName, trackerName) {

    var instance = createEmitter();

    var storageListSend = createStorageList(appName, trackerName, 'send');
    var storageListLog = createStorageList(appName, trackerName, 'log');
    storageSender.scan();

    /**
     * 记录日志
     *
     * @param {Object} data 日志数据
     * @return {string} 返回记录 ID
     */
    function log(data) {
      storageListLog.clean();

      return storageListLog.push(data);
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
      var storage = app.createStorage('h5t', 'send');
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
      var storage = app.createStorage('h5t', 'send2');
      storage.send({
        hisType: 'pageview'
      }, '/host/path/to/t.gif', 'path');

      var data = JSON.parse(localStorage['h5t@storageList/h5t/send2/send']);

      console.log(data[0].data.acceptStyle);
      // > path
      ```
     * @example send():accept is undefined
      ```js
      var storage = app.createStorage('h5t', 'send3');
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
      storageSender.scan();
      return id;
    }
    instance.send = send;

    return instance;
  }
  /*</function>*/

  exports.createStorage = createStorage;

})();