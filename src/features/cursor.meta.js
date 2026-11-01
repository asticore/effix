/* Docs data for cursor (not bundled). */
module.exports = {
  title: 'Custom cursor',
  group: 'Pointer',
  summary: 'A ring and/or dot cursor that eases toward the pointer, grows over interactive elements and hides when the pointer leaves the window. Fine pointers and motion-OK only.',
  classes: [
    ['efx-cursor', 'On <body> (page-wide) or any container to enable the custom cursor.'],
    ['efx-cursor-hover', 'Mark extra elements that should trigger the hover state.'],
    ['efx-cursor-hide', 'Added automatically with data-efx-hide-native (cursor:none).'],
  ],
  options: [
    ['data-efx-style', 'ring', 'ring · dot · dot-ring'],
    ['data-efx-size', '32', 'Ring diameter in px.'],
    ['data-efx-color', '(theme)', 'Cursor color.'],
    ['data-efx-hide-native', 'false', 'Hide the native cursor.'],
    ['data-efx-blend', 'false', 'mix-blend-mode: difference.'],
    ['data-efx-hover', 'a,button,[role=button],input,select,textarea,label,summary,.efx-cursor-hover', 'Selector that triggers the hover state.'],
  ],
  vars: [
    ['--efx-cursor-color', 'theme', 'Set on the injected cursor elements.'],
    ['--efx-cursor-size', 'size option', 'Set on the injected cursor elements.'],
  ],
  examples: [
    { html: `<div class="efx-cursor p-6 rounded-lg stack" data-efx-style="dot-ring" data-efx-hide-native style="min-height:240px;background:var(--sh-surface,#f1f5f9)">
  <h3>Custom cursor zone</h3><div class="cluster gap-4"><button class="btn">Hover me</button><a href="#">A link</a></div>
</div>` },
  ],
};
