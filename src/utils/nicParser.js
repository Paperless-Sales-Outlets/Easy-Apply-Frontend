import { getPostalCodeByCity } from './sriLankaPostalCodes.js';

/**
 * Sri Lankan NIC Day-of-Year to Month/Day mapping table (366-day leap year baseline used by DRP)
 */
const MONTH_RANGES = [
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
];

/**
 * Converts day of the year (1-366) to Month (1-12) and Day (1-31)
 */
function getMonthAndDay(dayOfYear) {
  let remainingDays = dayOfYear;
  for (const item of MONTH_RANGES) {
    if (remainingDays <= item.days) {
      return {
        month: item.month,
        day: remainingDays,
      };
    }
    remainingDays -= item.days;
  }
  return null;
}

/**
 * Mathematically decodes Sri Lankan NIC (both 12-digit New format & 9-digit Old format)
 * @param {string} rawNic - Raw extracted NIC string
 * @returns {Object|null} Decoded NIC details or null if invalid
 */
export function parseSriLankanNIC(rawNic) {
  if (!rawNic || typeof rawNic !== 'string') return null;

  const cleanNic = rawNic.replace(/[\s\-_]/g, '').trim().toUpperCase();

  let year = null;
  let dayOfYear = null;
  let isOldFormat = false;

  // New NIC: 12 digits (e.g. 199513312345)
  if (/^\d{12}$/.test(cleanNic)) {
    year = parseInt(cleanNic.substring(0, 4), 10);
    dayOfYear = parseInt(cleanNic.substring(4, 7), 10);
    isOldFormat = false;
  }
  // Old NIC: 9 digits followed by V or X (e.g. 951331234V)
  else if (/^\d{9}[VX]$/.test(cleanNic)) {
    const yy = parseInt(cleanNic.substring(0, 2), 10);
    year = 1900 + yy;
    dayOfYear = parseInt(cleanNic.substring(2, 5), 10);
    isOldFormat = true;
  } else {
    return null;
  }

  // Determine Gender: If dayOfYear > 500, Female and actual days = dayOfYear - 500
  let gender = 'Male';
  let actualDayOfYear = dayOfYear;

  if (dayOfYear > 500) {
    gender = 'Female';
    actualDayOfYear = dayOfYear - 500;
  }

  // Validate day of year range (1 to 366)
  if (actualDayOfYear < 1 || actualDayOfYear > 366) {
    return null;
  }

  const monthDay = getMonthAndDay(actualDayOfYear);
  if (!monthDay) return null;

  const mm = String(monthDay.month).padStart(2, '0');
  const dd = String(monthDay.day).padStart(2, '0');
  const dobFormatted = `${year}-${mm}-${dd}`;

  return {
    isValid: true,
    nic: cleanNic,
    format: isOldFormat ? 'OLD_NIC' : 'NEW_NIC',
    year,
    dayOfYear: actualDayOfYear,
    dob: dobFormatted, // YYYY-MM-DD
    gender, // 'Male' | 'Female'
    suggestedTitle: gender === 'Male' ? 'Mr.' : 'Ms.',
  };
}

/**
 * Extracts and parses NIC from unformatted OCR raw text
 */
export function extractNICFromText(text) {
  if (!text || typeof text !== 'string') return null;

  // Match 12-digit new NIC or 9-digit old NIC with V/X
  const matches = text.match(/\b(\d{12}|\d{9}[vVxX])\b/g);
  if (!matches || matches.length === 0) return null;

  for (const candidate of matches) {
    const parsed = parseSriLankanNIC(candidate);
    if (parsed && parsed.isValid) {
      return parsed;
    }
  }

  return null;
}

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
export function extractFullNameFromOCR(text) {
  if (!text || typeof text !== 'string') return '';

  const ignoredKeywords = [
    'DEMOCRATIC', 'SOCIALIST', 'REPUBLIC', 'SRI', 'LANKA', 'SRILANKA',
    'NATIONAL', 'IDENTITY', 'CARD', 'DEPARTMENT', 'REGISTRATION',
    'PERSONS', 'DATE', 'BIRTH', 'GENDER', 'SEX', 'MALE', 'FEMALE',
    'HOLDER', 'SIGNATURE', 'PLACE', 'COUNTRY', 'LANKAN', 'SRILANKAN',
    'MINISTRY', 'DEFENCE', 'OFFICIAL', 'SECRETARY'
  ];

  const lines = text
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  let bestCandidate = '';

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    // 1. Direct Regex match for 2 to 5 uppercase words (e.g. "MAHALINGAM DAWANHAREN" in "e IC MAHALINGAM DAWANHAREN")
    const matchUpperWords = rawLine.match(/\b([A-Z]{3,}(?:\s+[A-Z]{2,}){1,4})\b/);
    if (matchUpperWords && matchUpperWords[1]) {
      const candidate = matchUpperWords[1].trim();
      const words = candidate.split(/\s+/);
      const isIgnored = words.some((w) => ignoredKeywords.includes(w.toUpperCase()));
      if (!isIgnored && candidate.length > bestCandidate.length) {
        bestCandidate = candidate;
        continue;
      }
    }

    // 2. Names with initials (e.g. "M. DAWANHAREN" or "K.A.D. PERERA")
    const matchInitials = rawLine.match(/\b((?:[A-Z]\.?\s*){1,3}[A-Z]{3,}(?:\s+[A-Z]{3,})?)\b/);
    if (matchInitials && matchInitials[1]) {
      const candidate = matchInitials[1].trim();
      const words = candidate.split(/\s+/);
      const isIgnored = words.some((w) => ignoredKeywords.includes(w.toUpperCase()));
      if (!isIgnored && candidate.length > bestCandidate.length) {
        bestCandidate = candidate;
        continue;
      }
    }

    // 3. Check if line is preceded by "Name" or "Names" label
    const nameMatch = rawLine.match(/(?:Name|Full\s*Name|Names)[\s\:\-\/]+([A-Za-z\s\.\-]{4,})/i);
    if (nameMatch && nameMatch[1]) {
      const candidate = nameMatch[1].replace(/[^A-Za-z\s\.\-]/g, '').trim().toUpperCase();
      const words = candidate.split(/\s+/).filter((w) => w.length > 1);
      const isIgnored = words.some((w) => ignoredKeywords.includes(w.toUpperCase()));
      if (!isIgnored && candidate.length > bestCandidate.length) {
        bestCandidate = candidate;
      }
    }
  }

  return bestCandidate;
}

/**
 * Heuristically extracts Address text from OCR raw text on Sri Lankan NIC reverse side
 */
export function extractAddressFromOCR(text) {
  if (!text || typeof text !== 'string') return '';

  const lines = text
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const addressKeywords = [
    'ROAD', 'STREET', 'MAWATHA', 'DIVISION', 'LANE', 'AVENUE', 'ESTATE',
    'GARDENS', 'WATTE', 'TOWN', 'NAGAR', 'THOTTAM', 'GAMAYA', 'VILLAGE',
    'SCHEME', 'HOUSING', 'COLOMBO', 'KANDY', 'GALLE', 'MATARA', 'JAFFNA',
    'KURUNEGALA', 'GAMPAHA', 'DICKOYA', 'HATTON', 'NUWARA', 'BADULLA',
    'RATNAPURA', 'KEGALLE', 'KALUTARA', 'AMPARA', 'BATTICALOA', 'TRINCOMALEE',
    'ANURADHAPURA', 'POLONNARUWA', 'MATALE', 'PUTTALAM', 'VAVUNIYA', 'MANNAR',
    'MULLAITIVU', 'KILINOCHCHI', 'HAMBANTOTA', 'NO.', 'NO'
  ];

  // 1. First priority: look for a line containing clear Sri Lankan address keywords (e.g. "153,BATHFORD DIVISION, DICKOYA peo SE")
  for (const rawLine of lines) {
    // Stop if we hit official Act or Date markers
    if (/(?:Registration of Persons|Commissioner General|Place of Birth|Date of Issue|\d{4}\/\d{2}\/\d{2})/i.test(rawLine)) {
      break;
    }

    const upper = rawLine.toUpperCase();
    const hasAddressKeyword = addressKeywords.some((kw) => upper.includes(kw));

    if (hasAddressKeyword) {
      // Clean leading & trailing noise
      let clean = rawLine
        .replace(/\s+(?:peo|pro|geo|gemo|emo|bior|bion|se|eb|sb|le|nfley)\b.*$/i, '')
        .replace(/^[^\dA-Za-z]+/, '')
        .replace(/\b[A-Z0-9]{2,4}[0-9A-Z]{4,8}(?:-[A-Z0-9])?\b/g, '')
        .replace(/\b[0-9a-fA-F]{6,10}\b/g, '')
        .replace(/[£§©®™|\\_~@#^*=\[\]\{\}]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Extract the continuous uppercase address block (e.g., "153, BATHFORD DIVISION, DICKOYA")
      const addressPatternMatch = clean.match(/(\d+[\/\-A-Za-z0-9]*,?\s*(?:[A-Za-z0-9]{2,}[\s,]+)+[A-Za-z]{3,})/);
      if (addressPatternMatch && addressPatternMatch[1]) {
        let extracted = addressPatternMatch[1].trim().replace(/,\s*,/g, ',').replace(/\s+,/g, ',');
        // Ensure proper spacing after comma: "153,BATHFORD" -> "153, BATHFORD"
        extracted = extracted.replace(/,([A-Za-z0-9])/g, ', $1');
        return extracted;
      }

      if (clean.length >= 8) {
        return clean.replace(/,([A-Za-z0-9])/g, ', $1');
      }
    }
  }

  // 2. Fallback: Search for lines starting with number + comma (e.g. "153, ...") before official footer
  for (const rawLine of lines) {
    if (/(?:Registration of Persons|Commissioner General|Place of Birth|Date of Issue|\d{4}\/\d{2}\/\d{2})/i.test(rawLine)) {
      break;
    }
    const matchNo = rawLine.match(/^(\d{1,4}[A-Za-z]?[\s,]+[A-Za-z\s,]{5,40})/);
    if (matchNo && matchNo[1]) {
      return matchNo[1].trim().replace(/,([A-Za-z0-9])/g, ', $1');
    }
  }

  return '';
}
