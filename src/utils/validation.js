/**
 * Validates a Sri Lankan NIC value against old (9 digits + V/X)
 * or new (12 digits) NIC formats.
 * @param {string} v
 * @returns {boolean}
 */
export function isValidNIC(v) {
  if (!v) return false;

  const value = String(v).trim();
  const oldNicRegex = /^\d{9}[vVxX]$/;
  const newNicRegex = /^\d{12}$/;

  return oldNicRegex.test(value) || newNicRegex.test(value);
}

/**
 * Validates a Sri Lankan mobile number (07 + 8 digits).
 * @param {string} v
 * @returns {boolean}
 */
export function isValidMobile(v) {
  if (!v) return false;

  const value = String(v).trim();
  const mobileRegex = /^07\d{8}$/;

  return mobileRegex.test(value);
}
