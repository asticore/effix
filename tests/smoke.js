// Cross-browser smoke test for dist/effix.min.js + dist/effix.min.css.
// Builds one page from every feature's docs examples, then checks that each feature
// starts (data-efx-ready), lazy features start after scrolling, there are no page
// errors, and Effix.destroy() tears everything down.
// Usage: node tests/smoke.js [chromium|firefox|webkit ...]   (default: chromium)
const fs = require('fs');
const path = require('path');
const playwright = require('playwright');

const root = path.join(__dirname, '..');
const FEAT = path.join(root, 'src', 'features');
const page = path.join(root, 'dist', '_smoke.html');
const names = fs.readdirSync(FEAT).filter(f => /^[\w-]+\.js$/.test(f) && !f.endsWith('.meta.js')).map(f => f.slice(0, -3));

const feats = names.map(n => {
  const src = fs.readFileSync(path.join(FEAT, n + '.js'), 'utf8');
  const selector = (src.match(/selector:\s*(['"`])([\s\S]*?)\1/) || [])[2];
  const meta = fs.existsSync(path.join(FEAT, n + '.meta.js')) ? require(path.join(FEAT, n + '.meta.js')) : {};
  const ex = (meta.examples || [])[0];
  return { n, selector, html: ex ? (typeof ex === 'string' ? ex : ex.html) : '' };
});

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../docs/vendor/shine.min.css"><link rel="stylesheet" href="effix.min.css">
<style>.box{min-height:320px;position:relative}</style></head><body>
${feats.map(f => `<section class="box" id="s-${f.n}">${f.html}</section><div style="height:200px"></div>`).join('\n')}
<script src="effix.min.js"></script></body></html>`;
fs.writeFileSync(page, html);

async function run(name) {
  // PW_EXECUTABLE lets a preinstalled browser be used when Playwright's own download is missing.
  const browser = await playwright[name].launch(process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {});
  const p = await browser.newPage({ viewport: { width: 1100, height: 750 } });
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file://' + page);
  await p.waitForFunction(() => window.Effix);

  // Scroll through the page so lazy features start.
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); }
    scrollTo(0, 0);
  });
  await p.waitForTimeout(300);

  const fails = [];
  for (const f of feats) {
    if (!f.html) { fails.push(`${f.n}: no docs example`); continue; }
    if (!f.selector) { fails.push(`${f.n}: no selector found`); continue; }
    const res = await p.evaluate(({ id, sel, n }) => {
      const els = [...document.querySelectorAll(`#${id} ${sel.split(',').join(`, #${id} `)}`)];
      if (!els.length) return 'example has no element matching ' + sel;
      const bad = els.filter(e => !(e.getAttribute('data-efx-ready') || '').split(' ').includes(n));
      return bad.length ? `${bad.length}/${els.length} not started` : '';
    }, { id: 's-' + f.n, sel: f.selector, n: f.n });
    if (res) fails.push(`${f.n}: ${res}`);
  }

  const featureList = await p.evaluate(() => Effix.features());
  for (const n of names) if (!featureList.includes(n)) fails.push(`${n}: missing from bundle`);

  // destroy() must remove every running instance
  const left = await p.evaluate(() => { Effix.destroy(document); return document.querySelectorAll('[data-efx-ready]').length; });
  if (left) fails.push(`destroy left ${left} element(s) running`);
  // and init() must bring them back without errors
  await p.evaluate(() => Effix.init());

  errors.forEach(e => fails.push(`page error: ${e}`));
  await browser.close();
  return fails;
}

(async () => {
  const browsers = process.argv.slice(2).length ? process.argv.slice(2) : ['chromium'];
  let failed = 0;
  for (const b of browsers) {
    const fails = await run(b);
    if (fails.length) { failed++; console.error(`✗ ${b}\n  ` + fails.join('\n  ')); }
    else console.log(`✓ ${b}: ${feats.length} features start, destroy + re-init clean`);
  }
  fs.rmSync(page, { force: true });
  process.exit(failed ? 1 : 0);
})();
