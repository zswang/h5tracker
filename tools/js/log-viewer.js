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
    tabs: {
      log: [],
      send: []
    },
    nowTime: Date.now(),
    activatTab: 'log',
    isSpread: false
  },
  methods: {
    getStorage: function() {
      if (!localStorage) {
        return;
      }
      var _this = this;
      this.tabs.log = [];
      this.tabs.send = [];
      var nextTime = {
        log: 0,
        send: 0
      };
      Object.keys(localStorage).forEach(function(key) {

        var match = key.match(/^h5t@storageList\/(\w+)\/(\w+)\/(\w+)$/);
        if (!match) {
          return;
        }
        var appName = match[1];
        var trackerName = match[2];
        var listName = match[3];
        if (['log', 'send'].indexOf(listName) === -1) {
          return;
        }
        var logData = localStorage[key];

        try {
          logData = JSON.parse(logData);
        } catch (ex) {
          console.error('logData not is JSON');
          return;
        }

        logData.map(function(item) {
          item._trackerName = appName + '/' + trackerName;
        });
        _this.tabs[listName] = _this.tabs[listName]
          .concat(logData)
          .sort(function(a, b) {
            return b.birthday - a.birthday;
          });
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
