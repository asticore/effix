/* Docs data for odometer (not bundled). */
module.exports = {
  title: 'Odometer',
  group: 'Scroll',
  summary: 'Rolling digit counter: each digit is a 0-9 strip that rolls into place when visible. Re-roll live with an efx:data event. Static final value without JS or with reduced motion.',
  classes: [['efx-odometer', 'Element whose text is the final number. Non-digits ($ , % .) stay static.']],
  options: [
    ['data-efx-duration', '1800', 'Roll time in ms.'],
    ['data-efx-from', '', 'Start value (empty = zeros).'],
    ['data-efx-stagger', '60', 'Delay between digits in ms.'],
    ['data-efx-once', 'true', 'false = reset and replay when re-entering the viewport.'],
  ],
  vars: [['--efx-odo-duration', '1800ms', 'Set from data-efx-duration.']],
  examples: [
    { html: `<div class="stack gap-4 p-6 text-center" style="min-height:300px;align-content:center">
  <div class="text-5xl font-bold"><span id="odo-demo" class="efx-odometer">$12,840</span></div>
  <div><button class="btn" onclick="document.getElementById('odo-demo').dispatchEvent(new CustomEvent('efx:data',{detail:{value:Math.round(Math.random()*90000)+1000}}))">Roll new value</button></div>
</div>` },
  ],
};
