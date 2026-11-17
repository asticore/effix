/* Docs data for odometer (not bundled). */
module.exports = {
  title: 'Odometer',
  group: 'Scroll',
  summary: 'Rolling digit counter: each digit is a 0-9 strip that rolls into place when visible. Re-roll live with an spark:data event. Static final value without JS or with reduced motion.',
  classes: [['spark-odometer', 'Element whose text is the final number. Non-digits ($ , % .) stay static.']],
  options: [
    ['data-spark-duration', '1800', 'Roll time in ms.'],
    ['data-spark-from', '', 'Start value (empty = zeros).'],
    ['data-spark-stagger', '60', 'Delay between digits in ms.'],
    ['data-spark-once', 'true', 'false = reset and replay when re-entering the viewport.'],
  ],
  vars: [['--spark-odo-duration', '1800ms', 'Set from data-spark-duration.']],
  examples: [
    { html: `<div class="stack gap-4 p-6 text-center" style="min-height:300px;align-content:center">
  <div class="text-5xl font-bold"><span id="odo-demo" class="spark-odometer">$12,840</span></div>
  <div><button class="btn" onclick="document.getElementById('odo-demo').dispatchEvent(new CustomEvent('spark:data',{detail:{value:Math.round(Math.random()*90000)+1000}}))">Roll new value</button></div>
</div>` },
  ],
};
