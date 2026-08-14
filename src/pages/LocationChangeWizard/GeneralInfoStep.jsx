import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheckCircle, FiUploadCloud, FiLock, FiFileText, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import api from '../../utils/api';
import { useVerifiedContext } from '../../components/verification';
import ExistingCustomerSummaryBox from '../../components/ExistingCustomerSummaryBox';

export default function GeneralInfoStep({ isActive, formData, onChange, onValidationChange, showValidationErrors = false }) {
  const { t } = useTranslation();
  const { mobileNumber, customerExists, selectedAccount } = useVerifiedContext();

  const onValidationChangeRef = useRef(onValidationChange);
  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  const [loading, setLoading] = useState(false);
  const [verificationState, setVerificationState] = useState(selectedAccount ? 'verified' : 'verified');

  const [customer, setCustomer] = useState({
    telephone: selectedAccount?.telephone || formData?.telephone || '',
    legalOwner: selectedAccount?.fullName || formData?.legalOwner || '',
    serviceType: selectedAccount?.serviceType || formData?.serviceType || 'FTTH',
    contactPerson: selectedAccount?.fullName || formData?.contactPerson || '',
    tel: selectedAccount?.telephone || formData?.tel || '',
    mobile: selectedAccount?.mobileNumber || formData?.mobile || mobileNumber || '',
    email: selectedAccount?.email || formData?.email || '',
  });

  const [nicFrontFile, setNicFrontFile] = useState(null);
  const [nicBackFile, setNicBackFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedAccount) {
      const updated = {
        telephone: selectedAccount.telephone || selectedAccount.phoneNumber || '',
        legalOwner: selectedAccount.fullName || selectedAccount.customerName || '',
        serviceType: selectedAccount.serviceType || 'FTTH',
        contactPerson: selectedAccount.fullName || selectedAccount.customerName || '',
        tel: selectedAccount.telephone || selectedAccount.phoneNumber || '',
        mobile: selectedAccount.mobileNumber || selectedAccount.phoneNumber || mobileNumber || '',
        email: selectedAccount.email || '',
      };
      setCustomer(updated);
      setVerificationState('verified');
      if (typeof onChange === 'function') {
        onChange(updated);
      }
    }
  }, [selectedAccount, mobileNumber]);

  const isNicFrontValid = Boolean(nicFrontFile);
  const isNicBackValid = Boolean(nicBackFile);
  const isStepValid = Boolean(customer.telephone) && Boolean(customer.serviceType) && isNicFrontValid && isNicBackValid;

  useEffect(() => {
    if (typeof onValidationChangeRef.current === 'function') {
      onValidationChangeRef.current(isStepValid);
    }
  }, [isStepValid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextCustomer = {
      ...customer,
      [name]: value,
    };
    setCustomer(nextCustomer);
    if (typeof onChange === 'function') {
      onChange(nextCustomer);
    }
  };

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      {/* VERIFIED CUSTOMER SUMMARY BOX AT TOP */}
      <ExistingCustomerSummaryBox customerData={selectedAccount} customerExists={customerExists} />

      {/* SECTION 1: Customer Details */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div style={{ backgroundColor: '#eff6ff', color: '#0056b3', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiUser size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
            1. Customer & Service Connection Details
          </h4>
        </div>

        {/* Telephone & Legal Owner Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
              {t('wizards.locationChange.generalInfo.telephone', 'Telephone Number')} <span style={{ color: '#dc2626' }}>*</span>
            </label>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                name="telephone"
                type="tel"
                value={customer.telephone}
                readOnly
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  paddingRight: '110px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  padding: '0.35rem 0.7rem',
                  borderRadius: '7px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                }}
              >
                <FiCheckCircle size={14} />
                <span>Verified</span>
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
              {t('wizards.locationChange.generalInfo.legalOwner', 'Legal Owner Name')}
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                name="legalOwner"
                type="text"
                value={customer.legalOwner || 'Autofilled upon verification'}
                readOnly
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
              <FiLock style={{ position: 'absolute', right: '12px', color: '#94a3b8' }} size={16} />
            </div>
          </div>
        </div>

        {/* Service Type Selection */}
        <div>
          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
            {t('wizards.locationChange.generalInfo.serviceType', 'Service Type')} <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <select
            name="serviceType"
            value={customer.serviceType}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#0f172a',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="FTTH">FTTH (Fibre To The Home)</option>
            <option value="LTE">LTE (Home Broadband)</option>
            <option value="Megaline">Megaline (Copper Voice)</option>
            <option value="PEO TV">PEO TV</option>
          </select>
        </div>
      </div>

      {/* SECTION 2: Contact Information */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiPhone size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
            2. Verified Contact Details
          </h4>
        </div>

        {/* Contact Person */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
            {t('wizards.locationChange.generalInfo.contactPerson', 'Name of the Contact Person')}
          </label>
          <input
            name="contactPerson"
            type="text"
            value={customer.contactPerson}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#0f172a',
              outline: 'none',
            }}
          />
        </div>

        {/* Tel, Mobile, Email Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
              Telephone
            </label>
            <input
              name="tel"
              type="tel"
              value={customer.tel}
              readOnly
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#0f172a',
              }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
              Mobile Number
            </label>
            <input
              name="mobile"
              type="tel"
              value={customer.mobile}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#0f172a',
              }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <input
              name="email"
              type="email"
              value={customer.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#0f172a',
              }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Identification Uploads */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div style={{ backgroundColor: '#fef3c7', color: '#d97706', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiFileText size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
            3. Identification Documents
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* NIC Front Upload Dropzone */}
          <div>
            <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
              NIC Front (or Passport ID) <span style={{ color: '#dc2626' }}>*</span>
            </label>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                border: nicFrontFile ? '2px stroke #10b981' : '2px dashed #93c5fd',
                borderRadius: '12px',
                backgroundColor: nicFrontFile ? '#f0fdf4' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files[0] || null;
                  setNicFrontFile(f);
                  const next = { ...customer, nicFront: f };
                  setCustomer(next);
                  if (typeof onChange === 'function') onChange(next);
                }}
              />
              <FiUploadCloud size={30} style={{ color: nicFrontFile ? '#16a34a' : '#0056b3', marginBottom: '0.5rem' }} />
              {nicFrontFile ? (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d', display: 'block' }}>
                    {nicFrontFile.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>File Uploaded</span>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0056b3', display: 'block' }}>
                    Click to Upload NIC Front
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>JPG, PNG, PDF up to 5MB</span>
                </div>
              )}
            </label>
            {showValidationErrors && !isNicFrontValid && (
              <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                NIC Front file is required.
              </div>
            )}
          </div>

          {/* NIC Back Upload Dropzone */}
          <div>
            <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
              NIC Back (or Supporting Document) <span style={{ color: '#dc2626' }}>*</span>
            </label>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                border: nicBackFile ? '2px stroke #10b981' : '2px dashed #93c5fd',
                borderRadius: '12px',
                backgroundColor: nicBackFile ? '#f0fdf4' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files[0] || null;
                  setNicBackFile(f);
                  const next = { ...customer, nicBack: f };
                  setCustomer(next);
                  if (typeof onChange === 'function') onChange(next);
                }}
              />
              <FiUploadCloud size={30} style={{ color: nicBackFile ? '#16a34a' : '#0056b3', marginBottom: '0.5rem' }} />
              {nicBackFile ? (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d', display: 'block' }}>
                    {nicBackFile.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>File Uploaded</span>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0056b3', display: 'block' }}>
                    Click to Upload NIC Back
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>JPG, PNG, PDF up to 5MB</span>
                </div>
              )}
            </label>
            {showValidationErrors && !isNicBackValid && (
              <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                NIC Back file is required.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
