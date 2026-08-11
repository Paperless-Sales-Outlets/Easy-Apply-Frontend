// These forms have no backend yet. Until account lookup is wired up, we
// simulate "we already know who you are" once the phone is OTP-verified,
// matching the UX of forms that do have a lookup (e.g. Reconnection).
const MOCK_PROFILE = {
  fullName: 'John Doe',
  nic: '199012345678',
  email: 'john.doe@example.com',
  fixedNo: '0112345678',
  existingPackage: 'Fibre Broadband 50Mbps',
};

// OTP context stores the 9-digit number without the leading 0.
const formatPhone = (phone) => {
  if (!phone) return '';
  return phone.length === 9 ? `0${phone}` : phone;
};

export function getMockCustomerProfile(verifiedMobile) {
  return {
    ...MOCK_PROFILE,
    contactNo: formatPhone(verifiedMobile),
  };
}
