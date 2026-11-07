/* Docs data for layout (not bundled). */
module.exports = {
  title: 'Layout animation (FLIP)',
  group: 'Components',
  summary: 'Animates a container\'s children to their new positions whenever they are added, removed, hidden, reordered or resized. Entering items fade and scale in, leaving items fade out from a clone. Ships a filter / sort helper with aria-pressed buttons and a polite live region ("6 items").',
  classes: [
    ['efx-layout', 'Container whose direct children animate when the layout changes (childList, hidden/class/style changes, resizes). Needs no extra markup.'],
    ['data-efx-filter="tag" · "*"', 'Button: shows children whose data-efx-tags contain the tag (hidden is toggled). Link it with data-efx-for="#grid" or put it inside the container (in a [data-efx-controls] wrapper).'],
    ['data-efx-sort="key"', 'Button: sorts children by data-efx-key-<key> (numeric when both are numbers, else text); click again to reverse.'],
    ['data-efx-tags', 'On a child: space-separated tags used by the filter.'],
  ],
  options: [
    ['data-efx-duration', '400', 'Animation length in ms.'],
    ['data-efx-ease', 'cubic-bezier(.22,1,.36,1)', 'CSS easing string (cubic-bezier, ease-out, linear(…)).'],
    ['data-efx-scale', '0.9', 'Scale entering items start from / leaving items shrink to.'],
    ['data-efx-noun', 'item', 'Word used in the live count ("6 items").'],
    ['data-efx-count', '', 'Selector of your own element to receive the count (it gets aria-live="polite"); otherwise a hidden status node is added after the container.'],
  ],
  vars: [
    ['--efx-color', 'Shine tone/primary', 'Outline of the pressed filter/sort buttons.'],
  ],
  examples: [
    { html: `<div class="stack gap-3 p-4">
  <div class="cluster gap-2">
    <button class="btn btn-sm" data-efx-filter="*" data-efx-for="#layout-demo">All</button>
    <button class="btn btn-sm" data-efx-filter="design" data-efx-for="#layout-demo">Design</button>
    <button class="btn btn-sm" data-efx-filter="dev" data-efx-for="#layout-demo">Dev</button>
    <button class="btn btn-sm" data-efx-sort="price" data-efx-for="#layout-demo">Price</button>
    <button class="btn btn-sm" data-efx-sort="name" data-efx-for="#layout-demo">Name</button>
  </div>
  <div class="efx-layout grid grid-cols-3 gap-3" id="layout-demo">
  <div class="card p-4" data-efx-tags="design" data-efx-key-price="19" data-efx-key-name="Alpha"><strong>Alpha</strong><br><small>design · $19</small></div>
  <div class="card p-4" data-efx-tags="dev" data-efx-key-price="7" data-efx-key-name="Bravo"><strong>Bravo</strong><br><small>dev · $7</small></div>
  <div class="card p-4" data-efx-tags="design dev" data-efx-key-price="42" data-efx-key-name="Charlie"><strong>Charlie</strong><br><small>design dev · $42</small></div>
  <div class="card p-4" data-efx-tags="dev" data-efx-key-price="12" data-efx-key-name="Delta"><strong>Delta</strong><br><small>dev · $12</small></div>
  <div class="card p-4" data-efx-tags="design" data-efx-key-price="28" data-efx-key-name="Echo"><strong>Echo</strong><br><small>design · $28</small></div>
  <div class="card p-4" data-efx-tags="dev" data-efx-key-price="3" data-efx-key-name="Foxtrot"><strong>Foxtrot</strong><br><small>dev · $3</small></div>
  </div>
</div>` },
  ],
};
