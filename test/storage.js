
var dom = require('./lib/dom');
global.window = dom.window;
global.document = dom.document;
global.localStorage = dom.localStorage;
global.sessionStorage = dom.sessionStorage;

require('../src/index.js');
var app = window.h5t.app;
      
describe("src/storage.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }

  it("send():base", function() {
    examplejs_printLines = [];
      var storage = app.createStorage('h5t', 'send');
      var id = storage.send({
        hisType: 'pageview'
      }, '/host/path/to/t.gif');

      var data = JSON.parse(localStorage['h5t@storageList/h5t/send/send']);

      examplejs_print(data[0].data.accept);
      assert.equal(examplejs_printLines.join("\n"), "/host/path/to/t.gif"); examplejs_printLines = [];

      examplejs_print(data[0].data.query);
      assert.equal(examplejs_printLines.join("\n"), "hisType=pageview"); examplejs_printLines = [];

      examplejs_print(id === data[0].id);
      assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];
  });
  it("send():acceptStyle", function() {
    examplejs_printLines = [];
      var storage = app.createStorage('h5t', 'send2');
      storage.send({
        hisType: 'pageview'
      }, '/host/path/to/t.gif', 'path');

      var data = JSON.parse(localStorage['h5t@storageList/h5t/send2/send']);

      examplejs_print(data[0].data.acceptStyle);
      assert.equal(examplejs_printLines.join("\n"), "path"); examplejs_printLines = [];
  });
  it("send():accept is undefined", function() {
    examplejs_printLines = [];
      var storage = app.createStorage('h5t', 'send3');
      storage.send({
        hisType: 'pageview'
      });
  });
});