
var dom = require('./lib/dom');
global.window = dom.window;
global.document = dom.document;
window.localStorage = window.localStorage || {};
window.sessionStorage = window.sessionStorage || {};

require('../src/index.js');
var app = window.h5t.app;
      
describe("src/tracker.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }

  it("createTracker():base", function() {
    examplejs_printLines = [];
    var tracker = app.createTracker('h5t', 'base', app.sessionManager, app.storageSender, app.storageConfig);
    var count = 0;
    tracker.error('error1');
    tracker.send({
      ht: 'pageview'
    });
    tracker.on('log', function (data) {
      examplejs_print(count++);
      assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];

      examplejs_print(data.level);
      assert.equal(examplejs_printLines.join("\n"), "error"); examplejs_printLines = [];

      examplejs_print(data.message);
      assert.equal(examplejs_printLines.join("\n"), "error1"); examplejs_printLines = [];
    });
    tracker.create({
      accept: 'http://host/path/to',
      data: {
        do: 'h5t.com',
        lo: '/home'
      },
      event: {
        send: function (data) {
          examplejs_print(count++);
          assert.equal(examplejs_printLines.join("\n"), "2"); examplejs_printLines = [];

          examplejs_print(data.do);
          assert.equal(examplejs_printLines.join("\n"), "h5t.com"); examplejs_printLines = [];

          examplejs_print(data.lo);
          assert.equal(examplejs_printLines.join("\n"), "/home"); examplejs_printLines = [];
        },
        log: function (data) {
          examplejs_print(count++);
          assert.equal(examplejs_printLines.join("\n"), "0"); examplejs_printLines = [];

          examplejs_print(data.level);
          assert.equal(examplejs_printLines.join("\n"), "error"); examplejs_printLines = [];

          examplejs_print(data.message);
          assert.equal(examplejs_printLines.join("\n"), "error1"); examplejs_printLines = [];
        }
      },
    });
  });
  it("set() & get():base", function() {
    examplejs_printLines = [];
      var tracker = app.createTracker('h5t', 'setter', app.sessionManager, app.storageSender, app.storageConfig);
      tracker.set({
        x: 1,
        y: 2
      });
      tracker.get(function (y, x) {
        examplejs_print(x, y);
        assert.equal(examplejs_printLines.join("\n"), "1 2"); examplejs_printLines = [];
      });
  });
  it("send():field is null", function() {
    examplejs_printLines = [];
      var localStorage = app.storageConfig.localStorageProxy;
      var tracker = app.createTracker('h5t', 'send_case_1', app.sessionManager, app.storageSender, app.storageConfig);
      tracker.set({
        x: 1,
        y: 2,
        rid: null,
        uid: null,
        sid: null,
        seq: null,
        time: null
      });
      tracker.send({z: 3});
      tracker.send({
        z: null,
        rid: null
      });
      tracker.create({
        accept: '/host/case1',
        data: {
          z: 'z3'
        }
      });

      var data = JSON.parse(localStorage['h5t@storageList/h5t/send_case_1/send']);

      examplejs_print(data[0].data.query);
      assert.equal(examplejs_printLines.join("\n"), "z=3&x=1&y=2"); examplejs_printLines = [];

      examplejs_print(data[1].data.query);
      assert.equal(examplejs_printLines.join("\n"), "x=1&y=2"); examplejs_printLines = [];
  });
  it("send():accept is null", function() {
    examplejs_printLines = [];
      var localStorage = app.storageConfig.localStorageProxy;
      var tracker = app.createTracker('h5', 'send_case_2', app.sessionManager, app.storageSender, app.storageConfig);
      tracker.send({z: 3});
      tracker.create({});

      examplejs_print(typeof localStorage['h5t@storageList/h5t/send_case_2/send']);
      assert.equal(examplejs_printLines.join("\n"), "undefined"); examplejs_printLines = [];
  });
  it("send():event {}", function() {
    examplejs_printLines = [];
      var localStorage = app.storageConfig.localStorageProxy;
      var tracker = app.createTracker('h5t', 'send_case_3', app.sessionManager, app.storageSender, app.storageConfig);
      tracker.send({message: 'case_3'});
      tracker.create({
        accept: '/host/case3',
        event: {}
      });
  });
  it("send():string", function() {
    examplejs_printLines = [];
      var localStorage = app.storageConfig.localStorageProxy;
      var tracker = app.createTracker('h5t', 'send_case_4', app.sessionManager, app.storageSender, app.storageConfig);
      tracker.send('pageview');
      tracker.create({
        accept: '/host/case4'
      });

      var data = JSON.parse(localStorage['h5t@storageList/h5t/send_case_4/send']);
      examplejs_print(/ht=pageview/.test(data[0].data.query));
      assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];
  });
  it("log():case 1", function() {
    examplejs_printLines = [];
      var localStorage = app.storageConfig.localStorageProxy;
      var tracker = app.createTracker('h5t', 'log_case_1', app.sessionManager, app.storageSender, app.storageConfig);
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
      tracker.create({});

      var data = JSON.parse(localStorage['h5t@storageList/h5t/log_case_1/log']);

      data.forEach(function (item) {
        examplejs_print(item.data.level, item.data.message);
      });
      assert.equal(examplejs_printLines.join("\n"), "debug default log.\nwarn hello\ndebug debug log.\ninfo info log.\nwarn warn log.\nfatal fatal log."); examplejs_printLines = [];
  });
  it("log():level is undefined", function() {
    examplejs_printLines = [];
      var tracker = app.createTracker('h5t', 'log_case_2', app.sessionManager, app.storageSender, app.storageConfig);
      tracker.log({});
      tracker.create({});
  });
  it("log():event {}", function() {
    examplejs_printLines = [];
      var tracker = app.createTracker('h5t', 'log_case_3', app.sessionManager, app.storageSender, app.storageConfig);
      tracker.log('case3');
      tracker.create({
        event: {}
      });
  });
  it("create():opts in undefined", function() {
    examplejs_printLines = [];
      var tracker = app.createTracker('h5t', 'create_case_1', app.sessionManager, app.storageSender, app.storageConfig);
      tracker.create();
  });
  it("create():duplicate create", function() {
    examplejs_printLines = [];
      var tracker = app.createTracker('h5t', 'create_case_2', app.sessionManager, app.storageSender, app.storageConfig);
      tracker.create({});
      tracker.create({});
  });
});