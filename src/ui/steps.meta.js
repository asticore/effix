module.exports = {
  title: 'Stepper (multi-step)',
  group: 'Data',
  summary: 'Multi-step helper: shows one .efx-step at a time with a numbered progress list, a progress bar, Back / Next / Finish, validation before moving on and optional URL hash sync.',
  classes: [
    ['efx-steps', 'Container. Its direct children with .efx-step are the panels.'],
    ['efx-step', 'A panel. data-efx-title sets its label in the progress list.'],
    ['efx-steps__list / __item / __btn / __num / __title', 'Injected progress list (item states: is-active, is-done; aria-current="step" on the active button). When Shine\'s widgets CSS is loaded it emits Shine\'s own markup instead: ol.stepper > li.step (.done, aria-current="step") > button.step-marker + span.step-label.'],
    ['efx-steps__bar', 'Injected progress bar, driven by --efx-steps-progress (0–1).'],
    ['efx-steps__nav / __back / __next', 'Injected button row.'],
  ],
  options: [
    ['data-efx-start', '0', 'Step to open first (0-based).'],
    ['data-efx-hash', 'false', 'Sync the step with the URL hash as #<id>=<n> (id = the container id, else "step").'],
    ['data-efx-linear', 'true', 'Progress list buttons only go back or to steps already reached.'],
    ['data-efx-native', 'true', 'Check native form validity of the step\'s fields before moving forward.'],
    ['data-efx-validate', '', 'Name of a validator: Effix.add("step-validate", name, (panel, index) => boolean).'],
    ['data-efx-back / next / finish', 'Back / Next / Finish', 'Button labels.'],
    ['data-efx-label', 'Progress', 'Accessible name of the progress list.'],
  ],
  events: [
    ['efx:step', 'Step changed (bubbles). detail = { index, count, previous }.'],
    ['efx:validate', 'Fired on the panel before moving forward; call preventDefault() to stay. detail = { index }.'],
    ['efx:done', 'Finish pressed on the last step and it validated.'],
    ['efx:goto (listen)', 'Dispatch with detail = { index } to jump to a step.'],
  ],
  vars: [['--efx-steps-progress', '0', 'Set by JS: 0–1 completion of the bar.'], ['--efx-color', 'Shine tone', 'Accent colour.']],
  examples: [
    { html: `<form class="efx-steps card p-6" onsubmit="return false">
  <section class="efx-step" data-efx-title="Account"><label class="field">Email <input class="input" type="email" required></label></section>
  <section class="efx-step" data-efx-title="Plan"><label class="field">Plan <select class="select"><option>Starter</option><option>Team</option></select></label></section>
  <section class="efx-step" data-efx-title="Confirm"><p class="m-0">All set. Press Finish.</p></section>
</form>` },
  ],
};
