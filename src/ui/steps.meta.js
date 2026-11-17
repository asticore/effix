module.exports = {
  title: 'Stepper (multi-step)',
  group: 'Data',
  summary: 'Multi-step helper: shows one .spark-step at a time with a numbered progress list, a progress bar, Back / Next / Finish, validation before moving on and optional URL hash sync.',
  classes: [
    ['spark-steps', 'Container. Its direct children with .spark-step are the panels.'],
    ['spark-step', 'A panel. data-spark-title sets its label in the progress list.'],
    ['spark-steps__list / __item / __btn / __num / __title', 'Injected progress list (item states: is-active, is-done; aria-current="step" on the active button). When Shine\'s widgets CSS is loaded it emits Shine\'s own markup instead: ol.stepper > li.step (.done, aria-current="step") > button.step-marker + span.step-label.'],
    ['spark-steps__bar', 'Injected progress bar, driven by --spark-steps-progress (0–1).'],
    ['spark-steps__nav / __back / __next', 'Injected button row.'],
  ],
  options: [
    ['data-spark-start', '0', 'Step to open first (0-based).'],
    ['data-spark-hash', 'false', 'Sync the step with the URL hash as #<id>=<n> (id = the container id, else "step").'],
    ['data-spark-linear', 'true', 'Progress list buttons only go back or to steps already reached.'],
    ['data-spark-native', 'true', 'Check native form validity of the step\'s fields before moving forward.'],
    ['data-spark-validate', '', 'Name of a validator: Spark.add("step-validate", name, (panel, index) => boolean).'],
    ['data-spark-back / next / finish', 'Back / Next / Finish', 'Button labels.'],
    ['data-spark-label', 'Progress', 'Accessible name of the progress list.'],
  ],
  events: [
    ['spark:step', 'Step changed (bubbles). detail = { index, count, previous }.'],
    ['spark:validate', 'Fired on the panel before moving forward; call preventDefault() to stay. detail = { index }.'],
    ['spark:done', 'Finish pressed on the last step and it validated.'],
    ['spark:goto (listen)', 'Dispatch with detail = { index } to jump to a step.'],
  ],
  vars: [['--spark-steps-progress', '0', 'Set by JS: 0–1 completion of the bar.'], ['--spark-color', 'Shine tone', 'Accent colour.']],
  examples: [
    { html: `<form class="spark-steps card p-6" onsubmit="return false">
  <section class="spark-step" data-spark-title="Account"><label class="field">Email <input class="input" type="email" required></label></section>
  <section class="spark-step" data-spark-title="Plan"><label class="field">Plan <select class="select"><option>Starter</option><option>Team</option></select></label></section>
  <section class="spark-step" data-spark-title="Confirm"><p class="m-0">All set. Press Finish.</p></section>
</form>` },
  ],
};
