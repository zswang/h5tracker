/*<jdists encoding="fndep" import="./common.js" depend="newGuid">*/
var newGuid = require('./common').newGuid;
/*</jdists>*/

/*<jdists encoding="fndep" import="./storage-keys.js" depend="storageKeys">*/
var storageKeys = require('./storage-keys').storageKeys;
/*</jdists>*/

/*<function name="createStorageList" depend="newGuid">*/
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
function createStorageList(appName, trackerName, listName, storageInstance, storageExpires) {
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

exports.createStorageList = createStorageList;