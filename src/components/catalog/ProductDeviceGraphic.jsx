import React from 'react';

/* All graphics are sized to fit inside a ~110px wide container */

/* ── Fibre Broadband Router ── */
function RouterGraphic() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 130 108" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))' }}>
      <defs>
        <linearGradient id="rb" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#2d3748" /><stop offset="1" stopColor="#1a202c" />
        </linearGradient>
      </defs>

      {/* Antennas */}
      <rect x="22" y="8" width="5" height="44" rx="2.5" fill="#1a2232" />
      <rect x="62" y="2" width="5" height="50" rx="2.5" fill="#1a2232" />
      <rect x="103" y="8" width="5" height="44" rx="2.5" fill="#1a2232" />
      {/* Antenna tips */}
      <circle cx="24.5" cy="7" r="3" fill="#38bdf8" opacity="0.9" />
      <circle cx="64.5" cy="1" r="3" fill="#38bdf8" opacity="0.9" />
      <circle cx="105.5" cy="7" r="3" fill="#38bdf8" opacity="0.9" />

      {/* Body */}
      <rect x="5" y="52" width="120" height="32" rx="9" fill="url(#rb)" />
      <rect x="8" y="56" width="114" height="24" rx="7" fill="#111827" />

      {/* LEDs */}
      <circle cx="22" cy="68" r="3" fill="#38bdf8">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="33" cy="68" r="3" fill="#38bdf8">
        <animate attributeName="opacity" values="1;0.3;1" dur="2.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="44" cy="68" r="3" fill="#10b981">
        <animate attributeName="opacity" values="1;0.4;1" dur="2.6s" repeatCount="indefinite"/>
      </circle>
      <circle cx="55" cy="68" r="3" fill="#38bdf8" />
      <circle cx="66" cy="68" r="3" fill="#38bdf8" />

      {/* Branding */}
      <rect x="82" y="63" width="28" height="10" rx="3" fill="#1e3a5f" />
      <rect x="84" y="65" width="8" height="6" rx="1" fill="#0056b3" />
      <rect x="94" y="65" width="14" height="6" rx="1" fill="#0284c7" />

      {/* Feet */}
      <rect x="10" y="83" width="14" height="3" rx="1.5" fill="#0d1117" />
      <rect x="48" y="83" width="14" height="3" rx="1.5" fill="#0d1117" />
      <rect x="86" y="83" width="14" height="3" rx="1.5" fill="#0d1117" />
      <rect x="106" y="83" width="14" height="3" rx="1.5" fill="#0d1117" />

      {/* Shadow */}
      <ellipse cx="65" cy="100" rx="52" ry="5" fill="black" opacity="0.2" />
    </svg>
  );
}

/* ── LTE Home Unit ── */
function LTEGraphic() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 115 115" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.45))' }}>
      <defs>
        <linearGradient id="lb" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f0f4f8" /><stop offset="1" stopColor="#d9e2ec" />
        </linearGradient>
        <linearGradient id="lf" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#ffffff" /><stop offset="1" stopColor="#e8f0f7" />
        </linearGradient>
      </defs>

      {/* Tower */}
      <rect x="20" y="10" width="55" height="90" rx="12" fill="url(#lb)" />
      <rect x="23" y="13" width="49" height="84" rx="10" fill="url(#lf)" />

      {/* Signal bars */}
      <rect x="30" y="22" width="4" height="8" rx="1" fill="#10b981" />
      <rect x="36" y="19" width="4" height="11" rx="1" fill="#10b981" />
      <rect x="42" y="16" width="4" height="14" rx="1" fill="#10b981" />
      <rect x="48" y="22" width="4" height="8" rx="1" fill="#d1dce8" />
      <circle cx="58" cy="24" r="3" fill="#10b981">
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
      </circle>

      {/* Screen */}
      <rect x="27" y="36" width="41" height="28" rx="4" fill="#0f172a" />
      <rect x="29" y="38" width="37" height="24" rx="3" fill="#0d1b2a" />
      <rect x="32" y="42" width="20" height="2" rx="1" fill="#38bdf8" opacity="0.9" />
      <rect x="32" y="47" width="28" height="2" rx="1" fill="#64748b" opacity="0.8" />
      <rect x="32" y="52" width="24" height="2" rx="1" fill="#64748b" opacity="0.7" />
      <rect x="32" y="57" width="16" height="2" rx="1" fill="#10b981" opacity="0.9" />

      {/* SLT badge */}
      <rect x="28" y="70" width="39" height="12" rx="4" fill="#0056b3" />
      <text x="47.5" y="79.5" fontSize="7" fontWeight="800" fill="#fff" textAnchor="middle" fontFamily="system-ui,sans-serif">SLT</text>

      {/* Ports */}
      <rect x="28" y="87" width="39" height="10" rx="3" fill="#d9e2ec" />
      <rect x="31" y="89" width="8" height="6" rx="1" fill="#94a3b8" />
      <rect x="42" y="89" width="8" height="6" rx="1" fill="#94a3b8" />
      <rect x="53" y="89" width="8" height="6" rx="1" fill="#94a3b8" />

      {/* Remote */}
      <rect x="82" y="38" width="20" height="58" rx="6" fill="#1e2a3a" />
      <rect x="84" y="40" width="16" height="56" rx="5" fill="#252d3a" />
      <circle cx="92" cy="50" r="5" fill="#0056b3" />
      <circle cx="92" cy="64" r="7" fill="#1e2a3a" />
      <circle cx="92" cy="64" r="5" fill="#334155" />
      <circle cx="92" cy="59" r="2" fill="#64748b" />
      <circle cx="92" cy="69" r="2" fill="#64748b" />
      <circle cx="87" cy="64" r="2" fill="#64748b" />
      <circle cx="97" cy="64" r="2" fill="#64748b" />
      <rect x="86" y="76" width="4" height="3" rx="1" fill="#3d4a5c" />
      <rect x="90" y="76" width="4" height="3" rx="1" fill="#3d4a5c" />
      <rect x="94" y="76" width="4" height="3" rx="1" fill="#3d4a5c" />
      <rect x="86" y="81" width="4" height="3" rx="1" fill="#3d4a5c" />
      <rect x="90" y="81" width="4" height="3" rx="1" fill="#3d4a5c" />
      <rect x="94" y="81" width="4" height="3" rx="1" fill="#3d4a5c" />

      <ellipse cx="57" cy="108" rx="45" ry="4" fill="black" opacity="0.18" />
    </svg>
  );
}

/* ── PEO TV ── */
function PEOTVGraphic() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.45))' }}>
      <defs>
        <linearGradient id="ts" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#1e293b" /><stop offset="1" stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id="sg" cx="50%" cy="50%" r="50%">
          <stop stopColor="#0284c7" stopOpacity="0.85" />
          <stop offset="1" stopColor="#0f172a" stopOpacity="0.25" />
        </radialGradient>
      </defs>

      {/* Monitor */}
      <rect x="5" y="5" width="110" height="70" rx="8" fill="#1a2030" />
      <rect x="8" y="8" width="104" height="64" rx="6" fill="url(#ts)" />
      <rect x="12" y="12" width="96" height="56" rx="4" fill="url(#sg)" />
      <rect x="28" y="26" width="64" height="28" rx="4" fill="#0f172a" opacity="0.6" />
      <text x="60" y="44" fontSize="11" fontWeight="900" fill="#ff6b35" textAnchor="middle" fontFamily="system-ui,sans-serif">PEO TV</text>

      {/* Stand */}
      <rect x="50" y="75" width="20" height="10" rx="1" fill="#1e2a3a" />
      <rect x="35" y="85" width="50" height="5" rx="2.5" fill="#0f172a" />

      {/* STB */}
      <rect x="10" y="90" width="100" height="14" rx="5" fill="#1a2232" />
      <rect x="12" y="91" width="96" height="12" rx="4" fill="#1e2a3a" />
      <circle cx="20" cy="97" r="3" fill="#10b981">
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/>
      </circle>
      <rect x="28" y="93" width="22" height="8" rx="2" fill="#0f172a" />
      <rect x="30" y="95" width="5" height="4" rx="1" fill="#10b981" opacity="0.8" />
      <rect x="37" y="95" width="5" height="4" rx="1" fill="#10b981" opacity="0.8" />
      <rect x="80" y="94" width="10" height="6" rx="1" fill="#0d1117" />
      <rect x="93" y="94" width="10" height="6" rx="1" fill="#0d1117" />

      <ellipse cx="60" cy="107" rx="50" ry="4" fill="black" opacity="0.18" />
    </svg>
  );
}

/* ── Voice Home Phone ── */
function VoicePhoneGraphic() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 120 108" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.45))' }}>
      <defs>
        <linearGradient id="pb" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#2d3748" /><stop offset="1" stopColor="#1a202c" />
        </linearGradient>
      </defs>

      {/* Phone base */}
      <rect x="28" y="32" width="82" height="64" rx="10" fill="url(#pb)" />
      <rect x="31" y="35" width="76" height="58" rx="8" fill="#1e2a3a" />

      {/* LCD screen */}
      <rect x="36" y="40" width="66" height="20" rx="4" fill="#0f172a" />
      <rect x="38" y="42" width="62" height="16" rx="3" fill="#0d1b2a" />
      <rect x="41" y="45" width="36" height="2" rx="1" fill="#38bdf8" opacity="0.9" />
      <rect x="41" y="50" width="26" height="2" rx="1" fill="#64748b" opacity="0.7" />
      <rect x="41" y="55" width="30" height="2" rx="1" fill="#64748b" opacity="0.6" />

      {/* Keypad — 3x4 */}
      {[0,1,2,3].map(row => [0,1,2].map(col => (
        <rect key={`${row}-${col}`}
          x={40 + col * 16} y={66 + row * 10}
          width="11" height="7" rx="2" fill="#2d3a4a" />
      )))}

      {/* Handset */}
      <rect x="3" y="16" width="23" height="72" rx="11.5" fill="#0f172a" />
      <rect x="5" y="18" width="19" height="68" rx="9.5" fill="#1a2232" />
      <ellipse cx="14.5" cy="28" rx="7" ry="9" fill="#0f172a" />
      <ellipse cx="14.5" cy="28" rx="5" ry="7" fill="#1e2a3a" />
      <ellipse cx="14.5" cy="76" rx="7" ry="9" fill="#0f172a" />
      <ellipse cx="14.5" cy="76" rx="5" ry="7" fill="#1e2a3a" />
      <path d="M26 56 Q30 56 30 66 Q30 76 28 78" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* SLT badge */}
      <rect x="76" y="88" width="28" height="9" rx="3" fill="#0056b3" />
      <text x="90" y="95.5" fontSize="6" fontWeight="800" fill="white" textAnchor="middle" fontFamily="system-ui,sans-serif">SLT</text>

      <ellipse cx="68" cy="106" rx="50" ry="4" fill="black" opacity="0.18" />
    </svg>
  );
}

/* ── Add-on Static IP ── */
function StaticIPGraphic() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 115 115" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', filter: 'drop-shadow(0 6px 16px rgba(124,58,237,0.55))' }}>
      <defs>
        <linearGradient id="so" x1="18" y1="8" x2="97" y2="106" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" /><stop offset="0.5" stopColor="#7c3aed" /><stop offset="1" stopColor="#4c1d95" />
        </linearGradient>
        <linearGradient id="si" x1="28" y1="18" x2="90" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" /><stop offset="1" stopColor="#3b0764" />
        </linearGradient>
        <radialGradient id="sg2" cx="50%" cy="38%" r="50%">
          <stop stopColor="#c4b5fd" stopOpacity="0.35" /><stop offset="1" stopColor="#6d28d9" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer shield */}
      <path d="M57.5 6 L97 22 V52 C97 76 80 94 57.5 104 C35 94 18 76 18 52 V22 L57.5 6Z"
        fill="url(#so)" stroke="#a855f7" strokeWidth="2" />
      {/* Inner shield */}
      <path d="M57.5 16 L88 29 V52 C88 72 74 87 57.5 96 C41 87 27 72 27 52 V29 L57.5 16Z"
        fill="url(#si)" />
      {/* Glow */}
      <path d="M57.5 16 L88 29 V52 C88 72 74 87 57.5 96 C41 87 27 72 27 52 V29 L57.5 16Z"
        fill="url(#sg2)" />

      {/* Circle */}
      <circle cx="57.5" cy="52" r="18" fill="rgba(255,255,255,0.1)" />
      <circle cx="57.5" cy="52" r="13" fill="rgba(255,255,255,0.08)" />

      {/* IP text */}
      <text x="57.5" y="58" fontSize="16" fontWeight="900" fill="#ffffff"
        textAnchor="middle" fontFamily="system-ui,sans-serif" letterSpacing="1">IP</text>

      {/* Edge highlights */}
      <path d="M57.5 6 L97 22" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <path d="M57.5 6 L18 22" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

      {/* Glow halo */}
      <ellipse cx="57.5" cy="104" rx="28" ry="4" fill="rgba(139,92,246,0.35)" />

      {/* Floating orbs */}
      <circle cx="22" cy="38" r="3" fill="#c084fc" opacity="0.6">
        <animate attributeName="cy" values="38;32;38" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="93" cy="42" r="2" fill="#ddd6fe" opacity="0.5">
        <animate attributeName="cy" values="42;36;42" dur="2.5s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

/* ── Main export ── */
export default function ProductDeviceGraphic({ name, category }) {
  if (name?.includes('Fibre') || category === 'Fibre Broadband') return <RouterGraphic />;
  if (name?.includes('LTE') || category === 'LTE Home')           return <LTEGraphic />;
  if (name?.includes('PEO') || category === 'PEO TV')             return <PEOTVGraphic />;
  if (name?.includes('Voice') || category === 'Voice')            return <VoicePhoneGraphic />;
  return <StaticIPGraphic />;
}
