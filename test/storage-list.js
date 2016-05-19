
var dom = require('./lib/dom');
global.window = dom.window;
global.document = dom.document;
window.localStorage = window.localStorage || {};
window.sessionStorage = window.sessionStorage || {};

require('../src/index.js');
var app = window.h5t.app;
      
describe("src/storage-list.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }

  it("createStorageList():storageInstance => sessionStorage", function() {
    examplejs_printLines = [];
    var storageList = app.createStorageList('h5t', 'base1', 'log', sessionStorage);
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    var data = JSON.parse(sessionStorage['h5t@storageList/h5t/base1/log']);
    examplejs_print(data.length);
    assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];
  });
  it("createStorageList():storageExpires => 10000", function() {
    examplejs_printLines = [];
    var storageList = app.createStorageList('h5t', 'base2', 'log', localStorage, 10000);
    storageList.push({
      level: 'info',
      message: 'click button1'
    });
    var data = JSON.parse(localStorage['h5t@storageList/h5t/base2/log']);
    examplejs_print(data[0].expires);
    assert.equal(examplejs_printLines.join("\n"), "10000"); examplejs_printLines = [];
  });
  it("push():base", function() {
    examplejs_printLines = [];
      var storageList = app.createStorageList('h5t', 'push_case_1', 'log');
      storageList.push({
        level: 'info',
        message: 'click button1'
      });
      storageList.push({
        level: 'info',
        message: 'click button2'
      });
      var data = JSON.parse(localStorage['h5t@storageList/h5t/push_case_1/log']);
      examplejs_print(data.length);
      assert.equal(examplejs_printLines.join("\n"), "2"); examplejs_printLines = [];
      examplejs_print(data[0].data.message);
      assert.equal(examplejs_printLines.join("\n"), "click button1"); examplejs_printLines = [];
      examplejs_print(data[1].data.message);
      assert.equal(examplejs_printLines.join("\n"), "click button2"); examplejs_printLines = [];
  });
  it("push():storageMaxCount = 5", function() {
    examplejs_printLines = [];
      var storageList = app.createStorageList('h5t', 'push_case_2', 'log', null, null, 5);
      for (var i = 0; i < 6; i++ ) {
        storageList.push({
          level: 'info',
          message: 'click button' + i
        });
      }
      var data = JSON.parse(localStorage['h5t@storageList/h5t/push_case_2/log']);
      examplejs_print(data.length);
      assert.equal(examplejs_printLines.join("\n"), "5"); examplejs_printLines = [];
  });
  it("toArray():base", function() {
    examplejs_printLines = [];
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
      examplejs_print(items.pop().data.message);
      assert.equal(examplejs_printLines.join("\n"), "click button2"); examplejs_printLines = [];
      examplejs_print(items.pop().data.message);
      assert.equal(examplejs_printLines.join("\n"), "click button1"); examplejs_printLines = [];
  });
  it("clean():base", function() {
    examplejs_printLines = [];
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
      examplejs_print(data.length);
      assert.equal(examplejs_printLines.join("\n"), "2"); examplejs_printLines = [];
      examplejs_print(data[0].data.message);
      assert.equal(examplejs_printLines.join("\n"), "click button1"); examplejs_printLines = [];
      examplejs_print(data[1].data.message);
      assert.equal(examplejs_printLines.join("\n"), "click button3"); examplejs_printLines = [];
  });
  it("clean():localStorage JSON error", function() {
    examplejs_printLines = [];
      var storageList = app.createStorageList('h5t', 'clean_case2', 'log');
      localStorage['h5t@storageList/h5t/clean_case2/log'] = '#error';
      storageList.clean();
      var data = JSON.parse(localStorage['h5t@storageList/h5t/clean_case2/log']);
      examplejs_print(data);
      assert.equal(examplejs_printLines.join("\n"), "[]"); examplejs_printLines = [];
  });
  it("clean():localStorage timestamp change", function() {
    examplejs_printLines = [];
      var storageList = app.createStorageList('h5t', 'clean_case3', 'log');
      storageList.push({
        level: 'info',
        message: 'click button1'
      });
      var data = JSON.parse(localStorage['h5t@storageList/h5t/clean_case3/log']);
      data[0].birthday = 0;
      localStorage['h5t@storageList/h5t/clean_case3/log'] = JSON.stringify(data);
      localStorage['h5t@storageList/h5t/clean_case3/log/ts'] = 0;
      storageList.clean();
      data = JSON.parse(localStorage['h5t@storageList/h5t/clean_case3/log']);
      examplejs_print(data);
      assert.equal(examplejs_printLines.join("\n"), "[]"); examplejs_printLines = [];

      examplejs_print(localStorage['h5t@storageList/h5t/clean_case3/log/ts'] !== '0');
      assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];
  });
  it("clean():×2", function() {
    examplejs_printLines = [];
      var storageList = app.createStorageList('h5t', 'clean_case4', 'log');
      storageList.clean();
      storageList.clean();
  });
  it("clean():minExpiresTime", function(done) {
    examplejs_printLines = [];
      var storageList = app.createStorageList('h5t', 'clean_case5', 'log');
      storageList.push({
        level: 'info',
        message: 'click button1'
      });
      storageList.push({
        level: 'info',
        message: 'click button2'
      });
      var data = JSON.parse(localStorage['h5t@storageList/h5t/clean_case5/log']);
      data[0].expires = 0.001;
      localStorage['h5t@storageList/h5t/clean_case5/log'] = JSON.stringify(data);
      storageList.clean();
      setTimeout(function () {
        storageList.clean();
        data = JSON.parse(localStorage['h5t@storageList/h5t/clean_case5/log']);
        examplejs_print(data.length);
        assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];
        done();
      }, 100);
  });
  it("remove():base", function() {
    examplejs_printLines = [];
      var storageList = app.createStorageList('h5t', 'remove', 'log');
      var id1 = storageList.push({
        level: 'info',
        message: 'click button1'
      });
      var id2 = storageList.push({
        level: 'info',
        message: 'click button2'
      });
      storageList.clean();
      storageList.remove(id1);
      var data = JSON.parse(localStorage['h5t@storageList/h5t/remove/log']);
      examplejs_print(data.length);
      assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];
      examplejs_print(data[0].id === id2);
      assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];
  });
  it("update():base", function() {
    examplejs_printLines = [];
      var storageList = app.createStorageList('h5t', 'update', 'send');
      var id1 = storageList.push({
        level: 'info',
        message: 'click button1'
      });
      storageList.update(id1, {
        tried: 2
      });
      var data = JSON.parse(localStorage['h5t@storageList/h5t/update/send']);
      examplejs_print(data[0].tried === 2);
      assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];
  });
  it("update():not exists", function() {
    examplejs_printLines = [];
      var storageList = app.createStorageList('h5t', 'update_case2', 'send');
      var id1 = storageList.push({
        level: 'info',
        message: 'click button1'
      });
      storageList.update('null', {
        level: 'debug'
      });
      var data = JSON.parse(localStorage['h5t@storageList/h5t/update_case2/send']);
      examplejs_print(data[0].data.level);
      assert.equal(examplejs_printLines.join("\n"), "info"); examplejs_printLines = [];
  });
  it("get():base", function() {
    examplejs_printLines = [];
      var storageList = app.createStorageList('h5t', 'get', 'send');
      var id1 = storageList.push({
        level: 'info',
        message: 'click button1'
      });
      var item = storageList.get(id1);
      var data = JSON.parse(localStorage['h5t@storageList/h5t/get/send']);
      examplejs_print(item.id === id1);
      assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];
  });
});