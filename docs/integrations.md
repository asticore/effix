# Framework integrations

Spark is plain DOM, so it works in any framework. Three tiny wrappers (in `src/integrations/`) call `Spark.init` when an element mounts, `Spark.refresh` when it updates and `Spark.destroy` when it unmounts. Copy them or import them. Features must be registered first: import the bundle (`import '@asticore/spark'`) or call `Spark.define(...)`. Set `data-spark-manual` on `<html>` if you don't want the global auto-scan.

## React

```jsx
import { useRef } from 'react';
import { useSpark } from '@asticore/spark/react';

export function Hero({ items }) {
  const ref = useRef(null);
  useSpark(ref, [items]);   // re-initialises when deps change
  return <div ref={ref}><h1 className="spark-reveal">Hello</h1></div>;
}
```

## Vue 3

```js
import { SparkPlugin } from '@asticore/spark/vue';
app.use(SparkPlugin);
```
```html
<div v-spark><h1 class="spark-reveal">Hello</h1></div>
```
Or locally: `directives: { spark: vSpark }`.

## Svelte

```svelte
<script> import { spark } from '@asticore/spark/svelte'; </script>
<div use:spark><h1 class="spark-reveal">Hello</h1></div>
```

## Notes
- The wrapper element owns everything inside it; `destroy` cleans every feature in that subtree.
- Rendering dynamic lists? Re-run via the deps array (React), `updated` (Vue) or `update` (Svelte); or use `Spark.observe()` to auto-init added nodes.
- Server rendering is safe: the core does nothing without `document`.
