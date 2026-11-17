/* Docs data for progress (not bundled). */
module.exports = {
  title: 'Scroll progress',
  group: 'Scroll',
  summary: 'A bar that fills as the page (or one article) is scrolled. Exposes --spark-progress and role="progressbar".',
  classes: [
    ['spark-progress', 'The bar element. Fixed to the top by default.'],
  ],
  options: [
    ['data-spark-target', '""', 'CSS selector of an article to measure instead of the whole page.'],
    ['data-spark-position', 'top', 'top · bottom · none (none = you position it).'],
    ['data-spark-height', '4', 'Bar thickness in px.'],
  ],
  vars: [
    ['--spark-color', 'var(--sh-tone, --sh-primary)', 'Bar color (Shine .tone-* classes work).'],
    ['--spark-progress', '0..1', 'Set by JS; use it to style anything else.'],
  ],
  examples: [
    { html: `<div class="card p-6 stack"><div class="spark-progress" data-spark-position="none" data-spark-height="8" data-spark-target="#spark-prog-art" style="border-radius:4px"></div>
  <article id="spark-prog-art" class="stack" style="min-height:700px"><p>This bar tracks how far you have scrolled through this article.</p><p>Keep scrolling the page.</p></article></div>` },
  ],
};
