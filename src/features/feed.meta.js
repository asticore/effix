/* Docs data for feed (not bundled). */
module.exports = {
  title: 'Animated feed',
  group: 'Components',
  summary: 'An activity or notification feed: the children of the container appear one at a time and push the others down with a smooth height animation, then loop. Pauses off-screen and in hidden tabs; reduced motion shows the first items statically.',
  classes: [
    ['spark-feed', 'Container. Its direct children are the feed items (cards, rows, anything). Add .stack or a flex column for spacing.'],
  ],
  options: [
    ['data-spark-interval', '1500', 'Milliseconds between new items.'],
    ['data-spark-max', '4', 'How many items are visible at once (the oldest leaves when exceeded).'],
    ['data-spark-loop', 'true', 'Start over after the last item. false = stop once all have appeared.'],
    ['data-spark-order', 'newest', 'newest = new items enter at the top · append = enter at the bottom.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="spark-feed stack gap-2" data-spark-max="4" data-spark-interval="1400" style="min-height:300px">
  <div class="card p-3 rounded-lg">New signup: <strong>Ada</strong></div>
  <div class="card p-3 rounded-lg">Payment received: <strong>$49</strong></div>
  <div class="card p-3 rounded-lg">Deploy finished on <strong>main</strong></div>
  <div class="card p-3 rounded-lg">Comment from <strong>Linus</strong></div>
  <div class="card p-3 rounded-lg">Invoice <strong>#1042</strong> sent</div>
  <div class="card p-3 rounded-lg">New review: 5 stars</div>
</div>` },
  ],
};
