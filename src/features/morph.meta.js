/* Docs data for morph (not bundled). */
module.exports = {
  title: 'Morphing text',
  group: 'Text',
  summary: 'Cycles through a list of words with a gooey blur morph: letters melt into the next word. Width is reserved for the longest word so surrounding text never jumps. Screen readers read the current word; reduced motion shows the first word only.',
  classes: [
    ['efx-morph', 'Inline element whose text morphs. Without data-efx-words the existing text is used (static).'],
  ],
  options: [
    ['data-efx-words', '(none)', 'Words separated by |, e.g. Design|Build|Ship.'],
    ['data-efx-duration', '1200', 'Morph time in ms.'],
    ['data-efx-pause', '1800', 'Hold time between morphs in ms.'],
  ],
  vars: [
    ['--efx-morph-justify', 'center', 'Alignment of shorter words inside the reserved width (start | center | end).'],
  ],
  examples: [
    { html: `<div class="p-6" style="text-align:center">
  <h1 style="font-size:3rem;font-weight:800">We <span class="efx-morph" data-efx-words="Design|Build|Ship|Scale"></span> products</h1>
</div>` },
  ],
};
