(function () {

  /*<function name="newGuid">*/
  /**
   * 比较大的概率上，生成唯一 ID
   *
   * @return {string} 返回生成的 ID
   *
   * @example newGuid:base
    ```js
    console.log(/^[a-z0-9]+$/.test(app.newGuid()));
    // > true
    ```
   */
  var newGuid = (function() {
    var guid = parseInt(Math.random() * 36);
    return function newGuid() {
      return Date.now().toString(36) + (guid++ % 36).toString(36) + Math.random().toString(36).slice(2, 4);
    };
  })();
  /*</function>*/
  exports.newGuid = newGuid;

  /*<function name="format">*/
  /**
   * 格式化字符串
   *
   * @param {string} template 字符模板
   * @param {Object} json 数据
   * @return {string} 返回格式化结果
   '''<example>'''
   * @example format:array
    ```js
    console.log(app.format('#{0} - #{1}', [2, 3]));
    // > 2 - 3
    ```
   * @example format:object
    ```js
    console.log(app.format('#{x} - #{y}', {x: 1, y: 2}));
    // > 1 - 2
    ```
   * @example format:field is undefined
    ```js
    console.log(app.format('[#{z}]', {x: 1, y: 2}));
    // > []
    ```
   '''</example>'''
   */
  function format(template, json) {
    return template.replace(/#\{(.*?)\}/g, function(all, key) {
      return json && (key in json) ? json[key] : "";
    });
  }
  /*</function>*/
  exports.format = format;

  /*<function name="queryFrom">*/
  /**
   * 拼装 URL 调用参数
   *
   * @param {Object} data 参数
   * @return {string} 返回拼接的字符串
   * @example queryFrom:field is null
    ```js
    console.log(app.queryFrom({x: 1, y: null}));
    // x=1
    ```
   * @example queryFrom:field is undefined
    ```js
    console.log(app.queryFrom({x: 1, y: undefined}));
    // x=1
    ```
   * @example queryFrom:field is space
    ```js
    console.log(app.queryFrom({x: " "}));
    // x=%20
    ```
   */
  function queryFrom(data) {
    var result = [];
    Object.keys(data).forEach(function(key) {
      if (data[key] === null || data[key] === undefined) {
        return;
      }
      result.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    });
    return result.join('&');
  }
  /*</function>*/
  exports.queryFrom = queryFrom;
})();
