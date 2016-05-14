/**

1. 定时扫描未发送的数据
  /h5t@storageList\/(\w+)\/(\w+)\/send/
  createStorageList()
  createStorageList()

2. 发送数据
  storageList.toArray()
  发送策略,优先尝试次数少的,再次创建最近的
  storageList.update(); // 更新发送尝试次数

3. 发送成功后移除数据
  storageList.remove();
4. 处理中途插入发送数据


*/

/*<jdists encoding="fndep" import="./storage-list.js" depend="createStorageList">*/
var createStorageList = require('./storage-list').createStorageList;
/*</jdists>*/

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

exports.createStorageSender = createStorageSender;
