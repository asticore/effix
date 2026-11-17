/* Docs data for trail (not bundled). */
module.exports = {
  title: 'Cursor trail',
  group: 'Pointer',
  summary: 'Images, dots, rings or emoji spawn along the pointer path inside an element and fade away. Hover mode shows a floating preview image that follows the pointer over [data-spark-image] items. Nodes are pooled and reused. Fine pointers and motion-OK only.',
  classes: [
    ['spark-trail', 'Section that shows the trail / hover preview (becomes position:relative if static).'],
    ['spark-trail__item', 'Injected, pooled, aria-hidden trail node.'],
  ],
  options: [
    ['data-spark-images', '', 'a.jpg|b.jpg|c.jpg : images to spawn (random pick).'],
    ['data-spark-spacing', '80', 'Pointer distance in px between spawns.'],
    ['data-spark-life', '900', 'Lifetime of each item in ms.'],
    ['data-spark-size', '140', 'Item size in px (preview width in hover mode).'],
    ['data-spark-rotate', '12', 'Random rotation +/- degrees.'],
    ['data-spark-max', '12', 'Pool size (items alive at once).'],
    ['data-spark-shape', '', 'Without images: dot · ring · emoji:✨ · or name[:arg] of any registered trail-shape'],
    ['data-spark-mode', 'trail', 'trail · hover (floating preview of the hovered [data-spark-image]).'],
    ['data-spark-image', '', 'On a child in hover mode: preview image URL.'],
  ],
  extend: [
    ['trail-shape', '(size, arg) => Node', 'Return a DOM node placed inside each pooled item (item is size x size, centered; style the node yourself). data-spark-shape="name:arg" passes arg. Built-in: emoji.'],
  ],
  extendExample: `<script>
window.SparkConfig = { extend(E) {
  E.add('trail-shape', 'box', (size, arg) => {
    const n = document.createElement('i');
    n.style.cssText = 'width:' + size / 3 + 'px;height:' + size / 3 + 'px;background:' + (arg || 'hotpink') + ';border-radius:20%';
    return n;
  });
} };
</script>
<div class="spark-trail" data-spark-shape="box:tomato" data-spark-size="60" style="min-height:240px"></div>`,
  vars: [
    ['--spark-color', 'Shine tone/primary', 'Color for dot and ring shapes.'],
  ],
  examples: [
    { html: `<div class="spark-trail card rounded-lg p-6" data-spark-shape="emoji:✨" data-spark-spacing="50" data-spark-size="60" style="min-height:240px;display:grid;place-items:center">
  <p>Move the pointer around here</p>
</div>
<div class="spark-trail card rounded-lg p-6" data-spark-mode="hover" data-spark-size="200" style="min-height:240px">
  <ul class="stack gap-2">
    <li><a href="#" data-spark-image="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='140'%3E%3Crect width='200' height='140' fill='%234f46e5'/%3E%3C/svg%3E">Indigo project</a></li>
    <li><a href="#" data-spark-image="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='140'%3E%3Crect width='200' height='140' fill='%23db2777'/%3E%3C/svg%3E">Pink project</a></li>
  </ul>
</div>` },
  ],
};
