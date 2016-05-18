(function() {
  var records = {}; // key: [rid]

  var vm = new Vue({
    ready: function() {
      var _this = this;
      _this.getStorage();
      setInterval(function() {
        _this.getStorage();
      }, 1000);
    },
    el: '#app',
    data: {
      tabs: ['log', 'send'],
      activatTab: 'log',
      log: [],
      send: [],
      nowTime: Date.now(),
      isSpread: false
    },
    methods: {
      getStorage: function() {
        if (!localStorage) {
          return;
        }
        var self = this;
        var liveRecordSet = new Set();
        var liverecordList = [];
        Object.keys(localStorage).forEach(function(key) {
          var match = key.match(/^h5t@storageList\/(\w+\/\w+)\/(\w+)$/);
          if (!match) {
            return;
          }
          var trackerName = match[1];
          var listName = match[2];
          if (['log', 'send'].indexOf(listName) === -1) {
            return;
          }
          var logData;
          try {
            logData = JSON.parse(localStorage[key]);
          } catch (ex) {
            console.error(ex.message);
            return;
          }

          logData.forEach(function(item) {
            item._trackerName = trackerName;
            item._listName = listName;
            item._removed = false;

            liveRecordSet.add(item.id);
            liverecordList.push(item);
          });
        });

        liverecordList.sort(function(a, b) {
          return a.birthday - b.birthday;
        }).forEach(function(item) {
          var oldItem = records[item.id];
          if (!oldItem) { // 新记录
            records[item.id] = item;
            self[item._listName].unshift(item);
          }
        });

        Object.keys(records).forEach(function(key) {
          var item = records[key];
          if (!liveRecordSet.has(item.id)) {
            console.log('removed', item.id);
            item._removed = true;
          } else {
            item._removed = false;
          }
        });
      },
      getTimeout: function(item) {
        this.nowTime = Date.now();
        var timeout = item.birthday + item.expires * 1000 - this.nowTime;
        if (timeout <= 0) {
          return 'none';
        }
        var sec = Math.ceil(timeout / 1000);
        if (sec > 60) {
          return Math.ceil(sec / 60) + '分';
        } else {
          return sec + '秒';
        }
      },
      clean: function(activatTab) {
        if (!confirm('是否确定清除' + activatTab + '吗!')) {
          return;
        }
        Object.keys(localStorage).forEach(function(key) {
          var match = key.match(/^h5t@storageList\/(\w+)\/(\w+)\/(\w+)$/);
          if (!match) {
            return;
          }
          var listName = match[3];
          if (listName === activatTab) {
            localStorage[key] = '[]';
          }
        });
      },
      toString: function(item) {
        var queryArr = decodeURIComponent(item).split("&");
        return queryArr.join('<i></i>');
      }
    }
  });
})();
