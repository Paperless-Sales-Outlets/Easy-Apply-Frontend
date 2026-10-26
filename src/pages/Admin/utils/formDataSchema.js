// Ordered, human-readable schema for the wizard-collected `formData` on each
// service type. The customer wizards store `formData` as a flat object with no
// step metadata, so this map recreates the step order and field labels so the
// admin detail view can show exactly what the customer entered, step by step.

const FILE_KEYS = new Set([
  'documents',
  'nicFront',
  'nicBack',
  'facePhoto',
  'passportDoc',
  'brcDoc',
  'vatDoc',
  'taxExemptionDoc',
  'signature',
  'signatureUpload',
  'signatureFile',
  'digitalSignature',
  'digitalSignatureBase64',
  'signatureBase64',
  'signatureDoc',
  'proofOfAddress',
  'authorizationLetter',
  'sketchFile',
  'brcFile',
  'premisesPhoto',
  'receiptUpload',
  'paymentReceipt',
  'requestDocument',
  'newOwnerNicPdf',
  'newOwnerNicFront',
  'newOwnerNicBack',
]);

// A field is treated as a document (rendered on the Documents tab) rather than
// inline data when the value points at a stored file.
const FILE_REF = /^(gridfs:\/\/|data:|\/api\/files\/|\/uploads\/)/;

function isFileRef(value) {
  return typeof value === 'string' && FILE_REF.test(value);
}

function isFileKey(key) {
  return FILE_KEYS.has(key) || /^requiredDoc_/.test(key);
}

const PRODUCT_FIELDS = [
  { key: 'productName', label: 'Package' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'monthlyPrice', label: 'Monthly Price (Rs.)' },
  { key: 'installationFee', label: 'Installation Fee (Rs.)' },
  { key: 'speed', label: 'Speed' },
  { key: 'dataAllowance', label: 'Data Allowance' },
];

export const FIELD_LABELS = {
  // Identity / contact
  title: 'Title',
  nameFull: 'Full Name',
  fullName: 'Full Name',
  contactName: 'Contact Name',
  customerName: 'Customer Name',
  legalOwner: 'Legal Owner',
  currentCustomerName: 'Current Customer',
  dob: 'Date of Birth',
  nic: 'NIC / ID / BRC Number',
  currentNic: 'Current NIC',
  email: 'Email Address',
  mobileNumber: 'Verified Mobile',
  mobile: 'Mobile',
  mobileNo: 'Mobile',
  contactNo: 'Contact Number',
  contactNoVerified: 'Contact Number Verified (OTP)',
  currentContactNo: 'Current Contact Number',
  fixedNumber: 'Fixed Number',
  fixedNo: 'Fixed Number',
  faxNumber: 'Fax Number',
  tel: 'Telephone',
  telephone: 'Telephone',
  presentNumber: 'Present Telephone Number',
  currentTelephone: 'Current Telephone Number',
  contactPerson: 'Contact Person',
  customerType: 'Customer Type',

  // Location / address
  locationType: 'Installation Location',
  city: 'City / Area',
  district: 'District',
  postalCode: 'Postal Code',
  address: 'Address',
  address1: 'Address Line 1',
  address2: 'Address Line 2',
  addressLine1: 'Address Line 1',
  addressLine2: 'Address Line 2',
  installAddress: 'Installation Address',
  billingAddress: 'Billing Address',
  currentAddress: 'Current Address',
  newAddress: 'New (Relocation) Address',
  landmark: 'Nearest Landmark',
  latitude: 'Latitude',
  longitude: 'Longitude',

  // Account / service preferences
  isExistingCustomer: 'Existing Customer',
  existingNumber: 'Existing Connection Number',
  separateBill: 'Separate Bill',
  billingMode: 'Billing Mode',
  taxExemption: 'Tax Exemption',
  deactIDD: 'Deactivate IDD',
  broadbandPackage: 'Broadband Package',
  otherBroadbandPackage: 'Preferred Package',
  staticIP: 'Static IP',
  serviceType: 'Service Type',
  service: 'Required Service',
  accountNumber: 'Account Number',
  currentPackage: 'Current Package',
  requiredPackage: 'Required Package',
  outstandingBalance: 'Outstanding Dues',
  amountToPay: 'Amount to Pay',
  facility_voice: 'Voice (Telephone)',
  facility_peoTv: 'PEO TV',
  facility_peotv: 'PEO TV',
  facility_broadband: 'Broadband',
  facilityMegaline: 'Megaline',
  facilityCitylink: 'Citylink',
  facilityFtth: 'FTTH',
  facilityLte: 'LTE',
  broadbandUsername: 'Broadband Username',
  terminationType: 'Termination Type',
  serviceBroadband: 'SLT Broadband Internet',
  serviceDialUp: 'Dial-up Internet',
  serviceEmail: 'Email',
  servicePeoTv: 'PEO TV',
  serviceSltPlus: 'SLT Plus',
  serviceIdd: 'IDD',
  serviceCrbt: 'CRBT',
  serviceQuickMeet: 'Quick Meet',
  serviceCli: 'CLI',
  dialUpUsername: 'Dial-up Username',
  emailUsername: 'Email Username',
  otherServices: 'Other Services',

  // Scheduling / dates
  deactivationDate: 'Deactivation Date',
  resumeDate: 'Resume Date',
  relocationDate: 'Preferred Relocation Date',
  disconnectDate: 'Disconnect Date',
  disconnectAction: 'Disconnect Action',
  callForwarding: 'Call Forwarding',
  forwardingDuration: 'Forwarding Duration (Months)',
  effectiveDate: 'Effective From',
  remarks: 'Remarks',
  newRemarks: 'Remarks',
  additionalComments: 'Additional Comments',

  // Relocation kept services
  'keptServices.incoming': 'Keep Incoming Calls',
  'keptServices.outgoing': 'Keep Outgoing Calls',
  'keptServices.broadband': 'Keep Fibre Broadband',
  'keptServices.peoTv': 'Keep PEO TV',

  // Transfer
  transferScenario: 'Transfer Scenario',
  currentCustomerConsent: 'Current Customer Consent',
  newApplicantDeclaration: 'New Applicant Declaration',

  // Refund
  bankName: 'Name as in Bank Passbook',
  bankBranch: 'Bank Name & Branch',
  paidAmount: 'Paid Amount (Rs.)',
  reason: 'Reason for Refund',

  // Request acceptance
  requestType: 'Request Type',
  description: 'Request Description',

  // Migration feasibility
  loopCheckPerformed: 'Loop Check Performed',
  loopAvailable: 'Loop Available',
  requiresSiteSurvey: 'Site Survey Required',

  // Payment / declaration
  paymentReference: 'Payment Reference',
  paymentIntention: 'Payment Intention',
  declarationAccepted: 'Declaration Accepted',
  agreementAccepted: 'Declaration & Terms Accepted',
  agreed: 'Declaration & Terms Accepted',
  signatureMethod: 'Signature Method',
};

// Ordered wizard steps per service type. A step whose fields are all empty is
// omitted from the rendered output, so these can safely list every candidate
// field for a step.
const FORM_STEPS = {
  'new-connection': [
    { title: 'Selected Product', special: 'product' },
    {
      title: 'Installation Location',
      fields: [
        'title', 'nameFull', 'nic', 'dob', 'mobileNumber', 'isExistingCustomer',
        'locationType', 'city', 'district', 'postalCode', 'installAddress',
        'address', 'email',
      ],
    },
    { title: 'Terms & Signature', fields: ['declarationAccepted', 'signature'] },
    { title: 'Payment', fields: ['paymentReference'] },
  ],
  reconnection: [
    {
      title: 'Existing Account Verification',
      fields: [
        'telephone', 'fullName', 'nic', 'addressLine1', 'addressLine2',
        'amountToPay', 'facility_voice', 'facility_peoTv', 'facility_broadband',
        'broadbandUsername',
      ],
    },
    { title: 'Details & Documents', fields: ['paymentIntention', 'paymentReceipt', 'signatureDoc'] },
  ],
  relocation: [
    {
      title: 'Existing Account Verification',
      fields: ['telephone', 'legalOwner', 'serviceType', 'contactPerson', 'tel', 'mobile', 'email'],
    },
    {
      title: 'New Address',
      fields: [
        'currentAddress', 'newAddress', 'district', 'city', 'postalCode',
        'address1', 'address2', 'landmark', 'latitude', 'longitude',
        'proofOfAddress', 'sketchFile', 'premisesPhoto', 'authorizationLetter',
      ],
    },
    {
      title: 'Preferences',
      fields: [
        'relocationDate', 'disconnectDate', 'disconnectAction',
        'keptServices.incoming', 'keptServices.outgoing', 'keptServices.broadband',
        'keptServices.peoTv', 'callForwarding', 'forwardingDuration', 'brcFile',
      ],
    },
    { title: 'Agreement', fields: ['agreed', 'signature', 'signatureFile'] },
  ],
  transfer: [
    { title: 'Current Connection', fields: ['currentTelephone', 'currentCustomerName', 'currentNic', 'currentContactNo'] },
    { title: 'New Applicant', fields: ['fullName', 'nic', 'contactNo', 'contactNoVerified', 'email', 'newRemarks'] },
    {
      title: 'Documents',
      fields: ['transferScenario', 'newOwnerConsent', 'newOwnerNicPdf', 'newOwnerNicFront', 'newOwnerNicBack', 'requiredDoc_N'],
    },
    { title: 'Declaration', fields: ['currentCustomerConsent', 'newApplicantDeclaration'] },
  ],
  'package-migration': [
    { title: 'Existing Account Verification', fields: ['telephone', 'accountNumber', 'customerName', 'nic', 'currentPackage', 'requiredPackage'] },
    { title: 'Fibre Feasibility Check', fields: ['loopCheckPerformed', 'loopAvailable', 'requiresSiteSurvey'] },
    { title: 'Migration Schedule', fields: ['effectiveDate', 'remarks'] },
    { title: 'Declaration', fields: ['declarationAccepted', 'signature', 'signatureFile'] },
  ],
  'service-vacation': [
    { title: 'Existing Account Verification', fields: ['telephone', 'fullName', 'outstandingBalance', 'nic'] },
    { title: 'Vacation Details', fields: ['facility_voice', 'facility_broadband', 'facility_peotv', 'deactivationDate', 'resumeDate'] },
    { title: 'Agreement', fields: ['paymentReceipt', 'signatureDoc'] },
  ],
  'refund-request': [
    { title: 'Existing Account Verification', fields: ['telephone', 'fullName', 'nic', 'contactNo', 'bankName', 'bankBranch'] },
    { title: 'Refund Details', fields: ['paidAmount', 'reason', 'receiptUpload'] },
  ],
  termination: [
    {
      title: 'Customer & Facilities',
      fields: ['presentNumber', 'fullName', 'nic', 'contactNo', 'fixedNo', 'email', 'facilityMegaline', 'facilityCitylink', 'facilityFtth', 'facilityLte'],
    },
    {
      title: 'Services to Disconnect',
      fields: [
        'terminationType', 'serviceBroadband', 'serviceDialUp', 'serviceEmail',
        'servicePeoTv', 'serviceSltPlus', 'serviceIdd', 'serviceCrbt',
        'serviceQuickMeet', 'serviceCli', 'broadbandUsername', 'dialUpUsername',
        'emailUsername', 'otherServices', 'disconnectDate',
      ],
    },
    { title: 'Reason for Termination', special: 'terminationReason' },
    { title: 'Agreement', fields: ['agreementAccepted'] },
  ],
  'customer-request-acceptance': [
    {
      title: 'Request Details',
      fields: ['fullName', 'nic', 'telephone', 'address', 'service', 'requestType', 'fixedNo', 'mobileNo', 'email', 'description', 'requestDocument'],
    },
    { title: 'Agreement', fields: ['signatureMethod', 'digitalSignatureBase64', 'signatureDoc'] },
  ],
};

function humanize(key) {
  const base = key.split('.').pop();
  return base
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getByPath(obj, path) {
  return path.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
}

function isEmpty(value) {
  if (value === null || value === undefined || value === '') return true;
  if (typeof value === 'boolean') return value === false;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'string') {
    if (value === 'false') return true;
    if (isFileRef(value)) return true;
    if (value.length > 500) return true;
  }
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

function formatValue(value) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    return value.map((v) => (v && typeof v === 'object' ? '—' : String(v))).join(', ');
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function toEntry(key, value) {
  return {
    key,
    label: FIELD_LABELS[key] || humanize(key),
    display: formatValue(value),
  };
}

function buildProductSection(product) {
  if (!product || typeof product !== 'object') return null;
  const entries = [];
  PRODUCT_FIELDS.forEach((field) => {
    const value = product[field.key];
    if (isEmpty(value)) return;
    entries.push({ key: `product.${field.key}`, label: field.label, display: formatValue(value) });
  });
  return entries.length ? { title: 'Selected Product', entries } : null;
}

function buildTerminationReasonSection(formData) {
  const entries = [];
  Object.keys(formData).forEach((key) => {
    const value = formData[key];
    if (key === 'additionalComments') return;
    if (!/^(reason_|competitorPkg_)/.test(key)) return;
    if (isEmpty(value)) return;
    const pretty = key.replace(/^reason_/, '').replace(/^competitorPkg_/, 'Competitor: ');
    entries.push({ key, label: FIELD_LABELS[key] || humanize(pretty), display: formatValue(value) });
  });
  if (!isEmpty(formData.additionalComments)) {
    entries.push(toEntry('additionalComments', formData.additionalComments));
  }
  return entries.length ? { title: 'Reason for Termination', entries } : null;
}

// Build ordered, non-empty sections of customer-entered data for the detail view.
export function getFormSections(serviceType, formData) {
  const fd = formData || {};
  const steps = FORM_STEPS[serviceType] || [];
  const sections = [];
  const usedTop = new Set();

  steps.forEach((step) => {
    if (step.special === 'product') {
      const section = buildProductSection(fd.product);
      usedTop.add('product');
      if (section) sections.push(section);
      return;
    }
    if (step.special === 'terminationReason') {
      const section = buildTerminationReasonSection(fd);
      Object.keys(fd).forEach((key) => {
        if (/^(reason_|competitorPkg_)/.test(key) || key === 'additionalComments') usedTop.add(key);
      });
      if (section) sections.push(section);
      return;
    }

    const entries = [];
    (step.fields || []).forEach((key) => {
      usedTop.add(key.split('.')[0]);
      if (isFileKey(key)) return;
      const value = getByPath(fd, key);
      if (isEmpty(value)) return;
      entries.push(toEntry(key, value));
    });
    if (entries.length) sections.push({ title: step.title, entries });
  });

  // Anything the customer submitted that is not covered by the schema.
  const leftover = [];
  Object.keys(fd).forEach((key) => {
    if (key === 'documents' || usedTop.has(key) || isFileKey(key)) return;
    const value = fd[key];
    if (isEmpty(value)) return;
    if (typeof value === 'object' && !Array.isArray(value)) {
      Object.keys(value).forEach((nestedKey) => {
        const nestedValue = value[nestedKey];
        if (isEmpty(nestedValue)) return;
        leftover.push(toEntry(`${key}.${nestedKey}`, nestedValue));
      });
      return;
    }
    leftover.push(toEntry(key, value));
  });
  if (leftover.length) sections.push({ title: 'Additional Details', entries: leftover });

  return sections;
}

export default getFormSections;
