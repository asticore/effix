#!/usr/bin/env node
/* Effix build. Runtime has zero dependencies; esbuild is used only to bundle/minify.
   Three bundles, so pages only download what they use:
     effix.min.js / .css          core + effects            (window.Effix, auto-boots)
     effix-charts.min.js / .css   chart add-on              (needs effix.min.js on the page, any order)
     effix.all.min.js / .css      core + effects + charts   (one file)
   Plus readable (non-.min) versions, ES modules (effix.esm.js, effix.all.esm.js) and
   dist/sizes.json (gzip bytes per feature) used by the docs.
   Usage:
     node build.js                               full build -> dist/
     node build.js --only=reveal,chart-bar       custom single bundle -> dist/custom/effix.min.js
     node build.js --exclude=cursor,popup        custom single bundle
     node build.js --only=reveal --out=public/js  choose output folder */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const esbuild = require('esbuild');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const pkg = require('./package.json');
const BUDGET = { // gzip bytes
  'effix.min.js': 34 * 1024, 'effix.min.css': 8 * 1024,
  'effix-charts.min.js': 20 * 1024, 'effix-charts.min.css': 3 * 1024,
};

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v = ''] = a.replace(/^--/, '').split('=');
  return [k, v];
}));
const list = v => (v ? v.split(',').map(s => s.trim()).filter(Boolean) : null);
const only = list(args.only);
const exclude = list(args.exclude);
const custom = !!(only || exclude);
const OUT = path.resolve(ROOT, args.out || (custom ? 'dist/custom' : 'dist'));

const scanDir = dir => fs.readdirSync(path.join(SRC, dir))
  .filter(f => /^[a-z][\w-]*\.js$/.test(f) && !f.endsWith('.meta.js'))
  .map(f => ({ name: f.slice(0, -3), dir })).sort((a, b) => a.name.localeCompare(b.name));
const EFFECTS = scanDir('features');
const CHARTS = scanDir('charts');
const ALL = [...EFFECTS, ...CHARTS];
const unknown = [...(only || []), ...(exclude || [])].filter(n => !ALL.some(f => f.name === n));
if (unknown.length) { console.error(`Unknown feature(s): ${unknown.join(', ')}\nAvailable: ${ALL.map(f => f.name).join(', ')}`); process.exit(1); }
const pick = fs0 => fs0.filter(f => (!only || only.includes(f.name)) && (!exclude || !exclude.includes(f.name)));

const gz = s => zlib.gzipSync(s, { level: 9 }).length;
const kb = n => (n / 1024).toFixed(1) + ' KB';
const ident = f => 'f_' + f.name.replace(/-/g, '_');
const TARGET = ['es2019', 'chrome90', 'firefox88', 'safari14'];

/* Entry for a standalone bundle (includes core). */
const entry = (feats, boot = true) => [
  `import api, { define, autoBoot } from './core.js';`,
  ...feats.map(f => `import ${ident(f)} from './${f.dir}/${f.name}.js';`),
  feats.length ? `define(${feats.map(ident).join(', ')});` : '',
  `if (typeof window !== 'undefined') window.Effix = api;`,
  boot ? `autoBoot();` : '',
  `export default api;`,
].join('\n');

/* Entry for an add-on bundle: core is NOT included. Features import '../core.js',
   which the plugin below maps to thin wrappers around the page's window.Effix. */
const addonEntry = feats => [
  ...feats.map(f => `import ${ident(f)} from './${f.dir}/${f.name}.js';`),
  `const defs = [${feats.map(ident).join(', ')}];`,
  `if (window.Effix) window.Effix.define(defs);`,
  `else (window.EffixPending = window.EffixPending || []).push(...defs);`,
].join('\n');
const CORE_API = ['define', 'init', 'destroy', 'refresh', 'observe', 'disconnect', 'options', 'isMounted', 'features',
  'motionOK', 'finePointer', 'cssVar', 'themeColor', 'on', 'rafThrottle', 'onVisible', 'onScroll'];
const useHostCore = {
  name: 'effix-host-core',
  setup(b) {
    b.onResolve({ filter: /(^|\/)core\.js$/ }, () => ({ path: 'effix-core', namespace: 'effix-host' }));
    b.onLoad({ filter: /.*/, namespace: 'effix-host' }, () => ({
      contents: CORE_API.map(n => `export const ${n} = (...a) => window.Effix.${n}(...a);`).join('\n') + '\nexport default window.Effix;',
      loader: 'js',
    }));
  },
};

const bundle = (contents, { format = 'iife', minify = true, plugins = [] } = {}) => esbuild.build({
  stdin: { contents, resolveDir: SRC, sourcefile: 'effix-entry.js', loader: 'js' },
  bundle: true, write: false, format, minify, target: TARGET, plugins, legalComments: 'none',
}).then(r => r.outputFiles[0].text.replace(/__VERSION__/g, pkg.version));

const cssOf = f => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim() : '');
const cssFor = feats => feats.map(f => cssOf(path.join(SRC, f.dir, f.name + '.css'))).filter(Boolean);
// `@layer shine, effix;` pins effix above Shine whatever order the stylesheets load in.
const wrapCss = (banner, parts) => `${banner}@layer shine, effix;\n@layer effix {\n${parts.join('\n\n')}\n}\n`;
const minCss = css => esbuild.transformSync(css, { loader: 'css', minify: true, target: ['chrome90', 'firefox88', 'safari14'] }).code;

const BASE_CSS = cssOf(path.join(SRC, 'css', 'base.css'));
const CHART_CSS = cssOf(path.join(SRC, 'charts', '_lib.css'));
const banner = (what, feats) => `/*! Effix${what} v${pkg.version} | MIT | https://github.com/asticore/effix${custom ? ` | ${feats.map(f => f.name).join(',')}` : ''} */\n`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const written = {};
  const write = (f, s) => { fs.writeFileSync(path.join(OUT, f), s); written[f] = s; };

  if (custom) {
    const feats = pick(ALL);
    const hasCharts = feats.some(f => f.dir === 'charts');
    const b = banner('', feats);
    write('effix.js', b + await bundle(entry(feats), { minify: false }));
    write('effix.min.js', b + await bundle(entry(feats)));
    write('effix.esm.js', b + await bundle(entry(feats), { format: 'esm' }));
    const css = wrapCss(b, [BASE_CSS, ...(hasCharts ? [CHART_CSS] : []), ...cssFor(feats)]);
    write('effix.css', css);
    write('effix.min.css', b + minCss(css));
  } else {
    // effects
    const bE = banner('', EFFECTS);
    write('effix.js', bE + await bundle(entry(EFFECTS), { minify: false }));
    write('effix.min.js', bE + await bundle(entry(EFFECTS)));
    write('effix.esm.js', bE + await bundle(entry(EFFECTS), { format: 'esm' }));
    const cssE = wrapCss(bE, [BASE_CSS, ...cssFor(EFFECTS)]);
    write('effix.css', cssE);
    write('effix.min.css', bE + minCss(cssE));
    // charts add-on
    const bC = banner(' Charts', CHARTS);
    write('effix-charts.js', bC + await bundle(addonEntry(CHARTS), { minify: false, plugins: [useHostCore] }));
    write('effix-charts.min.js', bC + await bundle(addonEntry(CHARTS), { plugins: [useHostCore] }));
    const cssC = wrapCss(bC, [CHART_CSS, ...cssFor(CHARTS)]);
    write('effix-charts.css', cssC);
    write('effix-charts.min.css', bC + minCss(cssC));
    // everything
    const bA = banner(' (all)', ALL);
    write('effix.all.min.js', bA + await bundle(entry(ALL)));
    write('effix.all.esm.js', bA + await bundle(entry(ALL), { format: 'esm' }));
    write('effix.all.min.css', bA + minCss(wrapCss(bA, [BASE_CSS, CHART_CSS, ...cssFor(ALL)])));

    // per-feature sizes (JS on top of core; charts include their share of the chart toolkit once)
    const core = gz(await bundle(entry([])));
    const chartLib = gz(await bundle(`import { chart } from './charts/_lib.js'; window.x = chart;`)) + gz(minCss(CHART_CSS));
    const sizes = {
      version: pkg.version, core, chartLib,
      bundles: Object.fromEntries(Object.entries(written).filter(([f]) => f.includes('.min.')).map(([f, s]) => [f, gz(s)])),
      features: {},
    };
    for (const f of ALL) {
      let js;
      if (f.dir === 'charts') js = Math.max(0, gz(await bundle(addonEntry([f]), { plugins: [useHostCore] })) - (chartLib - gz(minCss(CHART_CSS))));
      else js = Math.max(0, gz(await bundle(entry([f]))) - core);
      const c = cssOf(path.join(SRC, f.dir, f.name + '.css'));
      sizes.features[f.name] = { js, css: c ? gz(minCss(c)) : 0, kind: f.dir === 'charts' ? 'chart' : 'effect' };
    }
    write('sizes.json', JSON.stringify(sizes, null, 2) + '\n');
  }

  const feats = custom ? pick(ALL) : ALL;
  console.log(`Effix v${pkg.version}  ${feats.length} feature(s)  -> ${path.relative(ROOT, OUT) || '.'}`);
  let over = false;
  for (const [f, s] of Object.entries(written)) {
    if (!f.includes('.min.')) continue;
    const z = gz(s);
    const limit = !custom && BUDGET[f];
    console.log(`  ${f.padEnd(22)} ${kb(s.length).padStart(8)}  ${kb(z).padStart(8)} gzip${limit ? `  (budget ${kb(limit)})` : ''}`);
    if (limit && z > limit) { console.error(`  ^ over budget`); over = true; }
  }
  if (over) process.exit(1);
})().catch(err => { console.error(err.message || err); process.exit(1); });
