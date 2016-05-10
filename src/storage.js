/*<jdists encoding="fndep" import="./storage-list.js" depend="createStorageList">*/
var createStorageList = require('./storage-list').createStorageList;
/*</jdists>*/

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
  function buildQuery(data) {
    return Object.keys(data).map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
    }).join('&');
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
      query: buildQuery(data)
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