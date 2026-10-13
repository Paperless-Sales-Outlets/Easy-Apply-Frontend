import React, { useEffect, useRef } from 'react';

/**
 * Decorative "connection" illustration: light pulses travel from the SLT hub
 * along three fibre lines to a home, a TV and a phone line. Hovering the art
 * adds a faster burst; moving the pointer nudges the layers (parallax).
 *
 * Pure SVG + CSS: only transform/opacity animate, motion is switched off for
 * people who ask for reduced motion, and the whole thing is aria-hidden
 * because it carries no information.
 */
const HUB = { x: 70, y: 240 };
const LINES = [
  { id: 'fibre', d: 'M70 240 C 210 240, 270 100, 500 96', end: { x: 500, y: 96 }, delay: 0, dur: 5.2 },
  { id: 'tv', d: 'M70 240 C 230 240, 330 236, 500 236', end: { x: 500, y: 236 }, delay: 1.1, dur: 4.6 },
  { id: 'voice', d: 'M70 240 C 210 240, 280 384, 500 376', end: { x: 500, y: 376 }, delay: 2.2, dur: 5.8 },
];

const ICONS = {
  // Feather outlines (24px grid), drawn centred on the node
  fibre: 'M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01',
  tv: 'M4 7h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM17 2l-5 5-5-5',
  voice:
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z',
};

export default function ConnectionArt({ className = '' }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canHover || reduce) return undefined;

    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / r.width;
        const y = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.setProperty('--px', x.toFixed(3));
        el.style.setProperty('--py', y.toFixed(3));
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div ref={rootRef} className={`conn-art ${className}`} aria-hidden="true">
      <svg viewBox="0 0 560 480" role="presentation" focusable="false">
        {/* fibre lines */}
        <g className="conn-art__layer conn-art__layer--back">
          {LINES.map((l) => (
            <path key={l.id} d={l.d} className="conn-art__line" />
          ))}
          <path d="M-20 470 L 150 -10" className="conn-art__slash conn-art__slash--blue" />
          <path d="M20 490 L 190 10" className="conn-art__slash conn-art__slash--green" />
        </g>

        {/* travelling pulses */}
        <g className="conn-art__layer conn-art__layer--mid">
          {LINES.map((l) => (
            <React.Fragment key={l.id}>
              <circle
                r="6"
                className="conn-art__pulse"
                style={{ offsetPath: `path('${l.d}')`, animationDuration: `${l.dur}s`, animationDelay: `${l.delay}s` }}
              />
              <circle
                r="4"
                className="conn-art__pulse conn-art__pulse--burst"
                style={{ offsetPath: `path('${l.d}')`, animationDelay: `${l.delay / 3}s` }}
              />
            </React.Fragment>
          ))}
        </g>

        {/* nodes */}
        <g className="conn-art__layer conn-art__layer--front">
          <g transform={`translate(${HUB.x} ${HUB.y})`}>
            <circle r="40" className="conn-art__hub-ring" />
            <circle r="34" fill="#fff" />
            <path d="M-12 14 L-2 -14" stroke="#0056a2" strokeWidth="6" strokeLinecap="round" />
            <path d="M4 14 L14 -14" stroke="#50b748" strokeWidth="6" strokeLinecap="round" />
          </g>

          {LINES.map((l) => (
            <g key={l.id} transform={`translate(${l.end.x} ${l.end.y})`} className="conn-art__node">
              <circle
                r="30"
                className="conn-art__ring"
                style={{ animationDuration: `${l.dur}s`, animationDelay: `${l.delay}s` }}
              />
              <circle r="28" fill="#fff" />
              <g transform="translate(-12 -12)">
                <path
                  d={ICONS[l.id]}
                  fill="none"
                  stroke="#0056a2"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
