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
  'COLOMBO 01': 'Colombo',
  'COLOMBO 02': 'Colombo',
  'COLOMBO 03': 'Colombo',
  'COLOMBO 04': 'Colombo',
  'COLOMBO 05': 'Colombo',
  'COLOMBO 06': 'Colombo',
  'COLOMBO 07': 'Colombo',
  'COLOMBO 08': 'Colombo',
  'COLOMBO 09': 'Colombo',
  'COLOMBO 10': 'Colombo',
  'COLOMBO 11': 'Colombo',
  'COLOMBO 12': 'Colombo',
  'COLOMBO 13': 'Colombo',
  'COLOMBO 14': 'Colombo',
  'COLOMBO 15': 'Colombo',
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
 * Mapping of Sinhala & Tamil Town and District names to English
 */
export const SINHALA_TAMIL_TOWN_MAP = {
  // Sinhala Towns
  'කොළඹ': 'Colombo',
  'මහනුවර': 'Kandy',
  'නුවර': 'Kandy',
  'පේරාදෙණිය': 'Peradeniya',
  'ගම්පොල': 'Gampola',
  'කටුගස්තොට': 'Katugastota',
  'කුණ්ඩසාලේ': 'Kundasale',
  'නාවලපිටිය': 'Nawalapitiya',
  'දික්ඔය': 'Dickoya',
  'හැටන්': 'Hatton',
  'තලවාකැලේ': 'Talawakele',
  'නුවරඑළිය': 'Nuwara Eliya',
  'මස්කෙළිය': 'Maskeliya',
  'ගිනිගත්හේන': 'Ginigathena',
  'ගාල්ල': 'Galle',
  'හික්කඩුව': 'Hikkaduwa',
  'කරාපිටිය': 'Karapitiya',
  'ඇල්පිටිය': 'Elpitiya',
  'අම්බලන්ගොඩ': 'Ambalangoda',
  'මාතර': 'Matara',
  'වැලිගම': 'Weligama',
  'අකුරැස්ස': 'Akuressa',
  'දෙණියාය': 'Deniyaya',
  'ගම්පහ': 'Gampaha',
  'මීගමුව': 'Negombo',
  'කැලණිය': 'Kelaniya',
  'කඩවත': 'Kadawatha',
  'රාගම': 'Ragama',
  'ජා-ඇල': 'Ja-Ela',
  'ජා ඇල': 'Ja-Ela',
  'වත්තල': 'Wattala',
  'කිරිබත්ගොඩ': 'Kiribathgoda',
  'මිනුවන්ගොඩ': 'Minuwangoda',
  'මීරිගම': 'Mirigama',
  'වේයන්ගොඩ': 'Veyangoda',
  'කළුතර': 'Kalutara',
  'පානදුර': 'Panadura',
  'හොරණ': 'Horana',
  'බේරුවල': 'Beruwala',
  'අලුත්ගම': 'Aluthgama',
  'මතුගම': 'Matugama',
  'වාද්දුව': 'Wadduwa',
  'බණ්ඩාරගම': 'Bandaragama',
  'කුරුණෑගල': 'Kurunegala',
  'කුලියාපිටිය': 'Kuliyapitiya',
  'නාරම්මල': 'Narammala',
  'පන්නල': 'Pannala',
  'රත්නපුර': 'Ratnapura',
  'ඇඹිලිපිටිය': 'Embilipitiya',
  'බලන්ගොඩ': 'Balangoda',
  'පැල්මඩුල්ල': 'Pelmadulla',
  'ඇහැලියගොඩ': 'Eheliyagoda',
  'කෑගල්ල': 'Kegalle',
  'මාවනැල්ල': 'Mawanella',
  'වරකාපොල': 'Warakapola',
  'රුවන්වැල්ල': 'Ruwanwella',
  'බදුල්ල': 'Badulla',
  'බණ්ඩාරවෙල': 'Bandarawela',
  'හපුතලේ': 'Haputale',
  'ඇල්ල': 'Ella',
  'වැලිමඩ': 'Welimada',
  'මහියංගණය': 'Mahiyanganaya',
  'දියතලාව': 'Diyatalawa',
  'අනුරාධපුර': 'Anuradhapura',
  'මැදවච්චිය': 'Medawachchiya',
  'කැකිරාව': 'Kekirawa',
  'පොළොන්නරුව': 'Polonnaruwa',
  'හිඟුරක්ගොඩ': 'Hingurakgoda',
  'මාතලේ': 'Matale',
  'දඹුල්ල': 'Dambulla',
  'සීගිරිය': 'Sigiriya',
  'පුත්තලම': 'Puttalam',
  'හලාවත': 'Chilaw',
  'මාරවිල': 'Marawila',
  'වෙන්නප්පුව': 'Wennappuwa',
  'හම්බන්තොට': 'Hambantota',
  'තංගල්ල': 'Tangalle',
  'බෙලිඅත්ත': 'Beliatta',
  'අම්බලන්තොට': 'Ambalantota',
  'තිස්සමහාරාමය': 'Tissamaharama',
  'මොණරාගල': 'Monaragala',
  'වැල්ලවාය': 'Wellawaya',
  'කතරගම': 'Kataragama',
  'යාපනය': 'Jaffna',
  'චාවකච්චේරි': 'Chavakachcheri',
  'පේදුරුතුඩුව': 'Point Pedro',
  'වවුනියාව': 'Vavuniya',
  'මන්නාරම': 'Mannar',
  'මුලතිව්': 'Mullaitivu',
  'කිලිනොච්චිය': 'Kilinochchi',
  'ත්‍රිකුණාමලය': 'Trincomalee',
  'ත්රිකුණාමලය': 'Trincomalee',
  'කින්නියා': 'Kinniya',
  'මඩකලපුව': 'Batticaloa',
  'කාත්තන්කුඩි': 'Kattankudy',
  'අම්පාර': 'Ampara',
  'කල්මුනේ': 'Kalmunai',
  'සම්මන්තුරේ': 'Sammanthurai',
  'අක්කරපත්තුව': 'Akkaraipattu',

  // Tamil Towns
  'கொழும்பு': 'Colombo',
  'கண்டி': 'Kandy',
  'பேராதனை': 'Peradeniya',
  'கம்பளை': 'Gampola',
  'நாவலப்பிட்டி': 'Nawalapitiya',
  'டிக்கோயா': 'Dickoya',
  'ஹற்றன்': 'Hatton',
  'தலவாக்கலை': 'Talawakele',
  'நுவரெலியா': 'Nuwara Eliya',
  'மஸ்கெலியா': 'Maskeliya',
  'காலி': 'Galle',
  'ஹிக்கடுவ': 'Hikkaduwa',
  'மாத்தறை': 'Matara',
  'வெலிகம': 'Weligama',
  'கம்பஹா': 'Gampaha',
  'நீர்கொழும்பு': 'Negombo',
  'களுத்துறை': 'Kalutara',
  'பாணந்துறை': 'Panadura',
  'ஹொரண': 'Horana',
  'குருநாகல்': 'Kurunegala',
  'குளியாப்பிட்டிய': 'Kuliyapitiya',
  'இரத்தினபுரி': 'Ratnapura',
  'எம்பிலிப்பிட்டிய': 'Embilipitiya',
  'பலாங்கொடை': 'Balangoda',
  'கேகாலை': 'Kegalle',
  'மாவனல்லை': 'Mawanella',
  'பதுளை': 'Badulla',
  'பண்டாரவளை': 'Bandarawela',
  'அப்புத்தளை': 'Haputale',
  'எல்ல': 'Ella',
  'தியத்தலாவ': 'Diyatalawa',
  'அனுராதபுரம்': 'Anuradhapura',
  'பொலன்னறுவை': 'Polonnaruwa',
  'மாத்தளை': 'Matale',
  'தம்புள்ளை': 'Dambulla',
  'புத்தளம்': 'Puttalam',
  'சிலாபம்': 'Chilaw',
  'அம்பாந்தோட்டை': 'Hambantota',
  'தங்கல்லை': 'Tangalle',
  'மொணராகலை': 'Monaragala',
  'வெல்லவாய': 'Wellawaya',
  'யாழ்ப்பாணம்': 'Jaffna',
  'சாவகச்சேரி': 'Chavakachcheri',
  'பருத்தித்துறை': 'Point Pedro',
  'நல்லூர்': 'Nallur',
  'வவுனியா': 'Vavuniya',
  'மன்னார்': 'Mannar',
  'முல்லைத்தீவு': 'Mullaitivu',
  'கிளிநொச்சி': 'Kilinochchi',
  'திருகோணமலை': 'Trincomalee',
  'கிண்ணியா': 'Kinniya',
  'மட்டக்களப்பு': 'Batticaloa',
  'காத்தான்குடி': 'Kattankudy',
  'ஏறாவூர்': 'Eravur',
  'வாழைச்சேனை': 'Valaichchenai',
  'அம்பாறை': 'Ampara',
  'கல்முனை': 'Kalmunai',
  'சம்மாந்துறை': 'Sammanthurai',
  'அக்கரைப்பற்று': 'Akkaraipattu',
  'பொத்துவில்': 'Potuvil',
};

/**
 * Cleans OCR artifacts (. FETC a, peo, etc.) and normalizes town name
 */
export function cleanTownNoise(str) {
  if (!str || typeof str !== 'string') return '';
  let cleaned = str
    .replace(/\s+(?:peo|pro|geo|gemo|emo|bior|bion|se|eb|sb|le|nfley|pS|jie|jle|die|sie|fetc|etc|fec|setec|drp|a|e|h)\b.*$/i, '')
    .replace(/\b(?:peo|pro|geo|gemo|emo|bior|bion|se|eb|sb|le|nfley|pS|jie|jle|die|sie|fetc|etc|fec|setec|drp)\b/gi, '')
    .replace(/[\.\,\-\/\\_]+$/, '')
    .trim();

  // If the string contains a known Sri Lankan town name, normalize to exact clean town format
  // Sort keys by length descending so 'COLOMBO 03' matches before 'COLOMBO'
  const upper = cleaned.toUpperCase();
  const sortedTowns = Object.keys(SRI_LANKA_TOWN_DISTRICT_MAP).sort((a, b) => b.length - a.length);
  for (const town of sortedTowns) {
    const regex = new RegExp(`\\b${town}\\b`, 'i');
    if (regex.test(cleaned) || upper.startsWith(town)) {
      return town.charAt(0) + town.slice(1).toLowerCase().replace(/\s+([a-z0-9])/g, (_, c) => ' ' + c.toUpperCase());
    }
  }

  return cleaned;
}

/**
 * Parses and splits a Sri Lankan NIC address into addressLine1, addressLine2, city, and district.
 * e.g. "153, BATHFORD DIVISION, DICKOYA. FETC a" ->
 * addressLine1: "153, BATHFORD DIVISION", city: "Dickoya", district: "Nuwara Eliya", postalCode: "22050"
 */
export function parseSriLankanAddress(rawAddress = '', givenCity = '', givenDistrict = '') {
  if (!rawAddress && !givenCity && !givenDistrict) return {};

  let clean = (rawAddress || '')
    .replace(/[\r\n]+/g, ', ')
    .replace(/\s+(?:peo|pro|geo|gemo|emo|bior|bion|se|eb|sb|le|nfley|fetc|etc|fec|setec|drp)\b.*$/i, '')
    .replace(/[£§©®™|\\_~@#^*=\[\]\{\}]/g, '')
    .replace(/\.+$/, '')
    .trim();

  let city = (givenCity || '').trim();
  let district = (givenDistrict || '').trim();

  // 1. Detect Sinhala/Tamil city or district in raw address or givenCity
  for (const [localTown, engTown] of Object.entries(SINHALA_TAMIL_TOWN_MAP)) {
    if (clean.includes(localTown) || city.includes(localTown)) {
      if (!city || city.includes(localTown)) {
        city = engTown;
      }
      if (!district && SRI_LANKA_TOWN_DISTRICT_MAP[engTown.toUpperCase()]) {
        district = SRI_LANKA_TOWN_DISTRICT_MAP[engTown.toUpperCase()];
      }
      break;
    }
  }

  // Strip trailing noise tokens
  const rawParts = clean.split(',').map((p) => p.trim()).filter(Boolean);
  let parts = rawParts.filter((p) => !/^(?:peo|pro|geo|se|emo|bior|h|e|eb|pS|fetc|etc|fec|a)$/i.test(p));

  // If parts contain both English lines and non-English lines, keep English parts only
  const hasEnglish = parts.some((p) => /[A-Za-z]{3,}/.test(p));
  if (hasEnglish) {
    const englishParts = parts.filter((p) => !/[\u0D80-\u0DFF\u0B80-\u0BFF]/.test(p));
    if (englishParts.length >= 2) {
      parts = englishParts;
    }
  }

  let addressLine1 = '';
  let addressLine2 = '';

  // Determine lines
  if (parts.length === 1) {
    addressLine1 = parts[0];
  } else if (parts.length === 2) {
    // If part 0 is just a house number (e.g. "153" or "No. 12"), both belong in addressLine1
    if (/^(?:No\.?|#)?\s*\d+[\/\-A-Za-z0-9]*$/i.test(parts[0])) {
      addressLine1 = `${parts[0]}, ${parts[1]}`;
    } else {
      addressLine1 = parts[0];
      if (!city) city = parts[1];
    }
  } else if (parts.length === 3) {
    // e.g. ["153", "BATHFORD DIVISION", "DICKOYA. FETC a"]
    addressLine1 = `${parts[0]}, ${parts[1]}`;
    if (!city) city = parts[2];
  } else if (parts.length >= 4) {
    addressLine1 = `${parts[0]}, ${parts[1]}`;
    addressLine2 = parts.slice(2, parts.length - 1).join(', ');
    if (!city) city = parts[parts.length - 1];
  }

  // Clean and normalize city and addressLine1 from OCR noise
  if (city) {
    city = cleanTownNoise(city);
    if (SINHALA_TAMIL_TOWN_MAP[city]) {
      city = SINHALA_TAMIL_TOWN_MAP[city];
    }
  }

  if (addressLine1) {
    addressLine1 = addressLine1
      .replace(/\s+(?:peo|pro|geo|gemo|emo|bior|bion|se|eb|sb|le|nfley|pS|jie|jle|die|sie|fetc|etc|fec|setec|drp)\b.*$/i, '')
      .replace(/[\.\,\-\/\\_]+$/, '')
      .trim();
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
          if (!city || city.toUpperCase() === town) city = town;
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
 * Repairs common OCR character misrecognitions in Sri Lankan names
 * (e.g. 'MANALINGAM' -> 'MAHALINGAM' where thin 'H' crossbar is read as 'N')
 */
export function repairOcrName(name) {
  if (!name || typeof name !== 'string') return '';

  let repaired = name;

  // 1. Repair H <-> N confusion in common Sri Lankan Tamil/Sinhala name roots
  repaired = repaired.replace(/\b([A-Za-z]*?)NALINGAM\b/gi, '$1HALINGAM');
  repaired = repaired.replace(/\b([A-Za-z]*?)NALINGAM/gi, '$1HALINGAM');

  // 2. Repair DAWANHAF / DAWANHAR -> DAWANHAREN
  repaired = repaired.replace(/\bDAWANHAF\b/gi, 'DAWANHAREN');
  repaired = repaired.replace(/\bDAWANHAR\b/gi, 'DAWANHAREN');
  repaired = repaired.replace(/\b([A-Za-z]{3,})HAF\b/gi, '$1HAREN');

  // 3. Double V misread as W
  repaired = repaired.replace(/\bVV/g, 'W');

  return repaired;
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
    'MINISTRY', 'DEFENCE', 'OFFICIAL', 'SECRETARY',
    'UCT', 'UTC', 'ICT', 'NIC', 'SLT', 'NATIONALITY',
    'DICKOYA', 'HATTON', 'TALAWAKELE', 'COLOMBO', 'KANDY', 'GALLE',
    'MATARA', 'JAFFNA', 'KURUNEGALA', 'GAMPAHA', 'NEGOMBO', 'RATNAPURA',
    'BADULLA', 'KEGALLE', 'KALUTARA', 'AMPARA', 'BATTICALOA', 'TRINCOMALEE',
    'ANURADHAPURA', 'POLONNARUWA', 'MATALE', 'PUTTALAM', 'VAVUNIYA', 'MANNAR',
    'MULLAITIVU', 'KILINOCHCHI', 'HAMBANTOTA', 'MONARAGALA', 'JIE', 'JLE'
  ];

  const lines = text
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const cleanNameToken = (cand) => {
    let cleaned = cand
      .replace(/^(?:UCT|UTC|ICT|NIC|IC|E\s*IC|NO|ID|DOC|SRI\s*LANKAN|LANKAN)\s+/i, '')
      .replace(/^(?:DICKOYA|COLOMBO|KANDY|GALLE|MATARA|JAFFNA|KURUNEGALA|GAMPAHA|HATTON|NUWARA\s*ELIYA|BADULLA|RATNAPURA|KEGALLE|KALUTARA|AMPARA|BATTICALOA|TRINCOMALEE|ANURADHAPURA|POLONNARUWA|MATALE|PUTTALAM|VAVUNIYA|MANNAR|MULLAITIVU|KILINOCHCHI|HAMBANTOTA|MONARAGALA)[\s,]+(?:Jie|Jle|die|sie|peo|pro|geo|se|eb|sb|le)?\s*,?\s*/i, '')
      .replace(/\s+(?:UCT|UTC|ICT|NIC|IC|NO|ID|Jie|Jle|peo|se)$/i, '')
      .replace(/^[,\s\.\-]+/, '')
      .trim();
    return repairOcrName(cleaned);
  };

  let bestCandidate = '';

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    // 1. Direct Regex match for 2 to 5 uppercase words
    const matchUpperWords = rawLine.match(/\b([A-Z]{2,}(?:\s+[A-Z]{2,}){1,4})\b/);
    if (matchUpperWords && matchUpperWords[1]) {
      let candidate = cleanNameToken(matchUpperWords[1]);
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
      let candidate = cleanNameToken(matchInitials[1]);
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
      let candidate = cleanNameToken(nameMatch[1].replace(/[^A-Za-z\s\.\-]/g, '').trim().toUpperCase());
      const words = candidate.split(/\s+/).filter((w) => w.length > 1);
      const isIgnored = words.some((w) => ignoredKeywords.includes(w.toUpperCase()));
      if (!isIgnored && candidate.length > bestCandidate.length) {
        bestCandidate = candidate;
      }
    }
  }

  return cleanNameToken(bestCandidate);
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

  const ignoredAdministrativeKeywords = [
    'REGISTRATION OF PERSONS', 'COMMISSIONER GENERAL', 'PLACE OF BIRTH',
    'DATE OF ISSUE', 'DEPARTMENT', 'REPUBLIC OF SRI LANKA', 'HOLDER',
    'SIGNATURE', 'MINISTRY', 'SECRETARY',
    'පුද්ගලයින් ලියාපදිංචි', 'පාලක ජනරාල්', 'උපන් ස්ථානය', 'නිකුත් කළ දිනය',
    'දෙපාර්තමේන්තුව', 'උප්පැන්න සහතිකය', 'ශ්‍රී ලංකා', 'අත්සන',
    'ஆட்பதிவுத் திணைக்களம்', 'ஆணையாளர் நாயகம்', 'பிறந்த இடம்', 'வழங்கப்பட்ட திகதி',
    'பிறப்பு அத்தாட்சிப் பத்திரம்'
  ];

  const addressKeywords = [
    'ROAD', 'STREET', 'MAWATHA', 'DIVISION', 'LANE', 'AVENUE', 'ESTATE',
    'GARDENS', 'WATTE', 'TOWN', 'NAGAR', 'THOTTAM', 'GAMAYA', 'VILLAGE',
    'SCHEME', 'HOUSING', 'COLOMBO', 'KANDY', 'GALLE', 'MATARA', 'JAFFNA',
    'KURUNEGALA', 'GAMPAHA', 'DICKOYA', 'HATTON', 'NUWARA', 'BADULLA',
    'RATNAPURA', 'KEGALLE', 'KALUTARA', 'AMPARA', 'BATTICALOA', 'TRINCOMALEE',
    'ANURADHAPURA', 'POLONNARUWA', 'MATALE', 'PUTTALAM', 'VAVUNIYA', 'MANNAR',
    'MULLAITIVU', 'KILINOCHCHI', 'HAMBANTOTA', 'NO.', 'NO',
    // Sinhala keywords
    'පාර', 'මාවත', 'වත්ත', 'කොට්ඨාශය', 'ගම', 'නිවස', 'වීදිය', 'දෙපාර්තමේන්තුව',
    'කොළඹ', 'මහනුවර', 'ගාල්ල', 'මාතර', 'යාපනය', 'කුරුණෑගල', 'ගම්පහ', 'දික්ඔය',
    'හැටන්', 'නුවරඑළිය', 'බදුල්ල', 'රත්නපුර', 'කෑගල්ල', 'කළුතර',
    // Tamil keywords
    'வீதி', 'தோட்டம்', 'கிராமம்', 'கொழும்பு', 'கண்டி', 'யாழ்ப்பாணம்', 'டிக்கோயா', 'ஹற்றன்'
  ];

  const candidateLines = [];

  for (const rawLine of lines) {
    const upper = rawLine.toUpperCase();

    // Skip administrative lines
    const isIgnored = ignoredAdministrativeKeywords.some((kw) => upper.includes(kw) || rawLine.includes(kw));
    if (isIgnored) continue;

    // Skip date-like footer lines (e.g. 1995/12/30 or 2018-05-10)
    if (/^\d{4}[\/\.\-]\d{2}[\/\.\-]\d{2}/.test(rawLine.trim())) continue;

    // Check if line has address keywords or starts with number/house indicator
    const hasAddressKw = addressKeywords.some((kw) => upper.includes(kw) || rawLine.includes(kw));
    const isHouseNumberLine = /^(?:No\.?|#)?\s*\d+[\/\-A-Za-z0-9]*,?\s+/i.test(rawLine);

    if (hasAddressKw || isHouseNumberLine) {
      let clean = rawLine
        .replace(/\s+(?:peo|pro|geo|gemo|emo|bior|bion|se|eb|sb|le|nfley)\b.*$/i, '')
        .replace(/^[^\dA-Za-z\u0D80-\u0DFF\u0B80-\u0BFF]+/, '')
        .replace(/\b(?=[A-Za-z0-9]*\d)(?=[A-Za-z0-9]*[A-Za-z])[A-Za-z0-9]{8,16}(?:-[A-Za-z0-9]+)?\b/g, '')
        .replace(/[£§©®™|\\_~@#^*=\[\]\{\}]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (clean.length >= 3) {
        candidateLines.push(clean);
      }
    }
  }

  // Prioritize English lines if present (avoids dual Tamil + English duplication)
  const englishLines = candidateLines.filter((l) => /[A-Za-z]{3,}/.test(l) && !/[\u0D80-\u0DFF\u0B80-\u0BFF]/.test(l));
  const selectedLines = englishLines.length > 0 ? englishLines : candidateLines;

  if (selectedLines.length > 0) {
    let combined = selectedLines.join(', ')
      .replace(/,\s*,/g, ', ')
      .replace(/\s+,/g, ', ')
      .replace(/,([A-Za-z0-9\u0D80-\u0DFF\u0B80-\u0BFF])/g, ', $1')
      .trim();
    return combined;
  }

  // Fallback: search for first line starting with a number before official footer
  for (const rawLine of lines) {
    if (/(?:Registration of Persons|Commissioner General|Place of Birth|Date of Issue|\d{4}\/\d{2}\/\d{2})/i.test(rawLine)) {
      break;
    }
    const matchNo = rawLine.match(/^(\d{1,4}[A-Za-z]?[\s,]+[A-Za-z\u0D80-\u0DFF\u0B80-\u0BFF\s,]{4,50})/);
    if (matchNo && matchNo[1]) {
      return matchNo[1].trim().replace(/,([A-Za-z0-9])/g, ', $1');
    }
  }

  return '';
}
