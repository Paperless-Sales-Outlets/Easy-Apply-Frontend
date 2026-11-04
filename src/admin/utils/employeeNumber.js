// Staff employee numbers are exactly 6 digits (e.g. 099885). Leading zeros are
// part of the number, so it is always kept as text. Mirrors the backend rule in
// Easy-Apply-Backend/utils/employeeNumber.js.
export const EMPLOYEE_NUMBER_LENGTH = 6;
export const EMPLOYEE_NUMBER_PATTERN = /^\d{6}$/;
export const EMPLOYEE_NUMBER_HINT = 'Exactly 6 digits, e.g. 099885';

/** Keeps only digits and caps the length, so the field can't hold anything else. */
export const normalizeEmployeeNumberInput = (value) => String(value || '').replace(/\D/g, '').slice(0, EMPLOYEE_NUMBER_LENGTH);

/** → an error message, or '' when the number is valid. */
export function employeeNumberError(value) {
  const v = String(value || '').trim();
  if (!v) return 'Employee number is required.';
  if (!EMPLOYEE_NUMBER_PATTERN.test(v)) return `Employee number must be exactly ${EMPLOYEE_NUMBER_LENGTH} digits (e.g. 099885).`;
  return '';
}
