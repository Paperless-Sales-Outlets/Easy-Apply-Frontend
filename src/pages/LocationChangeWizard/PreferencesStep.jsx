import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function PreferencesStep({ 
  isActive, 
  selectedServiceType = 'FTTH', // Accepts 'FTTH', 'Megaline', 'LTE', etc.
  customerType = 'business',    // Accepts 'individual' or 'business'
  onValidationChange,
  onDataChange,
  showValidationErrors = false,
}) {
  const { t } = useTranslation();

  // State Management
  const [relocationDate, setRelocationDate] = useState('');
  const [disconnectDate, setDisconnectDate] = useState('');
  const [disconnectAction, setDisconnectAction] = useState('all');
  const [keptServices, setKeptServices] = useState({
    incoming: false,
    outgoing: false,
    broadband: false,
    peoTv: false,
  });

  const [callForwarding, setCallForwarding] = useState('no');
  const [forwardingDuration, setForwardingDuration] = useState('');

  const [sltNumber1, setSltNumber1] = useState('');
  const [sltNumber2, setSltNumber2] = useState('');

  const [isRepresentative, setIsRepresentative] = useState('no');
  const [authLetter, setAuthLetter] = useState(null);
  const [brcFile, setBrcFile] = useState(null);

  // Errors state
  const [errors, setErrors] = useState({});

  // Minimum date selection for preferred relocation date (Today onwards)
  const today = new Date().toISOString().split('T')[0];

  // Helper validation for 10-digit numeric numbers
  const validatePhoneNumber = (value) => {
    return /^\d{10}$/.test(value);
  };

  const handlePhone1Change = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setSltNumber1(val);
    if (val && !validatePhoneNumber(val)) {
      setErrors((prev) => ({ ...prev, sltNumber1: 'Must be exactly 10 digits' }));
    } else {
      setErrors((prev) => ({ ...prev, sltNumber1: null }));
    }
  };

  const handlePhone2Change = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setSltNumber2(val);
    if (val && !validatePhoneNumber(val)) {
      setErrors((prev) => ({ ...prev, sltNumber2: 'Must be exactly 10 digits' }));
    } else {
      setErrors((prev) => ({ ...prev, sltNumber2: null }));
    }
  };

  const handleCheckboxChange = (serviceKey) => {
    setKeptServices((prev) => ({ ...prev, [serviceKey]: !prev[serviceKey] }));
  };

  const isFTTHOrMegaline = ['FTTH', 'Megaline'].includes(selectedServiceType);
  const isAuthLetterValid = isRepresentative !== 'yes' || Boolean(authLetter);
  const isBrcValid = customerType !== 'business' || Boolean(brcFile);
  const isSltNumber1Valid = !isFTTHOrMegaline || validatePhoneNumber(sltNumber1);
  const isSltNumber2Valid = !sltNumber2 || validatePhoneNumber(sltNumber2);
  const isSltNumbersValid = isSltNumber1Valid && isSltNumber2Valid;
  const isRelocationDateValid = Boolean(relocationDate);
  const isDisconnectDateValid = Boolean(disconnectDate);

  const isStepValid = isRelocationDateValid && isDisconnectDateValid && isSltNumbersValid && isAuthLetterValid && isBrcValid;

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isStepValid);
    }
  }, [isStepValid, onValidationChange]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        relocationDate,
        sltNumber1,
        sltNumber2,
        isRepresentative,
        authLetter,
        brcFile,
      });
    }
  }, [onDataChange, relocationDate, sltNumber1, sltNumber2, isRepresentative, authLetter, brcFile]);

  return (
    <div className="preferences-step-container">
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem', fontWeight: 'bold' }}>
        {t('wizards.locationChange.preferences.heading', 'Transfer Preferences')}
      </h3>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. Dates Row */}
      {/* ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: '600' }}>
            {t('wizards.locationChange.preferences.relocationDate', 'Preferred Relocation Date')}{' '}
            <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="date"
            className="form-control"
            min={today}
            value={relocationDate}
            onChange={(e) => setRelocationDate(e.target.value)}
            required={isActive}
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: '600' }}>
            {t('wizards.locationChange.preferences.disconnectDate', 'Disconnect Date')}{' '}
            <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="date"
            className="form-control"
            value={disconnectDate}
            onChange={(e) => setDisconnectDate(e.target.value)}
            required={isActive}
          />
          {showValidationErrors && !disconnectDate && (
            <span style={{ color: 'red', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
              Disconnect date is required.
            </span>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. Present Services Options */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="form-group mb-4">
        <label className="form-label" style={{ fontWeight: '600' }}>
          {t('wizards.locationChange.preferences.presentServices', '1.5 Present services')}
          {selectedServiceType && (
            <span style={{ fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '0.3rem' }}>
              ({selectedServiceType})
            </span>
          )}
        </label>

        <div className="radio-group" style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
          <label className="radio-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="disconnectAction"
              value="all"
              checked={disconnectAction === 'all'}
              onChange={(e) => setDisconnectAction(e.target.value)}
              className="radio-input"
            />
            {t('wizards.locationChange.preferences.disconnectAll', 'a. Disconnect all existing services immediately')}
          </label>

          <label className="radio-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="disconnectAction"
              value="keep"
              checked={disconnectAction === 'keep'}
              onChange={(e) => setDisconnectAction(e.target.value)}
              className="radio-input"
            />
            {t('wizards.locationChange.preferences.keepServices', 'b. Keep the following services until new telephone line is given')}
          </label>
        </div>

        {disconnectAction === 'keep' && (
          <div
            className="card flex gap-4 flex-wrap mt-2"
            style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
          >
            {['incoming', 'outgoing', 'broadband', 'peoTv'].map((serviceKey) => (
              <label key={serviceKey} className="checkbox-label" style={{ margin: 0, minWidth: '120px', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={keptServices[serviceKey]}
                  onChange={() => handleCheckboxChange(serviceKey)}
                />
                {t(`wizards.locationChange.preferences.${serviceKey}`, serviceKey.charAt(0).toUpperCase() + serviceKey.slice(1))}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. Call Forwarding */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="form-group mb-4">
        <label className="form-label" style={{ fontWeight: '600', marginBottom: '0.2rem' }}>
          {t('wizards.locationChange.preferences.callForwarding', '1.6 Required Call Forwarding Facility (charges applicable)')}
        </label>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {t('wizards.locationChange.preferences.callForwardingNote', '(transfer calls from existing number to new number)')}
        </p>

        <div className="radio-group" style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.8rem' }}>
          <label className="radio-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="callForwarding"
              value="yes"
              checked={callForwarding === 'yes'}
              onChange={(e) => setCallForwarding(e.target.value)}
              className="radio-input"
            />
            {t('wizards.locationChange.preferences.yes', 'Yes')}
          </label>
          <label className="radio-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="callForwarding"
              value="no"
              checked={callForwarding === 'no'}
              onChange={(e) => setCallForwarding(e.target.value)}
              className="radio-input"
            />
            {t('wizards.locationChange.preferences.no', 'No')}
          </label>
        </div>

        {callForwarding === 'yes' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {t('wizards.locationChange.preferences.durationReq', 'Duration required:')}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '150px' }}>
              <input
                type="number"
                min="1"
                max="12"
                className="form-control"
                value={forwardingDuration}
                onChange={(e) => setForwardingDuration(e.target.value)}
                required={isActive && callForwarding === 'yes'}
              />
              <span style={{ color: 'var(--text-secondary)' }}>
                {t('wizards.locationChange.preferences.months', 'months')}
              </span>
            </div>
          </div>
        )}
      </div>

      <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid var(--border-color)' }} />

      
      {isFTTHOrMegaline && (
        <>
          <div className="form-group mb-4">
             

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label className="form-label">
                  {t('wizards.locationChange.preferences.nearestNumber1', 'Nearest SLT Telephone Number 1')}{' '}
                  <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., 0112345678"
                  value={sltNumber1}
                  onChange={handlePhone1Change}
                  required={isActive && isFTTHOrMegaline}
                />
                {errors.sltNumber1 && (
                  <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>
                    {errors.sltNumber1}
                  </span>
                )}
              </div>

              <div>
                <label className="form-label">
                  {t('wizards.locationChange.preferences.nearestNumber2', 'Nearest SLT Telephone Number 2')}{' '}
                  <span style={{ color: '#888', fontWeight: '400', fontSize: '0.85rem' }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., 0112345679"
                  value={sltNumber2}
                  onChange={handlePhone2Change}
                />
                {errors.sltNumber2 && (
                  <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>
                    {errors.sltNumber2}
                  </span>
                )}
              </div>
            </div>
          </div>

          <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid var(--border-color)' }} />
        </>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. Representative Selection */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="form-group mb-4">
        <label className="form-label" style={{ fontWeight: '600' }}>
          {t('wizards.locationChange.preferences.isRepresentative', 'Are you applying on behalf of the Legal Owner?')}
        </label>

        <div className="radio-group" style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
          <label className="radio-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="isRepresentative"
              value="yes"
              checked={isRepresentative === 'yes'}
              onChange={(e) => setIsRepresentative(e.target.value)}
              className="radio-input"
            />
            {t('wizards.locationChange.preferences.yes', 'Yes')}
          </label>

          <label className="radio-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="isRepresentative"
              value="no"
              checked={isRepresentative === 'no'}
              onChange={(e) => setIsRepresentative(e.target.value)}
              className="radio-input"
            />
            {t('wizards.locationChange.preferences.no', 'No')}
          </label>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 6. Authorization Letter Upload (Shows when Representative = Yes) */}
      {/* ────────────────────────────────────────────────────────── */}
      {isRepresentative === 'yes' && (
        <div className="form-group mb-4" style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-color)' }}>
          <label className="form-label" style={{ fontWeight: '600' }}>
            {t('wizards.locationChange.preferences.authLetter', 'Authorization Letter')} <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="form-control"
            onChange={(e) => setAuthLetter(e.target.files[0])}
            required={isActive && isRepresentative === 'yes'}
          />
          <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.3rem' }}>
            Please upload an authorization letter signed by the legal owner (.pdf, .jpg, .png).
          </small>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 7. Business Registration Certificate Upload (Shows for Business type) */}
      {/* ────────────────────────────────────────────────────────── */}
      {customerType === 'business' && (
        <div className="form-group mb-4" style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-color)' }}>
          <label className="form-label" style={{ fontWeight: '600' }}>
            {t('wizards.locationChange.preferences.brc', 'Business Registration Certificate (BRC)')}
          </label>
          <input
            type="file"
            name="brcFile"
            accept=".pdf,.png,.jpg,.jpeg"
            className="form-control"
            onChange={(e) => setBrcFile(e.target.files[0])}
            required={isActive && customerType === 'business'}
          />
          <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.3rem' }}>
            Upload a valid Business Registration Certificate (.pdf, .jpg, .png).
          </small>
          {showValidationErrors && customerType === 'business' && !brcFile && (
            <span style={{ color: 'red', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
              Business Registration Certificate is required.
            </span>
          )}
        </div>
      )}
    </div>
  );
}