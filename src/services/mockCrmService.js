/**
 * Mock CRM Service
 * 
 * TEMPORARY implementation for development and testing.
 * This simulates a real CRM API that checks customer existence by NIC.
 * 
 * TODO: Replace with real CRM API integration when available.
 * The real implementation should call something like:
 * GET /api/customers/by-nic/{nic}
 */

// Mock CRM customer database
const mockCustomers = [
  {
    nic: '200012345678',
    mobileNumber: '0779999999'
  },
  {
    nic: '199912345678',
    mobileNumber: '0718888888'
  },
  {
    nic: '200112345678',
    mobileNumber: '0757777777'
  },
  {
    nic: '980123456V',
    mobileNumber: '0771234567'
  },
  {
    nic: '895678901V',
    mobileNumber: '0712345678'
  },
  {
    nic: '750234567V',
    mobileNumber: '0759876543'
  },
];

/**
 * Check if a customer exists in the CRM by NIC number.
 * Simulates an API call with a small delay.
 * 
 * @param {string} nic - Sri Lankan NIC number (old or new format)
 * @returns {Promise<Object>} Customer data or not-found response
 * 
 * @example
 * // Successful response
 * {
 *   exists: true,
 *   nic: "200012345678",
 *   mobileNumber: "0779999999"
 * }
 * 
 * @example
 * // Not found response
 * {
 *   exists: false,
 *   mobileNumber: null
 * }
 */
export async function checkCustomerByNIC(nic) {
  // Simulate API delay (500ms)
  await new Promise(resolve => setTimeout(resolve, 500));

  // Normalize NIC for comparison (remove spaces, uppercase)
  const normalizedNic = nic.replace(/\s/g, '').toUpperCase();

  // Find customer in mock database
  const customer = mockCustomers.find(c => 
    c.nic.replace(/\s/g, '').toUpperCase() === normalizedNic
  );

  if (customer) {
    return {
      exists: true,
      nic: customer.nic,
      mobileNumber: customer.mobileNumber
    };
  }

  return {
    exists: false,
    mobileNumber: null
  };
}

/**
 * Mask a mobile number for display (e.g., 077****999)
 * 
 * @param {string} mobileNumber - Full mobile number
 * @returns {string} Masked mobile number
 */
export function maskMobileNumber(mobileNumber) {
  if (!mobileNumber || mobileNumber.length < 7) return mobileNumber;
  return mobileNumber.slice(0, 3) + '****' + mobileNumber.slice(-3);
}
