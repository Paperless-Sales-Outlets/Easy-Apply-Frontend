import React, { useState } from 'react';
import fallbackArt from '../assets/HeroSLT.png';

// A live SLT advert, referenced straight from slt.lk. If SLT rotates the banner
// and the URL stops resolving, the page falls back to the bundled brand artwork
// instead of showing a broken image.
export const AD_URL =
  'https://www.slt.lk/sites/default/files/2026-06/home_slider/Asset%201-100%203.jpg';

/**
 * Right-hand brand panel: the advert sits centred with softened, feathered
 * edges over a blurred wash of its own colours, so there is no hard frame
 * and no blank margin. Static by design; the page's own entrance does the
 * motion.
 */
export default function HeroVisual({ className = '' }) {
  const [src, setSrc] = useState(AD_URL);
  const failed = src !== AD_URL;

  return (
    <div className={`ad-visual${failed ? ' is-fallback' : ''} ${className}`} aria-hidden="true">
      <img className="ad-visual__ambient" src={src} alt="" draggable="false" />
      <img
        className="ad-visual__img"
        src={src}
        alt=""
        draggable="false"
        onError={() => setSrc(fallbackArt)}
      />
    </div>
  );
}
