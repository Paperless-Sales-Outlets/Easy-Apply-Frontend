import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';

export default function GeneralInfoStep({ isActive, formData, onChange, onValidationChange, showValidationErrors = false }) {
  const { t } = useTranslation();

  const onValidationChangeRef = useRef(onValidationChange);
  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  const [loading, setLoading] = useState(false);
  const [verificationState, setVerificationState] = useState('idle'); // 'idle' | 'verifying' | 'verified' | 'failed'

  const [customer, setCustomer] = useState({
    telephone: formData?.telephone || '',
    legalOwner: formData?.legalOwner || '',
    serviceType: formData?.serviceType || '',
    contactPerson: formData?.contactPerson || '',
    tel: formData?.tel || formData?.telephone || '',
    mobile: formData?.mobile || '',
    email: formData?.email || '',
  });

  // Identification files (NIC front/back)
  const [nicFrontFile, setNicFrontFile] = useState(null);
  const [nicBackFile, setNicBackFile] = useState(null);

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
    const nextCustomer = {
      ...customer,
      [name]: value,
    };

    setCustomer(nextCustomer);
    handleFieldValidation(name, value);

    if (typeof onChange === 'function') {
      onChange(nextCustomer);
    }
  };

  const isVerified = verificationState === 'verified';
  const isTelephoneValid = validateTelephone(customer.telephone);
  const isServiceTypeValid = Boolean(customer.serviceType);
  const isNicFrontValid = Boolean(nicFrontFile);
  const isNicBackValid = Boolean(nicBackFile);
  const isStepValid = isVerified && isTelephoneValid && isServiceTypeValid && isNicFrontValid && isNicBackValid;

  useEffect(() => {
    if (typeof onValidationChangeRef.current === 'function') {
      onValidationChangeRef.current(isStepValid);
    }
  }, [isStepValid]);

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

    try {
      const response = await api.get(`/customers/${customer.telephone}`);

      if (response.data && response.data.success && response.data.data) {
        const customerData = response.data.data;
        const updatedCustomer = {
          ...customerData,
          telephone: customerData.telephone || customer.telephone,
          legalOwner: customerData.legalOwner || customerData.fullName || '',
          serviceType: customerData.serviceType || customer.serviceType || 'Megaline',
          contactPerson: customerData.contactPerson || customerData.legalOwner || customerData.fullName || '',
          tel: customerData.telephone || customer.telephone,
          mobile: customerData.mobile || customerData.contactNo || '',
          email: customerData.email || '',
          currentAddress: customerData.currentAddress || {
            address1: customerData.address1 || '',
            address2: customerData.address2 || '',
            city: customerData.city || '',
            district: customerData.district || '',
            postalCode: customerData.postal_code || customerData.postalCode || '',
          },
        };

        setCustomer(updatedCustomer);
        setVerificationState('verified');

        if (typeof onChange === 'function') {
          onChange({ ...updatedCustomer, nicFront: nicFrontFile, nicBack: nicBackFile });
        }
        if (typeof onValidationChange === 'function') {
          onValidationChange(isStepValid);
        }
      } else {
        setVerificationState('failed');
        setErrors((prev) => ({
          ...prev,
          telephone: 'Customer details not found.',
        }));
      }
    } catch (err) {
      setVerificationState('failed');
      const apiErrorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Customer not found or network error.';

      setErrors((prev) => ({
        ...prev,
        telephone: apiErrorMessage,
      }));
    } finally {
      setLoading(false);
    }
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

        {/* Identification Uploads */}
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)' }}>Identification Documents</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 500 }}>NIC Front (or Passport ID)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="form-control"
                onChange={(e) => {
                  const f = e.target.files[0] || null;
                  setNicFrontFile(f);
                  const next = { ...customer, nicFront: f };
                  setCustomer(next);
                  if (typeof onChange === 'function') onChange(next);
                }}
                disabled={!isVerified}
              />
              {showValidationErrors && !isNicFrontValid && (
                <small style={{ color: '#dc2626', display: 'block', marginTop: '0.4rem' }}>
                  NIC front is required.
                </small>
              )}
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 500 }}>NIC Back (if any)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="form-control"
                onChange={(e) => {
                  const f = e.target.files[0] || null;
                  setNicBackFile(f);
                  const next = { ...customer, nicBack: f };
                  setCustomer(next);
                  if (typeof onChange === 'function') onChange(next);
                }}
                disabled={!isVerified}
              />
              {showValidationErrors && !isNicBackValid && (
                <small style={{ color: '#dc2626', display: 'block', marginTop: '0.4rem' }}>
                  NIC back is required.
                </small>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
