import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function GeneralInfoStep({ isActive }) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [verificationState, setVerificationState] = useState('idle'); // 'idle' | 'verifying' | 'verified' | 'failed'

  const [customer, setCustomer] = useState({
    telephone: '',
    legalOwner: '',
    serviceType: '',
    contactPerson: '',
    tel: '',
    mobile: '',
    email: '',
  });

  const [errors, setErrors] = useState({});

  // RegEx Validators
  const validateTelephone = (val) => /^\d{10}$/.test(val);
  const validateMobile = (val) => /^(?:0|94|\+94)?7[0-9]{8}$/.test(val);
  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleFieldValidation = (name, value) => {
    let errorMsg = '';

    if (name === 'telephone' && value && !validateTelephone(value)) {
      errorMsg = 'Telephone must be exactly 10 digits.';
    } else if (name === 'mobile' && value && !validateMobile(value)) {
      errorMsg = 'Invalid Sri Lankan mobile number format (e.g., 0771234567).';
    } else if (name === 'email' && value && !validateEmail(value)) {
      errorMsg = 'Please enter a valid email address.';
    }

    setErrors((prev) => ({
      ...prev,
      [name]: errorMsg,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));

    handleFieldValidation(name, value);
  };

  const handleVerify = async () => {
    if (!customer.telephone) {
      setErrors((prev) => ({
        ...prev,
        telephone: 'Please enter a telephone number to verify.',
      }));
      return;
    }

    if (!validateTelephone(customer.telephone)) {
      setErrors((prev) => ({
        ...prev,
        telephone: 'Telephone must be 10 digits.',
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, telephone: '' }));
    setLoading(true);
    setVerificationState('verifying');

    // Temporary mock API
    setTimeout(() => {
      // Set success or fail mock condition
      const isSuccess = true;

      if (isSuccess) {
        setCustomer({
          telephone: customer.telephone,
          legalOwner: 'Nimal Perera',
          serviceType: 'FTTH',
          contactPerson: 'Nimal Perera',
          tel: customer.telephone,
          mobile: '0771234567',
          email: 'nimal@gmail.com',
        });

        setVerificationState('verified');
      } else {
        setVerificationState('failed');
      }
      setLoading(false);
    }, 1200);
  };

  const renderStatusBadge = () => {
    switch (verificationState) {
      case 'verifying':
        return <small style={{ color: '#d97706', fontWeight: 500 }}>Verifying...</small>;
      case 'verified':
        return <small style={{ color: '#155a2f', fontWeight: 600 }}>Verified</small>;
      case 'failed':
        return <small style={{ color: '#dc2626', fontWeight: 500 }}>Verification Failed</small>;
      default:
        return <small style={{ color: '#6b7280' }}>Not Verified</small>;
    }
  };

  const isVerified = verificationState === 'verified';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>
        {t('wizards.locationChange.generalInfo.heading', 'General Information')}
      </h3>

      {/* SECTION 1: Customer Details */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          marginBottom: '1.5rem',
          background: 'var(--bg-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
        }}
      >
        <h4 style={{ margin: '0 0 1.25rem 0', color: 'var(--text-primary)' }}>
          {t('wizards.locationChange.generalInfo.customerDetailsHeading', 'Customer Details')}
        </h4>

        {/* Telephone Verification */}
        <div className="form-group flex flex-col-mobile gap-4" style={{ marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label" style={{ fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
              {t('wizards.locationChange.generalInfo.telephone', 'Telephone Number')} <span style={{ color: 'red' }}>*</span>
            </label>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                name="telephone"
                type="tel"
                className="form-control"
                value={customer.telephone}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={10}
                readOnly={isVerified}
                disabled={loading}
                required={isActive}
                style={{
                  flex: 1,
                  backgroundColor: isVerified ? '#f3f4f6' : 'inherit',
                  borderColor: errors.telephone ? '#dc2626' : undefined,
                }}
              />

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleVerify}
                disabled={loading || isVerified || !customer.telephone}
                style={{ whiteSpace: 'nowrap', minWidth: '100px' }}
              >
                {loading ? 'Verifying...' : isVerified ? 'Verified' : 'Verify'}
              </button>
            </div>

            <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {renderStatusBadge()}
              {errors.telephone && (
                <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.telephone}</span>
              )}
            </div>
          </div>

          {/* Legal Owner */}
          <div style={{ flex: 1 }}>
            <label className="form-label" style={{ fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
              {t('wizards.locationChange.generalInfo.legalOwner', 'Legal Owner')}
            </label>

            <input
              name="legalOwner"
              type="text"
              className="form-control"
              value={customer.legalOwner}
              readOnly
              placeholder="Autofilled upon verification"
              style={{ backgroundColor: '#f3f4f6' }}
            />
          </div>
        </div>

        {/* Service Type (Required) */}
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label" style={{ fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
            {t('wizards.locationChange.generalInfo.serviceType', 'Service Type')} <span style={{ color: 'red' }}>*</span>
          </label>

          <select
            name="serviceType"
            className="form-control"
            value={customer.serviceType}
            onChange={handleChange}
            disabled={!isVerified}
            required={isActive}
            style={{ width: '100%' }}
          >
            <option value="">-- Select Service Type --</option>
            <option value="FTTH">FTTH</option>
            <option value="LTE">LTE</option>
            <option value="Megaline">Megaline</option>
            <option value="PEO TV">PEO TV</option>
          </select>
        </div>
      </div>

      {/* SECTION 2: Contact Information */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          background: 'var(--bg-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          opacity: isVerified ? 1 : 0.65,
          transition: 'opacity 0.2s ease-in-out',
        }}
      >
        <h4 style={{ margin: '0 0 1.25rem 0', color: 'var(--text-primary)' }}>
          {t('wizards.locationChange.generalInfo.contactHeading', 'Contact Information')}
        </h4>

        {/* Contact Person */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label" style={{ fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
            {t('wizards.locationChange.generalInfo.contactPerson', 'Contact Person')}
          </label>

          <input
            name="contactPerson"
            type="text"
            className="form-control"
            value={customer.contactPerson}
            onChange={handleChange}
            disabled={!isVerified}
          />
        </div>

        {/* Tel & Mobile */}
        <div className="form-group flex flex-col-mobile gap-4" style={{ marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label" style={{ fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
              {t('wizards.locationChange.generalInfo.tel', 'Telephone')}
            </label>

            <input
              name="tel"
              type="tel"
              className="form-control"
              value={customer.tel}
              readOnly
              style={{ backgroundColor: '#f3f4f6' }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label className="form-label" style={{ fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
              {t('wizards.locationChange.generalInfo.mobile', 'Mobile')}
            </label>

            <input
              name="mobile"
              type="tel"
              className="form-control"
              value={customer.mobile}
              onChange={handleChange}
              disabled={!isVerified}
              style={{ borderColor: errors.mobile ? '#dc2626' : undefined }}
            />
            {errors.mobile && (
              <small style={{ color: '#dc2626', display: 'block', marginTop: '4px' }}>{errors.mobile}</small>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
            {t('wizards.locationChange.generalInfo.email', 'Email')}
          </label>

          <input
            name="email"
            type="email"
            className="form-control"
            value={customer.email}
            onChange={handleChange}
            disabled={!isVerified}
            style={{ borderColor: errors.email ? '#dc2626' : undefined }}
          />
          {errors.email && (
            <small style={{ color: '#dc2626', display: 'block', marginTop: '4px' }}>{errors.email}</small>
          )}
        </div>
      </div>
    </div>
  );
}