import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AddressInputWithMap from '../../components/form/AddressInputWithMap';
import {
  FiCheckCircle,
  FiUser,
  FiPhone,
  FiLock,
  FiSend,
  FiRefreshCw,
  FiShield,
  FiAlertCircle,
} from 'react-icons/fi';

export default function CustomerInfoStep({ formData, handleChange, handleSetFields }) {
  const { t } = useTranslation();

  // State for Customer Type (Existing vs New)
  const isExisting = formData.isExistingCustomer === 'yes';

  // OTP Verification state
  const [existingAccNumber, setExistingAccNumber] = useState(formData.existingNumber || '');
  const [phoneNum, setPhoneNum] = useState(formData.mobileNumber || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verified, setVerified] = useState(formData.otpVerified || false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate maximum allowed date of birth (18+ years old)
  const maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

  const isBusiness = formData.customerType === 'business';
  const isForeign = formData.customerType === 'foreign';

  // Handle Existing Customer radio toggle
  const handleExistingToggle = (val) => {
    handleChange({
      target: { name: 'isExistingCustomer', value: val },
    });
    setOtpSent(false);
    setVerified(false);
    setOtpCode('');
    setErrorMsg('');
  };

  // Send OTP handler
  const handleSendOtp = () => {
    setErrorMsg('');
    if (!phoneNum || phoneNum.trim().length < 9) {
      setErrorMsg('Please enter a valid 10-digit mobile number to receive OTP.');
      return;
    }
    if (isExisting && (!existingAccNumber || existingAccNumber.trim().length < 5)) {
      setErrorMsg('Please enter your existing SLT Telephone / Account number.');
      return;
    }

    setOtpSent(true);
  };

  // Verify OTP handler
  const handleVerifyOtp = () => {
    setErrorMsg('');
    if (otpCode.length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code sent to your mobile phone.');
      return;
    }

    setVerifying(true);

    setTimeout(() => {
      setVerifying(false);
      setVerified(true);

      // Auto-fill logic for existing customer
      if (isExisting) {
        handleSetFields({
          otpVerified: true,
          existingNumber: existingAccNumber,
          mobileNumber: phoneNum,
          customerType: 'home',
          title: 'Mr',
          nameFull: 'Kamal Perera',
          dob: '1988-05-20',
          nic: '881401234V',
          contactName: 'Kamal Perera',
          fixedNumber: existingAccNumber.startsWith('0') ? existingAccNumber : `0${existingAccNumber}`,
          email: 'kamal.perera@gmail.com',
          address: 'No. 45/2, Temple Road, Nugegoda, Colombo',
          installAddress: 'No. 45/2, Temple Road, Nugegoda, Colombo',
        });
      } else {
        handleSetFields({
          otpVerified: true,
          mobileNumber: phoneNum,
        });
      }
    }, 800);
  };

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue, #0F57A8)', marginBottom: '0.5rem' }}>
        1. Customer Verification & Personal Details
      </h3>
      <p style={{ color: 'var(--text-secondary, #64748B)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
        Verify your identity via OTP to auto-fill customer details or complete manual entry.
      </p>

      {/* Customer Category: Existing Customer vs New Customer */}
      <div
        style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <label
          style={{
            display: 'block',
            fontWeight: '700',
            fontSize: '0.95rem',
            color: '#0F172A',
            marginBottom: '0.75rem',
          }}
        >
          Are you an existing SLT Mobitel Customer?
        </label>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <label
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              border: isExisting ? '2px solid #0F57A8' : '1px solid #CBD5E1',
              backgroundColor: isExisting ? '#EFF6FF' : '#FFFFFF',
              color: isExisting ? '#1E3A8A' : '#475569',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <input
              type="radio"
              name="isExistingCustomer"
              value="yes"
              checked={isExisting}
              onChange={() => handleExistingToggle('yes')}
              style={{ accentColor: '#0F57A8' }}
            />
            <span>Yes, I am an Existing Customer</span>
          </label>

          <label
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              border: !isExisting ? '2px solid #0F57A8' : '1px solid #CBD5E1',
              backgroundColor: !isExisting ? '#EFF6FF' : '#FFFFFF',
              color: !isExisting ? '#1E3A8A' : '#475569',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <input
              type="radio"
              name="isExistingCustomer"
              value="no"
              checked={!isExisting}
              onChange={() => handleExistingToggle('no')}
              style={{ accentColor: '#0F57A8' }}
            />
            <span>No, I am a New Customer</span>
          </label>
        </div>
      </div>

      {/* OTP Verification Box */}
      <div
        style={{
          backgroundColor: verified ? '#F0FDF4' : '#F0F9FF',
          border: verified ? '1px solid #10B981' : '1px solid #0F57A8',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <FiShield size={20} style={{ color: verified ? '#10B981' : '#0F57A8' }} />
          <h4 style={{ margin: 0, color: verified ? '#065F46' : '#0369A1', fontSize: '1.05rem', fontWeight: '700' }}>
            {verified ? 'OTP Verification Completed' : 'Mobile Number & Identity Verification (OTP)'}
          </h4>
        </div>

        {errorMsg && (
          <div
            style={{
              color: '#DC2626',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '0.6rem 0.85rem',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <FiAlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {verified ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              padding: '1rem',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FiCheckCircle size={24} style={{ color: '#10B981' }} />
              <div>
                <strong style={{ color: '#065F46', display: 'block' }}>
                  {isExisting ? 'Existing Account Verified — Customer Profile Auto-filled' : 'Mobile Verification Successful'}
                </strong>
                <span style={{ fontSize: '0.82rem', color: '#047857' }}>
                  Verified Mobile: {phoneNum} {isExisting ? `| SLT Ref: ${existingAccNumber}` : ''}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setVerified(false)}
              style={{
                background: 'none',
                border: '1px solid #6EE7B7',
                color: '#047857',
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Re-verify
            </button>
          </div>
        ) : (
          <div>
            <div className="form-group flex flex-col-mobile gap-4" style={{ marginBottom: '1rem' }}>
              {isExisting && (
                <div style={{ flex: '1' }}>
                  <label className="form-label">
                    Existing SLT Phone / Account Number <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 0112345678 or ACC-987654"
                    value={existingAccNumber}
                    onChange={(e) => setExistingAccNumber(e.target.value)}
                  />
                </div>
              )}

              <div style={{ flex: '1' }}>
                <label className="form-label">
                  Mobile Number (For OTP Code) <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="e.g. 0771234567"
                  maxLength={10}
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>

              <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0F57A8',
                    color: '#FFFFFF',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    height: '42px',
                  }}
                >
                  <FiSend size={16} />
                  <span>{otpSent ? 'Resend OTP' : 'Send OTP'}</span>
                </button>
              </div>
            </div>

            {/* OTP Code Entry */}
            {otpSent && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid #BAE6FD',
                  marginTop: '1rem',
                }}
              >
                <label className="form-label" style={{ marginBottom: '0.4rem' }}>
                  Enter 6-Digit OTP Code sent to {phoneNum} (Demo OTP: <strong>123456</strong>)
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{
                      width: '160px',
                      padding: '0.5rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid #94A3B8',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      letterSpacing: '0.3em',
                      textAlign: 'center',
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifying}
                    style={{
                      padding: '0.55rem 1.25rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      cursor: verifying ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {verifying ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customer Information Form Fields */}
      <h4 style={{ marginBottom: '1.25rem', color: '#0F172A', fontWeight: '700' }}>
        Personal Details {isExisting && verified ? '(Auto-populated from SLT Profile)' : ''}
      </h4>

      {/* 1.1 Customer Type */}
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label className="form-label">{t('wizards.newConnection.customerInfo.customerType')}</label>
        <div className="radio-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {[
            { value: 'home', labelKey: 'wizards.newConnection.customerInfo.home' },
            { value: 'office', labelKey: 'wizards.newConnection.customerInfo.office' },
            { value: 'religious', labelKey: 'wizards.newConnection.customerInfo.religious' },
            { value: 'business', labelKey: 'wizards.newConnection.customerInfo.business' },
            { value: 'government', labelKey: 'wizards.newConnection.customerInfo.government' },
            { value: 'foreign', labelKey: 'wizards.newConnection.customerInfo.foreign' },
          ].map((type) => (
            <label key={type.value} className="radio-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="customerType"
                value={type.value}
                className="radio-input"
                checked={formData.customerType === type.value}
                onChange={handleChange}
                required
              />
              {t(type.labelKey)}
            </label>
          ))}
        </div>
      </div>

      {/* Title & Name */}
      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.title')}</label>
          <select
            name="title"
            className="form-control"
            value={formData.title || ''}
            onChange={handleChange}
          >
            <option value="" disabled>{t('wizards.newConnection.customerInfo.select')}</option>
            <option value="Rev">{t('wizards.newConnection.customerInfo.rev')}</option>
            <option value="Mr">{t('wizards.newConnection.customerInfo.mr')}</option>
            <option value="Ms">{t('wizards.newConnection.customerInfo.ms')}</option>
            <option value="Other">{t('wizards.newConnection.customerInfo.other')}</option>
          </select>
        </div>
        <div style={{ flex: '3' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.nameFull')}</label>
          <input
            name="nameFull"
            type="text"
            className="form-control"
            placeholder={t('wizards.newConnection.customerInfo.namePlaceholder')}
            value={formData.nameFull || ''}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* DOB, NIC / Passport, Tax Exemption */}
      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.dob')}</label>
          <input
            name="dob"
            type="date"
            className="form-control"
            value={formData.dob || ''}
            onChange={handleChange}
            max={maxDob}
            required
          />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.nic')}</label>
          <input
            name="nic"
            type="text"
            className="form-control"
            placeholder={isForeign ? 'Passport Number' : 'NIC / BR Number'}
            value={formData.nic || ''}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Conditional VAT Registration Number */}
      {isBusiness && (
        <div className="form-group flex flex-col-mobile gap-4" style={{ marginTop: '1rem' }}>
          <div style={{ flex: '1' }}>
            <label className="form-label">
              {t('wizards.newConnection.customerInfo.vat')} <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              name="vatNumber"
              type="text"
              className="form-control"
              placeholder="e.g. VAT123456789"
              value={formData.vatNumber || ''}
              onChange={handleChange}
              required={isBusiness}
            />
          </div>
        </div>
      )}

      {/* Permanent Address */}
      <div style={{ marginBottom: '1.5rem' }}>
        <AddressInputWithMap
          name="address"
          label={t('wizards.newConnection.customerInfo.address')}
          value={formData.address || ''}
          onChange={handleChange}
          required
        />
      </div>

      {/* Contact Details */}
      <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        {t('wizards.newConnection.customerInfo.contactDetails')}
      </h4>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.contactName')}</label>
          <input
            name="contactName"
            type="text"
            className="form-control"
            value={formData.contactName || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.fixedNumber')}</label>
          <input
            name="fixedNumber"
            type="tel"
            className="form-control"
            value={formData.fixedNumber || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.mobileNumber')}</label>
          <input
            name="mobileNumber"
            type="tel"
            className="form-control"
            value={formData.mobileNumber || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">{t('wizards.newConnection.customerInfo.email')}</label>
          <input
            name="email"
            type="email"
            className="form-control"
            value={formData.email || ''}
            onChange={handleChange}
            required
          />
        </div>
      </div>
    </div>
  );
}
