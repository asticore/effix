/* Docs data for drag (not bundled). */
module.exports = {
  title: 'Drag to scroll',
  group: 'Components',
  summary: 'Click-and-drag panning with momentum for any overflowing container, including Shine carousels. Mouse only (touch scrolls natively); clicks after a drag are suppressed and scroll-snap is paused while dragging.',
  classes: [
    ['efx-drag', 'Container with overflow: auto/scroll. Gets grab/grabbing cursors and .is-dragging while dragging.'],
  ],
  options: [
    ['data-efx-inertia', 'true', 'Keep gliding after release (friction 0.95). Off with reduced motion.'],
    ['data-efx-axis', 'x', 'x · y · both'],
  ],
  vars: [],
  examples: [
    { html: `<div class="efx-drag" style="display:flex;gap:1rem;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:.5rem">
  <div class="card p-6 rounded-lg" style="flex:0 0 220px;scroll-snap-align:start"><h4>One</h4><p>Drag me sideways.</p></div>
  <div class="card p-6 rounded-lg" style="flex:0 0 220px;scroll-snap-align:start"><h4>Two</h4><a href="#">Link (no click after drag)</a></div>
  <div class="card p-6 rounded-lg" style="flex:0 0 220px;scroll-snap-align:start"><h4>Three</h4></div>
  <div class="card p-6 rounded-lg" style="flex:0 0 220px;scroll-snap-align:start"><h4>Four</h4></div>
  <div class="card p-6 rounded-lg" style="flex:0 0 220px;scroll-snap-align:start"><h4>Five</h4></div>
</div>` },
  ],
};
