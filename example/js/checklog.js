var name = 'h5t';

var storage = [];
Object.keys(localStorage).forEach(function(key) {
  if (key.indexOf(name) === 0 && (/log$/i).test(key)) {
    var data = localStorage[key];
    if (typeof data !== 'Object') {
      try {
        storage = JSON.parse(data);
      } catch (e) {}
    }
  }
});

var html = jhtmls.render(document.querySelector('#templateLog').innerHTML, {
  data: storage
});
document.querySelector('.content').innerHTML = html;
