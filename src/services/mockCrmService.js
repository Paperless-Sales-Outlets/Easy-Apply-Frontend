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
 * Find a customer by mobile number.
 * 
 * @param {string} mobileNumber - Mobile number to search for
 * @returns {Object|null} Customer object or null if not found
 */
export function findCustomerByMobile(mobileNumber) {
  const normalizedMobile = mobileNumber.replace(/\D/g, '');
  return mockCustomers.find(c => 
    c.mobileNumber.replace(/\D/g, '') === normalizedMobile
  ) || null;
}

/**
 * Validate customer by NIC and Mobile Number combination.
 * This ensures the NIC and Mobile belong to the SAME customer record.
 * 
 * @param {string} nic - Sri Lankan NIC number
 * @param {string} mobileNumber - Mobile number
 * @returns {Promise<Object>} Validation result
 * 
 * @example
 * // Valid: NIC and Mobile match same customer
 * {
 *   valid: true,
 *   customerExists: true,
 *   mobileNumber: "0779999999",
 *   reason: null
 * }
 * 
 * @example
 * // Invalid: NIC exists but mobile doesn't match
 * {
 *   valid: false,
 *   customerExists: true,
 *   mobileNumber: null,
 *   reason: "NIC_MOBILE_MISMATCH"
 * }
 * 
 * @example
 * // Invalid: Mobile exists under different NIC
 * {
 *   valid: false,
 *   customerExists: false,
 *   mobileNumber: null,
 *   reason: "MOBILE_BELONGS_TO_ANOTHER_CUSTOMER"
 * }
 * 
 * @example
 * // Valid: New customer (neither NIC nor mobile in CRM)
 * {
 *   valid: true,
 *   customerExists: false,
 *   mobileNumber: "0771111111",
 *   reason: null
 * }
 */
export async function validateCustomer(nic, mobileNumber) {
  // Simulate API delay (500ms)
  await new Promise(resolve => setTimeout(resolve, 500));

  const normalizedNic = nic.replace(/\s/g, '').toUpperCase();
  // Normalize mobile: remove non-digits and remove leading 0 for comparison
  const normalizedMobile = mobileNumber.replace(/\D/g, '').replace(/^0/, '');

  // Find customer by NIC
  const customerByNic = mockCustomers.find(c => 
    c.nic.replace(/\s/g, '').toUpperCase() === normalizedNic
  );

  // CASE 1: NIC exists in CRM
  if (customerByNic) {
    // Normalize CRM mobile for comparison (remove leading 0)
    const crmMobile = customerByNic.mobileNumber.replace(/\D/g, '').replace(/^0/, '');
    
    // Check if entered mobile matches the CRM mobile for this NIC
    if (normalizedMobile === crmMobile) {
      // VALID: NIC and Mobile match same customer
      return {
        valid: true,
        customerExists: true,
        mobileNumber: customerByNic.mobileNumber,
        reason: null
      };
    } else {
      // INVALID: NIC exists but mobile doesn't match
      return {
        valid: false,
        customerExists: true,
        mobileNumber: null,
        reason: 'NIC_MOBILE_MISMATCH'
      };
    }
  }

  // CASE 2: NIC does not exist in CRM
  // Check if the entered mobile belongs to another customer
  const customerByMobile = mockCustomers.find(c => {
    const crmMobile = c.mobileNumber.replace(/\D/g, '').replace(/^0/, '');
    return crmMobile === normalizedMobile;
  });

  if (customerByMobile) {
    // INVALID: Mobile exists under a different NIC
    return {
      valid: false,
      customerExists: false,
      mobileNumber: null,
      reason: 'MOBILE_BELONGS_TO_ANOTHER_CUSTOMER'
    };
  }

  // CASE 3: Neither NIC nor Mobile exist in CRM
  // Valid new customer - use entered mobile
  return {
    valid: true,
    customerExists: false,
    mobileNumber: mobileNumber,
    reason: null
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
