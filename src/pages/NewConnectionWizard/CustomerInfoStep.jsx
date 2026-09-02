import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiLock, FiUser, FiMapPin, FiPhone, FiMail, FiCalendar, FiFileText } from 'react-icons/fi';
import AddressInputWithMap from '../../components/form/AddressInputWithMap';
import { useVerifiedContext } from '../../components/verification';
import { getAuthUser } from '../../utils/authSession';
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

const Label = ({ children, icon: Icon, isReadOnly, htmlFor }) => (
  <label htmlFor={htmlFor} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
    {Icon && <Icon size={14} color="#64748b" aria-hidden="true" />}
    {children}
    {isReadOnly && (
      <>
        <FiLock size={12} color="#0f7a4d" style={{ marginLeft: 'auto' }} aria-hidden="true" />
        <span className="sr-only">(locked — taken from your verified profile)</span>
      </>
    )}
  </label>
);

const InputWrapper = ({ children, icon: Icon, isReadOnly }) => (
  <div style={{ position: 'relative', width: '100%' }}>
    {Icon && (
      <div aria-hidden="true" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: isReadOnly ? '#94a3b8' : '#64748b', zIndex: 1 }}>
        <Icon size={16} />
      </div>
    )}
    {children}
  </div>
);

const ReadOnlyDetail = ({ label, value }) => (
  <div>
    <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#5b6472', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>
      {label}
    </span>
    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
      {value || <span style={{ color: '#5b6472', fontWeight: 600 }}>NA</span>}
    </span>
  </div>
);

export default function CustomerInfoStep({ formData, handleChange, setFields, handleFileChange }) {
  const { t } = useTranslation();
  const { mobileNumber, customerExists, selectedAccount } = useVerifiedContext();
  const [authUser] = useState(getAuthUser);

  // Whatever we already know about this person: their SLT connection if they
  // have one, otherwise the details they gave us when they registered. Either
  // way there's no reason to ask for it a second time.
  const knownProfile = (() => {
    if (selectedAccount) {
      return {
        source: 'account',
        title: selectedAccount.title || 'Mr',
        nameFull: selectedAccount.fullName || selectedAccount.customerName || '',
        nic: selectedAccount.nic || '',
        dob: '',
        email: selectedAccount.email || '',
        mobileNumber: selectedAccount.mobileNumber || selectedAccount.phoneNumber || mobileNumber || '',
        fixedNumber: selectedAccount.telephone || '',
        registeredAddress: selectedAccount.address || selectedAccount.addressLine1 || '',
      };
    }
    if (authUser) {
      const line = [authUser.addressLine1, authUser.addressLine2, authUser.city, authUser.postalCode]
        .filter(Boolean)
        .join(', ');
      return {
        source: 'registration',
        title: authUser.title || 'Mr',
        nameFull: authUser.name || '',
        nic: authUser.NIC || '',
        dob: authUser.dob || '',
        email: authUser.email || '',
        mobileNumber: authUser.phone || mobileNumber || '',
        fixedNumber: authUser.contactNumber || '',
        registeredAddress: line,
      };
    }
    return null;
  })();

  const hasKnownProfile = !!knownProfile;
  const isReadOnly = !!selectedAccount;

  // Install at the address we already hold, unless they tell us otherwise.
  const [useRegisteredAddress, setUseRegisteredAddress] = useState(true);

  useEffect(() => {
    if (!setFields) return;

    if (knownProfile) {
      setFields({
        customerType: selectedAccount?.customerType || formData.customerType || 'home',
        title: knownProfile.title,
        nameFull: knownProfile.nameFull,
        nic: knownProfile.nic,
        dob: knownProfile.dob,
        contactName: knownProfile.nameFull,
        email: knownProfile.email,
        mobileNumber: knownProfile.mobileNumber,
        fixedNumber: knownProfile.fixedNumber,
        isExistingCustomer: selectedAccount ? 'yes' : 'no',
        existingNumber: selectedAccount?.accountNumber || selectedAccount?.telephone || '',
      });
    } else if (customerExists === false) {
      setFields({ isExistingCustomer: 'no', mobileNumber: mobileNumber || '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount, customerExists, mobileNumber, authUser]);

  // Keep the install address in step with the "same as registered" choice.
  useEffect(() => {
    if (!setFields || !knownProfile) return;
    if (useRegisteredAddress && knownProfile.registeredAddress) {
      setFields({ address: knownProfile.registeredAddress });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useRegisteredAddress, knownProfile?.registeredAddress]);

  // Calculate the maximum allowed date of birth (must be 18+ years old)
  const maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

  // We already hold this person's identity — from their SLT account, or from
  // what they typed when they registered. Asking for all of it again is just
  // friction, so only the things that are specific to *this* connection are
  // asked for here.
  if (hasKnownProfile) {
    const fromRegistration = knownProfile.source === 'registration';

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h3 style={{ color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          {t('wizards.newConnection.customerInfo.heading')}
        </h3>
        <p style={{ color: '#475569', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          We already have your details{fromRegistration ? ' from your account' : ' on file'} — just tell us
          a few things about this new connection.
        </p>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* ── What we already know ─────────────────────────────── */}
          {fromRegistration && (
            <section aria-labelledby="nc-known-heading" style={{ marginBottom: '2rem' }}>
              <div style={{ marginBottom: '1rem', paddingBottom: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
                <h4 id="nc-known-heading" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiUser color="#0056b3" aria-hidden="true" /> Your Details
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem 1.5rem' }}>
                <ReadOnlyDetail label="Name" value={knownProfile.nameFull} />
                <ReadOnlyDetail label="NIC / Passport" value={knownProfile.nic} />
                <ReadOnlyDetail label="Date of Birth" value={knownProfile.dob} />
                <ReadOnlyDetail label="Email" value={knownProfile.email} />
                <ReadOnlyDetail label="Mobile Number" value={knownProfile.mobileNumber} />
              </div>

              <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.8rem', color: '#475569' }}>
                Taken from your account. If anything is wrong, update it in{' '}
                <Link to="/profile" style={{ color: '#0b4a91', fontWeight: 700 }}>My Profile</Link>.
              </p>
            </section>
          )}

          {/* ── Connection-specific questions ────────────────────── */}
          <div style={{ marginBottom: '1.5rem', paddingBottom: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
            <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiMapPin color="#0056b3" aria-hidden="true" /> New Connection Details
            </h4>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <span className="sr-only" id="nc-customer-type-label">{t('wizards.newConnection.customerInfo.customerType')}</span>
            <Label icon={FiUser} aria-hidden="true">{t('wizards.newConnection.customerInfo.customerType')}</Label>
            <div role="radiogroup" aria-labelledby="nc-customer-type-label" style={{ display: 'flex', gap: '1rem', padding: '0.8rem 1rem', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px' }}>
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

          {/* Installation address — often the same as the one we hold, but a
              connection can perfectly well be for a different place. */}
          {knownProfile.registeredAddress && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.9rem', color: '#334155', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={useRegisteredAddress}
                  onChange={(e) => setUseRegisteredAddress(e.target.checked)}
                  style={{ marginTop: '0.2rem', accentColor: '#0056b3' }}
                />
                <span>
                  Install at my registered address
                  <span style={{ display: 'block', fontWeight: 500, color: '#475569', fontSize: '0.85rem' }}>
                    {knownProfile.registeredAddress}
                  </span>
                </span>
              </label>
            </div>
          )}

          {(!useRegisteredAddress || !knownProfile.registeredAddress) && (
            <div style={{ marginBottom: '1.5rem' }}>
              <AddressInputWithMap
                name="address"
                label={knownProfile.registeredAddress ? 'Installation Address' : t('wizards.newConnection.customerInfo.address')}
                value={formData.address || ''}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div style={{ marginBottom: fromRegistration ? '2rem' : 0 }}>
            <Label icon={FiFileText} htmlFor="nc-taxExemption">{t('wizards.newConnection.customerInfo.taxExemption')}</Label>
            <InputWrapper icon={FiFileText}>
              <input
                id="nc-taxExemption"
                name="taxExemption"
                type="text"
                value={formData.taxExemption || ''}
                onChange={handleChange}
                style={getStyle()}
              />
            </InputWrapper>
          </div>

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
          borderRadius: '16px',
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
            <span className="sr-only" id="nc-customer-type-label">{t('wizards.newConnection.customerInfo.customerType')}</span>
            <Label icon={FiUser} aria-hidden="true">{t('wizards.newConnection.customerInfo.customerType')}</Label>
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
              <Label htmlFor="nc-title">Title</Label>
              <select id="nc-title" name="title" value={formData.title || ''} onChange={handleChange} disabled={isReadOnly} style={{...getStyle(), paddingLeft: '1rem'}}>
                <option value="" disabled>{t('wizards.newConnection.customerInfo.select')}</option>
                <option value="Rev">Rev</option>
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ flex: 3 }}>
              <Label icon={FiUser} htmlFor="nc-nameFull">{t('wizards.newConnection.customerInfo.nameFull')}</Label>
              <InputWrapper icon={FiUser}>
                <input
                  id="nc-nameFull"
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
            <Label icon={FiCalendar} htmlFor="nc-dob">{t('wizards.newConnection.customerInfo.dob')}</Label>
            <InputWrapper icon={FiCalendar}>
              <input
                id="nc-dob"
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
            <Label icon={FiFileText} htmlFor="nc-nic">{t('wizards.newConnection.customerInfo.nic')}</Label>
            <InputWrapper icon={FiFileText}>
              <input
                id="nc-nic"
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
            <Label icon={FiFileText} htmlFor="nc-taxExemption">{t('wizards.newConnection.customerInfo.taxExemption')}</Label>
            <InputWrapper icon={FiFileText}>
              <input
                id="nc-taxExemption"
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
            <Label icon={FiUser} htmlFor="nc-contactName">{t('wizards.newConnection.customerInfo.contactName')}</Label>
            <InputWrapper icon={FiUser}>
              <input
                id="nc-contactName"
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
            <Label icon={FiMail} htmlFor="nc-email">{t('wizards.newConnection.customerInfo.email')}</Label>
            <InputWrapper icon={FiMail}>
              <input
                id="nc-email"
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
            <Label icon={FiPhone} htmlFor="nc-fixedNumber">{t('wizards.newConnection.customerInfo.fixedNumber')}</Label>
            <InputWrapper icon={FiPhone}>
              <input
                id="nc-fixedNumber"
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
            <Label icon={FiPhone} htmlFor="nc-mobileNumber">{t('wizards.newConnection.customerInfo.mobileNumber')}</Label>
            <InputWrapper icon={FiPhone}>
              <input
                id="nc-mobileNumber"
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
