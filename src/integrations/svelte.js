/* Effix + Svelte: <div use:effix>…</div>
   Features must be defined first (import the Effix bundle, or Effix.define(...)). */
import Effix from '../core.js';

export function effix(node) {
  Effix.init(node);
  return {
    update() { Effix.refresh(node); },
    destroy() { Effix.destroy(node); },
  };
}
export default effix;
