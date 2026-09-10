/**
 * Sri Lankan National Identity Card — number model.
 *
 * Both card formats encode the holder's birth year, birth day-of-year and sex
 * inside the number itself, so those three facts can be *derived* rather than
 * read off the card. That matters for OCR: reading twelve digits reliably is a
 * far easier problem than reading a printed date, and everything derived from
 * those digits is then exact instead of best-effort.
 *
 *   Old format   YY DDD NNNN + V|X      9 digits and a letter, e.g. 851234567V
 *                └┬┘ └┬┘ └─┬┘   └┬┘
 *                 │   │    │     └── V = voter, X = non-voter
 *                 │   │    └──────── serial
 *                 │   └───────────── day of year (+500 if female)
 *                 └───────────────── birth year, last two digits
 *
 *   New format   YYYY DDD NNNNN      12 digits, e.g. 198512304567
 *                └─┬┘ └┬┘ └─┬─┘
 *                  │   │    └─────── serial
 *                  │   └──────────── day of year (+500 if female)
 *                  └──────────────── birth year, all four digits
 *
 * This module is pure: no DOM, no network, no dependencies. It is the single
 * source of truth for anything that has to understand an NIC number.
 */

/** Card formats. */
export const NIC_FORMAT = {
  OLD: 'OLD_NIC',
  NEW: 'NEW_NIC',
};

/** Reasons a value can fail to parse. Stable keys, safe to switch on. */
export const NIC_ERROR = {
  EMPTY: 'EMPTY',
  BAD_SHAPE: 'BAD_SHAPE',
  YEAR_OUT_OF_RANGE: 'YEAR_OUT_OF_RANGE',
  DAY_OUT_OF_RANGE: 'DAY_OUT_OF_RANGE',
};

/**
 * Day-of-year table used by the Department for Registration of Persons.
 *
 * February is counted as 29 days for EVERY year, leap or not — the calendar is
 * a fixed 366-day ruler, not the real length of the holder's birth year. Using
 * a normal day-of-year calculation instead shifts every birthday from March
 * onwards by one day in non-leap years, which is the single most common bug in
 * NIC decoders.
 *
 * Exported so it can be checked against a real card without reading this file.
 */
export const MONTH_RANGES = Object.freeze([
  { month: 1, name: 'January', days: 31 },
  { month: 2, name: 'February', days: 29 },
  { month: 3, name: 'March', days: 31 },
  { month: 4, name: 'April', days: 30 },
  { month: 5, name: 'May', days: 31 },
  { month: 6, name: 'June', days: 30 },
  { month: 7, name: 'July', days: 31 },
  { month: 8, name: 'August', days: 31 },
  { month: 9, name: 'September', days: 30 },
  { month: 10, name: 'October', days: 31 },
  { month: 11, name: 'November', days: 30 },
  { month: 12, name: 'December', days: 31 },
]);

/** Female day-of-year values are offset by this much. */
const FEMALE_OFFSET = 500;

/** Days in the fixed DRP calendar (February always 29). */
const DAYS_IN_YEAR = 366;

/** Nobody alive holds an NIC issued against a birth year before this. */
const MIN_BIRTH_YEAR = 1900;

/**
 * A two-digit old-format year of "00" means 2000, not 1900.
 *
 * The old format stopped being issued in 2016 and the DRP issues a first NIC at
 * 16, so the youngest old-format holder was born in 2000 — while a 1900 birth
 * would put the holder past 125. Every other two-digit year is unambiguous.
 */
function resolveOldFormatYear(twoDigitYear) {
  return twoDigitYear === 0 ? 2000 : 1900 + twoDigitYear;
}

/** Turns a day of the fixed 366-day calendar into { month, day }. */
function toMonthAndDay(dayOfYear) {
  let remaining = dayOfYear;
  for (const range of MONTH_RANGES) {
    if (remaining <= range.days) return { month: range.month, day: remaining };
    remaining -= range.days;
  }
  return null;
}

/** True when the calendar date actually exists (catches 29 Feb in a common year). */
function isRealDate(year, month, day) {
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

/** Whole years between an ISO date and today. */
function yearsSince(isoDate, today = new Date()) {
  const [y, m, d] = isoDate.split('-').map(Number);
  let age = today.getUTCFullYear() - y;
  const monthDiff = today.getUTCMonth() + 1 - m;
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < d)) age -= 1;
  return age;
}

/**
 * Strips separators and normalises case. Does not judge the result.
 * @param {string} raw
 * @returns {string}
 */
export function cleanNIC(raw) {
  if (raw === null || raw === undefined) return '';
  return String(raw).replace(/[\s\-_/.]/g, '').trim().toUpperCase();
}

/**
 * Parses an NIC number into everything it encodes.
 *
 * @param {string} raw - NIC in either format; separators and case are forgiven.
 * @param {Object} [options]
 * @param {Date} [options.today] - Reference date, for deterministic tests.
 * @returns {Object|null} `null` when the value is not an NIC at all; otherwise a
 *   record with `isValid: true`. `dob` is `null` — with an explanation in
 *   `warnings` — when the number decodes to a date that does not exist, so a
 *   caller never prefills a fabricated birthday.
 */
export function parseNIC(raw, options = {}) {
  const nic = cleanNIC(raw);
  if (!nic) return null;

  let format;
  let year;
  let rawDayOfYear;
  let serial;
  let voterMark = null;

  if (/^\d{12}$/.test(nic)) {
    format = NIC_FORMAT.NEW;
    year = Number(nic.slice(0, 4));
    rawDayOfYear = Number(nic.slice(4, 7));
    serial = nic.slice(7);
  } else if (/^\d{9}[VX]$/.test(nic)) {
    format = NIC_FORMAT.OLD;
    year = resolveOldFormatYear(Number(nic.slice(0, 2)));
    rawDayOfYear = Number(nic.slice(2, 5));
    serial = nic.slice(5, 9);
    voterMark = nic.slice(9);
  } else {
    return null;
  }

  const currentYear = (options.today || new Date()).getUTCFullYear();
  if (year < MIN_BIRTH_YEAR || year > currentYear) return null;

  const isFemale = rawDayOfYear > FEMALE_OFFSET;
  const dayOfYear = isFemale ? rawDayOfYear - FEMALE_OFFSET : rawDayOfYear;
  if (dayOfYear < 1 || dayOfYear > DAYS_IN_YEAR) return null;

  const monthDay = toMonthAndDay(dayOfYear);
  if (!monthDay) return null;

  const warnings = [];
  let dob = null;
  if (isRealDate(year, monthDay.month, monthDay.day)) {
    dob = `${year}-${String(monthDay.month).padStart(2, '0')}-${String(monthDay.day).padStart(2, '0')}`;
  } else {
    // Only reachable for day 60 (29 February) in a common year: the DRP
    // calendar always reserves the slot, so the number is structurally sound
    // but the date it points at never happened.
    warnings.push(
      `Day ${dayOfYear} decodes to 29 February ${year}, which does not exist. Date of birth must be entered manually.`
    );
  }

  const gender = isFemale ? 'Female' : 'Male';

  return {
    isValid: true,
    nic,
    format,
    year,
    dayOfYear,
    rawDayOfYear,
    serial,
    voterMark,
    isVoter: voterMark === null ? null : voterMark === 'V',
    dob,
    gender,
    suggestedTitle: isFemale ? 'Ms.' : 'Mr.',
    age: dob ? yearsSince(dob, options.today) : null,
    normalized: toNewFormat(nic),
    warnings,
  };
}

/**
 * Validation with a reason, for form-level error messages.
 * @param {string} raw
 * @param {Object} [options]
 * @returns {{ valid: boolean, reason: string|null, message: string|null, parsed: Object|null }}
 */
export function validateNIC(raw, options = {}) {
  const nic = cleanNIC(raw);
  if (!nic) {
    return { valid: false, reason: NIC_ERROR.EMPTY, message: 'NIC number is required', parsed: null };
  }

  const shapeOk = /^\d{12}$/.test(nic) || /^\d{9}[VX]$/.test(nic);
  if (!shapeOk) {
    return {
      valid: false,
      reason: NIC_ERROR.BAD_SHAPE,
      message: 'Enter 12 digits, or 9 digits followed by V or X',
      parsed: null,
    };
  }

  const parsed = parseNIC(nic, options);
  if (parsed) return { valid: true, reason: null, message: null, parsed };

  // The shape was right, so the failure is one of the two value checks.
  const year = /^\d{12}$/.test(nic)
    ? Number(nic.slice(0, 4))
    : resolveOldFormatYear(Number(nic.slice(0, 2)));
  const currentYear = (options.today || new Date()).getUTCFullYear();

  if (year < MIN_BIRTH_YEAR || year > currentYear) {
    return {
      valid: false,
      reason: NIC_ERROR.YEAR_OUT_OF_RANGE,
      message: `This NIC encodes a birth year of ${year}`,
      parsed: null,
    };
  }

  return {
    valid: false,
    reason: NIC_ERROR.DAY_OUT_OF_RANGE,
    message: 'This NIC encodes a birth date that does not exist',
    parsed: null,
  };
}

/**
 * Converts an old-format NIC to its 12-digit equivalent.
 * The serial widens from four digits to five by gaining a leading zero, which
 * is why converted numbers always have a 0 in position 8.
 * @param {string} raw
 * @returns {string|null} The 12-digit form, or `null` if the input is not an NIC.
 */
export function toNewFormat(raw) {
  const nic = cleanNIC(raw);
  if (/^\d{12}$/.test(nic)) return nic;
  if (!/^\d{9}[VX]$/.test(nic)) return null;

  const year = resolveOldFormatYear(Number(nic.slice(0, 2)));
  return `${year}${nic.slice(2, 5)}0${nic.slice(5, 9)}`;
}

/**
 * Converts a 12-digit NIC back to the old format.
 *
 * Only possible when the number came from an old card in the first place: the
 * serial must still carry its leading zero, and the birth year must be one the
 * two-digit field can express. Returns `null` otherwise — a natively-issued new
 * NIC has no old-format equivalent.
 *
 * @param {string} raw
 * @param {'V'|'X'} [voterMark='V']
 * @returns {string|null}
 */
export function toOldFormat(raw, voterMark = 'V') {
  const nic = cleanNIC(raw);
  if (/^\d{9}[VX]$/.test(nic)) return nic;
  if (!/^\d{12}$/.test(nic)) return null;

  const year = Number(nic.slice(0, 4));
  const serial = nic.slice(7);
  if (serial[0] !== '0') return null;
  if (year !== 2000 && (year < 1901 || year > 1999)) return null;

  const yy = String(year % 100).padStart(2, '0');
  const mark = voterMark === 'X' ? 'X' : 'V';
  return `${yy}${nic.slice(4, 7)}${serial.slice(1)}${mark}`;
}

/**
 * Groups an NIC for display: `1985 123 04567` / `851234567 V`.
 * @param {string} raw
 * @returns {string} The grouped form, or the cleaned input if it is not an NIC.
 */
export function formatNIC(raw) {
  const nic = cleanNIC(raw);
  if (/^\d{12}$/.test(nic)) return `${nic.slice(0, 4)} ${nic.slice(4, 7)} ${nic.slice(7)}`;
  if (/^\d{9}[VX]$/.test(nic)) return `${nic.slice(0, 9)} ${nic.slice(9)}`;
  return nic;
}

/**
 * Characters an OCR engine most often returns in place of a digit.
 * Applied only as a second pass, and only kept when the repaired candidate
 * parses — a guess that does not decode is discarded rather than shown.
 */
const OCR_DIGIT_REPAIRS = {
  O: '0', Q: '0', D: '0',
  I: '1', L: '1', '|': '1', '!': '1',
  Z: '2',
  E: '3',
  A: '4',
  S: '5',
  G: '6',
  T: '7',
  B: '8',
};

function repairOcrDigits(token) {
  return token.replace(/[OQDILZEASGTB|!]/g, (ch) => OCR_DIGIT_REPAIRS[ch] ?? ch);
}

/**
 * Finds the first parseable NIC in a block of OCR text.
 *
 * Runs twice: once over the text as read, then — only if nothing was found —
 * over candidates with common OCR letter/digit confusions repaired.
 *
 * @param {string} text
 * @param {Object} [options]
 * @returns {Object|null} The parsed NIC, with `repaired: true` when the second
 *   pass produced it, or `null` if no candidate decoded.
 */
export function extractNICFromText(text, options = {}) {
  if (!text || typeof text !== 'string') return null;

  const upper = text.toUpperCase();

  // Pass 1 — clean digits, optionally split by spaces the way cards print them.
  const strict = upper.match(/\b\d{9}\s?[VX]\b|\b\d{4}\s?\d{3}\s?\d{5}\b|\b\d{12}\b|\b\d{9}[VX]\b/g) || [];
  for (const candidate of strict) {
    const parsed = parseNIC(candidate, options);
    if (parsed) return { ...parsed, repaired: false };
  }

  // Pass 2 — allow OCR confusions inside otherwise NIC-shaped tokens.
  const loose = upper.match(/[0-9OQDILZEASGTB|!]{9,12}[VX]?/g) || [];
  for (const candidate of loose) {
    const repaired = repairOcrDigits(candidate);
    if (repaired === candidate) continue;
    const parsed = parseNIC(repaired, options);
    if (parsed) return { ...parsed, repaired: true };
  }

  return null;
}

/** Back-compatible alias for the original export name. */
export const parseSriLankanNIC = parseNIC;
