/*<function name="newGuid">*/
/**
 * 比较大的概率上，生成唯一 ID
 *
 * @return {string} 返回生成的 ID
 *
 '''<example>'''
 * @example newGuid:base
  ```js
  console.log(/^[a-z0-9]+$/.test(app.newGuid()));
  // > true
  ```
 '''</example>'''
 */
var newGuid = (function() {
  var guid = parseInt(Math.random() * 36);
  return function newGuid() {
    return Date.now().toString(36) + (guid++ % 36).toString(36) + Math.random().toString(36).slice(2, 4);
  }
})();
/*</function>*/
exports.newGuid = newGuid;

/*<function name="format">*/
function format(template, json) {
  return template.replace(/#\{(.*?)\}/g, function(all, key) {
    return json && (key in json) ? json[key] : "";
  });
}
/*</function>*/
exports.format = format;