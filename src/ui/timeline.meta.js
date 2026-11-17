module.exports = {
  title: 'Content timeline',
  group: 'Scroll',
  summary: 'A vertical, alternating or horizontal timeline for content (not the timeline chart): dated items with icons that reveal as they scroll in. Content is visible without JS.',
  classes: [
    ['spark-timeline', 'The list (ol, ul or div).'],
    ['spark-timeline__item', 'An entry. data-spark-icon="★" puts an icon (text / emoji) in its marker.'],
    ['spark-timeline__time', 'Optional date / label above the content.'],
    ['spark-timeline__body', 'Optional content wrapper.'],
    ['spark-timeline__marker', 'Injected marker (dot or icon).'],
    ['spark-timeline--vertical / --alternate / --horizontal', 'Set from data-spark-layout (own look). When Shine\'s widgets CSS is loaded the list gets Shine\'s .timeline (+ .timeline-alt / .timeline-horizontal), items .timeline-item, markers .timeline-marker, and __time / __body also get .timeline-date / .timeline-body; Shine draws the layout.'],
  ],
  options: [
    ['data-spark-layout', 'vertical', 'vertical · alternate (zig-zag from 720px up) · horizontal (scrolls sideways).'],
    ['data-spark-reveal', 'true', 'Items fade in as they enter the viewport (skipped for reduced motion).'],
    ['data-spark-progress', 'false', 'Vertical line fills with scroll progress (--spark-timeline-progress).'],
    ['data-spark-threshold', '0.2', 'How much of an item must show (0–1) before it reveals.'],
  ],
  vars: [['--spark-tl-size', '2rem', 'Marker size.'], ['--spark-tl-line', 'border color', 'Line colour.'], ['--spark-color', 'Shine tone', 'Marker / progress colour.']],
  examples: [
    { html: `<ol class="spark-timeline" data-spark-layout="alternate" data-spark-progress>
  <li class="spark-timeline__item" data-spark-icon="★"><time class="spark-timeline__time">2023</time><div class="spark-timeline__body"><h4>Founded</h4><p>Two people and an idea.</p></div></li>
  <li class="spark-timeline__item" data-spark-icon="⚑"><time class="spark-timeline__time">2024</time><div class="spark-timeline__body"><h4>First release</h4><p>Version 1 ships.</p></div></li>
  <li class="spark-timeline__item"><time class="spark-timeline__time">2025</time><div class="spark-timeline__body"><h4>Growth</h4><p>Ten thousand users.</p></div></li>
</ol>` },
    { html: `<ol class="spark-timeline" data-spark-layout="horizontal"><li class="spark-timeline__item" data-spark-icon="1"><div class="spark-timeline__body"><h4>Plan</h4><p>Scope it.</p></div></li><li class="spark-timeline__item" data-spark-icon="2"><div class="spark-timeline__body"><h4>Build</h4><p>Make it.</p></div></li><li class="spark-timeline__item" data-spark-icon="3"><div class="spark-timeline__body"><h4>Ship</h4><p>Release it.</p></div></li></ol>`, label: 'Horizontal' },
  ],
};
