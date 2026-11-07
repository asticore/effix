#!/usr/bin/env node
/* Effix docs generator — zero dependencies.
   Reads src/features/*.meta.js, src/charts/*.meta.js + dist/sizes.json and writes docs/index.html:
   a static, crawlable portal styled with Shine, where every demo is live and editable.
   Feature names, options and sizes come from the source, so the docs cannot drift.
   Usage: node docs.js */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIRS = ['features', 'charts'].map(d => path.join(ROOT, 'src', d));
const pkg = require('./package.json');
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const kb = n => (n / 1024).toFixed(1) + ' KB';
const warnings = [];

const sizesFile = path.join(ROOT, 'dist', 'sizes.json');
const sizes = fs.existsSync(sizesFile) ? JSON.parse(fs.readFileSync(sizesFile, 'utf8')) : { core: 0, chartLib: 0, bundles: {}, features: {} };
const B = n => sizes.bundles[n] || 0;
const effectsKB = B('effix.min.js') + B('effix.min.css');
const chartsKB = B('effix-charts.min.js') + B('effix-charts.min.css');

const GROUPS = ['Animations', 'Images', 'Scroll', 'Text', 'Buttons & borders', 'Background', 'Pointer', 'Sections', 'Components', 'Page', 'Time', 'Charts', 'Diagrams'];
const found = DIRS.flatMap(dir => fs.readdirSync(dir).filter(f => /^[a-z][\w-]*\.js$/.test(f) && !f.endsWith('.meta.js')).map(f => ({ name: f.slice(0, -3), dir })));
const names = found.map(f => f.name).sort();
const dirOf = n => found.find(f => f.name === n).dir;

// Normalise rows: accept [a,b,c] arrays or {name/attr/class, default, desc} objects.
const row = (r, keys) => (Array.isArray(r) ? r : keys.map(k => r[k] ?? r[k === 'name' ? 'attr' : k] ?? r[k === 'name' ? 'class' : k] ?? ''));
const feats = names.map(name => {
  const file = path.join(dirOf(name), name + '.meta.js');
  if (!fs.existsSync(file)) { warnings.push(`${name}: missing ${name}.meta.js`); return { name, title: name, group: 'Other', summary: '', classes: [], options: [], vars: [], examples: [] }; }
  delete require.cache[file];
  const m = require(file);
  return {
    name,
    title: m.title || name,
    group: m.group || 'Other',
    summary: m.summary || '',
    notes: m.notes || '',
    dataFormat: m.dataFormat || '',
    extend: (m.extend || []).map(r => row(r, ['kind', 'signature', 'desc'])),
    extendExample: m.extendExample || '',
    classes: (m.classes || []).map(r => row(r, ['name', 'desc'])),
    options: (m.options || []).map(r => row(r, ['name', 'default', 'desc'])),
    vars: (m.vars || []).map(r => row(r, ['name', 'default', 'desc'])),
    events: (m.events || []).map(r => row(r, ['name', 'desc'])),
    examples: (m.examples || []).map(e => (typeof e === 'string' ? { html: e } : e)),
  };
}).sort((a, b) => {
  const ga = GROUPS.indexOf(a.group), gb = GROUPS.indexOf(b.group);
  return (ga < 0 ? 99 : ga) - (gb < 0 ? 99 : gb) || a.title.localeCompare(b.title);
});
const groups = [...new Set(feats.map(f => f.group))];

const sizeOf = n => { const s = sizes.features[n]; return s ? s.js + s.css : 0; };
const table = (head, rows, codeCols = [0]) => rows.length ? `<div class="overflow-x-auto"><table class="table table-sm">
<thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead>
<tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td>${codeCols.includes(i) && c !== '' ? `<code>${esc(c)}</code>` : esc(c)}</td>`).join('')}</tr>`).join('\n')}</tbody></table></div>` : '';

let exId = 0;
const example = (f, ex) => {
  const id = `ex-${f.name}-${++exId}`;
  return `<div class="card card-flat overflow-hidden">
  <div class="demo p-6" id="${id}">${ex.html}</div>
  <div class="border-t bg-surface-2">
    <div class="flex items-center justify-between gap-2 px-3 py-2">
      <label class="text-sm text-muted" for="${id}-code">${esc(ex.label || 'HTML — edit to try options live')}</label>
      <button class="btn btn-sm btn-outline efx-copy" type="button" data-efx-target="#${id}-code">Copy</button>
    </div>
    <textarea class="code-edit" id="${id}-code" data-demo="${id}" spellcheck="false" rows="${Math.min(14, ex.html.split('\n').length + 1)}">${esc(ex.html)}</textarea>
  </div>
</div>`;
};

const featureSection = f => {
  if (!f.examples.length) warnings.push(`${f.name}: no examples`);
  const s = sizes.features[f.name];
  return `<section id="f-${f.name}" class="stack gap-4 feature" aria-labelledby="h-${f.name}">
  <header class="stack gap-1">
    <div class="cluster gap-2"><h3 id="h-${f.name}" class="text-2xl font-bold m-0">${esc(f.title)}</h3>
      <span class="badge tone-neutral"><code>${esc(f.name)}</code></span>
      ${s ? `<span class="badge tone-success" title="gzip, JS + CSS, on top of the core">${kb(s.js + s.css)}</span>` : ''}</div>
    <p class="m-0 text-muted">${f.summary}</p>
  </header>
  ${f.examples.map(ex => example(f, ex)).join('\n')}
  ${f.notes ? `<p class="text-sm m-0">${f.notes}</p>` : ''}
  ${f.dataFormat ? `<div class="alert tone-info"><span class="alert-title">Data format</span><div class="stack gap-2 text-sm">${f.dataFormat}</div></div>` : ''}
  ${table(['Class', 'What it does'], f.classes)}
  ${table(['Attribute', 'Default', 'Values'], f.options, [0, 1])}
  ${table(['CSS variable', 'Default', 'Controls'], f.vars, [0, 1])}
  ${table(['Event', 'When'], f.events)}
  ${f.extend.length ? `<h4 class="text-lg font-semibold m-0">Extend it</h4>${table(['Kind', 'Signature', 'What it is'], f.extend, [0, 1])}` : ''}
  ${f.extendExample ? code(`ext-${f.name}`, f.extendExample) : ''}
</section>`;
};

const code = (id, s) => `<div class="flex items-stretch gap-2"><pre class="flex-1 min-w-0 m-0 bg-surface-2 border rounded-lg p-3 text-sm overflow-x-auto" id="${id}" tabindex="0"><code>${esc(s)}</code></pre><button class="btn btn-outline btn-sm flex-none self-start efx-copy" type="button" data-efx-target="#${id}">Copy</button></div>`;

const CDN = 'https://cdn.jsdelivr.net/gh/asticore';
const install = `<link rel="stylesheet" href="${CDN}/shine@main/dist/shine.min.css">
<script src="${CDN}/effix@main/dist/effix.auto.min.js" defer></script>`;
const installBundle = `<link rel="stylesheet" href="${CDN}/shine@main/dist/shine.min.css">
<link rel="stylesheet" href="${CDN}/effix@main/dist/effix.min.css">
<script src="${CDN}/effix@main/dist/effix.min.js" defer></script>

<!-- optional: charts & funnels add-on -->
<link rel="stylesheet" href="${CDN}/effix@main/dist/effix-charts.min.css">
<script src="${CDN}/effix@main/dist/effix-charts.min.js" defer></script>`;
const installPick = `<script src="${CDN}/effix@main/dist/effix.core.min.js" defer></script>
<link rel="stylesheet" href="${CDN}/effix@main/dist/effix.core.min.css">
<!-- then one tag per feature you use -->
<script src="${CDN}/effix@main/dist/features/confetti.min.js" defer></script>
<script src="${CDN}/effix@main/dist/features/particles.min.js" defer></script>
<link rel="stylesheet" href="${CDN}/effix@main/dist/features/particles.min.css">`;

const apiRows = [
  ['Effix.init(root?)', 'Scan root (default document) and start every feature found. Safe to call again — already-running elements are skipped.'],
  ['Effix.destroy(root?, name?)', 'Stop features on root and its children, removing listeners, timers and injected nodes.'],
  ['Effix.refresh(el, name?)', 'destroy + init: re-reads data-efx-* after you change them.'],
  ['Effix.observe(target?)', 'Watch the DOM: new nodes start automatically, removed nodes are cleaned up. Same as <html data-efx-observe>.'],
  ['Effix.disconnect()', 'Stop watching the DOM.'],
  ['Effix.define(feature)', 'Register your own feature ({ name, selector, defaults, init }).'],
  ['Effix.features()', 'Names of the features in this build.'],
  ['Effix.isMounted(el, name)', 'Whether a feature is running on el.'],
  ['Effix.setData(el | selector, data)', 'Push new data into a chart or odometer (fires efx:data). See Data input.'],
  ['Effix.add(kind, name, impl)', 'Register a plugin: particle shape, divider shape, ambient mode, easing, chart format… See Extend.'],
  ['Effix.get(kind, name) · Effix.list(kind)', 'Look up / list registered plugins.'],
  ['Effix.charts', 'The chart toolkit (chart, COMMON, scales, nice, linePath, arcPath, s, axes…) for building your own chart types.'],
];
const knobRows = [
  ['<html data-efx-manual>', 'Do not auto-start. Call Effix.init() yourself.'],
  ['<html data-efx-observe>', 'Auto-start features on elements added later (SPAs, visual editors, infinite lists).'],
  ['<html data-efx-reduce>', 'Force reduced motion (static end states), e.g. for an editor canvas or a user toggle.'],
  ['<html data-efx-margin="200px">', 'How early lazy features (particles…) start before entering the viewport.'],
  ['data-efx-skip', 'On any element: observe() ignores nodes inside it.'],
  ['data-efx-media="(min-width: 768px)"', 'On any element: its effects run only while the media query matches, and start/stop as the viewport crosses it (e.g. particles on desktop only).'],
  ['window.EffixConfig = { auto:false, observe:true }', 'Same switches from JS, set before the script loads.'],
];

const DATA_SHAPE = `{
  "labels": ["Mon", "Tue", "Wed"],          // x categories / slices / stages
  "series": [
    { "name": "Web",    "data": [12, 19, 7] },
    { "name": "Mobile", "data": [9, 14, 11], "color": "#db2777" }   // color optional
  ]
}`;
const DATA_WAYS = [
  ['Attribute, comma list', 'Quickest. Separate series with <code>|</code>, name them with <code>data-efx-names</code>.', `<div class="efx-chart-bar"
     data-efx-data="12,19,7|9,14,11"
     data-efx-labels="Mon|Tue|Wed"
     data-efx-names="Web|Mobile"></div>`],
  ['Attribute, JSON', 'Any shape above. Wrap the attribute in single quotes so the JSON can use double quotes.', `<div class="efx-chart-line"
     data-efx-data='{"labels":["Mon","Tue","Wed"],
                     "series":[{"name":"Web","data":[12,19,7]}]}'></div>`],
  ['Inline JSON script', 'Best for bigger data or server-rendered pages: put a JSON script inside the chart element.', `<div class="efx-chart-pie">
  <script type="application/json">
    { "labels": ["Organic", "Direct", "Social"],
      "series": [{ "name": "Visits", "data": [4200, 2800, 900] }] }
  </script>
</div>`],
  ['A Shine table', 'Keep one accessible table and chart it. First column = labels, header row = series names.', `<table class="table" id="sales">
  <thead><tr><th>Month</th><th>2025</th><th>2026</th></tr></thead>
  <tbody><tr><td>Jan</td><td>42</td><td>51</td></tr> …</tbody>
</table>
<div class="efx-chart-bar" data-efx-source="#sales"></div>`],
  ['JavaScript', 'Load or update data at any time (API calls, live dashboards). Same shape as above.', `// any time after Effix has loaded
Effix.setData('#sales-chart', {
  labels: ['Jan', 'Feb', 'Mar'],
  series: [{ name: 'Revenue', data: [42, 58, 51] }],
});

// e.g. from your API
fetch('/api/sales').then(r => r.json())
  .then(data => Effix.setData('#sales-chart', data));`],
];
const DATA_DEMO = `document.querySelector('#data-demo-btn').onclick = () =>
  Effix.setData('#data-demo', {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    series: [
      { name: 'Web',    data: Array.from({ length: 5 }, () => 5 + Math.round(Math.random() * 25)) },
      { name: 'Mobile', data: Array.from({ length: 5 }, () => 5 + Math.round(Math.random() * 25)) },
    ],
  });`;
const EXTEND_DEMO = fs.readFileSync(path.join(ROOT, 'docs', 'extend-demo.js'), 'utf8').trim();
// Plugin kinds, collected from every feature's meta `extend` field.
const EXT_KINDS = [];
for (const f of feats) for (const [kind, sig] of f.extend) {
  const r = EXT_KINDS.find(x => x[0] === kind);
  if (r) { if (!r[1].includes(f.title)) r[1] += ', ' + f.title; } else EXT_KINDS.push([kind, f.title, sig]);
}
EXT_KINDS.push(['format', 'All charts (data-efx-format)', '(value, options) => string']);
EXT_KINDS.push(['Effix.define', 'Your own feature or chart type', '{ name, selector, lazy?, defaults, init(el, opts) → cleanup }']);

const toc = groups.map(g => `<li><span class="text-xs font-semibold uppercase text-muted">${esc(g)}</span><ul class="stack gap-1 mt-1">${feats.filter(f => f.group === g).map(f => `<li><a href="#f-${f.name}">${esc(f.title)}</a></li>`).join('')}</ul></li>`).join('\n');


/* Playground data: docs/playground-data.js (features, classes, typed options, first example). */
const pgOptions = f => {
  const out = [], seen = new Set();
  const add = (attr, def, desc) => {
    if (seen.has(attr)) return; seen.add(attr);
    const d = String(def ?? '').trim();
    const type = /^(true|false)$/.test(d) ? 'bool' : /^-?\d+(\.\d+)?$/.test(d) ? 'number'
      : (attr === 'data-efx-data' || /^[\[{]/.test(d)) ? 'json' : 'text';
    out.push({ attr, def: d, desc: String(desc ?? '').replace(/<[^>]+>/g, '').trim(), type });
  };
  for (const [a, def, desc] of f.options) {
    const parts = String(a).split('/').map(x => x.trim());
    parts.forEach((p, i) => {
      if (i === 0) { if (/^data-efx-[\w-]+$/.test(p)) add(p, def, desc); }
      else if (/^[\w-]+$/.test(p) && /^data-efx-[\w-]+$/.test(parts[0])) add('data-efx-' + p, def, desc);
    });
  }
  return out;
};
const pgClasses = f => {
  const all = [...new Set(f.classes.flatMap(c => String(c[0]).match(/(?<![\w-])efx-[a-z0-9]+(?:-[a-z0-9]+)*(?![\w-])/g) || []))];
  return all.filter(c => !all.some(o => o !== c && c.startsWith(o + '-') && !f.name.startsWith('chart-')));
};
const pgFeatures = feats.map(f => ({
  name: f.name, title: f.title, group: f.group,
  kind: dirOf(f.name).endsWith('charts') ? 'chart' : 'effect',
  classes: pgClasses(f), options: pgOptions(f), example: (f.examples[0] || {}).html || '',
})).filter(f => f.classes.length);
fs.writeFileSync(path.join(ROOT, 'docs', 'playground-data.js'),
  '/* generated by docs.js — do not edit */\nwindow.EFX_PLAYGROUND = ' + JSON.stringify({ features: pgFeatures }, null, 1) + ';\n');

const picker = feats.map(f => `<label class="flex items-center gap-2 text-sm"><input type="checkbox" class="checkbox" name="feat" value="${f.name}" data-kind="${(sizes.features[f.name] || {}).kind || 'effect'}" data-size="${sizeOf(f.name)}" checked> ${esc(f.title)} <span class="text-muted ml-auto">${kb(sizeOf(f.name))}</span></label>`).join('\n');

const html = `<!doctype html>
<html lang="en" data-theme="auto">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Effix — JavaScript effects for Shine CSS</title>
<meta name="description" content="Effix adds particles, parallax, scroll reveals, tilt, magnetic buttons, rotating borders, shape dividers, carousels, popups and more with plain classes. Pairs with Shine CSS. ${kb(effectsKB)} gzipped, only features on the page start. Interactive SVG charts and funnels as a ${kb(chartsKB)} add-on.">
<link rel="canonical" href="https://asticore.github.io/effix/docs/">
<link rel="icon" href="logo.svg">
<link rel="stylesheet" href="vendor/shine.min.css">
<link rel="stylesheet" href="../dist/effix.all.min.css">
<style>
.text-gradient{background-image:linear-gradient(100deg,var(--sh-primary),var(--sh-accent));-webkit-background-clip:text;background-clip:text;color:transparent}
.code-edit{display:block;inline-size:100%;border:0;border-block-start:1px solid var(--sh-border);background:var(--sh-surface);color:var(--sh-text);font:13px/1.55 var(--sh-font-mono);padding:.75rem 1rem;resize:vertical;tab-size:2;white-space:pre}
.code-edit:focus{outline:2px solid var(--sh-primary);outline-offset:-2px}
.demo{position:relative;min-block-size:8rem}
.hero{position:relative;overflow:hidden}
@media (min-width:1024px){.sticky-lg{position:sticky;top:5rem;align-self:start}.scroll-lg{max-block-size:calc(100vh - 7rem);overflow:auto}}
.feature{scroll-margin-top:5rem}
</style>
<script>
${EXTEND_DEMO}
</script>
<script defer src="../dist/effix.all.min.js"></script>
<script defer src="portal.js"></script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<div class="efx-progress" data-efx-position="top" aria-label="Page progress"></div>

<header class="sticky top-0 z-50 bg-surface border-b efx-sticky">
  <nav class="navbar container mx-auto max-w-7xl" aria-label="Main">
    <a class="navbar-brand flex items-center gap-2" href="#top"><img src="logo.svg" alt="" width="28" height="28">Effix</a>
    <ul class="navbar-nav efx-scrollspy">
      <li><a href="#start">Start</a></li>
      <li><a href="#how">How it works</a></li>
      <li><a href="#build">Custom build</a></li>
      <li><a href="#editors">Editors &amp; API</a></li>
      <li><a href="#data">Data</a></li>
      <li><a href="#extend">Extend</a></li>
      <li><a href="#features">Features</a></li>
    </ul>
    <div class="navbar-end flex items-center gap-2">
      <label class="sr-only" for="page-theme">Page theme</label>
      <select class="select input-sm" id="page-theme"><option value="auto">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select>
      <a class="btn btn-sm" href="playground.html">Playground</a>
      <a class="btn btn-sm btn-outline" href="https://github.com/asticore/effix">GitHub</a>
    </div>
  </nav>
</header>

<main id="main">
<section id="top" class="hero section efx-particles" data-efx-count="60" data-efx-links="true" data-efx-opacity="0.5" aria-labelledby="h-hero">
  <div class="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
    <div class="lg:col-span-7 stack gap-6">
      <p class="cluster gap-2">
        <span class="badge badge-solid">effects ${kb(effectsKB)} gzip</span>
        <span class="badge tone-accent">charts add-on ${kb(chartsKB)}</span>
        <span class="badge tone-success">core ${kb(sizes.core)}</span>
        <span class="badge tone-neutral">MIT · 0 dependencies</span>
      </p>
      <h1 id="h-hero" class="text-5xl md:text-6xl font-extrabold tracking-tight m-0"><span class="text-gradient">Effix</span><span class="sr-only"> JavaScript effects</span></h1>
      <p class="lead m-0 max-w-xl">Effects that need JavaScript — <span class="efx-typed" data-efx-words="particles|parallax|tilt|magnetic buttons|rotating borders|shape dividers|carousels|popups">particles</span> — applied with classes, tuned with <code>data-efx-*</code>.</p>
      <p class="text-muted m-0 max-w-xl">Built as the partner of <a href="https://asticore.github.io/shine/docs/">Shine CSS</a>: Shine handles styling with zero JS, Effix adds behaviour and reads Shine's tokens, so <code>tone-*</code> classes and <code>--sh-primary</code> recolour every effect. Only the features found on the page start; heavy ones wait until they scroll into view.</p>
      <div class="cluster gap-3">
        <a class="btn btn-lg efx-magnetic efx-ripple" href="#start">Get started</a>
        <a class="btn btn-lg btn-outline efx-border-spin" href="#features">Browse ${feats.length} features</a>
      </div>
    </div>
    <div class="lg:col-span-5">
      <div class="card efx-tilt efx-spotlight" data-efx-glare="true">
        <div class="card-body stack">
          <p class="label m-0">Drop it in your &lt;head&gt;</p>
          ${code('install-code', install)}
          <p class="text-sm text-muted m-0">Then add classes: <code>efx-reveal</code>, <code>efx-particles</code>, <code>efx-tilt</code>…</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="start" class="section" aria-labelledby="h-start">
  <div class="container mx-auto max-w-7xl stack gap-6">
    <header class="stack gap-2 max-w-3xl"><p class="label m-0 text-primary">Quick start</p><h2 id="h-start" class="text-3xl md:text-4xl font-bold tracking-tight m-0">Four ways in</h2></header>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card"><div class="card-body stack"><h3 class="card-title m-0">1 · Auto-loader <span class="badge tone-success">easiest</span></h3><p class="text-sm m-0">One tag. It looks for <code>efx-*</code> classes and fetches only those features' files (and the charts add-on only if a chart is on the page). Add <code>class="efx-confetti"</code> to a button and the confetti file loads by itself. With <code>&lt;html data-efx-observe&gt;</code> it also loads files for elements added later.</p>${code('q-cdn', install)}</div></div>
      <div class="card"><div class="card-body stack"><h3 class="card-title m-0">2 · Pick files yourself</h3><p class="text-sm m-0">The core plus one tag per feature, from <code>dist/features/</code>. Tag order doesn't matter.</p>${code('q-pick', installPick)}</div></div>
      <div class="card"><div class="card-body stack"><h3 class="card-title m-0">3 · Everything bundled</h3><p class="text-sm m-0">All effects in one file, plus the optional charts add-on. Best when a site uses many features on every page.</p>${code('q-bundle', installBundle)}</div></div>
      <div class="card"><div class="card-body stack"><h3 class="card-title m-0">4 · npm / bundlers</h3><p class="text-sm m-0">Import the bundle, or only the features you use from the ES sources.</p>${code('q-esm', `npm i effix shine-css\n\nimport 'shine-css';\nimport 'effix/css';\nimport Effix from 'effix';            // all effects\n\n// or pick features:\nimport { define, init } from 'effix/core';\nimport reveal from 'effix/features/reveal';\nimport funnel from 'effix/charts/chart-funnel';\ndefine(reveal, funnel);\ninit();`)}</div></div>
    </div>
  </div>
</section>

<section id="how" class="section pt-0" aria-labelledby="h-how">
  <div class="container mx-auto max-w-7xl stack gap-6">
    <header class="stack gap-2 max-w-3xl"><p class="label m-0 text-primary">How it works</p><h2 id="h-how" class="text-3xl md:text-4xl font-bold tracking-tight m-0">Class turns it on, attributes tune it, variables style it</h2>
    <p class="lead m-0">Every feature follows one pattern, so learning one teaches all.</p></header>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      ${code('how-code', `<button class="btn tone-accent efx-border-spin efx-magnetic"
        data-efx-strength="0.4"
        style="--efx-border-speed:2s">
  Subscribe
</button>`)}
      <ol class="stack gap-3 m-0">
        <li><strong><code>efx-*</code> class</strong> — picks the feature. Combine as many as you like on one element.</li>
        <li><strong><code>data-efx-*</code> attributes</strong> — behaviour options (counts, speeds, triggers). Each feature lists its options below.</li>
        <li><strong><code>--efx-*</code> CSS variables</strong> — visual knobs. Colors fall back to Shine: <code>--efx-color → --sh-tone → --sh-primary</code>.</li>
        <li><strong>Speed</strong> — on load the core asks the page once per feature (<code>querySelectorAll</code>); missing features cost nothing. Canvas features are lazy and every loop pauses off-screen and in hidden tabs.</li>
        <li><strong>Accessible by default</strong> — reduced-motion users get the static end state, pointer effects only run with a mouse, content is visible without JS.</li>
      </ol>
    </div>
    <h3 class="text-xl font-bold m-0">Page-level switches</h3>
    ${table(['Switch', 'Effect'], knobRows)}
  </div>
</section>

<section id="build" class="section pt-0" aria-labelledby="h-build">
  <div class="container mx-auto max-w-7xl stack gap-6">
    <header class="stack gap-2 max-w-3xl"><p class="label m-0 text-primary">Custom build</p><h2 id="h-build" class="text-3xl md:text-4xl font-bold tracking-tight m-0">Ship only what you use</h2>
    <p class="lead m-0">The full build is already small, but you can cut it further. Tick features to see the size and the command.</p></header>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <fieldset class="card lg:col-span-2"><legend class="sr-only">Features</legend><div class="card-body">
        <div class="cluster gap-2 mb-3"><button class="btn btn-sm btn-outline" type="button" id="pick-all">All</button><button class="btn btn-sm btn-outline" type="button" id="pick-none">None</button></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2" id="picker">${picker}</div>
      </div></fieldset>
      <div class="card"><div class="card-body stack">
        <p class="m-0">Estimated: <strong id="pick-size" data-core="${sizes.core}" data-chartlib="${sizes.chartLib}">${kb(effectsKB + chartsKB)}</strong> gzip</p>
        ${code('pick-cmd', 'node build.js')}
        ${code('pick-esm', `import { define, init } from 'effix/core';`)}
      </div></div>
    </div>
  </div>
</section>

<section id="editors" class="section pt-0" aria-labelledby="h-editors">
  <div class="container mx-auto max-w-7xl stack gap-6">
    <header class="stack gap-2 max-w-3xl"><p class="label m-0 text-primary">Visual editors &amp; SPAs</p><h2 id="h-editors" class="text-3xl md:text-4xl font-bold tracking-tight m-0">Works when the page keeps changing</h2>
    <p class="lead m-0">Page builders re-render blocks constantly. Turn on <code>observe</code> and Effix starts new blocks and cleans up removed ones. When the editor changes an option, call <code>Effix.refresh(el)</code>.</p></header>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      ${code('ed-code', `<html data-efx-observe>
…
// editor changed a block's settings
block.dataset.efxCount = 80;
Effix.refresh(block);

// editor canvas: keep things still while editing
document.documentElement.toggleAttribute('data-efx-reduce', editing);`)}
      ${table(['Method', 'What it does'], apiRows)}
    </div>
  </div>
</section>

<section id="data" class="section pt-0" aria-labelledby="h-data">
  <div class="container mx-auto max-w-7xl stack gap-6">
    <header class="stack gap-2 max-w-3xl"><p class="label m-0 text-primary">Data input</p><h2 id="h-data" class="text-3xl md:text-4xl font-bold tracking-tight m-0">Five ways to give a chart its data</h2>
    <p class="lead m-0">Every chart reads the same data shape. Pick whichever way suits your page; when several are present the order of precedence is: JavaScript update → table → <code>data-efx-data</code> → inline JSON.</p></header>
    <div class="card"><div class="card-body stack">
      <h3 class="card-title m-0">The shape</h3>
      ${code('data-shape', DATA_SHAPE)}
      <p class="text-sm m-0">Shorthands also work: a flat list <code>[12, 19, 7]</code>, a list of series <code>[[3,5,2],[4,1,6]]</code>, or label/value pairs <code>[{"label":"Mon","value":12}]</code>. Charts with special data (scatter, candlestick, timeline, flow, heatmap calendar) show their own format in a blue <em>Data format</em> box below.</p>
    </div></div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      ${DATA_WAYS.map((w, i) => `<div class="card"><div class="card-body stack"><h3 class="card-title m-0">${i + 1} · ${w[0]}</h3><p class="text-sm m-0">${w[1]}</p>${code('data-way-' + i, w[2])}</div></div>`).join('\n      ')}
    </div>
    <div class="card"><div class="card-body stack">
      <div class="cluster justify-between"><h3 class="card-title m-0">Live: update from JavaScript</h3><button class="btn btn-sm" type="button" id="data-demo-btn">Randomise data</button></div>
      <div id="data-demo" class="efx-chart-bar" data-efx-data="[[12,19,7,24,15],[9,14,11,18,21]]" data-efx-names="Web|Mobile" data-efx-labels="Mon|Tue|Wed|Thu|Fri"></div>
      ${code('data-demo-code', DATA_DEMO)}
    </div></div>
  </div>
</section>

<section id="extend" class="section pt-0" aria-labelledby="h-extend">
  <div class="container mx-auto max-w-7xl stack gap-6">
    <header class="stack gap-2 max-w-3xl"><p class="label m-0 text-primary">Extend Effix</p><h2 id="h-extend" class="text-3xl md:text-4xl font-bold tracking-tight m-0">Add your own shapes, modes, formats, charts and features</h2>
    <p class="lead m-0">Built-in variants are registered through the same plugin registry you use, so yours are first-class: register once, then use the name in <code>data-efx-*</code> like any built-in.</p></header>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div class="stack gap-4">
        <p class="m-0">Register before Effix starts with <code>window.EffixConfig.extend</code> (put it in a normal <code>&lt;script&gt;</code> above the Effix tags), or any time later with <code>Effix.add(…)</code> followed by <code>Effix.refresh(el)</code>. This page runs exactly the code on the right:</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card efx-particles" data-efx-shape="heart" data-efx-count="30" data-efx-size-min="9" data-efx-size-max="16" data-efx-interact="attract" style="min-height:180px"><div class="card-body"><strong>Custom particle shape</strong><br><code>data-efx-shape="heart"</code></div></div>
          <div class="card"><div class="card-body stack gap-2"><strong>Custom chart type + format</strong><div class="efx-chart-dots" data-efx-data="420,610,380,720,560" data-efx-labels="A|B|C|D|E" data-efx-format="gbp" data-efx-height="150"></div></div></div>
        </div>
        ${table(['Kind', 'Used by', 'Signature'], EXT_KINDS, [0, 2])}
      </div>
      ${code('extend-code', EXTEND_DEMO)}
    </div>
  </div>
</section>

<section id="features" class="section pt-0" aria-labelledby="h-features">
  <div class="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-8">
    <nav class="sticky-lg scroll-lg" aria-label="Features"><ul class="stack gap-3 efx-scrollspy" data-efx-offset="120">${toc}</ul></nav>
    <div class="lg:col-span-3 stack gap-12 min-w-0">
      <header class="stack gap-2"><p class="label m-0 text-primary">Features</p><h2 id="h-features" class="text-3xl md:text-4xl font-bold tracking-tight m-0">${feats.length} features</h2>
      <p class="m-0 text-muted">Every demo is live: edit the HTML under it and the demo restarts with your options.</p></header>
      ${feats.map(featureSection).join('\n')}
    </div>
  </div>
</section>
</main>

<footer class="border-t py-8">
  <div class="container mx-auto max-w-7xl cluster justify-between gap-4 text-sm text-muted">
    <span>Effix v${esc(pkg.version)} · MIT · pairs with <a href="https://github.com/asticore/shine">Shine CSS</a></span>
    <button class="btn btn-sm btn-ghost efx-totop" type="button" aria-label="Back to top">↑ Top</button>
  </div>
</footer>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, 'docs', 'index.html'), html);

/* Playground page (docs/playground.html); behaviour lives in docs/playground.js. */
const playground = `<!doctype html>
<html lang="en" data-theme="auto">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Effix Playground — try effects and charts live</title>
<meta name="description" content="Combine Effix effects and charts on a button, card, hero or chart box, tweak every option, and copy the HTML.">
<link rel="icon" href="logo.svg">
<link rel="stylesheet" href="vendor/shine.min.css">
<link rel="stylesheet" href="../dist/effix.all.min.css">
<style>
.pg{display:grid;grid-template-columns:minmax(300px,380px) minmax(0,1fr);gap:1.25rem;align-items:start;padding-block:1.25rem}
.pg-controls{position:sticky;top:4.5rem;max-block-size:calc(100vh - 5.5rem);overflow:auto;display:flex;flex-direction:column;gap:1rem;padding-inline-end:.25rem}
.pg-main{display:flex;flex-direction:column;gap:1rem;min-width:0}
.pg-sec{border:1px solid var(--sh-border);border-radius:var(--sh-radius,.5rem);background:var(--sh-surface);padding:.75rem;margin:0}
.pg-sec>legend,.pg-sec>summary{font-weight:600;font-size:.875rem;padding-inline:.25rem}
.pg-sec>summary{cursor:pointer;padding:0}
.pg-list{max-block-size:19rem;overflow:auto;margin-block-start:.5rem;display:flex;flex-direction:column;gap:.15rem}
.pg-group{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--sh-text-muted,var(--sh-muted,#6b7280));margin:.5rem 0 .15rem}
.pg-row{display:flex;align-items:center;gap:.5rem;font-size:.875rem;min-block-size:1.75rem}
.pg-row .select{margin-inline-start:auto;inline-size:auto;max-inline-size:9.5rem}
.pg-opt{display:grid;grid-template-columns:1fr;gap:.15rem;margin-block-start:.6rem;font-size:.8rem}
.pg-opt code{font-size:.75rem}
.pg-opt .hint{color:var(--sh-text-muted,var(--sh-muted,#6b7280));font-size:.72rem;line-height:1.3}
.pg-opts{display:flex;flex-direction:column}
.pg-toolbar{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:center}
.pg-viewport{border:1px dashed var(--sh-border);border-radius:var(--sh-radius,.5rem);padding:.5rem;overflow:auto;background:var(--sh-surface-2,var(--sh-bg))}
#pg-frame{max-inline-size:100%;margin-inline:auto;resize:horizontal;overflow:auto;min-inline-size:240px}
#pg-stage{background:var(--sh-bg);color:var(--sh-text);padding:1.5rem;min-block-size:14rem;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;border-radius:var(--sh-radius,.5rem);position:relative;overflow:hidden}
#pg-stage>*{max-inline-size:100%}
#pg-stage>.efx-chart-box,#pg-stage>[data-pg-fill]{inline-size:100%}
.pg-code{margin:0;background:var(--sh-surface-2,var(--sh-bg));border:1px solid var(--sh-border);border-radius:.5rem;padding:.75rem;font:13px/1.5 var(--sh-font-mono,monospace);overflow:auto;white-space:pre;max-block-size:22rem}
.pg-status{min-block-size:1.25rem;font-size:.8rem}
.pg-status.err{color:var(--sh-danger,#dc2626)}
.pg-status.ok{color:var(--sh-success,#16a34a)}
.pg-textarea{font:12px/1.4 var(--sh-font-mono,monospace);inline-size:100%;min-block-size:7rem;resize:vertical}
@media (max-width:900px){.pg{grid-template-columns:1fr}.pg-controls{position:static;max-block-size:none}}
</style>
<script src="../dist/effix.all.min.js" defer></script>
<script src="playground-data.js" defer></script>
<script src="playground.js" defer></script>
</head>
<body>
<a class="skip-link" href="#pg-stage">Skip to preview</a>
<header class="sticky top-0 z-50 bg-surface border-b">
  <nav class="navbar container mx-auto max-w-7xl" aria-label="Main">
    <a class="navbar-brand flex items-center gap-2" href="index.html"><img src="logo.svg" alt="" width="28" height="28">Effix</a>
    <ul class="navbar-nav">
      <li><a href="index.html">&larr; Docs</a></li>
      <li><a href="playground.html" aria-current="page">Playground</a></li>
    </ul>
    <div class="navbar-end flex items-center gap-2">
      <label class="sr-only" for="page-theme">Page theme</label>
      <select class="select input-sm" id="page-theme"><option value="auto">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select>
      <a class="btn btn-sm btn-outline" href="https://github.com/asticore/effix">GitHub</a>
    </div>
  </nav>
</header>
<main class="container mx-auto max-w-7xl px-4">
<div class="pg">
  <form class="pg-controls" id="pg-controls" aria-label="Playground controls" onsubmit="return false">
    <fieldset class="pg-sec"><legend>1 &middot; Base element</legend>
      <label class="sr-only" for="pg-base">Base element</label>
      <select class="select" id="pg-base"></select>
    </fieldset>
    <fieldset class="pg-sec"><legend>2 &middot; Effects &amp; charts</legend>
      <label class="sr-only" for="pg-search">Search effects</label>
      <input class="input input-sm" type="search" id="pg-search" placeholder="Search effects…" autocomplete="off">
      <div class="pg-list" id="pg-list" role="group" aria-label="Effects"></div>
    </fieldset>
    <div class="pg-opts" id="pg-opts" aria-label="Options"></div>
  </form>
  <div class="pg-main">
    <div class="pg-toolbar" role="toolbar" aria-label="Preview settings">
      <span class="btn-group" role="group" aria-label="Preview theme">
        <button type="button" class="btn btn-sm btn-outline" data-pg-theme="light" aria-pressed="false">Light</button>
        <button type="button" class="btn btn-sm btn-outline" data-pg-theme="dark" aria-pressed="false">Dark</button>
      </span>
      <span class="btn-group" role="group" aria-label="Viewport width">
        <button type="button" class="btn btn-sm btn-outline" data-pg-width="375" aria-pressed="false">Mobile</button>
        <button type="button" class="btn btn-sm btn-outline" data-pg-width="768" aria-pressed="false">Tablet</button>
        <button type="button" class="btn btn-sm btn-outline" data-pg-width="full" aria-pressed="true">Full</button>
      </span>
      <label class="flex items-center gap-2 text-sm"><input class="checkbox" type="checkbox" id="pg-reduce"> Reduced motion</label>
      <button type="button" class="btn btn-sm ml-auto" id="pg-replay">Replay</button>
    </div>
    <div class="pg-viewport"><div id="pg-frame"><div id="pg-stage" aria-label="Preview"></div></div></div>
    <p class="pg-status" id="pg-status" role="status" aria-live="polite"></p>
    <section class="stack gap-2" aria-labelledby="pg-h-html">
      <div class="flex items-center justify-between gap-2"><h2 class="text-lg font-semibold m-0" id="pg-h-html">HTML</h2>
        <button type="button" class="btn btn-sm efx-copy" data-efx-target="#pg-code-html">Copy</button></div>
      <pre class="pg-code" id="pg-code-html" tabindex="0"></pre>
    </section>
    <section class="stack gap-2" aria-labelledby="pg-h-head">
      <div class="flex items-center justify-between gap-2"><h2 class="text-lg font-semibold m-0" id="pg-h-head">Tags for your &lt;head&gt;</h2>
        <button type="button" class="btn btn-sm efx-copy" data-efx-target="#pg-code-head">Copy</button></div>
      <pre class="pg-code" id="pg-code-head" tabindex="0"></pre>
    </section>
    <section class="stack gap-2" aria-labelledby="pg-h-share">
      <h2 class="text-lg font-semibold m-0" id="pg-h-share">Share</h2>
      <div class="flex gap-2"><label class="sr-only" for="pg-share">Share link</label>
        <input class="input input-sm flex-1" id="pg-share" readonly>
        <button type="button" class="btn btn-sm efx-copy" data-efx-target="#pg-share">Copy link</button></div>
    </section>
  </div>
</div>
</main>
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, 'docs', 'playground.html'), playground);

/* README: regenerate the feature table and size badges between markers. */
const readmeFile = path.join(ROOT, 'README.md');
let readme = fs.readFileSync(readmeFile, 'utf8');
const cls = f => f.classes.map(c => '`' + String(c[0]).replace(/`/g, '') + '`').join(' ');
const rows = feats.map(f => `| ${f.group} | ${f.title} | ${cls(f)} | ${kb(sizeOf(f.name))} |`);
readme = readme.replace(/<!-- features:start[^>]*-->[\s\S]*?<!-- features:end -->/, m =>
  m.slice(0, m.indexOf('-->') + 3) + `\n| Group | Feature | Classes | gzip |\n|---|---|---|---|\n${rows.join('\n')}\n<!-- features:end -->`);
const sh = t => encodeURIComponent(t).replace(/-/g, '--'); // shields.io: '-' separates fields
const badge = (label, value, color, alt) => `<img src="https://img.shields.io/badge/${sh(label)}-${sh(value)}-${color}" alt="${alt}">`;
readme = readme.replace(/<!-- badges:start[^>]*-->[\s\S]*?<!-- badges:end -->/, m => m.slice(0, m.indexOf('-->') + 3) +
  badge('effects', `${kb(effectsKB)} gzip`, '4f46e5', `Effects: ${kb(effectsKB)} gzip`) + '\n  ' +
  badge('charts add-on', `${kb(chartsKB)} gzip`, 'db2777', `Charts add-on: ${kb(chartsKB)} gzip`) + '\n  ' +
  badge('core', kb(sizes.core), '16a34a', `Core ${kb(sizes.core)}`) + '\n  <!-- badges:end -->');
fs.writeFileSync(readmeFile, readme);
warnings.forEach(w => console.warn('warn:', w));
console.log(`docs/index.html  ${feats.length} features, ${(html.length / 1024).toFixed(1)} KB`);
