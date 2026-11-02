# Framework integrations

Effix is plain DOM, so it works in any framework. Three tiny wrappers (in `src/integrations/`) call `Effix.init` when an element mounts, `Effix.refresh` when it updates and `Effix.destroy` when it unmounts. Copy them or import them. Features must be registered first: import the bundle (`import 'effix'`) or call `Effix.define(...)`. Set `data-efx-manual` on `<html>` if you don't want the global auto-scan.

## React

```jsx
import { useRef } from 'react';
import { useEffix } from 'effix/react';

export function Hero({ items }) {
  const ref = useRef(null);
  useEffix(ref, [items]);   // re-initialises when deps change
  return <div ref={ref}><h1 className="efx-reveal">Hello</h1></div>;
}
```

## Vue 3

```js
import { EffixPlugin } from 'effix/vue';
app.use(EffixPlugin);
```
```html
<div v-effix><h1 class="efx-reveal">Hello</h1></div>
```
Or locally: `directives: { effix: vEffix }`.

## Svelte

```svelte
<script> import { effix } from 'effix/svelte'; </script>
<div use:effix><h1 class="efx-reveal">Hello</h1></div>
```

## Notes
- The wrapper element owns everything inside it; `destroy` cleans every feature in that subtree.
- Rendering dynamic lists? Re-run via the deps array (React), `updated` (Vue) or `update` (Svelte); or use `Effix.observe()` to auto-init added nodes.
- Server rendering is safe: the core does nothing without `document`.
