/* Docs data for tilt (not bundled). */
module.exports = {
  title: 'Tilt',
  group: 'Pointer',
  summary: '3D tilt toward the pointer with optional glare. Fine pointers and motion-OK only.',
  classes: [
    ['spark-tilt', 'Tilt this element toward the pointer.'],
    ['spark-tilt__glare', 'Injected glare layer (data-spark-glare).'],
  ],
  options: [
    ['data-spark-max', '10', 'Max rotation in degrees.'],
    ['data-spark-perspective', '900', 'Perspective in px.'],
    ['data-spark-scale', '1.02', 'Scale while hovered.'],
    ['data-spark-glare', 'false', 'Add a light glare following the pointer.'],
    ['data-spark-reset', 'true', 'Ease back to flat when the pointer leaves.'],
    ['data-spark-gyro', 'false', 'Touch devices: tilt with the phone (deviceorientation). Never prompts; on iOS it only works if your page already obtained motion permission.'],
  ],
  vars: [
    ['--spark-rx / --spark-ry', 'set by JS', 'Current rotation (read-only in practice).'],
  ],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card spark-tilt p-6"><h3>Tilt</h3><p>Hover me.</p></div>
  <div class="card spark-tilt p-6" data-spark-glare data-spark-max="16" data-spark-scale="1.05"><h3>With glare</h3><p>Stronger tilt.</p></div>
</div>` },
  ],
};
