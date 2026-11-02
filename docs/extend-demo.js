window.EffixConfig = {
  extend(E) {
    // 1. A particle shape: draw centred on 0,0 at the given size (fill colour is already set).
    E.add('particle-shape', 'heart', (ctx, size) => {
      const s = size / 2;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.6);
      ctx.bezierCurveTo(-s * 1.4, -s * 0.4, -s * 0.5, -s * 1.3, 0, -s * 0.5);
      ctx.bezierCurveTo(s * 0.5, -s * 1.3, s * 1.4, -s * 0.4, 0, s * 0.6);
      ctx.fill();
    });

    // 2. A number format any chart can use with data-efx-format="gbp".
    E.add('format', 'gbp', v => '£' + Math.round(v).toLocaleString('en-GB'));
  },
};

// 3. A whole new chart type built on the chart toolkit (Effix.charts),
//    and 4. a tiny custom feature. Both work like built-ins: class + data-efx-*.
document.addEventListener('efx:ready', ({ detail: E }) => {
  const { chart, COMMON, nice, linear, axes, s } = E.charts;

  E.define({
    name: 'chart-dots',
    selector: '.efx-chart-dots',
    lazy: true,
    defaults: { ...COMMON, radius: 6 },
    init: (el, o) => chart(el, o, ({ g, w, h, data, visible, colors, fmt }) => {
      const pad = { t: 10, r: 10, b: 28, l: 48 };
      const sc = nice(0, Math.max(1, ...visible.flatMap(sr => sr.values)));
      const y = linear([sc.min, sc.max], [h - pad.b, pad.t]);
      const x = i => pad.l + (i + 0.5) * (w - pad.l - pad.r) / data.labels.length;
      axes(g, { w, h, pad, y, ticks: sc.ticks, labels: data.labels, x, fmt });
      const marks = [];
      visible.forEach(sr => sr.values.forEach((v, i) => {
        s('line', { x1: x(i), x2: x(i), y1: y(0), y2: y(v), stroke: colors[sr.index], 'stroke-width': 2 }, g);
        const node = s('circle', { cx: x(i), cy: y(v), r: o.radius, fill: colors[sr.index], class: 'efx-chart__mark' }, g);
        marks.push({ x: x(i), y: y(v), label: data.labels[i], value: v, series: sr.name, node, index: i });
      }));
      return marks; // tooltips, keyboard, legend and efx:select come free
    }),
  });

  E.define({
    name: 'blink',
    selector: '.my-blink',
    defaults: { speed: 600 },                  // read from data-efx-speed
    init(el, o) {
      const t = setInterval(() => el.classList.toggle('is-on'), o.speed);
      return () => { clearInterval(t); el.classList.remove('is-on'); }; // cleanup
    },
  });
});
