/* Docs data for layout (not bundled). */
module.exports = {
  title: 'Layout animation (FLIP)',
  group: 'Components',
  summary: 'Animates a container\'s children to their new positions whenever they are added, removed, hidden, reordered or resized. Entering items fade and scale in, leaving items fade out from a clone. Ships a filter / sort helper with aria-pressed buttons and a polite live region ("6 items").',
  classes: [
    ['spark-layout', 'Container whose direct children animate when the layout changes (childList, hidden/class/style changes, resizes). Needs no extra markup.'],
    ['data-spark-filter="tag" · "*"', 'Button: shows children whose data-spark-tags contain the tag (hidden is toggled). Link it with data-spark-for="#grid" or put it inside the container (in a [data-spark-controls] wrapper).'],
    ['data-spark-sort="key"', 'Button: sorts children by data-spark-key-<key> (numeric when both are numbers, else text); click again to reverse.'],
    ['data-spark-tags', 'On a child: space-separated tags used by the filter.'],
  ],
  options: [
    ['data-spark-duration', '400', 'Animation length in ms.'],
    ['data-spark-ease', 'cubic-bezier(.22,1,.36,1)', 'CSS easing string (cubic-bezier, ease-out, linear(…)).'],
    ['data-spark-scale', '0.9', 'Scale entering items start from / leaving items shrink to.'],
    ['data-spark-noun', 'item', 'Word used in the live count ("6 items").'],
    ['data-spark-count', '', 'Selector of your own element to receive the count (it gets aria-live="polite"); otherwise a hidden status node is added after the container.'],
  ],
  vars: [
    ['--spark-color', 'Shine tone/primary', 'Outline of the pressed filter/sort buttons.'],
  ],
  examples: [
    { html: `<div class="stack gap-3 p-4">
  <div class="cluster gap-2">
    <button class="btn btn-sm" data-spark-filter="*" data-spark-for="#layout-demo">All</button>
    <button class="btn btn-sm" data-spark-filter="design" data-spark-for="#layout-demo">Design</button>
    <button class="btn btn-sm" data-spark-filter="dev" data-spark-for="#layout-demo">Dev</button>
    <button class="btn btn-sm" data-spark-sort="price" data-spark-for="#layout-demo">Price</button>
    <button class="btn btn-sm" data-spark-sort="name" data-spark-for="#layout-demo">Name</button>
  </div>
  <div class="spark-layout grid grid-cols-3 gap-3" id="layout-demo">
  <div class="card p-4" data-spark-tags="design" data-spark-key-price="19" data-spark-key-name="Alpha"><strong>Alpha</strong><br><small>design · $19</small></div>
  <div class="card p-4" data-spark-tags="dev" data-spark-key-price="7" data-spark-key-name="Bravo"><strong>Bravo</strong><br><small>dev · $7</small></div>
  <div class="card p-4" data-spark-tags="design dev" data-spark-key-price="42" data-spark-key-name="Charlie"><strong>Charlie</strong><br><small>design dev · $42</small></div>
  <div class="card p-4" data-spark-tags="dev" data-spark-key-price="12" data-spark-key-name="Delta"><strong>Delta</strong><br><small>dev · $12</small></div>
  <div class="card p-4" data-spark-tags="design" data-spark-key-price="28" data-spark-key-name="Echo"><strong>Echo</strong><br><small>design · $28</small></div>
  <div class="card p-4" data-spark-tags="dev" data-spark-key-price="3" data-spark-key-name="Foxtrot"><strong>Foxtrot</strong><br><small>dev · $3</small></div>
  </div>
</div>` },
  ],
};
