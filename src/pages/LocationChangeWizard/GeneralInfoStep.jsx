import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiFileText, FiUser, FiPhone } from 'react-icons/fi';
import api from '../../utils/api';
import { useVerifiedContext } from '../../components/verification';
import ExistingCustomerSummaryBox from '../../components/ExistingCustomerSummaryBox';
import FileUploadField from '../../components/form/FileUploadField';

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
            1. Service Type
          </h4>
        </div>

        {/* Hidden fields to keep the verified telephone/owner in the submitted form data */}
        <input type="hidden" name="telephone" value={customer.telephone} />
        <input type="hidden" name="legalOwner" value={customer.legalOwner} />

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
            2. Contact Details for This Request
          </h4>
        </div>

        {/* Hidden field to keep the verified telephone in the submitted form data */}
        <input type="hidden" name="tel" value={customer.tel} />

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

        {/* Mobile, Email Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
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
          <FileUploadField
            name="nicFront"
            label="NIC Front (or Passport ID)"
            accept=".pdf,.jpg,.jpeg,.png"
            required={isActive}
            value={nicFrontFile}
            onChange={(_, fileData) => {
              setNicFrontFile(fileData);
              const next = { ...customer, nicFront: fileData };
              setCustomer(next);
              if (typeof onChange === 'function') onChange(next);
            }}
            error={showValidationErrors && !isNicFrontValid ? 'NIC Front file is required.' : undefined}
          />

          <FileUploadField
            name="nicBack"
            label="NIC Back (or Supporting Document)"
            accept=".pdf,.jpg,.jpeg,.png"
            required={isActive}
            value={nicBackFile}
            onChange={(_, fileData) => {
              setNicBackFile(fileData);
              const next = { ...customer, nicBack: fileData };
              setCustomer(next);
              if (typeof onChange === 'function') onChange(next);
            }}
            error={showValidationErrors && !isNicBackValid ? 'NIC Back file is required.' : undefined}
          />
          {nicFrontFile && <input type="hidden" name="nicFront" value={nicFrontFile.data} />}
          {nicBackFile && <input type="hidden" name="nicBack" value={nicBackFile.data} />}
        </div>
      </div>
    </div>
  );
}
