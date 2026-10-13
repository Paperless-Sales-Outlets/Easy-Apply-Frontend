import React from 'react';
import heroArt from '../assets/HeroSLT.png';

/**
 * Brand photography with soft, feathered edges (no hard frame) and a quiet
 * "signal" motion: three thin rings widen from the handset and fade, once
 * every few seconds. It says "connected" without decorating.
 *
 * `focus` picks which of the two people in the SLT artwork is shown.
 * Only transform/opacity animate; reduced motion shows the still image.
 */
const FOCUS = {
  // translateX % of the stage + where the signal source sits inside it (% of stage)
  mobile: { shift: -16, x: 22.4, y: 70.2 },
  voice: { shift: -50, x: 66.5, y: 36 },
};

export default function HeroVisual({ focus = 'mobile', className = '' }) {
  const f = FOCUS[focus] || FOCUS.mobile;
  return (
    <div className={`hero-visual ${className}`} aria-hidden="true">
      <div className="hero-visual__stage" style={{ transform: `translateX(${f.shift}%)` }}>
        <img src={heroArt} alt="" draggable="false" />
        <span className="hero-visual__signal" style={{ left: `${f.x}%`, top: `${f.y}%` }}>
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}
