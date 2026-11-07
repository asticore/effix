/* Docs data for chapter (not bundled). */
module.exports = {
  title: 'Chapter indicator',
  group: 'Scroll',
  summary: 'A chip that shows the title of the section currently in view. The text slides up when the section changes and a ring tracks progress through that section. Clicking scrolls to the section.',
  classes: [
    ['efx-chapter', 'The chip (usually position:fixed or sticky). Gets is-empty while no section is in view.'],
  ],
  options: [
    ['data-efx-sections', 'section[data-efx-title]', 'CSS selector of the sections. Title comes from data-efx-title or the first heading.'],
    ['data-efx-ring', 'true', 'Show the section progress ring.'],
  ],
  vars: [
    ['--efx-chapter-bg', 'surface 85%', 'Chip background.'],
    ['--efx-color', 'Shine tone/primary', 'Ring color.'],
  ],
  examples: [
    { html: `<div class="stack">
  <div style="position:sticky;top:1rem;z-index:2"><a class="efx-chapter" href="#" data-efx-sections="#efx-chap-demo section"></a></div>
  <div id="efx-chap-demo" class="stack">
    <section data-efx-title="Discover" class="card p-6" style="min-height:70vh"><h3>Discover</h3></section>
    <section data-efx-title="Build" class="card p-6" style="min-height:70vh"><h3>Build</h3></section>
    <section class="card p-6" style="min-height:70vh"><h3>Ship</h3></section>
  </div>
</div>` },
  ],
};
