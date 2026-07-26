import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';

const ReconnectionDetailsStep = forwardRef(function ReconnectionDetailsStep({ isActive, reconnectionData }, ref) {
  const { t } = useTranslation();

  const [checkedFacilities, setCheckedFacilities] = useState({});
  const [otherChecked, setOtherChecked] = useState(false);
  const [facilityError, setFacilityError] = useState(false);

  const anyFacilityChecked = Object.values(checkedFacilities).some(Boolean);

  const toggleFacility = (key) => {
    setCheckedFacilities(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (Object.values(next).some(Boolean)) setFacilityError(false);
      return next;
    });
  };

  // Expose validate() so the parent wizard can call it before advancing
  useImperativeHandle(ref, () => ({
    validate: () => {
      if (!anyFacilityChecked) {
        setFacilityError(true);
        return false;
      }
      return true;
    },
  }));

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.reconnection.reconnectionDetails.heading')}</h3>

      {/* Disconnection date range */}
      <div className="form-group flex flex-col-mobile gap-4 items-center">
        <label className="form-label" style={{ margin: 0, flexShrink: 0 }}>
          {t('wizards.reconnection.reconnectionDetails.disconnectedFrom')}
        </label>
        <input type="date" name="disconnectedFrom" className="form-control" style={{ flex: '1' }} required={isActive} value={reconnectionData?.disconnectedFrom || ''} readOnly />
        <span style={{ padding: '0 0.5rem' }}>{t('wizards.reconnection.reconnectionDetails.disconnectedTo')}</span>
        <input type="date" name="disconnectedTo" className="form-control" style={{ flex: '1' }} required={isActive} value={reconnectionData?.disconnectedTo || ''} readOnly />
      </div>

      {/* Amount to pay */}
      <div className="form-group flex gap-4 items-center">
        <label className="form-label" style={{ margin: 0 }}>
          {t('wizards.reconnection.reconnectionDetails.amountToPay')}
        </label>
        <input type="text" name="amountToPay" className="form-control" style={{ maxWidth: '200px' }} required={isActive} value={reconnectionData?.outstandingBalance !== undefined ? reconnectionData.outstandingBalance : ''} readOnly />
      </div>

      {/* Facilities — at least one required */}
      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        {t('wizards.reconnection.reconnectionDetails.facilitiesHeading')}
      </h4>

      <div className="form-group">
        {/* Single shared grid: Email under CLI, Dial-up below IDD */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem 1rem' }}>
          {/* Broadband — col 1, row 1 */}
          <label className="checkbox-label">
            <input type="checkbox" name="facility_broadband" className="checkbox-input"
              checked={!!checkedFacilities['broadband']}
              onChange={() => toggleFacility('broadband')}
            /> {t('wizards.reconnection.reconnectionDetails.broadband')}
          </label>
          {/* PeoTV — col 2, row 1 */}
          <label className="checkbox-label">
            <input type="checkbox" name="facility_peoTv" className="checkbox-input"
              checked={!!checkedFacilities['peoTv']}
              onChange={() => toggleFacility('peoTv')}
            /> {t('wizards.reconnection.reconnectionDetails.peoTv')}
          </label>
          {/* SLT+ — col 1, row 2 */}
          <label className="checkbox-label">
            <input type="checkbox" name="facility_sltPlus" className="checkbox-input"
              checked={!!checkedFacilities['sltPlus']}
              onChange={() => toggleFacility('sltPlus')}
            /> {t('wizards.reconnection.reconnectionDetails.sltPlus')}
          </label>
          {/* CLI — col 2, row 2 */}
          <label className="checkbox-label">
            <input type="checkbox" name="facility_cli" className="checkbox-input"
              checked={!!checkedFacilities['cli']}
              onChange={() => toggleFacility('cli')}
            /> {t('wizards.reconnection.reconnectionDetails.cli')}
          </label>
          {/* IDD — col 1, row 3 */}
          <label className="checkbox-label">
            <input type="checkbox" name="facility_idd" className="checkbox-input"
              checked={!!checkedFacilities['idd']}
              onChange={() => toggleFacility('idd')}
            /> {t('wizards.reconnection.reconnectionDetails.idd')}
          </label>
          {/* Email — col 2, row 3 — directly under CLI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="checkbox-label">
              <input type="checkbox" name="facility_email" className="checkbox-input"
                checked={!!checkedFacilities['email']}
                onChange={() => toggleFacility('email')}
              /> {t('wizards.reconnection.reconnectionDetails.email')}
            </label>
            {checkedFacilities['email'] && (
              <div className="form-group" style={{ marginLeft: '1.5rem' }}>
                <input type="text" name="emailUsername" className="form-control" placeholder="Email Username *" required={isActive && checkedFacilities['email']} />
              </div>
            )}
          </div>
          {/* Dial-up — col 1, row 4 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="checkbox-label">
              <input type="checkbox" name="facility_dialUp" className="checkbox-input"
                checked={!!checkedFacilities['dialUp']}
                onChange={() => toggleFacility('dialUp')}
              /> {t('wizards.reconnection.reconnectionDetails.dialUp')}
            </label>
            {checkedFacilities['dialUp'] && (
              <div className="form-group" style={{ marginLeft: '1.5rem' }}>
                <input type="text" name="dialUpUsername" className="form-control" placeholder="Dial-up Username *" required={isActive && checkedFacilities['dialUp']} />
              </div>
            )}
          </div>
          {/* col 2, row 4 — empty */}
          <span />
        </div>

        {/* Inline error shown when user tries to advance without selecting */}
        {facilityError && (
          <p style={{ color: 'var(--danger, #dc3545)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            {t('wizards.reconnection.reconnectionDetails.facilitiesRequired') || 'Please select at least one facility.'}
          </p>
        )}
      </div>

      {/* Other — specify field appears below when checked */}
      <div className="form-group mt-4">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="facility_other"
            className="checkbox-input"
            checked={otherChecked}
            onChange={() => setOtherChecked(v => !v)}
          /> {t('wizards.reconnection.reconnectionDetails.other')}
        </label>
        {otherChecked && (
          <div className="form-group mt-2" style={{ marginLeft: '1.5rem' }}>
            <label className="form-label">{t('wizards.reconnection.reconnectionDetails.specify')} <span style={{ color: 'var(--danger, #dc3545)' }}>*</span></label>
            <input type="text" name="otherService" className="form-control" required={isActive && otherChecked} />
          </div>
        )}
      </div>

      {/* Remarks — optional */}
      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.reconnection.reconnectionDetails.remarks')}</label>
        <textarea className="form-control" rows="3"></textarea>
      </div>

    </div>
  );
});

export default ReconnectionDetailsStep;
