/* Docs data for scrollspy (not bundled). */
module.exports = {
  title: 'Scrollspy',
  group: 'Scroll',
  summary: 'Highlights the table-of-contents link whose section is in view and optionally smooth-scrolls on click.',
  classes: [
    ['spark-scrollspy', 'Nav/TOC containing a[href^="#"] links. The active link gets is-active and aria-current="true".'],
  ],
  options: [
    ['data-spark-offset', '80', 'Px from the top where a section becomes active (also scroll offset on click).'],
    ['data-spark-active-class', 'is-active', 'Class added to the active link.'],
    ['data-spark-smooth', 'true', 'Smooth scroll on click (respects reduced motion).'],
  ],
  vars: [],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <nav class="spark-scrollspy stack" data-spark-offset="20" aria-label="Contents">
    <a href="#spark-spy-a">Section A</a><a href="#spark-spy-b">Section B</a><a href="#spark-spy-c">Section C</a>
  </nav>
  <div class="stack"><section id="spark-spy-a" class="card p-6" style="min-height:240px">A</section><section id="spark-spy-b" class="card p-6" style="min-height:240px">B</section><section id="spark-spy-c" class="card p-6" style="min-height:240px">C</section></div>
</div>` },
  ],
};
