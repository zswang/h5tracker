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

/*<remove>*/
  // <!--jdists encoding="glob" pattern="./src/**/*.js" export="#files" /-->
/*</remove>*/

/*<jdists encoding="jhtmls,regex" pattern="/~/g" replacement="--" data="#files" export="#example">*/
forEach(function (item) {
!#{'describe("' + item + '", function () {'}
  <!~jdists import="#{item}?example*" /~>
!#{'});'}
});
/*</jdists>*/

/*<jdists export="#replacer">*/
function (content) {
  content = content.replace(/^\s*\*\s*@example\s*(.*)$/mg, function (all, desc) {
    return '  it(' + JSON.stringify(desc) + ', function () {';
  });
  content = content.replace(/^\s*```js\s*$/mg, '');
  content = content.replace(/^(\s*\/\/ > .*\n??)+/mg, function (all) {
    var space = all.match(/^(\s*)\/\/ > /)[1];
    var output = all.replace(/^\s*\/\/ > /mg, '');
    return space + 'assert.equal(printLines.join("\\n"), ' + JSON.stringify(output) + '); printLines = [];'
  });
  content = content.replace(/console\.log/g, 'print');
  content = content.replace(/^\s*```\s*$/mg,
    '  });');
  return content;
}
/*</jdists>*/
/*<jdists encoding="#replacer" import="#example"/>*/
