/* Spark + React: call useSpark(ref, deps) in a component that renders .spark-* markup.
   Features must be defined first (import the Spark bundle, or Spark.define(...)).
     const ref = useRef(null); useSpark(ref, [items]);  return <div ref={ref}>…</div>; */
import { useEffect } from 'react';
import Spark from '../core.js';

export function useSpark(ref, deps = []) {
  useEffect(() => {
    const el = ref && ref.current;
    if (!el) return;
    Spark.init(el);
    return () => Spark.destroy(el);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
export default useSpark;
