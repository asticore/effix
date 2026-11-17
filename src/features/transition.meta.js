/* Docs data for transition (not bundled). */
module.exports = {
  smoke: false, // page-level: lives on <html>, so the docs show code instead of a live demo
  title: 'Page transitions',
  group: 'Page',
  summary: 'Smooth navigation between pages: same-origin links play an exit animation, the next page plays the enter animation. Uses native cross-document View Transitions when available, a JS curtain otherwise. Optional link prefetch on hover.',
  classes: [
    ['spark-transition', 'Put on <html> or <body> of every page that should animate (use it on all pages, so enter + exit match).'],
    ['spark-transition__curtain', 'Injected overlay used by the JS fallback.'],
  ],
  options: [
    ['data-spark-style', 'fade', 'fade · slide-up · curtain · zoom'],
    ['data-spark-duration', '400', 'Animation length in ms.'],
    ['data-spark-prefetch', 'true', 'Add <link rel=prefetch> when an internal link is hovered or focused.'],
    ['data-spark-no-transition', '', 'On a link (or ancestor): navigate normally, no animation.'],
  ],
  vars: [
    ['--spark-color', 'Shine primary', 'Curtain color (style "curtain").'],
  ],
  examples: [
    { html: `<div class="card p-6 stack">
  <p>Add the class to your page root, once per page:</p>
  <pre><code>&lt;html class="spark-transition" data-spark-style="curtain"&gt;</code></pre>
  <p class="muted">Clicking same-site links then fades or wipes between pages. Links with <code>target=_blank</code>, modifier keys, #anchors, downloads or <code>data-spark-no-transition</code> are left alone.</p>
  <a class="btn" href="#demo" data-spark-no-transition>Example link (not animated)</a>
</div>` },
  ],
};
