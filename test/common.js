
var dom = require('./lib/dom');
global.window = dom.window;
global.document = dom.document;
window.localStorage = window.localStorage || {};
window.sessionStorage = window.sessionStorage || {};

require('../src/index.js');
var app = window.h5t.app;
      
describe("src/common.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }

  it("newGuid:base", function() {
    examplejs_printLines = [];
    examplejs_print(/^[a-z0-9]+$/.test(app.newGuid()));
    assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];
  });
  it("format:array", function() {
    examplejs_printLines = [];
    examplejs_print(app.format('#{0} - #{1}', [2, 3]));
    assert.equal(examplejs_printLines.join("\n"), "2 - 3"); examplejs_printLines = [];
  });
  it("format:object", function() {
    examplejs_printLines = [];
    examplejs_print(app.format('#{x} - #{y}', {x: 1, y: 2}));
    assert.equal(examplejs_printLines.join("\n"), "1 - 2"); examplejs_printLines = [];
  });
  it("format:field is undefined", function() {
    examplejs_printLines = [];
    examplejs_print(app.format('[#{z}]', {x: 1, y: 2}));
    assert.equal(examplejs_printLines.join("\n"), "[]"); examplejs_printLines = [];
  });
  it("queryFrom:field is null", function() {
    examplejs_printLines = [];
    examplejs_print(app.queryFrom({x: 1, y: null}));
    // x=1
  });
  it("queryFrom:field is undefined", function() {
    examplejs_printLines = [];
    examplejs_print(app.queryFrom({x: 1, y: undefined}));
    // x=1
  });
  it("queryFrom:field is space", function() {
    examplejs_printLines = [];
    examplejs_print(app.queryFrom({x: " "}));
    // x=%20
  });
});