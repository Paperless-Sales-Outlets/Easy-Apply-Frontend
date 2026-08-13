import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiSearch,
  FiUserCheck,
  FiUserPlus,
  FiLoader,
  FiCheckCircle,
  FiPhone,
  FiLock,
  FiUnlock,
  FiShield,
  FiZap,
} from 'react-icons/fi';
import AddressInputWithMap from '../../components/form/AddressInputWithMap';
import api from '../../utils/api';
import { useVerifiedContext } from '../../components/verification';
import ExistingCustomerSummaryBox from '../../components/ExistingCustomerSummaryBox';

export default function CustomerInfoStep({ formData, handleChange, setFields }) {
  const { t } = useTranslation();
  const { mobileNumber, customerExists, selectedAccount } = useVerifiedContext();

  const [phoneSearch, setPhoneSearch] = useState(formData.mobileNumber || formData.fixedNumber || mobileNumber || '');
  const [searching, setSearching] = useState(false);
  const [checkStatus, setCheckStatus] = useState(selectedAccount ? 'existing' : customerExists === false ? 'new' : null);
  const [customerRecord, setCustomerRecord] = useState(selectedAccount || null);

  useEffect(() => {
    if (selectedAccount && setFields) {
      setCheckStatus('existing');
      setCustomerRecord(selectedAccount);
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
      setCheckStatus('new');
      setFields({
        isExistingCustomer: 'no',
        mobileNumber: mobileNumber || '',
      });
    }
  }, [selectedAccount, customerExists, mobileNumber]);

  const isReadOnly = checkStatus === 'existing';

  const readOnlyStyle = isReadOnly
    ? {
      backgroundColor: '#f1f5f9',
      borderColor: '#cbd5e1',
      color: '#334155',
      cursor: 'not-allowed',
      fontWeight: 600,
    }
    : {};

  // Calculate the maximum allowed date of birth (must be 18+ years old)
  const maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

  const handleCheckCustomer = async (numToCheck) => {
    const targetNum = numToCheck !== undefined ? numToCheck : phoneSearch;
    if (!targetNum || targetNum.trim().length < 8) {
      return;
    }

    setSearching(true);
    setCheckStatus(null);
    setCustomerRecord(null);

    try {
      const res = await api.get(`/customers/${encodeURIComponent(targetNum.trim())}`);
      if (res.data && res.data.isExisting && res.data.data) {
        const cust = res.data.data;
        setCheckStatus('existing');
        setCustomerRecord(cust);

        if (setFields) {
          setFields({
            customerType: cust.customerType || 'home',
            title: cust.title || 'Mr',
            nameFull: cust.nameFull || cust.fullName || '',
            nic: cust.nic || '',
            dob: cust.dob || '',
            taxExemption: cust.taxExemption || '',
            address: cust.address || cust.addressLine1 || '',
            contactName: cust.contactName || cust.fullName || '',
            fixedNumber: cust.fixedNumber || cust.telephone || '',
            mobileNumber: cust.mobileNumber || cust.contactNo || targetNum,
            email: cust.email || '',
            isExistingCustomer: 'yes',
            existingNumber: cust.fixedNumber || cust.telephone || targetNum,
          });
        }
      } else {
        setCheckStatus('new');
        if (setFields) {
          setFields({
            isExistingCustomer: 'no',
            mobileNumber: targetNum,
          });
        }
      }
    } catch (err) {
      console.warn('Customer check error:', err);
      setCheckStatus('new');
      if (setFields) {
        setFields({
          isExistingCustomer: 'no',
          mobileNumber: targetNum,
        });
      }
    } finally {
      setSearching(false);
    }
  };

  const handlePhoneInputChange = (e) => {
    if (isReadOnly) return;
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneSearch(val);
    handleChange({ target: { name: 'mobileNumber', value: val } });
    if (val.length === 10) {
      handleCheckCustomer(val);
    }
  };

  const handleResetCheck = () => {
    setCheckStatus(null);
    setCustomerRecord(null);
    setPhoneSearch('');
    if (setFields) {
      setFields({
        customerType: 'home',
        title: '',
        nameFull: '',
        nic: '',
        dob: '',
        taxExemption: '',
        address: '',
        contactName: '',
        fixedNumber: '',
        mobileNumber: '',
        email: '',
        isExistingCustomer: 'no',
        existingNumber: '',
      });
    }
  };

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.25rem' }}>
        {t('wizards.newConnection.customerInfo.heading')}
      </h3>

      {/* VERIFIED CUSTOMER SUMMARY BOX AT TOP */}
      <ExistingCustomerSummaryBox customerData={selectedAccount} customerExists={customerExists} />

      {/* ── HIGH-END CUSTOMER CHECK & AUTO-FILL CARD ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '1.75rem',
          marginBottom: '2.25rem',
          boxShadow: checkStatus === 'existing'
            ? '0 10px 30px rgba(16, 185, 129, 0.12)'
            : checkStatus === 'new'
              ? '0 10px 30px rgba(0, 86, 179, 0.1)'
              : '0 8px 24px rgba(0, 0, 0, 0.05)',
          border: checkStatus === 'existing'
            ? '2px solid #10b981'
            : checkStatus === 'new'
              ? '2px solid #0056b3'
              : '1.5px solid #cbd5e1',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Top Accent Gradient Line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '5px',
            background: checkStatus === 'existing'
              ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
              : checkStatus === 'new'
                ? 'linear-gradient(90deg, #0056b3 0%, #0284c7 100%)'
                : 'linear-gradient(90deg, #0056b3 0%, #10b981 100%)',
          }}
        />

        {/* Header Title & Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: checkStatus === 'existing' ? '#ecfdf5' : '#eff6ff',
                color: checkStatus === 'existing' ? '#10b981' : '#0056b3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: checkStatus === 'existing' ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 4px 12px rgba(0, 86, 179, 0.15)',
                flexShrink: 0,
              }}
            >
              {checkStatus === 'existing' ? <FiLock size={22} /> : <FiPhone size={22} />}
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                Check Customer Status (Existing or New)
              </h4>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                Enter your phone number to check if your details exist in our SLTMobitel database.
              </p>
            </div>
          </div>

          {checkStatus && (
            <span
              style={{
                backgroundColor: checkStatus === 'existing' ? '#ecfdf5' : '#eff6ff',
                color: checkStatus === 'existing' ? '#047857' : '#1e40af',
                border: checkStatus === 'existing' ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {checkStatus === 'existing' ? <><FiLock size={12} /> Existing Customer (Read-Only)</> : <><FiUserPlus size={12} /> New Customer</>}
            </span>
          )}
        </div>

        {/* Input Bar & Button */}
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Enter Mobile/Fixed Number (e.g. 0771234567)"
              className="form-control"
              value={phoneSearch}
              onChange={handlePhoneInputChange}
              disabled={searching || isReadOnly}
              style={{
                paddingLeft: '2.6rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: '12px',
                height: '48px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: isReadOnly ? '#f1f5f9' : searching ? '#f8fafc' : '#ffffff',
                color: isReadOnly ? '#334155' : undefined,
                cursor: isReadOnly ? 'not-allowed' : undefined,
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
              }}
            />
            <FiPhone
              size={18}
              color="#64748b"
              style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>

          {!isReadOnly ? (
            <button
              type="button"
              onClick={() => handleCheckCustomer()}
              disabled={searching || !phoneSearch}
              style={{
                backgroundColor: '#0056b3',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0 1.75rem',
                height: '48px',
                fontWeight: 800,
                fontSize: '0.925rem',
                cursor: searching || !phoneSearch ? 'not-allowed' : 'pointer',
                opacity: searching || !phoneSearch ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(0, 86, 179, 0.25)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {searching ? (
                <>
                  <FiLoader className="spin" size={17} /> Checking Database...
                </>
              ) : (
                <>
                  <FiSearch size={17} /> Check Customer
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResetCheck}
              style={{
                backgroundColor: '#ffffff',
                color: '#0056b3',
                border: '1.5px solid #0056b3',
                borderRadius: '12px',
                padding: '0 1.25rem',
                height: '48px',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap',
              }}
            >
              <FiUnlock size={15} /> Change Number / Reset
            </button>
          )}
        </div>

        {/* Quick Sample Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748b' }}>
          <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <FiZap color="#0056b3" size={13} /> Quick Test:
          </span>
          {[
            { label: 'Existing (0771234567)', num: '0771234567' },
            { label: 'Existing (0112345678)', num: '0112345678' },
            { label: 'New Customer (0779999999)', num: '0779999999' },
          ].map((sample) => (
            <button
              key={sample.num}
              type="button"
              onClick={() => {
                setPhoneSearch(sample.num);
                handleCheckCustomer(sample.num);
              }}
              disabled={isReadOnly}
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.2rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#334155',
                cursor: isReadOnly ? 'not-allowed' : 'pointer',
                opacity: isReadOnly ? 0.6 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* Existing Customer Found Alert */}
        {checkStatus === 'existing' && customerRecord && (
          <div
            style={{
              marginTop: '1.25rem',
              backgroundColor: '#ecfdf5',
              border: '1.5px solid #a7f3d0',
              borderRadius: '14px',
              padding: '1.1rem 1.35rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                flexShrink: 0,
              }}
            >
              <FiCheckCircle size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h5 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#065f46' }}>
                  ✓ Existing Customer Record Found & Locked
                </h5>
                <span style={{ backgroundColor: '#059669', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                  🔒 Read-Only Mode
                </span>
              </div>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.86rem', color: '#047857', lineHeight: 1.5 }}>
                Welcome back, <strong>{customerRecord.nameFull || customerRecord.fullName}</strong> (NIC: <strong>{customerRecord.nic}</strong>)! Your details have been auto-filled and locked below to ensure database accuracy.
              </p>
            </div>
          </div>
        )}

        {/* New Customer Banner */}
        {checkStatus === 'new' && (
          <div
            style={{
              marginTop: '1.25rem',
              backgroundColor: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              borderRadius: '14px',
              padding: '1.1rem 1.35rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0056b3',
                flexShrink: 0,
              }}
            >
              <FiUserPlus size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#1e40af' }}>
                👤 New Customer — Full Registration Mode
              </h5>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.86rem', color: '#1d4ed8', lineHeight: 1.5 }}>
                No existing record found for <strong>{phoneSearch}</strong>. All form fields are editable below for manual completion.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* READ ONLY LOCK NOTICE BANNER */}
      {isReadOnly && (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.85rem',
            color: '#334155',
            fontWeight: 600,
          }}
        >
          <FiLock size={18} color="#059669" />
          <span>
            <strong>🔒 Customer Details Locked (Read-Only)</strong> — Registered details from SLTMobitel database cannot be edited on this form.
          </span>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {t('wizards.newConnection.customerInfo.customerType')}
          {isReadOnly && <FiLock size={13} color="#059669" title="Locked field" />}
        </label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="customerType"
              value="home"
              className="radio-input"
              checked={formData.customerType === 'home'}
              onChange={handleChange}
              disabled={isReadOnly}
              required
            /> {t('wizards.newConnection.customerInfo.home')}
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="customerType"
              value="office"
              className="radio-input"
              checked={formData.customerType === 'office'}
              onChange={handleChange}
              disabled={isReadOnly}
            /> {t('wizards.newConnection.customerInfo.office')}
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="customerType"
              value="religious"
              className="radio-input"
              checked={formData.customerType === 'religious'}
              onChange={handleChange}
              disabled={isReadOnly}
            /> {t('wizards.newConnection.customerInfo.religious')}
          </label>
        </div>
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {t('wizards.newConnection.customerInfo.title')}
            {isReadOnly && <FiLock size={12} color="#059669" />}
          </label>
          <select
            name="title"
            className="form-control"
            value={formData.title || ''}
            onChange={handleChange}
            disabled={isReadOnly}
            style={readOnlyStyle}
          >
            <option value="" disabled>{t('wizards.newConnection.customerInfo.select')}</option>
            <option value="Rev">{t('wizards.newConnection.customerInfo.rev')}</option>
            <option value="Mr">{t('wizards.newConnection.customerInfo.mr')}</option>
            <option value="Ms">{t('wizards.newConnection.customerInfo.ms')}</option>
            <option value="Other">{t('wizards.newConnection.customerInfo.other')}</option>
          </select>
        </div>
        <div style={{ flex: '3' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {t('wizards.newConnection.customerInfo.nameFull')}
            {isReadOnly && <FiLock size={12} color="#059669" />}
          </label>
          <input
            name="nameFull"
            type="text"
            className="form-control"
            placeholder={t('wizards.newConnection.customerInfo.namePlaceholder')}
            value={formData.nameFull || ''}
            onChange={handleChange}
            readOnly={isReadOnly}
            disabled={isReadOnly}
            style={readOnlyStyle}
            required
          />
        </div>
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {t('wizards.newConnection.customerInfo.dob')}
            {isReadOnly && <FiLock size={12} color="#059669" />}
          </label>
          <input
            name="dob"
            type="date"
            className="form-control"
            value={formData.dob || ''}
            onChange={handleChange}
            max={maxDob}
            readOnly={isReadOnly}
            disabled={isReadOnly}
            style={readOnlyStyle}
            required
          />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {t('wizards.newConnection.customerInfo.nic')}
            {isReadOnly && <FiLock size={12} color="#059669" />}
          </label>
          <input
            name="nic"
            type="text"
            className="form-control"
            value={formData.nic || ''}
            onChange={handleChange}
            readOnly={isReadOnly}
            disabled={isReadOnly}
            style={readOnlyStyle}
            required
          />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {t('wizards.newConnection.customerInfo.taxExemption')}
            {isReadOnly && <FiLock size={12} color="#059669" />}
          </label>
          <input
            name="taxExemption"
            type="text"
            className="form-control"
            value={formData.taxExemption || ''}
            onChange={handleChange}
            readOnly={isReadOnly}
            disabled={isReadOnly}
            style={readOnlyStyle}
          />
        </div>
      </div>

      <AddressInputWithMap
        name="address"
        label={t('wizards.newConnection.customerInfo.address')}
        value={formData.address || ''}
        onChange={handleChange}
        disabled={isReadOnly}
        readOnly={isReadOnly}
        required
      />

      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('wizards.newConnection.customerInfo.contactDetails')}</h4>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {t('wizards.newConnection.customerInfo.contactName')}
            {isReadOnly && <FiLock size={12} color="#059669" />}
          </label>
          <input
            name="contactName"
            type="text"
            className="form-control"
            value={formData.contactName || ''}
            onChange={handleChange}
            readOnly={isReadOnly}
            disabled={isReadOnly}
            style={readOnlyStyle}
            required
          />
        </div>
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {t('wizards.newConnection.customerInfo.fixedNumber')}
            {isReadOnly && <FiLock size={12} color="#059669" />}
          </label>
          <input
            name="fixedNumber"
            type="tel"
            inputMode="numeric"
            pattern="^([1-9][0-9]{8}|0[0-9]{9})$"
            maxLength={10}
            title="Enter 9 digits (not starting with 0) or 10 digits starting with 0"
            className="form-control"
            value={formData.fixedNumber || ''}
            onChange={handleChange}
            readOnly={isReadOnly}
            disabled={isReadOnly}
            style={readOnlyStyle}
          />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {t('wizards.newConnection.customerInfo.mobileNumber')}
            {isReadOnly && <FiLock size={12} color="#059669" />}
          </label>
          <input
            name="mobileNumber"
            type="tel"
            inputMode="numeric"
            pattern="^([1-9][0-9]{8}|0[0-9]{9})$"
            maxLength={10}
            title="Enter 9 digits (not starting with 0) or 10 digits starting with 0"
            className="form-control"
            value={formData.mobileNumber || ''}
            onChange={handleChange}
            readOnly={isReadOnly}
            disabled={isReadOnly}
            style={readOnlyStyle}
            required
          />
        </div>
      </div>

      <div className="form-group flex flex-col-mobile gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {t('wizards.newConnection.customerInfo.email')}
            {isReadOnly && <FiLock size={12} color="#059669" />}
          </label>
          <input
            name="email"
            type="email"
            className="form-control"
            value={formData.email || ''}
            onChange={handleChange}
            readOnly={isReadOnly}
            disabled={isReadOnly}
            style={readOnlyStyle}
            required
          />
        </div>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        {t('wizards.newConnection.customerInfo.mobileNote')}
      </p>

    </div>
  );
}
