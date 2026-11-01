/* lightbox — click images to view them in one shared Shine modal.
   <div class="efx-lightbox"><a href="full.jpg" data-efx-caption="Sunset"><img src="thumb.jpg" alt="Sunset"></a>…</div>
   Links stay normal links without JS. Links in containers sharing data-efx-group form one set. */
import { on } from '../core.js';

const SEL = 'a[href],[data-efx-src]';
let S = null; // shared dialog state, created lazily, removed when the last instance goes

const meta = a => {
  const img = a.querySelector('img'), fig = a.closest('figure');
  const fc = fig && fig.querySelector('figcaption');
  return { src: a.dataset.efxSrc || a.getAttribute('href'), cap: a.dataset.efxCaption || (img && img.alt) || (fc && fc.textContent.trim()) || '' };
};

function build() {
  const d = document.createElement('dialog');
  d.className = 'modal modal-lg efx-lightbox__dialog';
  d.setAttribute('aria-label', 'Image viewer');
  d.innerHTML = '<button type="button" class="btn-close efx-lightbox__close" aria-label="Close"></button>'
    + '<button type="button" class="btn btn-icon efx-lightbox__prev" aria-label="Previous image">‹</button>'
    + '<figure class="efx-lightbox__fig"><img alt=""><figcaption></figcaption></figure>'
    + '<button type="button" class="btn btn-icon efx-lightbox__next" aria-label="Next image">›</button>'
    + '<div class="efx-lightbox__count" aria-live="polite"></div>';
  document.body.appendChild(d);
  const q = c => d.querySelector('.efx-lightbox__' + c);
  const s = { d, img: q('fig').firstChild, cap: q('fig').lastChild, count: q('count'), prev: q('prev'), next: q('next'), items: [], i: 0, opts: {}, opener: null, refs: 0, offs: [] };
  const step = k => {
    const n = s.items.length;
    let i = s.i + k;
    if (i < 0 || i >= n) { if (!s.opts.loop) return; i = (i + n) % n; }
    show(i);
  };
  s.step = step;
  let x0 = null;
  s.offs.push(
    on(q('close'), 'click', () => d.close()),
    on(s.prev, 'click', () => step(-1)),
    on(s.next, 'click', () => step(1)),
    on(d, 'click', e => {
      if (e.target !== d) return;
      const r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
    }),
    on(d, 'keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    }),
    on(d, 'pointerdown', e => { x0 = e.pointerType === 'mouse' ? null : e.clientX; }),
    on(d, 'pointerup', e => {
      if (x0 === null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    }),
    on(d, 'close', () => { if (s.opener && s.opener.focus) s.opener.focus(); s.opener = null; })
  );
  return s;
}

function show(i) {
  const n = S.items.length, it = S.items[i];
  S.i = i;
  S.img.src = it.src;
  S.img.alt = it.cap;
  S.cap.textContent = S.opts.captions ? it.cap : '';
  S.cap.hidden = !S.opts.captions || !it.cap;
  S.count.textContent = n > 1 ? `${i + 1} / ${n}` : '';
  S.prev.hidden = S.next.hidden = n < 2;
  [i - 1, i + 1].forEach(j => { const k = S.items[(j + n) % n]; if (k) new Image().src = k.src; });
}

export default {
  name: 'lightbox',
  selector: '.efx-lightbox',
  defaults: { loop: true, captions: true, group: '' },
  init(el, o) {
    if (!S) S = build();
    S.refs++;
    const links = () => {
      const roots = o.group ? [...document.querySelectorAll('.efx-lightbox')].filter(r => r.dataset.efxGroup === o.group) : [el];
      return roots.flatMap(r => [...r.querySelectorAll(SEL)]);
    };
    const off = on(el, 'click', e => {
      const a = e.target.closest(SEL);
      if (!a || !el.contains(a) || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault();
      const ls = links();
      S.items = ls.map(meta);
      S.opts = o;
      S.opener = a;
      show(Math.max(0, ls.indexOf(a)));
      if (!S.d.open) S.d.showModal();
    });
    return () => {
      off();
      if (--S.refs > 0) return;
      S.offs.forEach(f => f());
      if (S.d.open) S.d.close();
      S.d.remove();
      S = null;
    };
  },
};
