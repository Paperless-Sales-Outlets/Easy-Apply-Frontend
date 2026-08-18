// Neither the Product nor Connection model carries a dedicated technology
// field — it has to be inferred from free-text name/category strings, the
// same way the rest of the app already does (see LocationChangeWizard's
// FTTH/LTE/Megaline picker and customerController's serviceType derivation).
// Word-boundary matches only — plain substring tests false-positive on
// ordinary words (e.g. "ADSL Splitter/Filter" contains "lte" inside
// "Filter", which would otherwise misclassify an accessory as LTE).
export function classifyTechnology(text) {
  const s = (text || '').toLowerCase();
  if (!s) return 'Unknown';
  if (/\b(fibre|fiber|ftth)\b/.test(s)) return 'Fibre';
  if (/\blte\b/.test(s)) return 'LTE';
  if (/\b(megaline|adsl|copper)\b/.test(s)) return 'Copper';
  if (/\bpeo[\s-]?tv\b/.test(s)) return 'PEOTV';
  if (/\bvoice\b/.test(s)) return 'Voice';
  return 'Unknown';
}

const TECH_RANK = { Copper: 1, LTE: 2, Fibre: 3 };

export function getTechRank(tech) {
  return TECH_RANK[tech] || 0;
}

// Parses a free-text speed string ("300 Mbps", "Up to 1 Gbps", "HD Quality")
// into a comparable Mbps number, or null when it can't be compared.
export function parseSpeedMbps(text) {
  if (!text) return null;
  const match = String(text).toLowerCase().match(/([\d.]+)\s*(gbps|mbps)/);
  if (!match) return null;
  const value = parseFloat(match[1]);
  if (Number.isNaN(value)) return null;
  return match[2] === 'gbps' ? value * 1000 : value;
}

// Package migration is upgrade-only (per BRD direction): a candidate package
// counts as an upgrade if it moves to a strictly better technology
// (Copper -> LTE -> Fibre), or — within the same technology — offers more
// speed, falling back to price when speed can't be compared.
export function isPackageUpgrade(currentPkg, candidatePkg) {
  const currentRank = getTechRank(classifyTechnology(currentPkg?.name));
  const candidateRank = getTechRank(classifyTechnology(candidatePkg?.name));

  if (candidateRank !== currentRank) return candidateRank > currentRank;

  const currentSpeed = parseSpeedMbps(currentPkg?.speed);
  const candidateSpeed = parseSpeedMbps(candidatePkg?.speed);
  if (currentSpeed != null && candidateSpeed != null) return candidateSpeed > currentSpeed;

  const currentPrice = Number(currentPkg?.monthlyPrice) || 0;
  const candidatePrice = Number(candidatePkg?.monthlyPrice) || 0;
  return candidatePrice > currentPrice;
}

// Fibre requires a physical loop/port at the customer's premises — migrating
// within the same medium (e.g. a faster Fibre or LTE tier) doesn't. Only
// trigger the coverage check when the upgrade actually moves onto fibre.
export function needsLoopCheck(currentPkg, candidatePkg) {
  const currentTech = classifyTechnology(currentPkg?.name);
  const candidateTech = classifyTechnology(candidatePkg?.name);
  return currentTech !== 'Fibre' && candidateTech === 'Fibre';
}
