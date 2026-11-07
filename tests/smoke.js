// Cross-browser smoke test for dist/effix.all.min.js + .css (effects + charts).
// Builds one page from every feature's docs examples, then checks that each feature
// starts (data-efx-ready), lazy features start after scrolling, there are no page
// errors, and Effix.destroy() tears everything down.
// Usage: node tests/smoke.js [chromium|firefox|webkit ...]   (default: chromium)
const fs = require('fs');
const path = require('path');
const playwright = require('playwright');

const root = path.join(__dirname, '..');
const DIRS = ['features', 'charts'].map(d => path.join(root, 'src', d));
const page = path.join(root, 'dist', '_smoke.html');
const found = DIRS.flatMap(dir => fs.readdirSync(dir).filter(f => /^[a-z][\w-]*\.js$/.test(f) && !f.endsWith('.meta.js')).map(f => ({ n: f.slice(0, -3), dir })));
const names = found.map(f => f.n);

const feats = found.map(({ n, dir }) => {
  const src = fs.readFileSync(path.join(dir, n + '.js'), 'utf8');
  const selector = (src.match(/selector:\s*(['"`])([\s\S]*?)\1/) || [])[2];
  const meta = fs.existsSync(path.join(dir, n + '.meta.js')) ? require(path.join(dir, n + '.meta.js')) : {};
  const ex = (meta.examples || [])[0];
  return { n, selector, skip: meta.smoke === false, stateful: meta.smokeRefresh === false, html: ex ? (typeof ex === 'string' ? ex : ex.html) : '' };
});

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../docs/vendor/shine.min.css"><link rel="stylesheet" href="effix.all.min.css">
<style>.box{min-height:320px;position:relative}</style></head><body>
${feats.map(f => `<section class="box" id="s-${f.n}">${f.html}</section><div style="height:200px"></div>`).join('\n')}
<script src="effix.all.min.js"></script></body></html>`;
fs.writeFileSync(page, html);

// Scroll every demo section into view and wait (up to 3 s each) until its feature has started.
// Lazy features (particles, charts) only start near the viewport, and IntersectionObserver timing
// differs between engines, so a fixed scroll delay is flaky (WebKit in CI).
async function visitAll(p) {
  for (const f of feats) {
    if (f.skip || !f.html || !f.selector) continue;
    await p.evaluate(id => document.getElementById(id).scrollIntoView({ block: 'center' }), 's-' + f.n);
    await p.waitForFunction(({ id, sel, n }) => {
      const els = [...document.querySelectorAll(`#${id} ${sel.split(',').join(`, #${id} `)}`)];
      return els.length && els.every(e => (e.getAttribute('data-efx-ready') || '').split(' ').includes(n));
    }, { id: 's-' + f.n, sel: f.selector, n: f.n }, { timeout: 3000 }).catch(() => {});
  }
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(200);
}

async function run(name, reducedMotion = 'no-preference') {
  // PW_EXECUTABLE lets a preinstalled browser be used when Playwright's own download is missing.
  const browser = await playwright[name].launch(process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {});
  const p = await browser.newPage({ viewport: { width: 1100, height: 750 }, reducedMotion });
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  // Network failures (example images/videos on remote hosts) are not code errors.
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await p.goto('file://' + page);
  await p.waitForFunction(() => window.Effix);

  await visitAll(p);

  const fails = [];
  for (const f of feats) {
    if (f.skip) continue;
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

  // refresh() twice must not duplicate injected UI or throw
  // (lazy features re-queue on refresh, so compare after scrolling again)
  // Wait for finite Web Animations (e.g. an outgoing title sliding away) to finish before counting nodes.
  const settle = () => p.waitForFunction(() => !document.getAnimations || document.getAnimations()
    .filter(a => a.playState === 'running' && (a.effect && a.effect.getComputedTiming().endTime !== Infinity)).length === 0, null, { timeout: 3000 }).catch(() => {});
  const count = async () => { await settle(); return p.evaluate(() => [...document.querySelectorAll('section.box')].map(s => s.id + ':' + s.querySelectorAll('*').length)); };
  const before = await count();
  await p.evaluate(() => { Effix.refresh(document); Effix.refresh(document); });
  await visitAll(p);
  const after = await count();
  // Features whose DOM depends on live state (e.g. which section is in view) opt out with meta.smokeRefresh = false.
  const stateful = new Set(feats.filter(f => f.stateful).map(f => 's-' + f.n));
  before.forEach((b, i) => { if (b !== after[i] && !stateful.has(b.split(':')[0])) fails.push(`refresh changed DOM: ${b} -> ${after[i].split(':')[1]}`); });

  // destroy() must remove every running instance
  const left = await p.evaluate(() => { Effix.destroy(document); return document.querySelectorAll('[data-efx-ready]').length; });
  if (left) fails.push(`destroy left ${left} element(s) running`);
  // and init() must bring them back without errors
  await p.evaluate(() => Effix.init());

  errors.forEach(e => fails.push(`page error: ${e}`));
  await browser.close();
  return fails;
}

// Auto-loader: a plain page with effix.auto.min.js must fetch only the files it uses.
async function autoCheck(name) {
  const file = path.join(root, 'dist', '_auto.html');
  fs.writeFileSync(file, `<!doctype html><html><head><meta charset="utf-8"><script src="effix.auto.min.js" defer></script></head><body>
<div class="efx-particles" style="height:120px"></div><button class="efx-confetti">x</button><div class="efx-chart-bar" data-efx-data="3,5,2"></div></body></html>`);
  const browser = await playwright[name].launch(process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {});
  const p = await browser.newPage();
  const fails = [], reqs = [];
  p.on('pageerror', e => fails.push('auto page error: ' + e));
  p.on('request', r => reqs.push(r.url()));
  await p.goto('file://' + file);
  await p.waitForFunction(() => document.querySelectorAll('[data-efx-ready]').length >= 3, null, { timeout: 5000 }).catch(() => fails.push('auto-loader: features did not start'));
  const extra = reqs.filter(u => /features\//.test(u) && !/(particles|confetti)\.min\./.test(u));
  if (extra.length) fails.push('auto-loader fetched unused files: ' + extra.join(', '));
  await browser.close();
  fs.rmSync(file, { force: true });
  return fails;
}

(async () => {
  const browsers = process.argv.slice(2).length ? process.argv.slice(2) : ['chromium'];
  let failed = 0;
  for (const b of browsers) {
    for (const rm of ['no-preference', 'reduce']) {
      const fails = await run(b, rm);
      if (fails.length) { failed++; console.error(`✗ ${b} (motion: ${rm})\n  ` + fails.join('\n  ')); }
      else console.log(`✓ ${b} (motion: ${rm}): ${feats.length} features start, refresh, destroy + re-init clean`);
    }
    const af = await autoCheck(b);
    if (af.length) { failed++; console.error(`✗ ${b} auto-loader\n  ` + af.join('\n  ')); }
    else console.log(`✓ ${b}: auto-loader fetches only the features on the page`);
  }
  fs.rmSync(page, { force: true });
  process.exit(failed ? 1 : 0);
})();
