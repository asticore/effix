/* Docs data for lyrics (not bundled). */
// Offline demo audio: a tiny 8 kHz sine melody built in the page (no network).
const tone = id => `<script>(function(a){var r=8000,n=r*12,b=new Uint8Array(44+n),d=new DataView(b.buffer),w=function(o,t){for(var i=0;i<t.length;i++)b[o+i]=t.charCodeAt(i)};w(0,'RIFF');d.setUint32(4,36+n,1);w(8,'WAVEfmt ');d.setUint32(16,16,1);d.setUint16(20,1,1);d.setUint16(22,1,1);d.setUint32(24,r,1);d.setUint32(28,r,1);d.setUint16(32,1,1);d.setUint16(34,8,1);w(36,'data');d.setUint32(40,n,1);for(var i=0;i<n;i++){var t=i/r,f=220*Math.pow(2,[0,4,7,12,7,4][Math.floor(t*2)%6]/12);b[44+i]=128+40*Math.sin(6.283*f*t)}a.src=URL.createObjectURL(new Blob([b],{type:'audio/wav'}))})(document.getElementById('${id}'))</script>`;
module.exports = {
  title: 'Lyrics & captions',
  group: 'Components',
  summary: 'Captions or lyrics synced to an audio/video element: the active line is highlighted and scrolled into view inside its own box, words can fill like karaoke, and clicking a line seeks the media. Cues come from JSON or the media\'s WebVTT track. Reduced motion: no smooth scrolling, whole active line is lit instead of a progressive fill.',
  classes: [
    ['spark-lyrics', 'The lyrics box (scrolls internally; set a height with --spark-lyrics-height).'],
    ['spark-lyrics__list', 'Injected <ol> of lines.'],
    ['spark-lyrics__line', 'Injected <li>; gets aria-current="true" and .is-active while sung.'],
    ['spark-lyrics__btn', 'Injected seek button (a <span> when data-spark-seek="false").'],
    ['spark-lyrics__word', 'Injected word span in karaoke mode (--p = 0..1 fill).'],
  ],
  options: [
    ['data-spark-for', '(parent audio/video)', 'Selector of the media element, e.g. #song.'],
    ['data-spark-cues', '', 'JSON [{"t":0,"text":"…","end":2,"words":[{"t":0,"w":"…"}]}]. Alternatives: an inline <script type="application/json"> child, or a captions/subtitles <track> on the media (WebVTT; <00:01.500> stamps give word timing).'],
    ['data-spark-karaoke', 'false', 'Fill words progressively (background-clip text gradient). Words without timing are spread evenly over the line.'],
    ['data-spark-scroll', 'true', 'Auto-scroll the active line to the middle of the box (pauses 3s after you scroll it yourself).'],
    ['data-spark-seek', 'true', 'Clicking a line sets media.currentTime.'],
    ['data-spark-offset', '0', 'Seconds added to the media time (lyrics early/late).'],
  ],
  vars: [
    ['--spark-lyrics-height', '16rem', 'Max height of the box.'],
    ['--spark-lyrics-active', 'var(--sh-primary)', 'Active line color.'],
    ['--spark-lyrics-fill', 'var(--sh-primary)', 'Karaoke filled color.'],
    ['--spark-lyrics-dim', '45% currentColor', 'Karaoke unfilled color.'],
  ],
  examples: [
    { html: `<div class="stack gap-3 p-4">
  <audio id="spark-ly-a" controls loop style="width:100%"></audio>
  <div class="spark-lyrics card" data-spark-for="#spark-ly-a" data-spark-cues='[{"t":0,"text":"Every light is turning on"},{"t":2,"text":"Somewhere past the edge of dawn"},{"t":4,"text":"Carry me, carry me home"},{"t":6,"text":"Where the quiet signals roam"},{"t":8,"text":"Count the stars and let them go"},{"t":10,"text":"Softly now, the river flows"}]' style="--spark-lyrics-height:11rem"></div>
</div>${tone('spark-ly-a')}` },
    { html: `<div class="stack gap-3 p-4">
  <audio id="spark-ly-b" controls loop style="width:100%"></audio>
  <div class="spark-lyrics card" data-spark-for="#spark-ly-b" data-spark-karaoke style="--spark-lyrics-height:11rem">
    <script type="application/json">[{"t":0,"text":"Every light is turning on"},{"t":2,"text":"Somewhere past the edge of dawn"},{"t":4,"text":"Carry me, carry me home"},{"t":6,"text":"Where the quiet signals roam"},{"t":8,"text":"Count the stars and let them go"},{"t":10,"text":"Softly now, the river flows"}]</script>
  </div>
</div>${tone('spark-ly-b')}` },
  ],
};
