/* Docs portal behaviour: theme switch, live-editable demos, custom-build picker. */
(function () {
  var html = document.documentElement;
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
                set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  // Theme
  var sel = document.getElementById('page-theme');
  var saved = store.get('effix-page-theme');
  if (saved) html.setAttribute('data-theme', saved);
  if (sel) {
    sel.value = html.getAttribute('data-theme') || 'auto';
    sel.addEventListener('change', function () { html.setAttribute('data-theme', sel.value); store.set('effix-page-theme', sel.value); });
  }

  // Live demos: editing the textarea re-renders the demo and restarts its effects.
  var timers = {};
  document.addEventListener('input', function (e) {
    var ta = e.target;
    if (!ta.matches || !ta.matches('textarea[data-demo]')) return;
    var id = ta.getAttribute('data-demo');
    clearTimeout(timers[id]);
    timers[id] = setTimeout(function () {
      var demo = document.getElementById(id);
      if (!demo || !window.Effix) return;
      Effix.destroy(demo);
      demo.innerHTML = ta.value;
      Effix.init(demo);
    }, 300);
  });

  // Custom build picker
  var picker = document.getElementById('picker');
  if (!picker) return;
  var boxes = [].slice.call(picker.querySelectorAll('input[name=feat]'));
  var sizeEl = document.getElementById('pick-size');
  var cmd = document.querySelector('#pick-cmd code');
  var esm = document.querySelector('#pick-esm code');
  var core = +sizeEl.getAttribute('data-core');
  var chartLib = +sizeEl.getAttribute('data-chartlib') || 0;
  var kb = function (n) { return (n / 1024).toFixed(1) + ' KB'; };
  var ident = function (n) { return n.replace(/-(\w)/g, function (_, c) { return c.toUpperCase(); }); };
  function update() {
    var on = boxes.filter(function (b) { return b.checked; });
    var total = on.reduce(function (s, b) { return s + +b.getAttribute('data-size'); }, core);
    if (on.some(function (b) { return b.getAttribute('data-kind') === 'chart'; })) total += chartLib; // shared chart toolkit, counted once
    var names = on.map(function (b) { return b.value; });
    sizeEl.textContent = kb(total);
    cmd.textContent = on.length === boxes.length ? 'node build.js' : 'node build.js --only=' + names.join(',');
    esm.textContent = "import { define, init } from 'effix/core';\n" +
      on.map(function (b) { var n = b.value; return 'import ' + ident(n) + " from 'effix/" + (b.getAttribute('data-kind') === 'chart' ? 'charts/' : 'features/') + n + "';"; }).join('\n') +
      '\n\ndefine(' + names.map(ident).join(', ') + ');\ninit();';
  }
  picker.addEventListener('change', update);
  document.getElementById('pick-all').addEventListener('click', function () { boxes.forEach(function (b) { b.checked = true; }); update(); });
  document.getElementById('pick-none').addEventListener('click', function () { boxes.forEach(function (b) { b.checked = false; }); update(); });
  update();
})();
