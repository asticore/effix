/* Spark + Svelte: <div use:spark>…</div>
   Features must be defined first (import the Spark bundle, or Spark.define(...)). */
import Spark from '../core.js';

export function spark(node) {
  Spark.init(node);
  return {
    update() { Spark.refresh(node); },
    destroy() { Spark.destroy(node); },
  };
}
export default spark;
