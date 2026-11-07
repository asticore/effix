/* Docs data for draggable (not bundled). */
module.exports = {
  title: 'Draggable',
  group: 'Pointer',
  summary: 'Drag any element with mouse, touch or pen. Keep it inside bounds, snap it to a grid, and on release spring it home, throw it with inertia (bouncing off the bounds) or leave it. Arrow keys move it when focused.',
  classes: [
    ['efx-draggable', 'Make this element draggable. It moves with the `translate` property (not `transform`), is focusable and gets role="group" + aria-roledescription="draggable".'],
  ],
  options: [
    ['data-efx-axis', 'both', 'x · y · both'],
    ['data-efx-bounds', 'parent', '"parent", a CSS selector of a bounding element, or "none".'],
    ['data-efx-release', 'spring', 'spring = snap back to the start · inertia = keep gliding with friction · stay = leave it where dropped.'],
    ['data-efx-spring', '170,18', 'Spring "stiffness,damping".'],
    ['data-efx-friction', '0.92', 'Inertia: velocity kept per frame (closer to 1 = longer glide).'],
    ['data-efx-bounce', '0.5', 'Inertia: speed kept when bouncing off a bound (0 = dead stop).'],
    ['data-efx-snap', '0', 'Grid size in px to snap to (0 = off).'],
    ['data-efx-step', '10', 'Arrow-key step in px (Shift = ×5; the snap size wins when set).'],
    ['data-efx-handle', '', 'Selector inside the element that starts the drag (touch-action:none is set on the handle only).'],
  ],
  events: [
    ['efx:dragstart', 'Fired once the pointer has moved a few pixels. detail = {x, y}.'],
    ['efx:drag', 'On every move (and arrow-key nudge). detail = {x, y} translate offsets.'],
    ['efx:dragend', 'On pointer release, before the spring/inertia plays. detail = {x, y}.'],
  ],
  vars: [
    ['--efx-color', 'Shine tone/primary', 'Focus ring color.'],
  ],
  examples: [
    { html: `<div class="grid md:grid-cols-3 gap-4 p-4">
  <div class="card p-4" style="height:200px"><p class="text-sm">Spring back</p>
    <button class="btn efx-draggable" data-efx-release="spring">Drag me</button></div>
  <div class="card p-4" style="height:200px"><p class="text-sm">Throw (inertia)</p>
    <button class="btn efx-draggable" data-efx-release="inertia">Throw me</button></div>
  <div class="card p-4" style="height:200px"><p class="text-sm">Axis x, 40px grid</p>
    <button class="btn efx-draggable" data-efx-release="stay" data-efx-axis="x" data-efx-snap="40">Snap</button></div>
</div>` },
  ],
};
