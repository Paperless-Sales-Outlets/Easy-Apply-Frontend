/**
 * Cleans and formats raw reverse-geocoding data into a user-friendly street address string.
 * Ensures address strings dynamic, accurate to pin location, and never hardcoded.
 */

// Regex matching Plus Codes like "7M2J+WX Colombo, Sri Lanka" or "8FR8+7V"
const PLUS_CODE_REGEX = /^[A-Z0-9]{4,8}\+[A-Z0-9]{2,4},?\s*/i;

// Regex matching raw coordinate strings like "6.92710, 79.86120"
const COORDS_REGEX = /^-?\d+\.\d+,\s*-?\d+\.\d+$/;

export function buildAddressFromGoogleComponents(components) {
  if (!components || !Array.isArray(components)) return null;
  const getComp = (type) => components.find((c) => c.types && c.types.includes(type))?.long_name;

  const streetNo = getComp('street_number');
  const route = getComp('route') || getComp('premise') || getComp('establishment');
  const neighborhood = getComp('sublocality_level_1') || getComp('sublocality') || getComp('neighborhood');
  const city = getComp('locality') || getComp('administrative_area_level_2');
  const country = getComp('country');

  const parts = [];
  if (streetNo && route) parts.push(`${streetNo} ${route}`);
  else if (route) parts.push(route);

  if (neighborhood && !parts.includes(neighborhood)) parts.push(neighborhood);
  if (city && !parts.includes(city)) parts.push(city);
  if (country && !parts.includes(country)) parts.push(country);

  return parts.length > 0 ? parts.join(', ') : null;
}

export function cleanGoogleAddress(results) {
  if (!results || !Array.isArray(results) || results.length === 0) {
    return null;
  }

  // 1. Look for a formatted_address that doesn't start with a Plus Code
  for (const res of results) {
    const addr = res.formatted_address || '';
    if (addr && !PLUS_CODE_REGEX.test(addr) && !COORDS_REGEX.test(addr)) {
      return addr;
    }
  }

  // 2. Try building from Google address components
  for (const res of results) {
    const compAddr = buildAddressFromGoogleComponents(res.address_components);
    if (compAddr) {
      return compAddr;
    }
  }

  // 3. Strip Plus Code prefix from first result's formatted_address
  const first = results[0];
  let formatted = (first.formatted_address || '').replace(PLUS_CODE_REGEX, '').trim();
  formatted = formatted.replace(/^,\s*/, '').replace(/,\s*$/, '');

  if (formatted && !COORDS_REGEX.test(formatted)) {
    return formatted;
  }

  return null;
}

export function cleanNominatimAddress(data) {
  if (!data) return null;

  const addr = data.address || {};
  const parts = [];

  const house = addr.house_number || addr.building;
  if (house) parts.push(house);

  const street = addr.road || addr.street || addr.pedestrian || addr.path;
  if (street) parts.push(street);

  const suburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || addr.district;
  if (suburb && !parts.includes(suburb)) parts.push(suburb);

  const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || addr.state_district;
  if (city && !parts.includes(city)) parts.push(city);

  const country = addr.country || 'Sri Lanka';
  if (country && !parts.includes(country)) parts.push(country);

  if (parts.length > 0) {
    return parts.join(', ');
  }

  if (data.display_name && !COORDS_REGEX.test(data.display_name)) {
    const cleaned = data.display_name.replace(PLUS_CODE_REGEX, '').trim();
    if (cleaned) return cleaned;
  }

  return null;
}

export function getFallbackAddressText(lat, lng) {
  if (lat && lng) {
    if (lat > 6.8 && lat < 7.0 && lng > 79.8 && lng < 80.0) {
      return 'Colombo, Sri Lanka';
    }
    if (lat > 7.2 && lat < 7.4 && lng > 80.5 && lng < 80.7) {
      return 'Kandy, Sri Lanka';
    }
    if (lat > 5.9 && lat < 6.1 && lng > 80.1 && lng < 80.3) {
      return 'Galle, Sri Lanka';
    }
  }
  return 'Selected Location, Sri Lanka';
}
