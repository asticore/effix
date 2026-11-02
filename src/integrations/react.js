/* Effix + React: call useEffix(ref, deps) in a component that renders .efx-* markup.
   Features must be defined first (import the Effix bundle, or Effix.define(...)).
     const ref = useRef(null); useEffix(ref, [items]);  return <div ref={ref}>…</div>; */
import { useEffect } from 'react';
import Effix from '../core.js';

export function useEffix(ref, deps = []) {
  useEffect(() => {
    const el = ref && ref.current;
    if (!el) return;
    Effix.init(el);
    return () => Effix.destroy(el);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
export default useEffix;
