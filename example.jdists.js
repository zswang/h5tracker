var assert = require('should');

var dom = require('./lib/dom');
global.window = dom.window;
global.document = dom.document;
global.localStorage = dom.localStorage;
global.sessionStorage = dom.sessionStorage;

require('../src/index.js');
var app = window.h5t.app;

var util = require('util');

var printLines = [];
function print() {
  printLines.push(util.format.apply(util, arguments));
}

/*<remove>*/
  // <!--jdists encoding="glob" pattern="./src/**/*.js" export="#files" /-->
/*</remove>*/

/*<jdists encoding="jhtmls,regex" pattern="/~/g" replacement="--" data="#files" export="#example">*/
forEach(function (item) {
!#{'describe("' + item + '", function () {'}
!#{'  this.timeout(5000);'}
!#{'  printLines = [];'}
  <!~jdists import="#{item}?example*" /~>
!#{'});'}
});
/*</jdists>*/

/*<jdists export="#replacer">*/
function (content) {
  return content.replace(/\s*\*(\s*)@example\s+(.*)\n\s*```js([^]*?)```/g,
    function (all, space, desc, code) {
      var hasDone = code.indexOf('//done();') >= 0;
      var result = space + 'it(' + JSON.stringify(desc) + ', function(' + (hasDone ? 'done': '') + ') {\n';
      result += space + 'printLines = [];';
      result += code.replace(/^(\s*\/\/ > .*\n??)+/mg, function (all) {
        var space = all.match(/^(\s*)\/\/ > /)[1];
        var output = all.replace(/^\s*\/\/ > /mg, '');
        return space + 'assert.equal(printLines.join("\\n"), ' + JSON.stringify(output) + '); printLines = [];'
      })
      .replace(/console\.log/g, 'print')
      .replace('//done();', 'done();');

      result += '});\n';
      return result;
    }
  );
  return content;
}
/*</jdists>*/
/*<jdists encoding="#replacer" import="#example"/>*/
