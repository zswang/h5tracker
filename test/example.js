var assert = require('should');
var dom = require('./lib/dom');
global.window = dom.window;
global.document = dom.document;
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
describe("./src/storage.js", function () {
});
describe("./src/tracker.js", function () {
});
