/* Docs data for cursor (not bundled). */
module.exports = {
  title: 'Custom cursor',
  group: 'Pointer',
  summary: 'A ring and/or dot cursor that eases toward the pointer, grows over interactive elements and hides when the pointer leaves the window. Fine pointers and motion-OK only.',
  classes: [
    ['spark-cursor', 'On <body> (page-wide) or any container to enable the custom cursor.'],
    ['spark-cursor-hover', 'Mark extra elements that should trigger the hover state.'],
    ['spark-cursor-hide', 'Added automatically with data-spark-hide-native (cursor:none).'],
  ],
  options: [
    ['data-spark-style', 'ring', 'ring · dot · dot-ring'],
    ['data-spark-size', '32', 'Ring diameter in px.'],
    ['data-spark-color', '(theme)', 'Cursor color.'],
    ['data-spark-hide-native', 'false', 'Hide the native cursor.'],
    ['data-spark-blend', 'false', 'mix-blend-mode: difference.'],
    ['data-spark-hover', 'a,button,[role=button],input,select,textarea,label,summary,.spark-cursor-hover', 'Selector that triggers the hover state.'],
  ],
  vars: [
    ['--spark-cursor-color', 'theme', 'Set on the injected cursor elements.'],
    ['--spark-cursor-size', 'size option', 'Set on the injected cursor elements.'],
  ],
  examples: [
    { html: `<div class="spark-cursor p-6 rounded-lg stack" data-spark-style="dot-ring" data-spark-hide-native style="min-height:240px;background:var(--sh-surface,#f1f5f9)">
  <h3>Custom cursor zone</h3><div class="cluster gap-4"><button class="btn">Hover me</button><a href="#">A link</a></div>
</div>` },
  ],
};
