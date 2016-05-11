var assert = require('should');
var dom = require('./lib/dom');
global.window = dom.window;
global.document = dom.document;
global.localStorage = dom.localStorage;
global.sessionStorage = dom.sessionStorage;
require('../.');
var app = window.h5t.app;
var util = require('util');
var printLines = [];
function print() {
  printLines.push(util.format.apply(util, arguments));
}
describe("./src/app.js", function () {
});
describe("./src/common.js", function () {
  it("newGuid:base", function () {
  print(/^[a-z0-9]+$/.test(app.newGuid()));
  assert.equal(printLines.join("\n"), "true"); printLines = [];
  });
});
describe("./src/event.js", function () {
  it("base", function () {
    var emitter = app.createEmitter();
    emitter.on('click', function (data) {
      print('on', data);
    });
    emitter.once('click', function (data) {
      print('once', data);
    });
    function bee(data) {
      print('bee', data);
    }
    emitter.on('click', bee);
    emitter.on('click2', function (data) {
      print('on', data);
    });
    emitter.emit('click2', 'hello 1');
    assert.equal(printLines.join("\n"), "on hello 1"); printLines = [];
    emitter.emit('click', 'hello 1');
    assert.equal(printLines.join("\n"), "on hello 1\nonce hello 1\nbee hello 1"); printLines = [];
    emitter.emit('click', 'hello 2');
    assert.equal(printLines.join("\n"), "on hello 2\nbee hello 2"); printLines = [];
    emitter.off('click', bee);
    emitter.emit('click', 'hello 3');
    assert.equal(printLines.join("\n"), "on hello 3"); printLines = [];
  });
});
describe("./src/index.js", function () {
});
describe("./src/inline.js", function () {
});
describe("./src/storage-list.js", function () {
  it("createStorageList():storageInstance => sessionStorage", function () {
    var storageList = app.createStorageList('h5t_base1_log', sessionStorage);
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    var data = JSON.parse(sessionStorage.h5t_base1_log);
    print(data.length);
    assert.equal(printLines.join("\n"), "1"); printLines = [];
  });
  it("createStorageList():storageExpires => 10000", function () {
    var storageList = app.createStorageList('h5t_base2_log', localStorage, 10000);
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    var data = JSON.parse(localStorage.h5t_base2_log);
    print(data[0].expires);
    assert.equal(printLines.join("\n"), "10000"); printLines = [];
  });
  it("push():base", function () {
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
    print(data.length);
    assert.equal(printLines.join("\n"), "2"); printLines = [];
    print(data[0].data.message);
    assert.equal(printLines.join("\n"), "click button1"); printLines = [];
    print(data[1].data.message);
    assert.equal(printLines.join("\n"), "click button2"); printLines = [];
  });
  it("toArray():base", function () {
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
    print(items.pop().data.message);
    assert.equal(printLines.join("\n"), "click button2"); printLines = [];
    print(items.pop().data.message);
    assert.equal(printLines.join("\n"), "click button1"); printLines = [];
  });
  it("clean():base", function () {
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
    print(data.length);
    assert.equal(printLines.join("\n"), "2"); printLines = [];
    print(data[0].data.message);
    assert.equal(printLines.join("\n"), "click button1"); printLines = [];
    print(data[1].data.message);
    assert.equal(printLines.join("\n"), "click button3"); printLines = [];
  });
  it("remove():base", function () {
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
    print(data.length);
    assert.equal(printLines.join("\n"), "1"); printLines = [];
    print(data[0].id === id2);
    assert.equal(printLines.join("\n"), "true"); printLines = [];
  });
});
describe("./src/storage.js", function () {
  it("send():base", function () {
    var storage = app.createStorage('h5t_scan');
    storage.send({
      hisType: 'pageview'
    }, '/host/path/to/t.gif');
    var data = JSON.parse(localStorage.h5t_scan_send);
    print(data[0].data.accept);
    assert.equal(printLines.join("\n"), "/host/path/to/t.gif"); printLines = [];
    print(data[0].data.query);
    assert.equal(printLines.join("\n"), "hisType=pageview"); printLines = [];
  });
  it("scan():base", function () {
    var storage = app.createStorage('h5t_scan');
    storage.send({
      hisType: 'pageview'
    }, '/host/path/to/t.gif');
  });
});
describe("./src/tracker.js", function () {
  it("createTracker():base", function () {
  var tracker = app.createTracker('base');
  var count = 0;
  tracker.error('error1');
  tracker.send({
    ht: 'pageview'
  });
  tracker.on('log', function (data) {
    print(count++);
    assert.equal(printLines.join("\n"), "1"); printLines = [];
    print(data.level);
    assert.equal(printLines.join("\n"), "error"); printLines = [];
    print(data.message);
    assert.equal(printLines.join("\n"), "error1"); printLines = [];
  });
  tracker.create({
    accept: 'http://host/path/to',
    data: {
      do: 'h5t.com',
      lo: '/home'
    },
    event: {
      send: function (data) {
        print(count++);
        assert.equal(printLines.join("\n"), "2"); printLines = [];
        print(data.do);
        assert.equal(printLines.join("\n"), "h5t.com"); printLines = [];
        print(data.lo);
        assert.equal(printLines.join("\n"), "/home"); printLines = [];
      },
      log: function (data) {
        print(count++);
        assert.equal(printLines.join("\n"), "0"); printLines = [];
        print(data.level);
        assert.equal(printLines.join("\n"), "error"); printLines = [];
        print(data.message);
        assert.equal(printLines.join("\n"), "error1"); printLines = [];
      }
    },
  });
  });
  it("set() & get():base", function () {
    var tracker = app.createTracker('setter');
    tracker.set({
      x: 1,
      y: 2
    });
    tracker.get(function (y, x) {
      print(x, y);
      assert.equal(printLines.join("\n"), "1 2"); printLines = [];
    });
  });
  it("send():case 1", function () {
    var tracker = app.createTracker('send_case_1');
    tracker.set({
      x: 1,
      y: 2
    });
    tracker.send({z: 3});
    tracker.send({z: null});
    tracker.create({
      accept: '/host/case1',
      data: {
        z: 'z3'
      }
    });
    var data = JSON.parse(localStorage.send_case_1_send);
    print(data[0].data.query);
    assert.equal(printLines.join("\n"), "z=3&x=1&y=2"); printLines = [];
    print(data[1].data.query);
    assert.equal(printLines.join("\n"), "x=1&y=2"); printLines = [];
  });
  it("log():case 1", function () {
    var tracker = app.createTracker('send_case_1');
    tracker.set({
      x: 1,
      y: 2
    });
    tracker.log('default log.');
    tracker.log({
      'level': 'warn',
      'message': 'hello'
    });
    tracker.debug('debug log.');
    tracker.info('info log.');
    tracker.warn('warn log.');
    tracker.fatal('fatal log.');
    tracker.create({
      accept: '/host/case1',
      data: {
        z: 'z3'
      }
    });
    var data = JSON.parse(localStorage.send_case_1_send);
    print(data[0].data.query);
    assert.equal(printLines.join("\n"), "z=3&x=1&y=2"); printLines = [];
    print(data[1].data.query);
    assert.equal(printLines.join("\n"), "x=1&y=2"); printLines = [];
  });
});
