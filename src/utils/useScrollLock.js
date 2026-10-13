import { useEffect } from 'react';

// Locks page scroll while a dialog/sheet is open. Reference-counted so stacked
// overlays don't unlock each other; `scrollbar-gutter: stable` (theme.css)
// stops the layout from shifting when the scrollbar disappears.
let locks = 0;
let previous = '';

export default function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    const body = document.body;
    if (locks === 0) {
      previous = body.style.overflow;
      body.style.overflow = 'hidden';
    }
    locks += 1;
    return () => {
      locks -= 1;
      if (locks === 0) body.style.overflow = previous;
    };
  }, [active]);
}
