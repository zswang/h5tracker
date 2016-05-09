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
  var storageListLog = createStorageList(trackerName + '_send');

  /**
   * 记录日志
   *
   * @param {Object} data 日志数据
   */
  function log(data) {
    storageListLog.push(data);
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

  function send(data, accept) {
    storageListSend.push({
      accept: accept,
      query: buildQuery(data)
    });
  }
  instance.send = send;

  /**
   * 清除过期数据
   */
  function scan() {
    storageListLog.clean();
    storageListSend.clean();
  }
  instance.scan = scan;

  return instance;
}
/*</function>*/