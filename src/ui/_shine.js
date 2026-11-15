/* True when Shine's optional widgets stylesheet (shine-widgets.css) is on the page.
   Widgets then emit Shine's class names (.stepper, .timeline, .calendar, .rating, .dt …) and leave
   the look to Shine; otherwise they use their own efx-* classes and CSS. Probed by styling a throwaway .calendar. */
let yes = false;
export const shineWidgets = () => {
  if (yes || typeof document === 'undefined' || !document.body) return yes;
  const p = document.createElement('div');
  p.className = 'calendar';
  p.style.visibility = 'hidden'; // not absolutely positioned: that would blockify the computed display
  document.body.appendChild(p);
  yes = getComputedStyle(p).display === 'inline-block';
  p.remove();
  return yes;
};
