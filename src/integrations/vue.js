/* Effix + Vue 3: <div v-effix>…</div>  — register globally with app.use(EffixPlugin) or locally { directives: { effix: vEffix } }.
   Features must be defined first (import the Effix bundle, or Effix.define(...)). */
import Effix from '../core.js';

export const vEffix = {
  mounted: el => { Effix.init(el); },
  updated: el => { Effix.refresh(el); },
  unmounted: el => { Effix.destroy(el); },
};
export const EffixPlugin = { install(app) { app.directive('effix', vEffix); } };
export default EffixPlugin;
