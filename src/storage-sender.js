(function () {

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
    var sender = app.createStorageSender();
    sender.scan();

    setTimeout(function(){
      console.log(localStorage['h5t@storageList/h5t/sender/send']);
      // > []
      //done();
    }, 1100);
    ```
   '''</example>'''
   */
  function createStorageSender() {

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
        Object.keys(localStorage).forEach(function(key) {
          var match = key.match(/^h5t@storageList\/(\w+)\/(\w+)\/send$/);
          if (match) {
            var appName = match[1];
            var trackerName = match[2];
            var storageListSend = storageListDict[[appName, trackerName]];
            if (!storageListSend) {
              storageListDict[[appName, trackerName]] =
                storageListSend =
                createStorageList(appName, trackerName, 'send');
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
  };
  /*</function>*/

  exports.createStorageSender = createStorageSender;

})();