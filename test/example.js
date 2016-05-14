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
  this.timeout(5000);
  printLines = []; it("test done", function(done) {
 printLines = [];
  setTimeout(function() {
    print('hello');
    assert.equal(printLines.join("\n"), "hello"); printLines = [];
    done();
  }, 1000);
 });
});
describe("./src/common.js", function () {
  this.timeout(5000);
  printLines = []; it("newGuid:base", function() {
 printLines = [];
  print(/^[a-z0-9]+$/.test(app.newGuid()));
  assert.equal(printLines.join("\n"), "true"); printLines = [];
  });
});
describe("./src/event.js", function () {
  this.timeout(5000);
  printLines = []; it("base", function() {
 printLines = [];
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
  this.timeout(5000);
  printLines = [];
});
describe("./src/inline.js", function () {
  this.timeout(5000);
  printLines = [];
});
describe("./src/session-manager.js", function () {
  this.timeout(5000);
  printLines = []; it("createSessionManager():base", function() {
 printLines = [];
  var sessionManager = app.createSessionManager();
  var sessionId = sessionStorage['h5t@global/sessionId'];
  var birthday = sessionStorage['h5t@global/sessionBirthday'];
  var liveTime = sessionStorage['h5t@global/sessionLiveTime'];
  print(!!sessionId && !!birthday && !!liveTime);
  assert.equal(printLines.join("\n"), "true"); printLines = [];
  print(sessionId === sessionManager.get('id'));
  assert.equal(printLines.join("\n"), "true"); printLines = [];
  print(birthday === sessionManager.get('birthday'));
  assert.equal(printLines.join("\n"), "true"); printLines = [];
  print(liveTime === sessionManager.get('liveTime'));
  assert.equal(printLines.join("\n"), "true"); printLines = [];
  });
 it("createSessionManager():sessionExpires => 3", function(done) {
 printLines = [];
  var timeout = 3;
  var sessionManager = app.createSessionManager(timeout);
  setTimeout(function(){
    print(Date.now() - sessionManager.get('liveTime') > timeout * 1000);
    assert.equal(printLines.join("\n"), "true"); printLines = [];
    done();
  }, 3500);
  });
 it("createSession():base", function() {
 printLines = [];
    var sessionManager = app.createSessionManager();
    var sessionId = sessionManager.get('id');
    print(!!sessionId);
    assert.equal(printLines.join("\n"), "true"); printLines = [];
    sessionManager.createSession();
    print(!!sessionManager.get('id'));
    assert.equal(printLines.join("\n"), "true"); printLines = [];
    print(sessionId != sessionManager.get('id'));
    assert.equal(printLines.join("\n"), "true"); printLines = [];
    });
 it("destroySession():base", function() {
 printLines = [];
    var sessionManager = app.createSessionManager();
    print(!!sessionManager.get('id'));
    assert.equal(printLines.join("\n"), "true"); printLines = [];
    sessionManager.destroySession();
    print(!!sessionManager.get('id'));
    assert.equal(printLines.join("\n"), "false"); printLines = [];
    });
});
describe("./src/storage-keys.js", function () {
  this.timeout(5000);
  printLines = [];
});
describe("./src/storage-list.js", function () {
  this.timeout(5000);
  printLines = []; it("createStorageList():storageInstance => sessionStorage", function() {
 printLines = [];
    var storageList = app.createStorageList('h5t', 'base1', 'log', sessionStorage);
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    var data = JSON.parse(sessionStorage['h5t@storageList/h5t/base1/log']);
    print(data.length);
    assert.equal(printLines.join("\n"), "1"); printLines = [];
    });
 it("createStorageList():storageExpires => 10000", function() {
 printLines = [];
    var storageList = app.createStorageList('h5t', 'base2', 'log', localStorage, 10000);
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    var data = JSON.parse(localStorage['h5t@storageList/h5t/base2/log']);
    print(data[0].expires);
    assert.equal(printLines.join("\n"), "10000"); printLines = [];
    });
 it("push():base", function() {
 printLines = [];
    var storageList = app.createStorageList('h5t', 'push', 'log');
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    storageList.push({
      level: 'info',
      message: 'click button2'
    });
    var data = JSON.parse(localStorage['h5t@storageList/h5t/push/log']);
    print(data.length);
    assert.equal(printLines.join("\n"), "2"); printLines = [];
    print(data[0].data.message);
    assert.equal(printLines.join("\n"), "click button1"); printLines = [];
    print(data[1].data.message);
    assert.equal(printLines.join("\n"), "click button2"); printLines = [];
    });
 it("toArray():base", function() {
 printLines = [];
    var storageList = app.createStorageList('h5t', 'toArray', 'log');
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    storageList.push({
      level: 'info',
      message: 'click button2'
    });
    var data = JSON.parse(localStorage['h5t@storageList/h5t/toArray/log']);
    var items = storageList.toArray();
    print(items.pop().data.message);
    assert.equal(printLines.join("\n"), "click button2"); printLines = [];
    print(items.pop().data.message);
    assert.equal(printLines.join("\n"), "click button1"); printLines = [];
    });
 it("clean():base", function() {
 printLines = [];
    var storageList = app.createStorageList('h5t', 'clean', 'log');
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
    var data = JSON.parse(localStorage['h5t@storageList/h5t/clean/log']);
    data[1].birthday = 0;
    localStorage['h5t@storageList/h5t/clean/log'] = JSON.stringify(data);
    storageList.clean();
    data = JSON.parse(localStorage['h5t@storageList/h5t/clean/log']);
    print(data.length);
    assert.equal(printLines.join("\n"), "2"); printLines = [];
    print(data[0].data.message);
    assert.equal(printLines.join("\n"), "click button1"); printLines = [];
    print(data[1].data.message);
    assert.equal(printLines.join("\n"), "click button3"); printLines = [];
    });
 it("remove():base", function() {
 printLines = [];
    var storageList = app.createStorageList('h5t', 'remove', 'log');
    var id1 = storageList.push({
      level: 'info',
      message: 'click button1'
    });
    var id2 = storageList.push({
      level: 'info',
      message: 'click button2'
    });
    storageList.remove(id1);
    var data = JSON.parse(localStorage['h5t@storageList/h5t/remove/log']);
    print(data.length);
    assert.equal(printLines.join("\n"), "1"); printLines = [];
    print(data[0].id === id2);
    assert.equal(printLines.join("\n"), "true"); printLines = [];
    });
 it("update():base", function() {
 printLines = [];
    var storageList = app.createStorageList('h5t', 'update', 'send');
    var id1 = storageList.push({
      level: 'info',
      message: 'click button1'
    });
    storageList.update(id1, {
      tried: 2
    });
    var data = JSON.parse(localStorage['h5t@storageList/h5t/update/send']);
    print(data[0].tried === 2);
    assert.equal(printLines.join("\n"), "true"); printLines = [];
    });
 it("get():base", function() {
 printLines = [];
    var storageList = app.createStorageList('h5t', 'get', 'send');
    var id1 = storageList.push({
      level: 'info',
      message: 'click button1'
    });
    var item = storageList.get(id1);
    var data = JSON.parse(localStorage['h5t@storageList/h5t/get/send']);
    print(item.id === id1);
    assert.equal(printLines.join("\n"), "true"); printLines = [];
    });
});
describe("./src/storage-sender.js", function () {
  this.timeout(5000);
  printLines = []; it("createStorageSender():base", function(done) {
 printLines = [];
    var storageList = app.createStorageList('h5t', 'sender', 'send');
    storageList.push({
      accept: 'http://host/path/to',
      query: 'level=info&message=click%20button1'
    });
    app.createStorageSender();
    setTimeout(function(){
      print(localStorage['h5t@storageList/h5t/sender/send']);
      assert.equal(printLines.join("\n"), "[]"); printLines = [];
      done();
    }, 1100);
    });
});
describe("./src/storage.js", function () {
  this.timeout(5000);
  printLines = []; it("send():base", function() {
 printLines = [];
    var storage = app.createStorage('h5t', 'scan');
    storage.send({
      hisType: 'pageview'
    }, '/host/path/to/t.gif');
    var data = JSON.parse(localStorage['h5t@storageList/h5t/scan/send']);
    print(data[0].data.accept);
    assert.equal(printLines.join("\n"), "/host/path/to/t.gif"); printLines = [];
    print(data[0].data.query);
    assert.equal(printLines.join("\n"), "hisType=pageview"); printLines = [];
    });
 it("send():acceptStyle", function() {
 printLines = [];
    var storage = app.createStorage('h5t', 'scan2');
    storage.send({
      hisType: 'pageview'
    }, '/host/path/to/t.gif', 'path');
    var data = JSON.parse(localStorage['h5t@storageList/h5t/scan2/send']);
    print(data[0].data.acceptStyle);
    assert.equal(printLines.join("\n"), "path"); printLines = [];
    });
 it("scan():base", function() {
 printLines = [];
    var storage = app.createStorage('h5t_scan');
    storage.send({
      hisType: 'pageview'
    }, '/host/path/to/t.gif');
    });
});
describe("./src/tracker.js", function () {
  this.timeout(5000);
  printLines = []; it("createTracker():base", function() {
 printLines = [];
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
 it("set() & get():base", function() {
 printLines = [];
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
 it("send():field is null", function() {
 printLines = [];
    var tracker = app.createTracker('h5t', 'send_case_1');
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
    var data = JSON.parse(localStorage['h5t@storageList/h5t/send_case_1/send']);
    print(data[0].data.query);
    assert.equal(printLines.join("\n"), "z=3&x=1&y=2"); printLines = [];
    print(data[1].data.query);
    assert.equal(printLines.join("\n"), "x=1&y=2"); printLines = [];
    });
 it("send():field is null", function() {
 printLines = [];
    var tracker = app.createTracker('h5', 'send_case_2');
    tracker.send({z: 3});
    tracker.create({});
    });
 it("log():case 1", function() {
 printLines = [];
    var tracker = app.createTracker('h5t', 'log_case_1');
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
    });
    var data = JSON.parse(localStorage['h5t@storageList/h5t/log_case_1/log']);
    data.forEach(function (item) {
      print(item.data.level, item.data.message);
    });
    assert.equal(printLines.join("\n"), "debug default log.\nwarn hello\ndebug debug log.\ninfo info log.\nwarn warn log.\nfatal fatal log."); printLines = [];
    });
 it("create():opts in undefined", function() {
 printLines = [];
    var tracker = app.createTracker('create_case_1');
    tracker.create();
    });
 it("create():duplicate create", function() {
 printLines = [];
    var tracker = app.createTracker('create_case_2');
    tracker.create({});
    tracker.create({});
    });
});
