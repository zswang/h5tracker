
var dom = require('./lib/dom');
global.window = dom.window;
global.document = dom.document;
global.localStorage = dom.localStorage;
global.sessionStorage = dom.sessionStorage;

require('../src/index.js');
var app = window.h5t.app;
      
describe("src/session-manager.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }

  it("createSessionManager():base", function() {
    examplejs_printLines = [];
    var sessionManager = app.createSessionManager();
    var sessionId = sessionStorage['h5t@global/sessionId'];
    var sessionSeq = sessionStorage['h5t@global/sessionSeq'];
    var birthday = sessionStorage['h5t@global/sessionBirthday'];
    var liveTime = sessionStorage['h5t@global/sessionLiveTime'];

    examplejs_print(sessionSeq >= 0);
    assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];

    examplejs_print(birthday && birthday === liveTime);
    assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];

    examplejs_print(sessionId === sessionManager.get('sid'));
    assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];

    examplejs_print(sessionSeq === sessionManager.get('seq'));
    assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];

    examplejs_print(birthday === sessionManager.get('birthday'));
    assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];

    examplejs_print(liveTime === sessionManager.get('liveTime'));
    assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];
  });
  it("createSessionManager():sessionExpires => 1", function(done) {
    examplejs_printLines = [];
    var timeout = 1;
    var sessionManager = app.createSessionManager(timeout);

    setTimeout(function(){
      examplejs_print(Date.now() - sessionManager.get('liveTime') > timeout * 1000);
      assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];
      done();
    }, 1500);
  });
  it("createSession():base", function() {
    examplejs_printLines = [];
      var sessionManager = app.createSessionManager();
      var sessionId = sessionManager.get('sid');

      examplejs_print(!!sessionId);
      assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];

      sessionManager.createSession();
      examplejs_print(!!sessionManager.get('sid'));
      assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];

      examplejs_print(sessionId !== sessionManager.get('sid'));
      assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];
  });
  it("destroySession():base", function() {
    examplejs_printLines = [];
      var sessionManager = app.createSessionManager();

      examplejs_print(!!sessionManager.get('sid'));
      assert.equal(examplejs_printLines.join("\n"), "true"); examplejs_printLines = [];

      sessionManager.destroySession();
      sessionManager.destroySession();

      examplejs_print(!!sessionManager.get('sid'));
      assert.equal(examplejs_printLines.join("\n"), "false"); examplejs_printLines = [];
  });
});