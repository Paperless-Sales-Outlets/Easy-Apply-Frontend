import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import DigitalSignatureCanvas from '../../components/form/DigitalSignatureCanvas';
import FaceCaptureField from '../../components/form/FaceCaptureField';

const ValueAddedServicesStep = forwardRef(function ValueAddedServicesStep({ formData, handleChange, isActive }, ref) {
  const { t } = useTranslation();
  const [signatureError, setSignatureError] = useState(false);
  const [faceError, setFaceError] = useState('');

  // Expose validate() so the parent wizard can confirm the headshot and
  // signature were provided before advancing — the backend rejects submissions
  // without them (BRD 5.1.4) regardless of which path (payment or no-loop) is
  // taken next. Every applicant needs a headshot, new customer or existing.
  useImperativeHandle(ref, () => ({
    validate: () => {
      if (!formData.facePhoto) {
        setFaceError('A face photo is required before you can sign.');
        toast.error('Please take or upload your face photo to proceed');
        return false;
      }
      if (!formData.signature) {
        setSignatureError(true);
        toast.error('Please provide your digital signature to proceed');
        return false;
      }
      return true;
    },
  }));

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.newConnection.vas.heading')}</h3>
      
      <div className="form-group">
        <label className="form-label">{t('wizards.newConnection.vas.requiredVas')}</label>
        <div className="radio-group responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)" }}>
          {[
            t('wizards.newConnection.vas.vasA'), t('wizards.newConnection.vas.vasB'), 
            t('wizards.newConnection.vas.vasC'), t('wizards.newConnection.vas.vasD'),
            t('wizards.newConnection.vas.vasE'), t('wizards.newConnection.vas.vasF'),
            t('wizards.newConnection.vas.vasG'), t('wizards.newConnection.vas.vasH'),
            t('wizards.newConnection.vas.vasI'), t('wizards.newConnection.vas.vasJ'), 
            t('wizards.newConnection.vas.vasK'), t('wizards.newConnection.vas.vasL')
          ].map((vas, idx) => {
            const name = `requiredVas_${idx}`;
            return (
              <label key={vas} className="checkbox-label">
                <input 
                  name={name} 
                  type="checkbox" 
                  className="checkbox-input" 
                  checked={!!formData[name]} 
                  onChange={handleChange} 
                /> {vas}
              </label>
            );
          })}
        </div>
      </div>

      <div className="form-group mt-4">
        <label className="form-label">{t('wizards.newConnection.vas.otherVas')}</label>
        <div className="radio-group">
          {[
            t('wizards.newConnection.vas.otherA'), t('wizards.newConnection.vas.otherB'), 
            t('wizards.newConnection.vas.otherC'), t('wizards.newConnection.vas.otherD')
          ].map((vas, idx) => {
            const name = `otherVas_${idx}`;
            return (
              <label key={vas} className="checkbox-label">
                <input 
                  name={name} 
                  type="checkbox" 
                  className="checkbox-input" 
                  checked={!!formData[name]} 
                  onChange={handleChange} 
                /> {vas}
              </label>
            );
          })}
        </div>
      </div>

      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('wizards.newConnection.vas.agreementHeading')}</h4>
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: '1rem' }}>
          {t('wizards.newConnection.vas.agreementText')}
        </p>
        <label className="checkbox-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
          <input
            name="declarationAccepted"
            type="checkbox"
            className="checkbox-input"
            checked={!!formData.declarationAccepted}
            onChange={handleChange}
            required
          /> {t('wizards.newConnection.vas.agreeLabel')}
        </label>
      </div>

      <h4 style={{ marginTop: '2rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>Identity Photo</h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1rem' }}>
        Take a live photo of your face so we can verify it against your identity documents.
      </p>
      <FaceCaptureField
        required
        value={formData.facePhoto || ''}
        error={faceError}
        onChange={(dataUrl) => {
          handleChange({ target: { name: 'facePhoto', value: dataUrl } });
          if (dataUrl) setFaceError('');
        }}
      />

      <div className="mt-4" style={{ marginTop: '1.5rem' }}>
        <DigitalSignatureCanvas
          isActive={isActive}
          required
          onChange={(base64) => {
            handleChange({ target: { name: 'signature', value: base64 } });
            if (base64) setSignatureError(false);
          }}
        />
        {signatureError && (
          <p style={{ color: 'var(--danger, #dc3545)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Please provide your digital signature to proceed.
          </p>
        )}
      </div>

    </div>
  );
});

export default ValueAddedServicesStep;
