// Shared labels, colours and helpers for the admin Lead Management screen.
// The serviceability catalogue is fetched from the API; the copy below is the
// fallback used until it arrives (and if the request fails).

export const LEAD_STATUS_META = {
  new: { label: 'New', tone: 'neutral' },
  'survey-scheduled': { label: 'Survey Scheduled', tone: 'info' },
  'survey-in-progress': { label: 'Survey In Progress', tone: 'info' },
  'survey-completed': { label: 'Survey Completed', tone: 'info' },
  qualified: { label: 'Qualified', tone: 'good' },
  conditional: { label: 'Conditional', tone: 'warn' },
  'not-feasible': { label: 'Not Feasible', tone: 'bad' },
  approved: { label: 'Approved', tone: 'good' },
  converted: { label: 'Converted', tone: 'good' },
  'on-hold': { label: 'On Hold', tone: 'neutral' },
};

export const LEAD_STATUS_OPTIONS = Object.entries(LEAD_STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export const LEAD_RISK_META = {
  none: { label: 'Clear', tone: 'good' },
  low: { label: 'Low Risk', tone: 'info' },
  medium: { label: 'Medium Risk', tone: 'warn' },
  high: { label: 'High Risk', tone: 'warn' },
  critical: { label: 'Critical', tone: 'bad' },
};

export const LEAD_RISK_OPTIONS = Object.entries(LEAD_RISK_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export const LEAD_CHECK_STATUS_META = {
  pending: { label: 'Pending', tone: 'neutral' },
  pass: { label: 'Pass', tone: 'good' },
  marginal: { label: 'Marginal', tone: 'warn' },
  fail: { label: 'Fail', tone: 'bad' },
  waived: { label: 'Waived', tone: 'info' },
  na: { label: 'N/A', tone: 'neutral' },
};

export const LEAD_CHECK_STATUS_OPTIONS = [
  { value: 'pass', label: 'Pass' },
  { value: 'marginal', label: 'Marginal' },
  { value: 'fail', label: 'Fail' },
  { value: 'waived', label: 'Waived' },
  { value: 'na', label: 'Not applicable' },
  { value: 'pending', label: 'Not measured' },
];

export const LEAD_RESOLUTION_META = {
  resurvey: { label: 'Re-survey the site', hint: 'Send a technician back with a different route or meter position.' },
  'alternative-package': { label: 'Offer a different package', hint: 'Serve a lower package the line can reliably carry.' },
  'alternative-technology': { label: 'Switch technology', hint: 'Serve the customer over a different medium (FTTC, wireless).' },
  'engineering-review': { label: 'Escalate to network engineering', hint: 'Request a network build before the customer is committed.' },
  waived: { label: 'Grant an exception', hint: 'Accept the survey as it stands and proceed.' },
  rejected: { label: 'Cannot be served', hint: 'Close the lead and tell the customer why.' },
};

export const LEAD_RESOLUTION_OPTIONS = Object.entries(LEAD_RESOLUTION_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export const LEAD_SOURCE_OPTIONS = [
  { value: 'portal', label: 'Online portal' },
  { value: 'call-centre', label: 'Call centre' },
  { value: 'field-sales', label: 'Field sales' },
  { value: 'partner', label: 'Partner' },
  { value: 'referral', label: 'Referral' },
  { value: 'walk-in', label: 'Walk-in' },
];

export const LEAD_TECHNOLOGY_OPTIONS = [
  { value: 'FTTH', label: 'Fibre to the home' },
  { value: 'FTTC', label: 'Fibre to the cabinet' },
  { value: 'Copper', label: 'Copper' },
  { value: 'Wireless', label: 'Wireless' },
  { value: 'Other', label: 'Other' },
];

// Mirror of the backend catalogue. Used to render the checklist before the
// catalog request resolves, and as the fallback if it fails.
export const FALLBACK_CHECK_CATALOG = [
  {
    key: 'signal-strength',
    label: 'Optical Signal Strength',
    type: 'numeric',
    unit: 'dBm',
    metric: 'ONT receive power measured at the premises',
    threshold: 'Pass at -27 dBm or above, marginal to -30 dBm, fail below',
    scale: { direction: 'above', good: -27, warn: -30 },
    critical: true,
    guidance: 'Read the ONT optical level meter at the customer end. Below -30 dBm the selected package will not stay up.',
  },
  {
    key: 'splitter-capacity',
    label: 'Splitter / PON Port Capacity',
    type: 'numeric',
    unit: '1:x',
    valuePrefix: '1:',
    metric: 'Split ratio and free port count at the distribution point',
    threshold: 'Pass at 1:8 or below, marginal to 1:16, fail above',
    scale: { direction: 'below', good: 8, warn: 16 },
    critical: true,
    guidance: 'A 1:8 splitter with no free port cannot take another drop.',
  },
  {
    key: 'drop-distance',
    label: 'Drop Cable Distance',
    type: 'numeric',
    unit: 'm',
    metric: 'Fibre length from the distribution point to the premises',
    threshold: 'Pass up to 1000 m, marginal to 1500 m, fail beyond',
    scale: { direction: 'below', good: 1000, warn: 1500 },
    critical: false,
    guidance: 'Longer drops lose more power and add latency.',
  },
  {
    key: 'infrastructure',
    label: 'Existing Fibre Infrastructure',
    type: 'select',
    options: ['available', 'partial', 'not-available'],
    optionStatus: { available: 'pass', partial: 'marginal', 'not-available': 'fail' },
    metric: 'Is there an existing drop or an in-building riser?',
    threshold: 'Pass when a drop is already available',
    critical: false,
    guidance: 'A new civil-work drop is a cost and a lead time.',
  },
  {
    key: 'power',
    label: 'Power Availability at Premises',
    type: 'select',
    options: ['available', 'unstable', 'not-available'],
    optionStatus: { available: 'pass', unstable: 'marginal', 'not-available': 'fail' },
    metric: 'Is there a grounded mains point for the ONT and router?',
    threshold: 'Pass when a stable grounded supply is present',
    critical: true,
    guidance: 'Without power the ONT cannot be commissioned.',
  },
  {
    key: 'exchange-capacity',
    label: 'Exchange / Cabinet Port Availability',
    type: 'select',
    options: ['available', 'limited', 'unavailable'],
    optionStatus: { available: 'pass', limited: 'marginal', unavailable: 'fail' },
    metric: 'Free PON port and rack space at the serving exchange',
    threshold: 'Pass when a free port and rack space exist',
    critical: true,
    guidance: 'The exchange port is the last bottleneck.',
  },
  {
    key: 'site-access',
    label: 'Site Access & Terrain',
    type: 'select',
    options: ['easy', 'moderate', 'difficult', 'inaccessible'],
    optionStatus: { easy: 'pass', moderate: 'pass', difficult: 'marginal', inaccessible: 'fail' },
    metric: 'How hard is it to reach and terminate the drop',
    threshold: 'Pass at easy or moderate access',
    critical: false,
    guidance: 'Difficult access changes the installation cost and the time on site.',
  },
  {
    key: 'right-of-way',
    label: 'Right of Way & Cable Route',
    type: 'select',
    options: ['clear', 'permission-required', 'obstructed'],
    optionStatus: { clear: 'pass', 'permission-required': 'marginal', obstructed: 'fail' },
    metric: 'Can the cable be run from the distribution point',
    threshold: 'Pass when the route is clear',
    critical: false,
    guidance: 'A route that needs third-party permission will delay activation.',
  },
  {
    key: 'address-verification',
    label: 'Address & Geo Verification',
    type: 'select',
    options: ['verified', 'unverified', 'mismatch'],
    optionStatus: { verified: 'pass', unverified: 'marginal', mismatch: 'fail' },
    metric: 'Does the address match the network coverage record',
    threshold: 'Pass when the address is verified',
    critical: false,
    guidance: 'A mismatch usually means the lead was quoted for a different building.',
  },
];

export const leadStatusLabel = (status) => LEAD_STATUS_META[status]?.label || status || '—';
export const leadStatusTone = (status) => LEAD_STATUS_META[status]?.tone || 'neutral';
export const leadRiskLabel = (risk) => LEAD_RISK_META[risk]?.label || risk || '—';
export const leadRiskTone = (risk) => LEAD_RISK_META[risk]?.tone || 'neutral';
export const checkStatusLabel = (status) => LEAD_CHECK_STATUS_META[status]?.label || status || '—';
export const checkStatusTone = (status) => LEAD_CHECK_STATUS_META[status]?.tone || 'neutral';

export const sourceLabel = (source) =>
  LEAD_SOURCE_OPTIONS.find((o) => o.value === source)?.label || source || '—';

// Catalogue option values are machine tokens (permission-required). This puts
// them in front of a technician the way the field team would say them.
const OPTION_LABELS = {
  'not-available': 'Not available',
  'permission-required': 'Permission required',
  '1:4': '1:4 splitter (or better)',
  '1:8': '1:8 splitter',
  '1:16': '1:16 splitter',
  '1:32': '1:32 splitter',
};

export const checkOptionLabel = (option) => {
  if (!option) return '—';
  return OPTION_LABELS[option] || option.charAt(0).toUpperCase() + option.slice(1);
};

// Turns "-28.5 dBm" into "-28.5" so it can be compared against a threshold.
export const parseReading = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const cleaned = String(value).replace(/[^0-9.+-]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '+') return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
};

// Rates a numeric reading against a catalogue entry. Returns null when the
// reading cannot be parsed.
export const rateReading = (entry, value) => {
  const num = parseReading(value);
  if (num === null || !entry?.scale) return null;
  const { direction, good, warn } = entry.scale;
  if (direction === 'above') {
    if (num >= good) return 'pass';
    if (num >= warn) return 'marginal';
    return 'fail';
  }
  if (num <= good) return 'pass';
  if (num <= warn) return 'marginal';
  return 'fail';
};

// Rates a picked option against a catalogue entry. Returns null for anything
// the catalogue does not know.
export const rateOption = (entry, value) => {
  const option = String(value || '').trim();
  if (!option) return null;
  return entry?.optionStatus?.[option] || null;
};

// The implied result for any check type — numeric or select. Anything the
// catalogue cannot judge comes back as null, and the caller leaves the
// technician's own verdict alone.
export const rateCheck = (entry, value) =>
  entry?.type === 'select' ? rateOption(entry, value) : rateReading(entry, value);

// How a stored reading should read on screen. Select options come back as
// their spoken labels; split ratios are stored as a bare number (8) but shown
// the way the field team says it (1:8).
export const displayReading = (check) => {
  const value = check?.value;
  if (value === null || value === undefined || value === '') return '—';
  const text = String(value);
  if (check?.type === 'select') return checkOptionLabel(text);
  if (check?.valuePrefix && /^\s*\d/.test(text)) return `${check.valuePrefix}${text}`;
  return text;
};

// A 0-100 reading of a signal strength, used to draw the meter bar.
// -40 dBm (hopeless) maps to 0, -10 dBm (excellent) maps to 100.
export const signalStrengthPercent = (value) => {
  const num = parseReading(value);
  if (num === null) return null;
  const pct = ((num + 40) / 30) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
};

// The colour the meter bar should take for a given reading.
export const signalStrengthTone = (value) => {
  const num = parseReading(value);
  if (num === null) return 'neutral';
  if (num >= -27) return 'good';
  if (num >= -30) return 'warn';
  return 'bad';
};

// "3 of 9 checks cleared" — used in the table and the detail drawer.
export const checkSummary = (lead) => {
  const checks = lead?.checks || [];
  const total = checks.length;
  const cleared = checks.filter((c) => ['pass', 'waived', 'na'].includes(c.status)).length;
  const failed = checks.filter((c) => c.status === 'fail').length;
  const marginal = checks.filter((c) => c.status === 'marginal').length;
  const pending = checks.filter((c) => c.status === 'pending').length;
  return { total, cleared, failed, marginal, pending };
};

// The critical check a lead is most likely to be blocked on.
export const primaryBlockingIssue = (lead) => {
  const checks = lead?.checks || [];
  const failed = checks.find((c) => c.status === 'fail' && c.critical);
  if (failed) return failed;
  const marginal = checks.find((c) => c.status === 'marginal' && c.critical);
  return marginal || null;
};

export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};
