/* Spark + Vue 3: <div v-spark>…</div>  — register globally with app.use(SparkPlugin) or locally { directives: { spark: vSpark } }.
   Features must be defined first (import the Spark bundle, or Spark.define(...)). */
import Spark from '../core.js';

export const vSpark = {
  mounted: el => { Spark.init(el); },
  updated: el => { Spark.refresh(el); },
  unmounted: el => { Spark.destroy(el); },
};
export const SparkPlugin = { install(app) { app.directive('@asticore/spark', vSpark); } };
export default SparkPlugin;
