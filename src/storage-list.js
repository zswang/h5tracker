/*<jdists encoding="fndep" import="./common.js" depend="newGuid">*/
var newGuid = require('./common').newGuid;
/*</jdists>*/

/*<function name="createStorageList" depend="newGuid">*/
/**
 * 创建存储列表
 *
 * @param {string} listName 列表名称
 * @param {Object} storageInstance 存储实例 localStorage | sessionStorage
 * @return {Object} 返回存储列表对象
 */
function createStorageList(listName, storageInstance, storageExpires) {

  var instance = {};

  var timestampKey = listName + '_ts';

  var list;
  var timestamp = null;

  storageInstance = storageInstance || localStorage;
  storageExpires = storageExpires || 10 * 24 * 60 * 60;

  /**
   * 追加数据到列表中
   *
   * @param {Object} data 保存数据
   * @param {Number} expire 过期时间，单位：秒
   */
  function push(data) {
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
    list.push({
      birthday: Date.now(),
      expires: storageExpires,
      data: data
    });
    storageInstance[timestampKey] = newGuid();
    storageInstance[listName] = JSON.stringify(list);
  }
  instance.push = push;

  return instance;
}
/*</function>*/

exports.createStorageList = createStorageList;