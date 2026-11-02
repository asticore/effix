/* Docs data for stack (not bundled). */
module.exports = {
  title: 'Stacking cards',
  group: 'Scroll',
  summary: 'Cards stick near the top and pile up as you scroll; each covered card scales back and dims. Plain sticky cards with reduced motion.',
  classes: [
    ['efx-stack', 'Container. Every direct child becomes a sticky card.'],
  ],
  options: [
    ['data-efx-offset', '80', 'Sticky top of the first card in px (clear your header).'],
    ['data-efx-gap', '16', 'Extra top px per card so edges peek out.'],
    ['data-efx-shrink', '0.05', 'Scale lost per card stacked on top of it.'],
    ['data-efx-blur', '0', 'Max blur in px for covered cards.'],
    ['data-efx-dim', '0.15', 'Max darkening (0–1) for covered cards.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="efx-stack stack gap-4" data-efx-offset="16" data-efx-gap="14">
  <div class="card tone-primary p-6" style="min-height:260px"><h3>Step one</h3><p>Scroll on.</p></div>
  <div class="card tone-secondary p-6" style="min-height:260px"><h3>Step two</h3><p>Covers the first.</p></div>
  <div class="card tone-success p-6" style="min-height:260px"><h3>Step three</h3><p>And the second.</p></div>
</div>` },
  ],
};
