import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUser } from 'react-icons/fi';
import api from '../../utils/api';
import { useVerifiedContext } from '../../components/verification';

export default function GeneralInfoStep({ isActive, formData, onChange, onValidationChange, showValidationErrors = false }) {
  const { t } = useTranslation();
  const { mobileNumber, selectedAccount } = useVerifiedContext();

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

  const isStepValid = Boolean(customer.telephone) && Boolean(customer.serviceType);

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
      {/* Hidden fields to keep the verified telephone/owner/service in the submitted form data */}
      <input type="hidden" name="telephone" value={customer.telephone} />
      <input type="hidden" name="legalOwner" value={customer.legalOwner} />
      <input type="hidden" name="serviceType" value={customer.serviceType} />
      <input type="hidden" name="tel" value={customer.tel} />
      <input type="hidden" name="contactPerson" value={customer.contactPerson} />
      <input type="hidden" name="mobile" value={customer.mobile} />
      <input type="hidden" name="email" value={customer.email} />

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
          <div style={{ backgroundColor: '#eff6ff', color: '#0056b3', width: '34px', height: '34px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiUser size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>
            Account & Service Verification
          </h4>
        </div>
        <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Your connection details and service type (<strong>{customer.serviceType || 'FTTH'}</strong>) have been verified automatically from your account. Click <strong>Next Step</strong> to specify your new relocation address.
        </p>
      </div>
    </div>
  );
}
