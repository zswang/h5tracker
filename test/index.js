
var dom = require('./lib/dom');
global.window = dom.window;
global.document = dom.document;
window.localStorage = window.localStorage || {};
window.sessionStorage = window.sessionStorage || {};

require('../src/index.js');
var app = window.h5t.app;
      
describe("src/index.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }

  it("h5tObjectName", function() {
    examplejs_printLines = [];
    examplejs_print(!!window['h5t']);
    assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];

    examplejs_print(app.get('debug'));
    assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];

    app.oldEntery('set', 'debug', false);
    examplejs_print(app.get('debug'));
    assert.equal(examplejs_printLines.join("\n"), "false"); examplejs_printLines = [];
  });
  it("entery", function() {
    examplejs_printLines = [];
    app.entery(document, window);
  });
  it("oldObject is null", function() {
    examplejs_printLines = [];
    delete window['h5t'];
    app.entery(document, window);
  });
  it("oldObject.q null", function() {
    examplejs_printLines = [];
    window['h5t'] = {};
    app.entery(document, window);
  });
});