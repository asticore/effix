module.exports = {
  title: 'Content timeline',
  group: 'Scroll',
  summary: 'A vertical, alternating or horizontal timeline for content (not the timeline chart): dated items with icons that reveal as they scroll in. Content is visible without JS.',
  classes: [
    ['efx-timeline', 'The list (ol, ul or div).'],
    ['efx-timeline__item', 'An entry. data-efx-icon="★" puts an icon (text / emoji) in its marker.'],
    ['efx-timeline__time', 'Optional date / label above the content.'],
    ['efx-timeline__body', 'Optional content wrapper.'],
    ['efx-timeline__marker', 'Injected marker (dot or icon).'],
    ['efx-timeline--vertical / --alternate / --horizontal', 'Set from data-efx-layout (own look). When Shine\'s widgets CSS is loaded the list gets Shine\'s .timeline (+ .timeline-alt / .timeline-horizontal), items .timeline-item, markers .timeline-marker, and __time / __body also get .timeline-date / .timeline-body; Shine draws the layout.'],
  ],
  options: [
    ['data-efx-layout', 'vertical', 'vertical · alternate (zig-zag from 720px up) · horizontal (scrolls sideways).'],
    ['data-efx-reveal', 'true', 'Items fade in as they enter the viewport (skipped for reduced motion).'],
    ['data-efx-progress', 'false', 'Vertical line fills with scroll progress (--efx-timeline-progress).'],
    ['data-efx-threshold', '0.2', 'How much of an item must show (0–1) before it reveals.'],
  ],
  vars: [['--efx-tl-size', '2rem', 'Marker size.'], ['--efx-tl-line', 'border color', 'Line colour.'], ['--efx-color', 'Shine tone', 'Marker / progress colour.']],
  examples: [
    { html: `<ol class="efx-timeline" data-efx-layout="alternate" data-efx-progress>
  <li class="efx-timeline__item" data-efx-icon="★"><time class="efx-timeline__time">2023</time><div class="efx-timeline__body"><h4>Founded</h4><p>Two people and an idea.</p></div></li>
  <li class="efx-timeline__item" data-efx-icon="⚑"><time class="efx-timeline__time">2024</time><div class="efx-timeline__body"><h4>First release</h4><p>Version 1 ships.</p></div></li>
  <li class="efx-timeline__item"><time class="efx-timeline__time">2025</time><div class="efx-timeline__body"><h4>Growth</h4><p>Ten thousand users.</p></div></li>
</ol>` },
    { html: `<ol class="efx-timeline" data-efx-layout="horizontal"><li class="efx-timeline__item" data-efx-icon="1"><div class="efx-timeline__body"><h4>Plan</h4><p>Scope it.</p></div></li><li class="efx-timeline__item" data-efx-icon="2"><div class="efx-timeline__body"><h4>Build</h4><p>Make it.</p></div></li><li class="efx-timeline__item" data-efx-icon="3"><div class="efx-timeline__body"><h4>Ship</h4><p>Release it.</p></div></li></ol>`, label: 'Horizontal' },
  ],
};
