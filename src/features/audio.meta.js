/* Docs data for audio (not bundled). */
// Offline demo audio: an 8 kHz chord sweep with a beat, built in the page (no network).
const tone = id => `<script>(function(a){var r=8000,n=r*10,b=new Uint8Array(44+n),d=new DataView(b.buffer),w=function(o,t){for(var i=0;i<t.length;i++)b[o+i]=t.charCodeAt(i)};w(0,'RIFF');d.setUint32(4,36+n,1);w(8,'WAVEfmt ');d.setUint32(16,16,1);d.setUint16(20,1,1);d.setUint16(22,1,1);d.setUint32(24,r,1);d.setUint32(28,r,1);d.setUint16(32,1,1);d.setUint16(34,8,1);w(36,'data');d.setUint32(40,n,1);for(var i=0;i<n;i++){var t=i/r,f=110*Math.pow(2,[0,3,7,10][Math.floor(t*2)%4]/12),e=Math.pow(1-(t*4%1),2),s=Math.sin(6.283*f*t)+.5*Math.sin(6.283*f*2*t)+.3*Math.sin(6.283*(300+200*Math.sin(t))*t);b[44+i]=128+34*s*(.35+.65*e)}a.src=URL.createObjectURL(new Blob([b],{type:'audio/wav'}))})(document.getElementById('${id}'))</script>`;
const ex = (id, type, extra = '') => `<div class="stack gap-3 p-4">
  <audio id="${id}" controls loop style="width:100%"></audio>
  <div class="efx-audio card rounded-lg" data-efx-for="#${id}" data-efx-type="${type}" ${extra} style="height:140px"></div>
</div>${tone(id)}`;
module.exports = {
  title: 'Audio visualizer',
  group: 'Components',
  summary: 'Audio-reactive canvas visualizer (bars, wave, circle, scope, dots) for an <audio> or <video>. The AnalyserNode is created lazily on the first play (a user gesture) and shared per media element. It also exposes a smoothed --efx-level (0–1) for CSS. Pauses when paused or off-screen. Reduced motion: a static, low-level drawing. The media must be same-origin, blob:/data:, or loaded with crossorigin + CORS headers: otherwise the analyser is skipped (it would otherwise mute the audio) and the canvas stays idle.',
  classes: [
    ['efx-audio', 'The visualizer box (give it a height). Injects a canvas; may also contain the media element.'],
    ['efx-audio__canvas', 'Injected canvas (aria-hidden, pointer-events none).'],
  ],
  options: [
    ['data-efx-for', '(audio/video inside)', 'Selector of the media element, e.g. #song.'],
    ['data-efx-type', 'bars', 'bars · wave · circle · scope · dots, or any registered audio-viz.'],
    ['data-efx-color', '(Shine chain)', 'Color or list separated by |; empty = --efx-chart-1…4, then Shine tone/primary.'],
    ['data-efx-count', '48', 'Number of bars / spokes.'],
    ['data-efx-gain', '1', 'Multiplier on the --efx-level value.'],
  ],
  extend: [
    ['audio-viz', '(ctx2d, { freq, time, level, count }, w, h, colors) => void', 'Draw one frame (canvas is cleared for you). freq/time are Uint8Arrays from the AnalyserNode; level is 0–1; sizes are CSS px.'],
  ],
  extendExample: `<script>
window.EffixConfig = { extend(E) {
  E.add('audio-viz', 'pulse', (c, d, w, h, colors) => { c.fillStyle = colors[0]; c.beginPath(); c.arc(w / 2, h / 2, 10 + d.level * h / 2, 0, 6.28); c.fill(); });
} };
</script>
<div class="efx-audio" data-efx-for="#song" data-efx-type="pulse" style="height:160px"></div>`,
  vars: [
    ['--efx-level', '0', 'Written on the visualizer and on any [data-efx-level-for="#media"] element: smoothed loudness 0–1. e.g. transform: scale(calc(1 + var(--efx-level) * .3)).'],
  ],
  examples: [
    { html: ex('efx-au-a', 'bars') },
    { html: ex('efx-au-b', 'circle', 'data-efx-color="#6366f1|#ec4899"') },
    { html: `<div class="stack gap-3 p-4">
  <audio id="efx-au-c" controls loop style="width:100%"></audio>
  <div class="cluster gap-4" style="align-items:center">
    <div class="card rounded-lg p-6" data-efx-level-for="#efx-au-c" style="transform:scale(calc(1 + var(--efx-level,0) * .25));box-shadow:0 0 calc(var(--efx-level,0) * 40px) var(--sh-primary,#6366f1)">Beat</div>
    <div class="efx-audio card rounded-lg" data-efx-for="#efx-au-c" data-efx-type="wave" style="height:100px;flex:1"></div>
    <div class="efx-audio card rounded-lg" data-efx-for="#efx-au-c" data-efx-type="scope" style="height:100px;width:100px"></div>
    <div class="efx-audio card rounded-lg" data-efx-for="#efx-au-c" data-efx-type="dots" style="height:100px;width:160px"></div>
  </div>
</div>${tone('efx-au-c')}` },
  ],
};
