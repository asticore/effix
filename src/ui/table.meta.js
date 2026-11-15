module.exports = {
  title: 'Data table',
  group: 'Data',
  summary: 'Behaviour layer for a plain Shine table: sort, search, per-column filter, paging, sticky header, column visibility, row selection, responsive stack, CSV download and an empty state. Zero dependencies.',
  classes: [
    ['efx-table', 'On a <table> (or a wrapper holding one). Add Shine\'s .table / .table-striped / .table-hover for the look.'],
    ['efx-table__bar', 'Injected toolbar above the table (search, columns, CSV).'],
    ['efx-table__pager', 'Injected pager below the table.'],
    ['efx-table__sort', 'Injected button inside a sortable header cell; the cell carries aria-sort.'],
    ['efx-table__filters', 'Injected per-column filter row.'],
    ['efx-table__empty', 'Row shown when nothing matches.'],
    ['is-selected', 'On a selected row.'],
    ['dt / dt-toolbar / dt-search / dt-pagebar / dt-info / dt-empty / table-wrap / table-sticky-head', 'Used instead of the efx-table__* parts when Shine\'s widgets CSS is loaded. Sortable headers carry aria-sort (none / ascending / descending) around a plain button; selected rows also get aria-selected="true".'],
  ],
  options: [
    ['data-efx-sort', 'true', 'Click a header to sort (numbers, then text, natural order). Cells may set data-efx-value for the sort key.'],
    ['data-efx-search', 'false', 'Search box above the table.'],
    ['data-efx-filters', 'false', 'A filter box under each header.'],
    ['data-efx-page-size', '0', 'Rows per page (0 = no paging).'],
    ['data-efx-sticky', 'false', 'Sticky header (to the page scroll).'],
    ['data-efx-height', '', 'Scroll the body inside this height (px or any CSS length); header stays sticky.'],
    ['data-efx-columns', 'false', 'Column visibility menu.'],
    ['data-efx-select', 'false', 'Row checkboxes with select all; fires a change event.'],
    ['data-efx-stack', 'false', 'Stack cells as label/value pairs under 640px.'],
    ['data-efx-csv', 'false', 'Download CSV button (filtered rows, visible columns; selected rows if any).'],
    ['data-efx-filename', 'table', 'CSV file name (no extension).'],
    ['data-efx-empty', 'No results', 'Text for the empty state.'],
    ['data-efx-placeholder', 'Search…', 'Search box placeholder.'],
    ['data-efx-data', '', 'Replace the rows: JSON array of objects or arrays, a CSV string, or a URL (.json / .csv).'],
  ],
  events: [
    ['change', 'Selection changed (bubbles). detail = { selected: string[][], count }.'],
    ['efx:data (listen)', 'Dispatch with detail = array of objects, array of arrays (first = header), CSV text or { columns, rows } to replace the table data.'],
  ],
  vars: [['--efx-table-top', '0', 'Sticky header offset (e.g. under a fixed navbar).']],
  examples: [
    { html: `<table class="table table-hover efx-table" data-efx-search data-efx-filters data-efx-page-size="3" data-efx-select data-efx-columns data-efx-csv data-efx-filename="plans">
  <thead><tr><th>Plan</th><th>Seats</th><th>Price</th></tr></thead>
  <tbody>
    <tr><td>Starter</td><td>3</td><td>$9</td></tr>
    <tr><td>Team</td><td>10</td><td>$49</td></tr>
    <tr><td>Business</td><td>50</td><td>$199</td></tr>
    <tr><td>Enterprise</td><td>500</td><td>$999</td></tr>
    <tr><td>Hobby</td><td>1</td><td>$0</td></tr>
  </tbody>
</table>` },
    { html: `<table class="table efx-table" data-efx-stack data-efx-search data-efx-data='[{"Name":"Ada","Role":"Engineer"},{"Name":"Grace","Role":"Admiral"},{"Name":"Linus","Role":"Maintainer"}]'></table>`, label: 'Rows from JSON' },
  ],
};
