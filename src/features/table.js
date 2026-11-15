/* table — behaviour layer for a plain (Shine) table: sort, search, per-column filter, paging,
   sticky header, column visibility, row selection, responsive stack, CSV download, empty state.
   <table class="table efx-table" data-efx-search data-efx-page-size="10" data-efx-csv>…</table>
   Data comes from the markup, `data-efx-data` (JSON array of objects/arrays, or CSV text / a URL ending .csv/.json),
   or `efx:data` (detail: array | { columns, rows }). Fires `change` (detail.selected) when the selection changes. */
import { on, parseCSV } from '../core.js';

const num = v => { const t = String(v).replace(/[\s,$£€%]/g, ''); return t !== '' && /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t) ? parseFloat(t) : NaN; };
const mk = (tag, cls, txt) => { const n = document.createElement(tag); n.className = cls; if (txt != null) n.textContent = txt; return n; };

const csvCell = v => {
  let t = String(v);
  if (/^[=+\-@\t\r]/.test(t) && Number.isNaN(num(t))) t = "'" + t; // stop spreadsheet formula injection
  return /[",\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
};

/** { columns: string[], rows: string[][] } from CSV text, an array of arrays, or an array of objects. */
function normalise(d) {
  if (typeof d === 'string') d = parseCSV(d);
  if (d && !Array.isArray(d) && typeof d === 'object') {
    const cols = d.columns || (d.rows && d.rows[0] && !Array.isArray(d.rows[0]) ? Object.keys(d.rows[0]) : null);
    return normalise(cols ? [cols, ...(d.rows || []).map(r => Array.isArray(r) ? r : cols.map(c => r[c]))] : d.rows || []);
  }
  if (!Array.isArray(d) || !d.length) return { columns: [], rows: [] };
  if (!Array.isArray(d[0]) && typeof d[0] === 'object') {
    const columns = [...new Set(d.flatMap(r => Object.keys(r)))];
    return { columns, rows: d.map(r => columns.map(c => r[c] == null ? '' : String(r[c]))) };
  }
  return { columns: d[0].map(String), rows: d.slice(1).map(r => r.map(c => c == null ? '' : String(c))) };
}

export default {
  name: 'table',
  selector: '.efx-table',
  defaults: {
    data: '', sort: true, search: false, filters: false, pageSize: 0, sticky: false, height: '', columns: false,
    select: false, stack: false, csv: false, filename: 'table', empty: 'No results', placeholder: 'Search…',
  },
  init(el, o) {
    const table = el.tagName === 'TABLE' ? el : el.querySelector('table');
    if (!table) return;
    const saved = table.innerHTML, parent = table.parentNode;
    const cls0 = table.className, bar = mk('div', 'efx-table__bar'), pager = mk('div', 'efx-table__pager');
    const live = mk('span', 'efx-table__live'); live.setAttribute('aria-live', 'polite');
    const offs = [];
    let dead = false, rows = [], cols = [], wrap = null, order = [], view = [], page = 0;
    let sortCol = -1, sortDir = 1, query = '', hiddenCols = new Set(), selected = new Set();
    const colF = [];

    /* ---- model: rows = [{ cells: string[], vals: any[], tr?: <tr> }] */
    const fromMarkup = () => {
      const ths = [...table.querySelectorAll('thead tr:first-child > *')];
      cols = ths.map(th => th.textContent.trim());
      rows = [...table.querySelectorAll(':scope > tbody > tr')].map(tr => {
        const tds = [...tr.children];
        return { tr, cells: tds.map(td => td.textContent.trim()), vals: tds.map(td => td.dataset.efxValue ?? td.textContent.trim()) };
      });
      if (!cols.length && rows[0]) cols = rows[0].cells.map((_, i) => 'Column ' + (i + 1));
    };
    const fromData = d => {
      const n = normalise(d);
      cols = n.columns;
      rows = n.rows.map(r => ({ cells: cols.map((_, i) => r[i] ?? ''), vals: cols.map((_, i) => r[i] ?? '') }));
      table.textContent = '';
      const th = table.createTHead().insertRow();
      cols.forEach(c => th.appendChild(mk('th', '', c)).setAttribute('scope', 'col'));
      const tb = table.createTBody();
      rows.forEach(r => { r.tr = tb.insertRow(); r.cells.forEach(c => r.tr.insertCell().textContent = c); });
    };

    /* ---- view pipeline: filter -> sort -> page */
    const pass = r => {
      if (query && !r.cells.some((c, i) => !hiddenCols.has(i) && c.toLowerCase().includes(query))) return false;
      return colF.every((f, i) => !f || r.cells[i].toLowerCase().includes(f));
    };
    const cmp = (a, b) => {
      const x = a.vals[sortCol], y = b.vals[sortCol], nx = num(x), ny = num(y);
      return (Number.isNaN(nx) || Number.isNaN(ny) ? String(x).localeCompare(String(y), undefined, { numeric: true, sensitivity: 'base' }) : nx - ny) * sortDir;
    };
    const selectedRows = () => rows.filter(r => selected.has(r)).map(r => r.cells);
    const fire = () => el.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { selected: selectedRows(), count: selected.size } }));

    const tbody = () => table.tBodies[0];
    let empty = null, all = null;
    function render(announce) {
      view = rows.filter(pass);
      if (sortCol >= 0) view = view.map((r, i) => [r, i]).sort((a, b) => cmp(a[0], b[0]) || a[1] - b[1]).map(x => x[0]);
      const size = o.pageSize > 0 ? Math.floor(o.pageSize) : view.length || 1, pages = Math.max(1, Math.ceil(view.length / size));
      page = Math.min(page, pages - 1);
      const shown = view.slice(page * size, page * size + size);
      const tb = tbody();
      tb.replaceChildren(...shown.map(r => r.tr));
      if (empty) { empty.remove(); empty = null; }
      if (!shown.length) {
        empty = mk('tr', 'efx-table__empty');
        const td = mk('td', '', o.empty); td.colSpan = Math.max(1, cols.length + (o.select ? 1 : 0));
        empty.append(td); tb.append(empty);
      }
      table.querySelectorAll('thead tr:first-child th[aria-sort]').forEach(th => th.removeAttribute('aria-sort'));
      if (sortCol >= 0) { const th = headCell(sortCol); if (th) th.setAttribute('aria-sort', sortDir > 0 ? 'ascending' : 'descending'); }
      if (all) { all.checked = !!shown.length && shown.every(r => selected.has(r)); all.indeterminate = !all.checked && shown.some(r => selected.has(r)); }
      if (o.pageSize > 0) {
        pager.hidden = pages < 2;
        pager.querySelector('.efx-table__info').textContent = view.length ? `${page * size + 1}–${page * size + shown.length} of ${view.length}` : '0 of 0';
        pager.querySelector('[data-p="prev"]').disabled = page <= 0;
        pager.querySelector('[data-p="next"]').disabled = page >= pages - 1;
      }
      if (announce) live.textContent = `${view.length} row${view.length === 1 ? '' : 's'}`;
    }
    const headCell = i => table.querySelector(`thead tr:first-child > :nth-child(${i + 1 + (o.select ? 1 : 0)})`);

    /* ---- decorate */
    const prep = () => {
      const row0 = table.querySelector('thead tr:first-child');
      if (!row0) return;
      if (o.select) {
        const th = mk('th', 'efx-table__sel'); th.scope = 'col';
        all = mk('input', 'checkbox'); all.type = 'checkbox'; all.setAttribute('aria-label', 'Select all rows');
        th.append(all); row0.prepend(th);
        offs.push(on(all, 'change', () => {
          const shown = [...tbody().children].map(tr => rows.find(r => r.tr === tr)).filter(Boolean);
          shown.forEach(r => { all.checked ? selected.add(r) : selected.delete(r); r.box.checked = all.checked; r.tr.classList.toggle('is-selected', all.checked); });
          render(); fire();
        }));
      }
      rows.forEach(r => {
        if (o.select) {
          const td = mk('td', 'efx-table__sel'), b = mk('input', 'checkbox'); b.type = 'checkbox'; b.setAttribute('aria-label', 'Select row');
          td.append(b); r.tr.prepend(td); r.box = b;
          offs.push(on(b, 'change', () => { b.checked ? selected.add(r) : selected.delete(r); r.tr.classList.toggle('is-selected', b.checked); render(); fire(); }));
        }
        if (o.stack) [...r.tr.children].forEach((td, i) => { const k = i - (o.select ? 1 : 0); if (k >= 0 && cols[k]) td.dataset.label = cols[k]; });
      });
      cols.forEach((c, i) => {
        const th = headCell(i);
        if (!th || !o.sort) return;
        const b = mk('button', 'efx-table__sort'); b.type = 'button';
        while (th.firstChild) b.append(th.firstChild);
        th.append(b);
        offs.push(on(b, 'click', () => { sortDir = sortCol === i ? -sortDir : 1; sortCol = i; render(true); }));
      });
      if (o.filters) {
        const fr = mk('tr', 'efx-table__filters');
        if (o.select) fr.append(mk('th', ''));
        cols.forEach((c, i) => {
          const th = mk('th', ''), inp = mk('input', 'input input-sm'); inp.type = 'search'; inp.placeholder = 'Filter'; inp.setAttribute('aria-label', 'Filter ' + c);
          colF[i] = ''; th.append(inp); fr.append(th);
          offs.push(on(inp, 'input', () => { colF[i] = inp.value.trim().toLowerCase(); page = 0; render(true); }));
        });
        row0.after(fr);
      }
    };

    const buildBar = () => {
      if (o.search) {
        const inp = mk('input', 'input input-sm efx-table__search'); inp.type = 'search'; inp.placeholder = o.placeholder; inp.setAttribute('aria-label', 'Search table');
        bar.append(inp);
        offs.push(on(inp, 'input', () => { query = inp.value.trim().toLowerCase(); page = 0; render(true); }));
      }
      if (o.columns && cols.length) {
        const d = mk('details', 'efx-table__cols'), sm = mk('summary', 'btn btn-sm btn-outline', 'Columns'), list = mk('div', 'efx-table__colist');
        cols.forEach((c, i) => {
          const lab = mk('label', ''), cb = mk('input', 'checkbox'); cb.type = 'checkbox'; cb.checked = true;
          lab.append(cb, document.createTextNode(' ' + c)); list.append(lab);
          offs.push(on(cb, 'change', () => {
            cb.checked ? hiddenCols.delete(i) : hiddenCols.add(i);
            if (hiddenCols.size >= cols.length) { hiddenCols.delete(i); cb.checked = true; }
            applyCols(); render(true);
          }));
        });
        d.append(sm, list); bar.append(d);
      }
      if (o.csv) {
        const b = mk('button', 'btn btn-sm btn-outline efx-table__csv', 'Download CSV'); b.type = 'button';
        bar.append(b);
        offs.push(on(b, 'click', () => {
          const keep = cols.map((_, i) => i).filter(i => !hiddenCols.has(i));
          const src = selected.size ? view.filter(r => selected.has(r)) : view;
          const text = [keep.map(i => cols[i]), ...src.map(r => keep.map(i => r.cells[i]))].map(r => r.map(csvCell).join(',')).join('\r\n');
          const a = document.createElement('a'), url = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }));
          a.href = url; a.download = (o.filename || 'table').replace(/[^\w.-]+/g, '_') + '.csv';
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }));
      }
      if (o.pageSize > 0) {
        pager.append(mk('span', 'efx-table__info'));
        ['prev', 'next'].forEach(k => {
          const b = mk('button', 'btn btn-sm btn-outline', k === 'prev' ? 'Previous' : 'Next'); b.type = 'button'; b.dataset.p = k;
          pager.append(b);
          offs.push(on(b, 'click', () => { page += k === 'prev' ? -1 : 1; render(true); }));
        });
      }
    };
    const applyCols = () => {
      const off = o.select ? 1 : 0;
      table.querySelectorAll('tr').forEach(tr => { if (!tr.classList.contains('efx-table__empty')) [...tr.children].forEach((c, i) => { c.hidden = i >= off && hiddenCols.has(i - off); }); });
    };

    const start = d => {
      if (dead) return;
      offs.splice(0).forEach(f => f());
      table.innerHTML = saved;
      bar.textContent = ''; pager.textContent = '';
      sortCol = -1; query = ''; page = 0; selected = new Set(); hiddenCols = new Set(); colF.length = 0; all = null;
      if (d === undefined) fromMarkup(); else fromData(d);
      buildBar(); prep(); render();
      bar.hidden = !bar.children.length;
      el.setAttribute('data-efx-rows', rows.length);
    };
    const parse = src => /^\s*[[{]/.test(src) ? JSON.parse(src) : src;
    const load = async () => {
      const d = o.data.trim();
      if (!d) return start();
      let src = d;
      if (/^(https?:\/\/|\/|\.\.?\/)\S+$|^[^\s,{[]+\.(csv|json)(\?\S*)?$/i.test(d)) {
        try { src = await (await fetch(d)).text(); } catch (e) { console.warn('[effix] table data', e); return start(); }
      }
      try { start(parse(src)); } catch (e) { console.warn('[effix] table data', e); start(); }
    };

    table.classList.add('efx-table--on');
    if (o.stack) table.classList.add('efx-table--stack');
    if (o.height) {
      wrap = mk('div', 'efx-table__wrap'); wrap.style.maxHeight = /^\d+$/.test(o.height) ? o.height + 'px' : o.height;
      parent.insertBefore(wrap, table); wrap.append(table);
    }
    if (o.sticky || o.height) table.classList.add('efx-table--sticky');
    (wrap || table).before(bar);
    (wrap || table).after(pager, live);
    bar.hidden = pager.hidden = true;
    const stat = [on(el, 'efx:data', e => start(e.detail))];
    load();

    return () => {
      dead = true; offs.forEach(f => f()); stat.forEach(f => f());
      table.innerHTML = saved; table.className = cls0;
      bar.remove(); pager.remove(); live.remove();
      if (wrap) { wrap.before(table); wrap.remove(); }
      el.removeAttribute('data-efx-rows');
    };
  },
};
