/* Docs data for toast (not bundled). */
module.exports = {
  title: 'Toast',
  group: 'Components',
  summary: 'Notification toasts that slide in with a springy nudge, stack per corner, auto-hide with a pause on hover/focus, and close with Shine\'s .btn-close. Show from a template after a delay, from a trigger button, or ad-hoc via an efx:toast event.',
  classes: [['efx-toast', 'Hidden template whose content becomes the toast. Needs `hidden`. Styled by Shine .toast.']],
  options: [
    ['data-efx-show', '(off)', 'Show automatically after this many ms.'],
    ['data-efx-position', 'bottom-right', 'top|bottom + left|center|right.'],
    ['data-efx-duration', '5000', 'Auto-hide ms (0 = sticky). Paused while hovered or focused.'],
    ['data-efx-tone', '', 'Shine tone (primary, success, danger...).'],
  ],
  extend: [
    ['Trigger', '[data-efx-toast="#id"]', 'Clicking shows the template with that id.'],
    ['Event', 'efx:toast', 'document.dispatchEvent(new CustomEvent("efx:toast", {detail:{text, tone, duration, position}})). Text is inserted as plain text. Requires at least one .efx-toast on the page.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="stack gap-3 p-6 text-center" style="min-height:300px;align-content:center">
  <div class="efx-toast" id="toast-demo" data-efx-tone="success" data-efx-duration="4000" hidden><strong>Saved!</strong> Your changes are live.</div>
  <div class="cluster gap-3" style="justify-content:center">
    <button class="btn tone-primary" data-efx-toast="#toast-demo">Show toast</button>
    <button class="btn" onclick="document.dispatchEvent(new CustomEvent('efx:toast',{detail:{text:'Ad-hoc <b>escaped</b> toast',tone:'warning',position:'top-center'}}))">Ad-hoc toast</button>
  </div>
</div>` },
  ],
};
