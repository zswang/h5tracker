var fs = require('fs');
var path = require('path');

var filename = path.join(__dirname, 'package.json');
var package = JSON.parse(fs.readFileSync(filename));
package.version = package.version.replace(/-?\d+$/, function(value) {
    return parseInt(value) + 1;
});

fs.writeFileSync(filename, JSON.stringify(package, null, '  '));

var filename = path.join(__dirname, 'bower.json');
var bower = JSON.parse(fs.readFileSync(filename));
bower.name = package.name;
bower.main = package.main;
bower.version = package.version;
bower.description = package.description;
bower.keywords = package.keywords;

fs.writeFileSync(filename, JSON.stringify(bower, null, '  '));