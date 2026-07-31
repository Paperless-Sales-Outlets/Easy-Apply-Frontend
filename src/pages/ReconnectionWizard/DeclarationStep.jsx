import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DigitalSignatureCanvas from '../../components/DigitalSignatureCanvas';

const DeclarationStep = forwardRef(function DeclarationStep({ isActive }, ref) {
  const { t } = useTranslation();
  const [customerType, setCustomerType] = useState('Residential');
  const [signatureBase64, setSignatureBase64] = useState('');
  const [signatureError, setSignatureError] = useState(false);

  const [signatureMethod, setSignatureMethod] = useState('draw'); // 'draw' or 'upload'
  const signatureFileRef = useRef(null);

  useImperativeHandle(ref, () => ({
    validate: () => {
      if (signatureMethod === 'draw' && !signatureBase64) {
        setSignatureError(true);
        return false;
      }
      if (signatureMethod === 'upload' && (!signatureFileRef.current || !signatureFileRef.current.files || signatureFileRef.current.files.length === 0)) {
        setSignatureError(true);
        return false;
      }
      return true;
    },
  }));

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>Supporting Documents</h3>
      
      <div className="form-group mb-4">
        <label className="form-label" style={{ marginBottom: '0.5rem' }}>Customer Type</label>
        <div className="radio-group" style={{ display: 'flex', gap: '1.5rem' }}>
          <label className="radio-label" style={{ cursor: 'pointer' }}>
            <input type="radio" name="customerTypeDocs" value="Residential" checked={customerType === 'Residential'} onChange={(e) => setCustomerType(e.target.value)} /> Residential
          </label>
          <label className="radio-label" style={{ cursor: 'pointer' }}>
            <input type="radio" name="customerTypeDocs" value="Foreign" checked={customerType === 'Foreign'} onChange={(e) => setCustomerType(e.target.value)} /> Foreign
          </label>
          <label className="radio-label" style={{ cursor: 'pointer' }}>
            <input type="radio" name="customerTypeDocs" value="Business" checked={customerType === 'Business'} onChange={(e) => setCustomerType(e.target.value)} /> Business
          </label>
        </div>
      </div>

      <div className="form-group flex flex-col-mobile gap-4 mb-4">
        {customerType === 'Residential' && (
          <>
            <div style={{ flex: '1' }}>
              <label className="form-label">NIC Front Copy (PDF/JPG/PNG) <span style={{ color: 'var(--danger, #dc3545)' }}>*</span></label>
              <input type="file" name="nicFront" accept=".pdf,.jpg,.jpeg,.png" className="form-control" required={isActive && customerType === 'Residential'} />
            </div>
            <div style={{ flex: '1' }}>
              <label className="form-label">NIC Back Copy (PDF/JPG/PNG) <span style={{ color: 'var(--danger, #dc3545)' }}>*</span></label>
              <input type="file" name="nicBack" accept=".pdf,.jpg,.jpeg,.png" className="form-control" required={isActive && customerType === 'Residential'} />
            </div>
          </>
        )}

        {customerType === 'Foreign' && (
          <div style={{ flex: '1' }}>
            <label className="form-label">Passport Copy (PDF/JPG/PNG) <span style={{ color: 'var(--danger, #dc3545)' }}>*</span></label>
            <input type="file" name="passportCopy" accept=".pdf,.jpg,.jpeg,.png" className="form-control" required={isActive && customerType === 'Foreign'} />
          </div>
        )}

        {customerType === 'Business' && (
          <div style={{ flex: '1' }}>
            <label className="form-label">Business Registration Certificate (PDF) <span style={{ color: 'var(--danger, #dc3545)' }}>*</span></label>
            <input type="file" name="brcCopy" accept=".pdf" className="form-control" required={isActive && customerType === 'Business'} />
          </div>
        )}
      </div>

      <div className="form-group mb-5">
        <label className="form-label">Payment Receipt (Optional, if dues already settled)</label>
        <input type="file" name="paymentReceipt" accept=".pdf,.jpg,.jpeg,.png" className="form-control" style={{ maxWidth: '400px' }} />
      </div>


      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem', marginTop: '2.5rem' }}>{t('wizards.reconnection.declaration.heading')}</h3>
      
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: '1rem' }}>
          {t('wizards.reconnection.declaration.declarationText')}
        </p>
        <label className="checkbox-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
          <input type="checkbox" className="checkbox-input" required={isActive} /> {t('wizards.reconnection.declaration.agreeLabel')}
        </label>
      </div>

      <div className="mt-5">
        <label className="form-label" style={{ marginBottom: '1rem', display: 'block' }}>Signature Method <span style={{ color: 'var(--danger, #dc3545)' }}>*</span></label>
        <div className="radio-group" style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <label className="radio-label" style={{ cursor: 'pointer' }}>
            <input type="radio" name="signatureMethod" value="draw" checked={signatureMethod === 'draw'} onChange={(e) => { setSignatureMethod('draw'); setSignatureError(false); }} /> Draw Signature
          </label>
          <label className="radio-label" style={{ cursor: 'pointer' }}>
            <input type="radio" name="signatureMethod" value="upload" checked={signatureMethod === 'upload'} onChange={(e) => { setSignatureMethod('upload'); setSignatureError(false); }} /> Upload Signature
          </label>
        </div>

        {signatureMethod === 'draw' ? (
          <div>
            <DigitalSignatureCanvas 
              isActive={isActive} 
              required={true} 
              onChange={(base64) => {
                setSignatureBase64(base64);
                if (base64) setSignatureError(false);
              }} 
            />
            <input type="hidden" name="digitalSignatureBase64" value={signatureBase64} />
          </div>
        ) : (
          <div style={{ maxWidth: '400px' }}>
            <label className="form-label">Upload Signature (PDF/JPG/PNG) <span style={{ color: 'var(--danger, #dc3545)' }}>*</span></label>
            <input type="file" name="signatureUpload" accept=".pdf,.jpg,.jpeg,.png" className="form-control" ref={signatureFileRef} onChange={(e) => { if(e.target.files.length > 0) setSignatureError(false); }} />
          </div>
        )}

        {signatureError && (
          <p style={{ color: 'var(--danger, #dc3545)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            {signatureMethod === 'draw' ? 'Please provide your digital signature to proceed.' : 'Please upload your signature document to proceed.'}
          </p>
        )}
      </div>
    </div>
  );
});

export default DeclarationStep;
