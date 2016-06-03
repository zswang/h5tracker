
var dom = require('./lib/dom');
global.window = dom.window;
global.document = dom.document;
window.localStorage = window.localStorage || {};
window.sessionStorage = window.sessionStorage || {};

require('../src/index.js');
var app = window.h5t.app;
      
describe("src/storage-sender.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }

  it("createStorageSender():base", function(done) {
    examplejs_printLines = [];
    var localStorage = app.storageConfig.localStorageProxy;
    Object.keys(localStorage).forEach(function (key) {
      if (/\/send($|\ts)/.test(key)) {
        delete localStorage[key];
      }
    });
    var storageList = app.createStorageList('h5t', 'sender1', 'send', app.storageConfig);
    storageList.push({
      accept: 'http://host/path/to?from=timeline',
      query: 'level=info&message=click%20button1'
    });
    var sender = app.createStorageSender(app.storageConfig);
    sender.scan();

    setTimeout(function(){
      examplejs_print(localStorage['h5t@storageList/h5t/sender1/send']);
      assert.equal(examplejs_printLines.join("\n"), "[]"); examplejs_printLines = [];
      done();
    }, 500);
  });
  it("createStorageSender():acceptStyle", function(done) {
    examplejs_printLines = [];
    var localStorage = app.storageConfig.localStorageProxy;
    Object.keys(localStorage).forEach(function (key) {
      if (/\/send($|\ts)/.test(key)) {
        delete localStorage[key];
      }
    });
    var storageList = app.createStorageList('h5t', 'sender2', 'send', app.storageConfig);
    storageList.push({
      accept: 'http://host/path/to/?from=timeline',
      acceptStyle: 'path',
      query: 'level=info&message=click%20button1'
    });
    var sender = app.createStorageSender(app.storageConfig);
    sender.scan();

    setTimeout(function(){
      examplejs_print(localStorage['h5t@storageList/h5t/sender2/send']);
      assert.equal(examplejs_printLines.join("\n"), "[]"); examplejs_printLines = [];
      done();
    }, 500);
  });
  it("createStorageSender():acceptStyle2", function(done) {
    examplejs_printLines = [];
    var localStorage = app.storageConfig.localStorageProxy;
    Object.keys(localStorage).forEach(function (key) {
      if (/\/send($|\ts)/.test(key)) {
        delete localStorage[key];
      }
    });
    var storageList = app.createStorageList('h5t', 'sender2_1', 'send', app.storageConfig);
    storageList.push({
      accept: 'http://host/path/to',
      acceptStyle: 'path',
      query: 'level=info&message=click%20button1'
    });
    var sender = app.createStorageSender(app.storageConfig);
    sender.scan();

    setTimeout(function(){
      examplejs_print(localStorage['h5t@storageList/h5t/sender2_1/send']);
      assert.equal(examplejs_printLines.join("\n"), "[]"); examplejs_printLines = [];
      done();
    }, 500);
  });
  it("createStorageSender():accept Error", function(done) {
    examplejs_printLines = [];
    var localStorage = app.storageConfig.localStorageProxy;
    Object.keys(localStorage).forEach(function (key) {
      if (/\/send($|\ts)/.test(key)) {
        delete localStorage[key];
      }
    });
    var storageList = app.createStorageList('h5t', 'sender3', 'send', app.storageConfig);
    storageList.push({
      accept: '/host/path#error',
      query: 'level=info&message=click%20button1'
    });
    var sender = app.createStorageSender(app.storageConfig);
    sender.scan();

    setTimeout(function(){
      examplejs_print(!!localStorage['h5t@storageList/h5t/sender3/send']);
      assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];
      done();
    }, 1100);
  });
  it("createStorageSender():accept is undefined", function() {
    examplejs_printLines = [];
    var localStorage = app.storageConfig.localStorageProxy;
    Object.keys(localStorage).forEach(function (key) {
      if (/\/send($|\ts)/.test(key)) {
        delete localStorage[key];
      }
    });
    var storageList = app.createStorageList('h5t', 'sender4', 'send', app.storageConfig);
    storageList.push({
      query: 'level=info&message=click%20button1'
    });
    var sender = app.createStorageSender(app.storageConfig);
    sender.scan();
  });
});