import { getPostalCodeByCity } from './sriLankaPostalCodes.js';

/**
 * The NIC number itself is modelled in ./sriLankaNic.js — decoding, validation,
 * old<->new conversion and OCR-tolerant extraction all live there, with tests in
 * ./__tests__/sriLankaNic.test.js. It is re-exported here so existing imports
 * from this module keep working.
 *
 * What stays in this file is the softer, heuristic half: pulling a name and an
 * address out of raw OCR text, and mapping a town to its district and postcode.
 */
export {
  parseSriLankanNIC,
  parseNIC,
  extractNICFromText,
  validateNIC,
  toNewFormat,
  toOldFormat,
  formatNIC,
  cleanNIC,
  NIC_FORMAT,
  NIC_ERROR,
} from './sriLankaNic.js';

export const SRI_LANKAN_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

/**
 * Mapping of Sri Lankan Towns & Cities to their respective Districts
 */
export const SRI_LANKA_TOWN_DISTRICT_MAP = {
  // Nuwara Eliya
  'DICKOYA': 'Nuwara Eliya',
  'HATTON': 'Nuwara Eliya',
  'TALAWAKELE': 'Nuwara Eliya',
  'NUWARA ELIYA': 'Nuwara Eliya',
  'MASKELIYA': 'Nuwara Eliya',
  'GINIGATHHENA': 'Nuwara Eliya',
  'RAGALA': 'Nuwara Eliya',
  'WALAPANE': 'Nuwara Eliya',
  'KOTMALE': 'Nuwara Eliya',
  'HAKGALA': 'Nuwara Eliya',

  // Colombo
  'COLOMBO': 'Colombo',
  'DEHIWALA': 'Colombo',
  'MOUNT LAVINIA': 'Colombo',
  'MORATUWA': 'Colombo',
  'KOTTE': 'Colombo',
  'BATTARAMULLA': 'Colombo',
  'MAHARAGAMA': 'Colombo',
  'KOTTAWA': 'Colombo',
  'PILIYANDALA': 'Colombo',
  'HOMAGAMA': 'Colombo',
  'AVISSAWELLA': 'Colombo',
  'NUGEGODA': 'Colombo',
  'RAJAGIRIYA': 'Colombo',
  'MALABE': 'Colombo',
  'PADUKKA': 'Colombo',
  'PANNIPITIYA': 'Colombo',

  // Gampaha
  'GAMPAHA': 'Gampaha',
  'NEGOMBO': 'Gampaha',
  'KELANIYA': 'Gampaha',
  'KADAWATHA': 'Gampaha',
  'RAGAMA': 'Gampaha',
  'JA-ELA': 'Gampaha',
  'WATTALA': 'Gampaha',
  'KIRIBATHGODA': 'Gampaha',
  'MINUWANGODA': 'Gampaha',
  'MIRIGAMA': 'Gampaha',
  'VEYANGODA': 'Gampaha',
  'DIVULAPITIYA': 'Gampaha',
  'KANDANA': 'Gampaha',

  // Kandy
  'KANDY': 'Kandy',
  'PERADENIYA': 'Kandy',
  'GAMPOLA': 'Kandy',
  'KATUGASTOTA': 'Kandy',
  'KUNDASALE': 'Kandy',
  'NAWALAPITIYA': 'Kandy',
  'AKURANA': 'Kandy',
  'TELDENIYA': 'Kandy',
  'WATTEGAMA': 'Kandy',
  'DIGANA': 'Kandy',

  // Galle
  'GALLE': 'Galle',
  'HIKKADUWA': 'Galle',
  'KARAPITIYA': 'Galle',
  'ELPITIYA': 'Galle',
  'AMBALANGODA': 'Galle',
  'BENTOTA': 'Galle',
  'BADDEGAMA': 'Galle',
  'AHANGAMA': 'Galle',

  // Matara
  'MATARA': 'Matara',
  'WELIGAMA': 'Matara',
  'AKURESSA': 'Matara',
  'DIKWELLE': 'Matara',
  'DENIYAYA': 'Matara',
  'KAMBURUPITIYA': 'Matara',

  // Jaffna
  'JAFFNA': 'Jaffna',
  'CHAVAKACHCHERI': 'Jaffna',
  'NALLUR': 'Jaffna',
  'POINT PEDRO': 'Jaffna',
  'VALVETTITHURAI': 'Jaffna',
  'KARAINAGAR': 'Jaffna',

  // Kurunegala
  'KURUNEGALA': 'Kurunegala',
  'KULIYAPITIYA': 'Kurunegala',
  'NARAMMALA': 'Kurunegala',
  'PANNALA': 'Kurunegala',
  'WARIYAPOLA': 'Kurunegala',
  'MAHO': 'Kurunegala',
  'ALAWWA': 'Kurunegala',
  'GIRIULLA': 'Kurunegala',

  // Ratnapura
  'RATNAPURA': 'Ratnapura',
  'EMBILIPITIYA': 'Ratnapura',
  'BALANGODA': 'Ratnapura',
  'PELMADULLA': 'Ratnapura',
  'KRAVITA': 'Ratnapura',
  'EHELIYAGODA': 'Ratnapura',
  'KALAWANA': 'Ratnapura',

  // Kegalle
  'KEGALLE': 'Kegalle',
  'MAWANELLA': 'Kegalle',
  'WARAKAPOLA': 'Kegalle',
  'RUWANWELLA': 'Kegalle',
  'DERANIYAGALA': 'Kegalle',
  'YATIYANTOTA': 'Kegalle',
  'DEHIOWITA': 'Kegalle',

  // Badulla
  'BADULLA': 'Badulla',
  'BANDARAWELA': 'Badulla',
  'HAPUTALE': 'Badulla',
  'ELLA': 'Badulla',
  'WELIMADA': 'Badulla',
  'MAHIYANGANAYA': 'Badulla',
  'DIYATALAWA': 'Badulla',
  'HALI ELA': 'Badulla',
  'PASSARA': 'Badulla',

  // Kalutara
  'KALUTARA': 'Kalutara',
  'PANADURA': 'Kalutara',
  'HORANA': 'Kalutara',
  'BERUWALA': 'Kalutara',
  'ALUTHGAMA': 'Kalutara',
  'MATUGAMA': 'Kalutara',
  'WADDUWA': 'Kalutara',
  'BANDARAGAMA': 'Kalutara',

  // Puttalam
  'PUTTALAM': 'Puttalam',
  'CHILAW': 'Puttalam',
  'MARAWILA': 'Puttalam',
  'DANKOTUWA': 'Puttalam',
  'NATTANDIYA': 'Puttalam',
  'WENNAPPUWA': 'Puttalam',
  'ANAMADUWA': 'Puttalam',

  // Anuradhapura
  'ANURADHAPURA': 'Anuradhapura',
  'MEDAWACHCHIYA': 'Anuradhapura',
  'KEKIRAWA': 'Anuradhapura',
  'EPPAWALA': 'Anuradhapura',
  'GALNEWA': 'Anuradhapura',
  'TAMBUTTEGAMA': 'Anuradhapura',

  // Matale
  'MATALE': 'Matale',
  'DAMBULLA': 'Matale',
  'SIGIRIYA': 'Matale',
  'GALAWELA': 'Matale',
  'UKUWELA': 'Matale',

  // Hambantota
  'HAMBANTOTA': 'Hambantota',
  'TANGALLE': 'Hambantota',
  'BELIATTA': 'Hambantota',
  'AMBALANTOTA': 'Hambantota',
  'TISSAMAHARAMA': 'Hambantota',

  // Trincomalee
  'TRINCOMALEE': 'Trincomalee',
  'KINNIYA': 'Trincomalee',
  'MUTUR': 'Trincomalee',
  'KANTALE': 'Trincomalee',

  // Batticaloa
  'BATTICALOA': 'Batticaloa',
  'KATTANKUDY': 'Batticaloa',
  'ERAVUR': 'Batticaloa',
  'VALAICHCHENAI': 'Batticaloa',

  // Ampara
  'AMPARA': 'Ampara',
  'KALMUNAI': 'Ampara',
  'SAMMANTHURAI': 'Ampara',
  'AKKARAIPATTU': 'Ampara',
  'SAINTHAMARUTHU': 'Ampara',
  'POTUVIL': 'Ampara',

  // Monaragala
  'MONARAGALA': 'Monaragala',
  'WELLAWAYA': 'Monaragala',
  'BUTTALA': 'Monaragala',
  'BIBILE': 'Monaragala',
  'KATARAGAMA': 'Monaragala',

  // Polonnaruwa
  'POLONNARUWA': 'Polonnaruwa',
  'KADURUWELE': 'Polonnaruwa',
  'HINGURAKGODA': 'Polonnaruwa',
  'MEDIRIGIRIYA': 'Polonnaruwa',

  // Northern Province
  'VAVUNIYA': 'Vavuniya',
  'VAWUNIYA': 'Vavuniya',
  'MANNAR': 'Mannar',
  'MULLAITIVU': 'Mullaitivu',
  'KILINOCHCHI': 'Kilinochchi',
};

/**
 * Parses and splits a Sri Lankan NIC address into addressLine1, addressLine2, city, and district.
 * e.g. "153, BATHFORD DIVISION, DICKOYA peo SE" ->
 * addressLine1: "153, BATHFORD DIVISION", city: "DICKOYA", district: "Nuwara Eliya"
 */
export function parseSriLankanAddress(rawAddress = '', givenCity = '', givenDistrict = '') {
  if (!rawAddress && !givenCity && !givenDistrict) return {};

  const clean = (rawAddress || '')
    .replace(/[\r\n]+/g, ', ')
    .replace(/\s+(?:peo|pro|geo|gemo|emo|bior|bion|se|eb|sb|le|nfley)\b.*$/i, '')
    .replace(/[£§©®™|\\_~@#^*=\[\]\{\}]/g, '')
    .replace(/\.+$/, '')
    .trim();

  // Strip trailing noise tokens
  const rawParts = clean.split(',').map((p) => p.trim()).filter(Boolean);
  const parts = rawParts.filter((p) => !/^(?:peo|pro|geo|se|emo|bior|h|e|eb)$/i.test(p));

  let addressLine1 = '';
  let addressLine2 = '';
  let city = (givenCity || '').trim();
  let district = (givenDistrict || '').trim();

  // Determine lines
  if (parts.length === 1) {
    addressLine1 = parts[0];
  } else if (parts.length === 2) {
    // If part 0 is just a house number (e.g. "153" or "No. 12"), both parts belong in addressLine1
    if (/^(?:No\.?|#)?\s*\d+[\/\-A-Za-z0-9]*$/i.test(parts[0])) {
      addressLine1 = `${parts[0]}, ${parts[1]}`;
    } else {
      addressLine1 = parts[0];
      if (!city) city = parts[1];
    }
  } else if (parts.length === 3) {
    // e.g. ["153", "BATHFORD DIVISION", "DICKOYA"]
    addressLine1 = `${parts[0]}, ${parts[1]}`;
    if (!city) city = parts[2];
  } else if (parts.length >= 4) {
    addressLine1 = `${parts[0]}, ${parts[1]}`;
    addressLine2 = parts.slice(2, parts.length - 1).join(', ');
    if (!city) city = parts[parts.length - 1];
  }

  // Clean city from noise
  if (city) {
    city = city.replace(/\s+(?:peo|pro|geo|gemo|emo|bior|bion|se|eb|sb|le|nfley)\b.*$/i, '').trim();
  }

  // Auto-detect District from Town-District Map
  if (!district && city) {
    const cityUpper = city.toUpperCase();
    if (SRI_LANKA_TOWN_DISTRICT_MAP[cityUpper]) {
      district = SRI_LANKA_TOWN_DISTRICT_MAP[cityUpper];
    } else {
      for (const [town, dist] of Object.entries(SRI_LANKA_TOWN_DISTRICT_MAP)) {
        if (clean.toUpperCase().includes(town) || cityUpper.includes(town)) {
          district = dist;
          break;
        }
      }
    }
  }

  // Auto-detect Postal Code
  let postalCode = '';
  if (city || district) {
    postalCode = getPostalCodeByCity(city, district);
  }

  return {
    addressLine1: addressLine1 || clean,
    addressLine2: addressLine2 || '',
    city: city || '',
    district: district || '',
    postalCode: postalCode || '',
  };
}

/**
 * Heuristically extracts Full Name in English from OCR raw text on Sri Lankan NICs
 */
/**
 * Words that appear on the card but are never part of a person's name.
 */
const NAME_STOPWORDS = new Set([
  'DEMOCRATIC', 'SOCIALIST', 'REPUBLIC', 'SRI', 'LANKA', 'SRILANKA', 'LANKAN', 'SRILANKAN',
  'NATIONAL', 'IDENTITY', 'CARD', 'DEPARTMENT', 'REGISTRATION', 'PERSONS', 'REGISTRAR',
  'DATE', 'BIRTH', 'GENDER', 'SEX', 'MALE', 'FEMALE', 'HOLDER', 'SIGNATURE',
  'PLACE', 'COUNTRY', 'MINISTRY', 'DEFENCE', 'OFFICIAL', 'SECRETARY',
  'COMMISSIONER', 'GENERAL', 'ACT', 'ISSUE', 'ISSUED', 'VALID', 'AUTHORITY',
  'NAME', 'NAMES', 'SURNAME', 'ADDRESS', 'PROFESSION', 'OCCUPATION',
  'SINHALA', 'TAMIL', 'ENGLISH', 'NIC', 'NO', 'ID',
  'OF', 'THE', 'AND', 'IN', 'ON', 'AT', 'TO', 'BY', 'FOR',
]);

/**
 * Lines carrying one of these are field labels, not names. They end whatever
 * name block was being collected, so "Date of Birth" sitting under the name
 * cannot bleed a stray word into it.
 */
const FIELD_LABELS = /\b(?:DATE|BIRTH|SEX|GENDER|ADDRESS|ISSUE[D]?|PLACE|PROFESSION|OCCUPATION|SIGNATURE|AUTHORITY|COMMISSIONER)\b/i;

/**
 * Two-letter words that really are name particles. Everything else of that
 * length on a card is OCR debris ("e IC", "No", "ID"), so plain name words must
 * otherwise be at least three letters.
 */
const NAME_PARTICLES = new Set(['DE', 'LA', 'LE']);

/** Words that mark a line as geography rather than a person. */
const PLACE_WORDS = new Set([
  'PROVINCE', 'DISTRICT', 'NORTH', 'SOUTH', 'EAST', 'WEST',
  'NORTHERN', 'SOUTHERN', 'EASTERN', 'WESTERN', 'CENTRAL',
  'UVA', 'SABARAGAMUWA', 'ROAD', 'STREET', 'MAWATHA', 'LANE', 'ESTATE',
]);

/**
 * True when most of a line's words are places — a town, a district or a word
 * like "Province". The address sits directly under the name on the card, so
 * without this the two run together into one block.
 */
function looksLikePlace(tokens) {
  if (tokens.length === 0) return false;
  const places = tokens.filter(
    (t) => PLACE_WORDS.has(t)
      || SRI_LANKA_TOWN_DISTRICT_MAP[t]
      || SRI_LANKAN_DISTRICTS.some((d) => d.toUpperCase() === t)
  );
  return places.length * 2 >= tokens.length;
}

/** A run of initials, e.g. "K." or "K.A.D." */
const INITIALS = /^(?:[A-Z]\.){1,5}$/;
/** An ordinary name word. Allows internal hyphens and apostrophes. */
const NAME_WORD = /^[A-Z]{3,}(?:[-'][A-Z]{2,})*$/;

/** True when a token can plausibly be part of a name. */
function isNameToken(token) {
  const bare = token.replace(/\./g, '');
  if (bare !== bare.toUpperCase()) return false; // mixed case => not the printed name
  if (NAME_STOPWORDS.has(bare)) return false;
  if (NAME_PARTICLES.has(bare)) return true;
  return INITIALS.test(token) || NAME_WORD.test(token);
}

/** "Name:" printed with the value on the same line. */
const NAME_LABEL_INLINE = /\bNames?\s*[:.]\s*(.+)$/i;
/** "Name" or "Name:" alone on its own line, value underneath. */
const NAME_LABEL_ALONE = /^\s*Names?\s*[:.]?\s*$/i;

/**
 * Reduces one OCR line to the name tokens it contains.
 *
 * Deliberately case-sensitive. The English name is the only thing on the card
 * printed in block capitals; the Sinhala and Tamil lines above it are not Latin
 * text at all, and an `eng` engine renders them as mixed-case nonsense
 * ("Com Shfm Evisens"). Upper-casing the line first — as this used to — turned
 * every one of those into a valid-looking name word.
 */
function nameTokensIn(line) {
  return line
    .replace(/[^A-Za-z.\-' ]+/g, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^[-']+|[-'.]+$/g, (m) => (m.includes('.') ? '.' : '')))
    .filter(Boolean)
    .filter(isNameToken);
}

/**
 * Re-cases a name that OCR read off the card in block capitals.
 *
 * Initials stay upper ("K.A.D."), every other part gets a single leading
 * capital, including after a hyphen or apostrophe ("PERERA-SILVA" ->
 * "Perera-Silva"). Anything already mixed-case is left alone.
 *
 * @param {string} name
 * @returns {string}
 */
export function toNameCase(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      const upper = word.toUpperCase();
      if (INITIALS.test(upper) || /^[A-Z]$/.test(upper)) return upper;
      return upper
        .toLowerCase()
        .replace(/(^|[-'])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
    })
    .join(' ');
}

/**
 * Pulls the holder's full name in English out of raw OCR text from the front of
 * the card.
 *
 * Names routinely wrap across two or three printed lines, so this collects
 * *runs* of consecutive name-like lines rather than picking a single best line —
 * taking only the longest line is why a two-line name used to come back as just
 * the first part.
 *
 * @param {string} text
 * @returns {string} The name in title case, or '' if nothing convincing was found.
 */
export function extractFullNameFromOCR(text) {
  if (!text || typeof text !== 'string') return '';

  const lines = text.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);

  // The card labels the English name outright ("Name: KESAVAN AVANEESH"), which
  // beats any amount of guessing. Trust it when it is there — scoring blocks by
  // size let six words of misread Sinhala outrank the two real ones.
  for (let i = 0; i < lines.length; i += 1) {
    const inline = lines[i].match(NAME_LABEL_INLINE);
    const alone = NAME_LABEL_ALONE.test(lines[i]);
    if (!inline && !alone) continue;

    let tokens = inline ? nameTokensIn(inline[1]) : [];
    // A long name spills onto the next line or two. Keep taking lines until one
    // stops looking like part of the name — a field label, a place, or anything
    // that is not printed in capitals.
    for (let j = i + 1; j <= i + 2 && j < lines.length; j += 1) {
      if (FIELD_LABELS.test(lines[j])) break;
      const next = nameTokensIn(lines[j]);
      if (next.length === 0 || looksLikePlace(next)) break;
      tokens = tokens.concat(next);
    }
    if (tokens.length > 0) return toNameCase(tokens.slice(0, 6).join(' '));
  }

  // No usable label — fall back to grouping consecutive name-like lines.
  const blocks = [];
  let current = null;
  lines.forEach((line, index) => {
    const tokens = FIELD_LABELS.test(line) ? [] : nameTokensIn(line);
    // A label line, a place line, or a line with nothing name-like all end the
    // run. A printed name never wraps past three lines either.
    if (tokens.length === 0 || looksLikePlace(tokens)) {
      current = null;
      return;
    }
    if (!current || current.lineCount >= 3) {
      current = { tokens: [], startLine: index, lineCount: 0 };
      blocks.push(current);
    }
    current.tokens.push(...tokens);
    current.lineCount += 1;
  });

  if (blocks.length === 0) return '';

  // Prefer a block introduced by a "Name" label, then the one with the most
  // parts — a real name is two or more words far more often than one.
  const labelled = new Set();
  lines.forEach((line, index) => {
    if (/\bNAMES?\b/i.test(line)) labelled.add(index).add(index + 1);
  });

  const scored = blocks.map((block) => ({
    block,
    score: Math.min(block.tokens.length, 6) + (labelled.has(block.startLine) ? 3 : 0),
  }));
  scored.sort((a, b) => b.score - a.score);

  const winner = scored[0].block.tokens.slice(0, 6);
  if (winner.length === 0) return '';

  return toNameCase(winner.join(' '));
}

/** Everything below this on the reverse of the card is legal boilerplate. */
const ADDRESS_STOP = /(?:Registration of Persons|Commissioner General|Place of Birth|Date of Issue|\d{4}\/\d{2}\/\d{2})/i;

/** The card labels the address block. */
const ADDRESS_LABEL = /\bAddress\s*[:.]?\s*(.*)$/i;

/** Trailing OCR debris that clings to the end of an address line. */
function tidyAddressLine(line) {
  return line
    .replace(/\s+(?:peo|pro|geo|gemo|emo|bior|bion|se|eb|sb|le|nfley)\b.*$/i, '')
    .replace(/[£§©®™|\\_~@#^*=[\]{}]/g, '')
    .replace(/^[^\dA-Za-z]+/, '')
    .replace(/\s+/g, ' ')
    .replace(/,\s*,/g, ',')
    .replace(/\s+,/g, ',')
    .replace(/,([A-Za-z0-9])/g, ', $1')
    .replace(/[.\s]+$/, '')
    .trim();
}

/**
 * True when a line is the English rendering of the address.
 *
 * The address is printed three times — Sinhala, Tamil, then English — and an
 * `eng` engine turns the first two into mixed-case noise. The English line is
 * the one in capitals, so case is the cleanest way to pick it out. A house
 * number is not necessarily numeric either ("C26/2/2"), which is why this looks
 * for a known town or a comma-separated list rather than a leading digit.
 */
function looksLikeEnglishAddress(line) {
  const clean = (line || '').trim();
  if (clean.length < 8 || ADDRESS_STOP.test(clean)) return false;

  const letters = clean.replace(/[^A-Za-z]/g, '');
  if (letters.length < 6) return false;
  const upperRatio = letters.replace(/[^A-Z]/g, '').length / letters.length;
  if (upperRatio < 0.8) return false;

  const words = clean.toUpperCase().match(/[A-Z]{3,}/g) || [];
  if (words.length === 0) return false;
  const hasTown = words.some((w) => SRI_LANKA_TOWN_DISTRICT_MAP[w])
    || words.some((w) => SRI_LANKAN_DISTRICTS.some((d) => d.toUpperCase() === w));

  return hasTown || (clean.includes(',') && words.length >= 2);
}

/**
 * Pulls the holder's address in English out of OCR text from the back of the card.
 *
 * @param {string} text
 * @returns {string} The address line, or '' if none was recognised.
 */
export function extractAddressFromOCR(text) {
  if (!text || typeof text !== 'string') return '';

  const lines = text.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);

  // Prefer the block introduced by the "Address" label, skipping the Sinhala
  // and Tamil renderings that sit between the label and the English one.
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(ADDRESS_LABEL);
    if (!match) continue;

    if (looksLikeEnglishAddress(match[1])) return tidyAddressLine(match[1]);

    for (let j = i + 1; j <= i + 5 && j < lines.length; j += 1) {
      if (ADDRESS_STOP.test(lines[j])) break;
      if (looksLikeEnglishAddress(lines[j])) return tidyAddressLine(lines[j]);
    }
    break;
  }

  // No label survived the scan — take the first address-shaped line instead.
  for (const line of lines) {
    if (ADDRESS_STOP.test(line)) break;
    if (looksLikeEnglishAddress(line)) return tidyAddressLine(line);
  }

  return '';
}
