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

const GROUPS = ['Scroll', 'Text', 'Buttons & borders', 'Background', 'Pointer', 'Sections', 'Components', 'Time', 'Charts'];
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
  ${table(['Class', 'What it does'], f.classes)}
  ${table(['Attribute', 'Default', 'Values'], f.options, [0, 1])}
  ${table(['CSS variable', 'Default', 'Controls'], f.vars, [0, 1])}
  ${table(['Event', 'When'], f.events)}
</section>`;
};

const code = (id, s) => `<div class="flex items-stretch gap-2"><pre class="flex-1 min-w-0 m-0 bg-surface-2 border rounded-lg p-3 text-sm overflow-x-auto" id="${id}" tabindex="0"><code>${esc(s)}</code></pre><button class="btn btn-outline btn-sm flex-none self-start efx-copy" type="button" data-efx-target="#${id}">Copy</button></div>`;

const CDN = 'https://cdn.jsdelivr.net/gh/asticore';
const install = `<link rel="stylesheet" href="${CDN}/shine@main/dist/shine.min.css">
<link rel="stylesheet" href="${CDN}/effix@main/dist/effix.min.css">
<script src="${CDN}/effix@main/dist/effix.min.js" defer></script>

<!-- optional: charts & funnels add-on -->
<link rel="stylesheet" href="${CDN}/effix@main/dist/effix-charts.min.css">
<script src="${CDN}/effix@main/dist/effix-charts.min.js" defer></script>`;

const apiRows = [
  ['Effix.init(root?)', 'Scan root (default document) and start every feature found. Safe to call again — already-running elements are skipped.'],
  ['Effix.destroy(root?, name?)', 'Stop features on root and its children, removing listeners, timers and injected nodes.'],
  ['Effix.refresh(el, name?)', 'destroy + init: re-reads data-efx-* after you change them.'],
  ['Effix.observe(target?)', 'Watch the DOM: new nodes start automatically, removed nodes are cleaned up. Same as <html data-efx-observe>.'],
  ['Effix.disconnect()', 'Stop watching the DOM.'],
  ['Effix.define(feature)', 'Register your own feature ({ name, selector, defaults, init }).'],
  ['Effix.features()', 'Names of the features in this build.'],
  ['Effix.isMounted(el, name)', 'Whether a feature is running on el.'],
];
const knobRows = [
  ['<html data-efx-manual>', 'Do not auto-start. Call Effix.init() yourself.'],
  ['<html data-efx-observe>', 'Auto-start features on elements added later (SPAs, visual editors, infinite lists).'],
  ['<html data-efx-reduce>', 'Force reduced motion (static end states), e.g. for an editor canvas or a user toggle.'],
  ['<html data-efx-margin="200px">', 'How early lazy features (particles…) start before entering the viewport.'],
  ['data-efx-skip', 'On any element: observe() ignores nodes inside it.'],
  ['window.EffixConfig = { auto:false, observe:true }', 'Same switches from JS, set before the script loads.'],
];

const toc = groups.map(g => `<li><span class="text-xs font-semibold uppercase text-muted">${esc(g)}</span><ul class="stack gap-1 mt-1">${feats.filter(f => f.group === g).map(f => `<li><a href="#f-${f.name}">${esc(f.title)}</a></li>`).join('')}</ul></li>`).join('\n');

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
      <li><a href="#features">Features</a></li>
    </ul>
    <div class="navbar-end flex items-center gap-2">
      <label class="sr-only" for="page-theme">Page theme</label>
      <select class="select input-sm" id="page-theme"><option value="auto">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select>
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
    <header class="stack gap-2 max-w-3xl"><p class="label m-0 text-primary">Quick start</p><h2 id="h-start" class="text-3xl md:text-4xl font-bold tracking-tight m-0">Three ways in</h2></header>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="card"><div class="card-body stack"><h3 class="card-title m-0">1 · CDN</h3><p class="text-sm m-0">Shine for styling, Effix for behaviour. The script is <code>defer</code>red and starts itself.</p>${code('q-cdn', install)}</div></div>
      <div class="card"><div class="card-body stack"><h3 class="card-title m-0">2 · npm</h3><p class="text-sm m-0">Full bundle; auto-starts on import.</p>${code('q-npm', `npm i effix shine-css\n\nimport 'shine-css';\nimport 'effix/css';\nimport Effix from 'effix';`)}</div></div>
      <div class="card"><div class="card-body stack"><h3 class="card-title m-0">3 · Pick features</h3><p class="text-sm m-0">Import only what you use from the ES sources — bundlers drop the rest.</p>${code('q-esm', `import { define, init } from 'effix/core';\nimport reveal from 'effix/features/reveal';\nimport tilt from 'effix/features/tilt';\n\ndefine(reveal, tilt);\ninit();`)}</div></div>
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
warnings.forEach(w => console.warn('warn:', w));
console.log(`docs/index.html  ${feats.length} features, ${(html.length / 1024).toFixed(1)} KB`);
