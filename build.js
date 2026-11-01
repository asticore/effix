#!/usr/bin/env node
/* Effix build. Runtime has zero dependencies; esbuild is used only to bundle/minify.
   Writes:
     dist/effix.js        readable IIFE  (window.Effix, auto-boots)
     dist/effix.min.js    minified IIFE
     dist/effix.esm.js    minified ES module (default export = Effix, auto-boots)
     dist/effix.css       readable CSS, wrapped in @layer effix
     dist/effix.min.css   minified CSS
     dist/sizes.json      gzip bytes per feature (JS + CSS), used by the docs
   Usage:
     node build.js                               full build
     node build.js --only=reveal,particles       custom build -> dist/custom/
     node build.js --exclude=cursor,popup        custom build -> dist/custom/
     node build.js --only=reveal --out=public/js  choose output folder */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const esbuild = require('esbuild');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const FEAT = path.join(SRC, 'features');
const pkg = require('./package.json');
const BUDGET = { js: 22 * 1024, css: 7 * 1024 }; // gzip bytes, full build

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v = ''] = a.replace(/^--/, '').split('=');
  return [k, v];
}));
const list = v => (v ? v.split(',').map(s => s.trim()).filter(Boolean) : null);
const only = list(args.only);
const exclude = list(args.exclude);
const custom = !!(only || exclude);
const OUT = path.resolve(ROOT, args.out || (custom ? 'dist/custom' : 'dist'));

const all = fs.readdirSync(FEAT).filter(f => /^[\w-]+\.js$/.test(f) && !f.endsWith('.meta.js')).map(f => f.slice(0, -3)).sort();
const unknown = [...(only || []), ...(exclude || [])].filter(n => !all.includes(n));
if (unknown.length) { console.error(`Unknown feature(s): ${unknown.join(', ')}\nAvailable: ${all.join(', ')}`); process.exit(1); }
const names = all.filter(n => (!only || only.includes(n)) && (!exclude || !exclude.includes(n)));

const gz = s => zlib.gzipSync(s, { level: 9 }).length;
const kb = n => (n / 1024).toFixed(1) + ' KB';
const ident = n => 'f_' + n.replace(/-/g, '_');

const entry = (feats, boot = true) => [
  `import api, { define, autoBoot } from './core.js';`,
  ...feats.map(n => `import ${ident(n)} from './features/${n}.js';`),
  `define(${feats.map(ident).join(', ')});`,
  `if (typeof window !== 'undefined') window.Effix = api;`,
  boot ? `autoBoot();` : '',
  `export default api;`,
].join('\n');

const bundle = (contents, { format = 'iife', minify = true } = {}) => esbuild.buildSync({
  stdin: { contents, resolveDir: SRC, sourcefile: 'effix-entry.js', loader: 'js' },
  bundle: true, write: false, format, minify, target: ['es2019', 'chrome90', 'firefox88', 'safari14'],
  define: { __VERSION__: JSON.stringify(pkg.version) },
  legalComments: 'none',
}).outputFiles[0].text.replace(/__VERSION__/g, pkg.version);

const banner = `/*! Effix v${pkg.version} | MIT | https://github.com/asticore/effix${custom ? ` | features: ${names.join(',')}` : ''} */\n`;

/* ---------------------------------------------------------------- JS */
const src = entry(names);
const jsFull = banner + bundle(src, { minify: false });
const jsMin = banner + bundle(src);
const jsEsm = banner + bundle(src, { format: 'esm' });

/* ---------------------------------------------------------------- CSS */
const cssOf = f => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim() : '');
const cssParts = [cssOf(path.join(SRC, 'css', 'base.css')), ...names.map(n => cssOf(path.join(FEAT, n + '.css')))].filter(Boolean);
// `@layer shine, effix;` pins effix above Shine whatever order the two stylesheets load in.
const cssFull = `${banner}@layer shine, effix;\n@layer effix {\n${cssParts.join('\n\n')}\n}\n`;
const cssMin = banner + esbuild.transformSync(cssFull, { loader: 'css', minify: true, target: ['chrome90', 'firefox88', 'safari14'] }).code;

fs.mkdirSync(OUT, { recursive: true });
const write = (f, s) => fs.writeFileSync(path.join(OUT, f), s);
write('effix.js', jsFull);
write('effix.min.js', jsMin);
write('effix.esm.js', jsEsm);
write('effix.css', cssFull);
write('effix.min.css', cssMin);

/* ------------------------------------------------------- per-feature sizes */
const coreOnly = gz(bundle(entry([])));
const sizes = { version: pkg.version, core: coreOnly, total: { js: gz(jsMin), css: gz(cssMin) }, features: {} };
for (const n of names) {
  const js = Math.max(0, gz(bundle(entry([n]))) - coreOnly);
  const cssSrc = cssOf(path.join(FEAT, n + '.css'));
  const css = cssSrc ? gz(esbuild.transformSync(cssSrc, { loader: 'css', minify: true }).code) : 0;
  sizes.features[n] = { js, css };
}
if (!custom) write('sizes.json', JSON.stringify(sizes, null, 2) + '\n');

console.log(`Effix v${pkg.version}  ${names.length} feature(s)  -> ${path.relative(ROOT, OUT) || '.'}`);
console.log(`  effix.min.js   ${kb(jsMin.length)}  (${kb(sizes.total.js)} gzip, core ${kb(coreOnly)})`);
console.log(`  effix.min.css  ${kb(cssMin.length)}  (${kb(sizes.total.css)} gzip)`);
if (!custom) {
  if (sizes.total.js > BUDGET.js) { console.error(`JS over budget: ${kb(sizes.total.js)} > ${kb(BUDGET.js)} gzip`); process.exit(1); }
  if (sizes.total.css > BUDGET.css) { console.error(`CSS over budget: ${kb(sizes.total.css)} > ${kb(BUDGET.css)} gzip`); process.exit(1); }
}
