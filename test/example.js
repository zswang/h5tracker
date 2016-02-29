var assert = require('should');
var h5tracker = require('../.');
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
    var emitter = h5tracker.createEmitter();
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
    emitter.emit('click', 'hello 1');
    assert.equal(printLines.join("\n"), "on hello 1\nonce hello 1\nbee hello 1"); printLines = [];
    emitter.emit('click', 'hello 2');
    assert.equal(printLines.join("\n"), "on hello 2\nbee hello 2"); printLines = [];
    emitter.off('click', bee);
    emitter.emit('click', 'hello 3');
    assert.equal(printLines.join("\n"), "on hello 3"); printLines = [];
  });
});
describe("./src/storage.js", function () {
});
describe("./src/tracker.js", function () {
});
