
var dom = require('./lib/dom');
global.window = dom.window;
global.document = dom.document;
window.localStorage = window.localStorage || {};
window.sessionStorage = window.sessionStorage || {};

require('../src/index.js');
var app = window.h5t.app;
      
describe("src/app.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }

  it("createApp():base", function() {
    examplejs_printLines = [];
    var appInstance = app.createApp('cctv1', app.storageConfig);
    examplejs_print(appInstance.name);
    assert.equal(examplejs_printLines.join("\n"), "cctv1"); examplejs_printLines = [];

    var appInstance = app.createApp('', app.storageConfig);
    examplejs_print(appInstance.name);
    assert.equal(examplejs_printLines.join("\n"), "h5t"); examplejs_printLines = [];
  });
  it("createApp():sessionExpires => 1", function(done) {
    examplejs_printLines = [];
    var oldSessionExpires = app.storageConfig.sessionExpires;
    app.storageConfig.sessionExpires = 1;
    var appInstance = app.createApp('cctv2', app.storageConfig);
    appInstance.once('createSession', function () {
      app.storageConfig.sessionExpires = oldSessionExpires;
      examplejs_print(appInstance.name);
      assert.equal(examplejs_printLines.join("\n"), "cctv2"); examplejs_printLines = [];
      done();
    });
    setTimeout(function () {
      document.dispatchEvent('mousemove');
    }, 1500);
  });
  it("cmd():set", function() {
    examplejs_printLines = [];
      app.cmd('tracker1.set', 'x', 2);

      examplejs_print(app.cmd('tracker1.get', 'x'));
      assert.equal(examplejs_printLines.join("\n"), "2"); examplejs_printLines = [];
  });
  it("cmd():default set", function() {
    examplejs_printLines = [];
      app.cmd('set', 'x', 3);

      examplejs_print(app.cmd('get', 'x'));
      assert.equal(examplejs_printLines.join("\n"), "3"); examplejs_printLines = [];
  });
  it("cmd():type error", function() {
    examplejs_printLines = [];
      app.cmd(112);
  });
  it("cmd():invalid format", function() {
    examplejs_printLines = [];
      app.cmd('^tt^.set', 'x', 1);
  });
  it("cmd():method is invalid", function() {
    examplejs_printLines = [];
      app.cmd('hello');
  });
  it("cmd():\"send\" method", function() {
    examplejs_printLines = [];
      app.cmd('send', {
        event: 'click'
      });
      app.cmd('create', {
        accept: '/host/path/to'
      });
      var localStorage = app.storageConfig.localStorageProxy;
      var list = JSON.parse(localStorage['h5t@storageList/h5t/h5t/send']);
      examplejs_print(/event=click/.test(list[0].data.query));
      assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];
  });
});