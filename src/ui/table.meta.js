module.exports = {
  title: 'Data table',
  group: 'Data',
  summary: 'Behaviour layer for a plain Shine table: sort, search, per-column filter, paging, sticky header, column visibility, row selection, responsive stack, CSV download and an empty state. Zero dependencies.',
  classes: [
    ['spark-table', 'On a <table> (or a wrapper holding one). Add Shine\'s .table / .table-striped / .table-hover for the look.'],
    ['spark-table__bar', 'Injected toolbar above the table (search, columns, CSV).'],
    ['spark-table__pager', 'Injected pager below the table.'],
    ['spark-table__sort', 'Injected button inside a sortable header cell; the cell carries aria-sort.'],
    ['spark-table__filters', 'Injected per-column filter row.'],
    ['spark-table__empty', 'Row shown when nothing matches.'],
    ['is-selected', 'On a selected row.'],
    ['dt / dt-toolbar / dt-search / dt-pagebar / dt-info / dt-empty / table-wrap / table-sticky-head', 'Used instead of the spark-table__* parts when Shine\'s widgets CSS is loaded. Sortable headers carry aria-sort (none / ascending / descending) around a plain button; selected rows also get aria-selected="true".'],
  ],
  options: [
    ['data-spark-sort', 'true', 'Click a header to sort (numbers, then text, natural order). Cells may set data-spark-value for the sort key.'],
    ['data-spark-search', 'false', 'Search box above the table.'],
    ['data-spark-filters', 'false', 'A filter box under each header.'],
    ['data-spark-page-size', '0', 'Rows per page (0 = no paging).'],
    ['data-spark-sticky', 'false', 'Sticky header (to the page scroll).'],
    ['data-spark-height', '', 'Scroll the body inside this height (px or any CSS length); header stays sticky.'],
    ['data-spark-columns', 'false', 'Column visibility menu.'],
    ['data-spark-select', 'false', 'Row checkboxes with select all; fires a change event.'],
    ['data-spark-stack', 'false', 'Stack cells as label/value pairs under 640px.'],
    ['data-spark-csv', 'false', 'Download CSV button (filtered rows, visible columns; selected rows if any).'],
    ['data-spark-filename', 'table', 'CSV file name (no extension).'],
    ['data-spark-empty', 'No results', 'Text for the empty state.'],
    ['data-spark-placeholder', 'Search…', 'Search box placeholder.'],
    ['data-spark-data', '', 'Replace the rows: JSON array of objects or arrays, a CSV string, or a URL (.json / .csv).'],
  ],
  events: [
    ['change', 'Selection changed (bubbles). detail = { selected: string[][], count }.'],
    ['spark:data (listen)', 'Dispatch with detail = array of objects, array of arrays (first = header), CSV text or { columns, rows } to replace the table data.'],
  ],
  vars: [['--spark-table-top', '0', 'Sticky header offset (e.g. under a fixed navbar).']],
  examples: [
    { html: `<table class="table table-hover spark-table" data-spark-search data-spark-filters data-spark-page-size="3" data-spark-select data-spark-columns data-spark-csv data-spark-filename="plans">
  <thead><tr><th>Plan</th><th>Seats</th><th>Price</th></tr></thead>
  <tbody>
    <tr><td>Starter</td><td>3</td><td>$9</td></tr>
    <tr><td>Team</td><td>10</td><td>$49</td></tr>
    <tr><td>Business</td><td>50</td><td>$199</td></tr>
    <tr><td>Enterprise</td><td>500</td><td>$999</td></tr>
    <tr><td>Hobby</td><td>1</td><td>$0</td></tr>
  </tbody>
</table>` },
    { html: `<table class="table spark-table" data-spark-stack data-spark-search data-spark-data='[{"Name":"Ada","Role":"Engineer"},{"Name":"Grace","Role":"Admiral"},{"Name":"Linus","Role":"Maintainer"}]'></table>`, label: 'Rows from JSON' },
  ],
};
