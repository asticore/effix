/* Docs data for popup (not bundled). */
module.exports = {
  title: 'Popup triggers',
  group: 'Components',
  summary: 'Auto-opens a Shine modal on a timer, after scrolling, or on exit intent, with frequency capping. Also wires up open/close buttons.',
  classes: [
    ['efx-popup', 'Add to a <dialog class="modal">. Opens with showModal(): Esc, focus trap and backdrop come from the browser.'],
    ['[data-efx-open="id"]', 'Any element (or a[href="#id"]) that opens the popup manually.'],
    ['[data-efx-close]', 'Inside the dialog: closes it. Clicking the backdrop closes it too.'],
  ],
  options: [
    ['data-efx-delay', '-1', 'Seconds before auto-opening. -1 = off.'],
    ['data-efx-scroll', '0', 'Open after scrolling this percent of the page. 0 = off.'],
    ['data-efx-exit', 'false', 'Open on exit intent (pointer leaves the top of the window, desktop only).'],
    ['data-efx-frequency', 'always', 'always · session · days · once.'],
    ['data-efx-days', '7', 'With frequency="days": wait this many days before showing again.'],
    ['data-efx-id', '(element id)', 'Storage key suffix: efx-popup:<id>.'],
  ],
  vars: [],
  examples: [
    { html: `<button class="btn" data-efx-open="demo-popup">Open popup</button>
<dialog class="modal efx-popup" id="demo-popup" aria-labelledby="demo-popup-t">
  <div class="modal-header"><strong id="demo-popup-t">Join the newsletter</strong><button class="btn-close" data-efx-close aria-label="Close"></button></div>
  <div class="modal-body">Auto popups wait for a delay, scroll depth or exit intent, and respect a frequency cap.</div>
  <div class="modal-footer"><button class="btn btn-ghost" data-efx-close>Not now</button><button class="btn" data-efx-close>Subscribe</button></div>
</dialog>` },
  ],
};
