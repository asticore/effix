/* Docs data for chapter (not bundled). */
module.exports = {
  smokeRefresh: false, // title shown depends on which section is in view at the moment
  title: 'Chapter indicator',
  group: 'Scroll',
  summary: 'A chip that shows the title of the section currently in view. The text slides up when the section changes and a ring tracks progress through that section. Clicking scrolls to the section.',
  classes: [
    ['spark-chapter', 'The chip (usually position:fixed or sticky). Gets is-empty while no section is in view.'],
  ],
  options: [
    ['data-spark-sections', 'section[data-spark-title]', 'CSS selector of the sections. Title comes from data-spark-title or the first heading.'],
    ['data-spark-ring', 'true', 'Show the section progress ring.'],
  ],
  vars: [
    ['--spark-chapter-bg', 'surface 85%', 'Chip background.'],
    ['--spark-color', 'Shine tone/primary', 'Ring color.'],
  ],
  examples: [
    { html: `<div class="stack">
  <div style="position:sticky;top:1rem;z-index:2"><a class="spark-chapter" href="#" data-spark-sections="#spark-chap-demo section"></a></div>
  <div id="spark-chap-demo" class="stack">
    <section data-spark-title="Discover" class="card p-6" style="min-height:70vh"><h3>Discover</h3></section>
    <section data-spark-title="Build" class="card p-6" style="min-height:70vh"><h3>Build</h3></section>
    <section class="card p-6" style="min-height:70vh"><h3>Ship</h3></section>
  </div>
</div>` },
  ],
};
