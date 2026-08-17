import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiLock, FiUser, FiMapPin, FiPhone, FiMail, FiCalendar, FiFileText } from 'react-icons/fi';
import AddressInputWithMap from '../../components/form/AddressInputWithMap';
import { useVerifiedContext } from '../../components/verification';
import { motion } from 'framer-motion';

const inputStyles = {
  base: {
    width: '100%',
    padding: '0.85rem 1rem 0.85rem 2.8rem',
    fontSize: '0.95rem',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
  },
  readOnly: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    color: '#475569',
    cursor: 'not-allowed',
    fontWeight: 600,
  }
};

const getStyle = (isReadOnly) => isReadOnly ? { ...inputStyles.base, ...inputStyles.readOnly } : inputStyles.base;

const Label = ({ children, icon: Icon, isReadOnly }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
    {Icon && <Icon size={14} color="#64748b" />}
    {children}
    {isReadOnly && <FiLock size={12} color="#10b981" title="Locked by verified profile" style={{ marginLeft: 'auto' }} />}
  </label>
);

const InputWrapper = ({ children, icon: Icon, isReadOnly }) => (
  <div style={{ position: 'relative', width: '100%' }}>
    {Icon && (
      <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: isReadOnly ? '#94a3b8' : '#64748b', zIndex: 1 }}>
        <Icon size={16} />
      </div>
    )}
    {children}
  </div>
);

export default function CustomerInfoStep({ formData, handleChange, setFields }) {
  const { t } = useTranslation();
  const { mobileNumber, customerExists, selectedAccount } = useVerifiedContext();

  const isReadOnly = !!selectedAccount;

  useEffect(() => {
    if (selectedAccount && setFields) {
      setFields({
        customerType: selectedAccount.customerType || 'home',
        title: selectedAccount.title || 'Mr',
        nameFull: selectedAccount.fullName || selectedAccount.customerName || '',
        nic: selectedAccount.nic || '',
        address: selectedAccount.address || selectedAccount.addressLine1 || '',
        contactName: selectedAccount.fullName || selectedAccount.customerName || '',
        fixedNumber: selectedAccount.telephone || '',
        mobileNumber: selectedAccount.mobileNumber || selectedAccount.phoneNumber || mobileNumber || '',
        email: selectedAccount.email || '',
        isExistingCustomer: 'yes',
        existingNumber: selectedAccount.accountNumber || selectedAccount.telephone || '',
      });
    } else if (customerExists === false && setFields) {
      setFields({
        isExistingCustomer: 'no',
        mobileNumber: mobileNumber || '',
      });
    }
  }, [selectedAccount, customerExists, mobileNumber]);

  // Calculate the maximum allowed date of birth (must be 18+ years old)
  const maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

  // Existing customer: we already have their identity on file (shown in the
  // verified summary box above this step) — only ask for what's still needed
  // for this specific new connection, instead of re-asking their whole profile.
  if (isReadOnly) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h3 style={{ color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          {t('wizards.newConnection.customerInfo.heading')}
        </h3>
        <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          We already have your details on file — just confirm a few things for this new connection.
        </p>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiMapPin color="#0056b3" /> New Connection Details
            </h4>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <Label icon={FiUser}>{t('wizards.newConnection.customerInfo.customerType')}</Label>
            <div style={{ display: 'flex', gap: '1rem', padding: '0.8rem 1rem', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px' }}>
              {['home', 'office', 'religious'].map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="customerType"
                    value={type}
                    checked={formData.customerType === type}
                    onChange={handleChange}
                    style={{ accentColor: '#0056b3' }}
                  />
                  {t(`wizards.newConnection.customerInfo.${type}`)}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <Label icon={FiFileText}>{t('wizards.newConnection.customerInfo.taxExemption')}</Label>
            <InputWrapper icon={FiFileText}>
              <input
                name="taxExemption"
                type="text"
                value={formData.taxExemption || ''}
                onChange={handleChange}
                style={getStyle()}
              />
            </InputWrapper>
          </div>

          <AddressInputWithMap
            name="address"
            label={t('wizards.newConnection.customerInfo.address')}
            value={formData.address || ''}
            onChange={handleChange}
            required
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h3 style={{ color: '#0f172a', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
        {t('wizards.newConnection.customerInfo.heading')}
      </h3>

      {/* NEW FORM LAYOUT */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
          border: '1px solid #e2e8f0',
          marginTop: '1.5rem',
        }}
      >
        <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
          <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiUser color="#0056b3" /> Personal Information
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <Label icon={FiUser}>{t('wizards.newConnection.customerInfo.customerType')}</Label>
            <div style={{ display: 'flex', gap: '1rem', padding: '0.8rem 1rem', backgroundColor: isReadOnly ? '#f8fafc' : '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px' }}>
              {['home', 'office', 'religious'].map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: isReadOnly ? '#64748b' : '#334155', cursor: isReadOnly ? 'not-allowed' : 'pointer' }}>
                  <input
                    type="radio"
                    name="customerType"
                    value={type}
                    checked={formData.customerType === type}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    style={{ accentColor: '#0056b3' }}
                  /> 
                  {t(`wizards.newConnection.customerInfo.${type}`)}
                </label>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <Label>Title</Label>
              <select name="title" value={formData.title || ''} onChange={handleChange} disabled={isReadOnly} style={{...getStyle(), paddingLeft: '1rem'}}>
                <option value="" disabled>{t('wizards.newConnection.customerInfo.select')}</option>
                <option value="Rev">Rev</option>
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ flex: 3 }}>
              <Label icon={FiUser}>{t('wizards.newConnection.customerInfo.nameFull')}</Label>
              <InputWrapper icon={FiUser}>
                <input
                  name="nameFull"
                  type="text"
                  placeholder={t('wizards.newConnection.customerInfo.namePlaceholder')}
                  value={formData.nameFull || ''}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  disabled={isReadOnly}
                  style={getStyle()}
                  required
                />
              </InputWrapper>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <Label icon={FiCalendar}>{t('wizards.newConnection.customerInfo.dob')}</Label>
            <InputWrapper icon={FiCalendar}>
              <input
                name="dob"
                type="date"
                value={formData.dob || ''}
                onChange={handleChange}
                max={maxDob}
                readOnly={isReadOnly}
                disabled={isReadOnly}
                style={getStyle()}
                required
              />
            </InputWrapper>
          </div>
          <div>
            <Label icon={FiFileText}>{t('wizards.newConnection.customerInfo.nic')}</Label>
            <InputWrapper icon={FiFileText}>
              <input
                name="nic"
                type="text"
                value={formData.nic || ''}
                onChange={handleChange}
                readOnly={isReadOnly}
                disabled={isReadOnly}
                style={getStyle()}
                required
              />
            </InputWrapper>
          </div>
          <div>
            <Label icon={FiFileText}>{t('wizards.newConnection.customerInfo.taxExemption')}</Label>
            <InputWrapper icon={FiFileText}>
              <input
                name="taxExemption"
                type="text"
                value={formData.taxExemption || ''}
                onChange={handleChange}
                readOnly={isReadOnly}
                disabled={isReadOnly}
                style={getStyle()}
              />
            </InputWrapper>
          </div>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <AddressInputWithMap
            name="address"
            label={t('wizards.newConnection.customerInfo.address')}
            value={formData.address || ''}
            onChange={handleChange}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            required
          />
        </div>

        <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
          <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiPhone color="#0056b3" /> Contact Details
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <Label icon={FiUser}>{t('wizards.newConnection.customerInfo.contactName')}</Label>
            <InputWrapper icon={FiUser}>
              <input
                name="contactName"
                type="text"
                value={formData.contactName || ''}
                onChange={handleChange}
                readOnly={isReadOnly}
                disabled={isReadOnly}
                style={getStyle()}
                required
              />
            </InputWrapper>
          </div>
          <div>
            <Label icon={FiMail}>{t('wizards.newConnection.customerInfo.email')}</Label>
            <InputWrapper icon={FiMail}>
              <input
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange}
                readOnly={isReadOnly}
                disabled={isReadOnly}
                style={getStyle()}
                required
              />
            </InputWrapper>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '0.5rem' }}>
          <div>
            <Label icon={FiPhone}>{t('wizards.newConnection.customerInfo.fixedNumber')}</Label>
            <InputWrapper icon={FiPhone}>
              <input
                name="fixedNumber"
                type="tel"
                inputMode="numeric"
                pattern="^([1-9][0-9]{8}|0[0-9]{9})$"
                maxLength={10}
                value={formData.fixedNumber || ''}
                onChange={handleChange}
                readOnly={isReadOnly}
                disabled={isReadOnly}
                style={getStyle()}
              />
            </InputWrapper>
          </div>
          <div>
            <Label icon={FiPhone}>{t('wizards.newConnection.customerInfo.mobileNumber')}</Label>
            <InputWrapper icon={FiPhone}>
              <input
                name="mobileNumber"
                type="tel"
                inputMode="numeric"
                pattern="^([1-9][0-9]{8}|0[0-9]{9})$"
                maxLength={10}
                value={formData.mobileNumber || ''}
                onChange={handleChange}
                readOnly={isReadOnly}
                disabled={isReadOnly}
                style={getStyle()}
                required
              />
            </InputWrapper>
          </div>
        </div>
        
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FiMail size={14} /> {t('wizards.newConnection.customerInfo.mobileNote')}
        </p>

      </div>
    </motion.div>
  );
}
