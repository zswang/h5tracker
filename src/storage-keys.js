/*<function name="storageKeys">*/
var storageKeys = (function () {
  var prefix = 'h5t@';
  return {
    userId: prefix + 'global/userId',
    scanTime: prefix + 'global/scanTime',

    sessionId: prefix + 'global/sessionId',
    sessionBirthday: prefix + 'global/sessionBirthday',
    sessionLiveTime: prefix + 'global/sessionLiveTime',

    storageList: prefix + 'storageList/#{name}/#{app}/#{tracker}',
    storageListTS: prefix + 'storageList/#{name}/ts/#{app}/#{tracker}',
  };
})();
/*</function>*/
exports.storageKeys = storageKeys;