/* popout — "poster breaking its frame": a cut-out that overflows the card and gains depth.
   <div class="spark-popout rounded-xl" data-spark-depth="24">
     <div class="spark-popout__bg" style="background-image:url(sky.jpg)"></div>
     <img class="spark-popout__fg" src="hero-cutout.png" alt="…">
   </div>
   Pointer (fine pointers) and/or scroll shift the layers at different depths. */
import { on, rafThrottle, onScroll, motionOK, finePointer } from '../core.js';

export default {
  name: 'popout',
  selector: '.spark-popout',
  defaults: { depth: 20, tilt: 8, mode: 'both' },
  init(el, o) {
    let restorePos = false;
    if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restorePos = true; }
    const undoPos = () => { if (restorePos) el.style.position = ''; };
    const bg = el.querySelector(':scope > .spark-popout__bg');
    if (!bg || !motionOK()) return undoPos;
    const ptr = finePointer() && o.mode !== 'scroll', scr = o.mode !== 'pointer';
    if (!ptr && !scr) return undoPos;
    const clip = document.createElement('div');
    clip.className = 'spark-popout__clip';
    const mark = document.createComment('spark-popout');
    bg.replaceWith(mark); clip.appendChild(bg); mark.replaceWith(clip);
    el.style.setProperty('--spark-depth', o.depth + 'px');
    el.style.setProperty('--spark-tilt', o.tilt + 'deg');
    el.classList.add('is-popout');
    const offs = [];
    let rect = null;
    if (ptr) {
      const move = rafThrottle(e => {
        if (!rect) rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 2 - 1, y = (e.clientY - rect.top) / rect.height * 2 - 1;
        el.style.setProperty('--spark-px', x.toFixed(3)); el.style.setProperty('--spark-py', y.toFixed(3));
      });
      const leave = () => { move.cancel(); rect = null; el.style.removeProperty('--spark-px'); el.style.removeProperty('--spark-py'); };
      offs.push(on(el, 'pointermove', move), on(el, 'pointerleave', leave), () => move.cancel());
    }
    const stopScroll = scr ? onScroll((y, vh) => {
      const r = el.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
      return () => el.style.setProperty('--spark-sy', p.toFixed(3));
    }) : null;
    return () => {
      offs.forEach(f => f()); stopScroll && stopScroll();
      ['--spark-depth', '--spark-tilt', '--spark-px', '--spark-py', '--spark-sy'].forEach(v => el.style.removeProperty(v));
      el.classList.remove('is-popout');
      clip.replaceWith(bg);
      undoPos();
    };
  },
};
