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
  'effix.min.js': 52 * 1024, 'effix.min.css': 12 * 1024,
  'effix-charts.min.js': 36 * 1024, 'effix-charts.min.css': 5 * 1024,
  'effix-diagrams.min.js': 24 * 1024, 'effix-diagrams.min.css': 5 * 1024,
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
const CHART_DIR = scanDir('charts');
// diagram-* ship as their own add-on so chart-only pages don't download them
const CHARTS = CHART_DIR.filter(f => !f.name.startsWith('diagram-'));
const DIAGRAMS = CHART_DIR.filter(f => f.name.startsWith('diagram-'));
const ALL = [...EFFECTS, ...CHARTS, ...DIAGRAMS];
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
  feats.some(f => f.dir === 'charts') ? `import * as chartKit from './charts/_lib.js'; api.charts = chartKit;` : '',
  `if (typeof window !== 'undefined') window.Effix = api;`,
  boot ? `autoBoot();` : '',
  `export default api;`,
].join('\n');

/* Entry for an add-on bundle: core is NOT included. Features import '../core.js',
   which the plugin below maps to thin wrappers around the page's window.Effix. */
const addonEntry = (feats, kit = true) => [
  ...feats.map(f => `import ${ident(f)} from './${f.dir}/${f.name}.js';`),
  kit ? `import * as chartKit from './charts/_lib.js';` : '',
  `const defs = [${feats.map(ident).join(', ')}];`,
  kit ? `if (window.Effix) window.Effix.charts = chartKit; else window.EffixChartKit = chartKit;` : '',
  `if (window.Effix) window.Effix.define(defs);`,
  `else (window.EffixPending = window.EffixPending || []).push(...defs);`,
].join('\n');
const CORE_API = ['define', 'init', 'destroy', 'refresh', 'observe', 'disconnect', 'options', 'isMounted', 'features', 'add', 'get', 'list', 'setData',
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
  const write = (f, s) => { fs.mkdirSync(path.dirname(path.join(OUT, f)), { recursive: true }); fs.writeFileSync(path.join(OUT, f), s); written[f] = s; };

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
    // diagrams add-on (tree, flow, sequence, cycle, fishbone)
    const bD = banner(' Diagrams', DIAGRAMS);
    write('effix-diagrams.js', bD + await bundle(addonEntry(DIAGRAMS), { minify: false, plugins: [useHostCore] }));
    write('effix-diagrams.min.js', bD + await bundle(addonEntry(DIAGRAMS), { plugins: [useHostCore] }));
    const cssD = wrapCss(bD, [CHART_CSS, ...cssFor(DIAGRAMS)]);
    write('effix-diagrams.css', cssD);
    write('effix-diagrams.min.css', bD + minCss(cssD));
    // core only + auto-loader (plain pages: load just the feature files the page uses)
    const bK = banner(' core', []);
    write('effix.core.min.js', bK + await bundle(entry([])));
    write('effix.core.min.css', bK + minCss(wrapCss(bK, [BASE_CSS])));
    const manifest = {
      effects: Object.fromEntries(EFFECTS.map(f => {
        const sel = (fs.readFileSync(path.join(SRC, f.dir, f.name + '.js'), 'utf8').match(/selector:\s*(['"`])([\s\S]*?)\1/) || [])[2] || `.efx-${f.name}`;
        // Also match every documented class (CSS-only ones like efx-bounce efx-hover), so their CSS loads too.
        const metaFile = path.join(SRC, f.dir, f.name + '.meta.js');
        const extra = fs.existsSync(metaFile) ? (require(metaFile).classes || [])
          .map(c => String(Array.isArray(c) ? c[0] : c.name || '').trim()).filter(c => /^efx-[\w-]+$/.test(c)).map(c => '.' + c) : [];
        // plus every top-level efx-* class the feature's CSS styles (not injected __parts or -pending states)
        for (const m of cssOf(path.join(SRC, f.dir, f.name + '.css')).matchAll(/\.(efx-[a-z0-9-]+)(?![\w-])/g))
          if (!m[1].includes('__') && !/-(pending|on|active)$/.test(m[1])) extra.push('.' + m[1]);
        return [f.name, [[...new Set([...sel.split(',').map(x => x.trim()), ...extra])].join(','), !!cssOf(path.join(SRC, f.dir, f.name + '.css'))]];
      })),
      charts: CHARTS.map(f => `.efx-${f.name}`).join(','),
      diagrams: DIAGRAMS.map(f => `.efx-${f.name}`).join(','),
    };
    const autoEntry = `import api, { autoBoot } from './core.js';\nimport { autoload } from './loader.js';\nwindow.Effix = api;\nautoload(api, ${JSON.stringify(manifest)});\nautoBoot();\nexport default api;`;
    write('effix.auto.min.js', banner(' auto-loader', []) + await bundle(autoEntry));
    // one file per effect, for <script> tags or the auto-loader (registers into window.Effix)
    for (const f of EFFECTS) {
      const b = banner(` ${f.name}`, []);
      write(`features/${f.name}.min.js`, b + await bundle(addonEntry([f], false), { plugins: [useHostCore] }));
      const c = cssOf(path.join(SRC, f.dir, f.name + '.css'));
      if (c) write(`features/${f.name}.min.css`, b + minCss(wrapCss(b, [c])));
    }
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
      bundles: Object.fromEntries(Object.entries(written).filter(([f]) => f.includes('.min.') && !f.startsWith('features/')).map(([f, s]) => [f, gz(s)])),
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
    if (!f.includes('.min.') || f.startsWith('features/')) continue;
    const z = gz(s);
    const limit = !custom && BUDGET[f];
    console.log(`  ${f.padEnd(22)} ${kb(s.length).padStart(8)}  ${kb(z).padStart(8)} gzip${limit ? `  (budget ${kb(limit)})` : ''}`);
    if (limit && z > limit) { console.error(`  ^ over budget`); over = true; }
  }
  if (over) process.exit(1);
})().catch(err => { console.error(err.message || err); process.exit(1); });
