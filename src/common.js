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
function newGuid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}
/*</function>*/

exports.newGuid = newGuid;