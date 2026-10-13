import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FiFileText, FiEdit3 } from 'react-icons/fi';
import DigitalSignatureCanvas from '../../components/form/DigitalSignatureCanvas';
import WizardStepHeader from '../../components/wizard/WizardStepHeader';

const DeclarationStep = forwardRef(({ formData, handleChange, setFields }, ref) => {
  const { t } = useTranslation();
  const [signatureError, setSignatureError] = useState(false);

  const isAgreed = Boolean(formData.declarationAccepted);
  const signatureVal = formData.signature || '';

  // Expose validation to parent wizard
  useImperativeHandle(ref, () => ({
    validate: () => {
      if (!isAgreed) {
        toast.error(t('wizards.newConnection.declaration.mustAgree', 'Please accept the Terms & Conditions and Customer Declaration to proceed.'));
        return false;
      }
      if (!signatureVal || signatureVal.trim() === '') {
        setSignatureError(true);
        toast.error(t('wizards.newConnection.declaration.mustSign', 'Please provide your digital signature before continuing.'));
        return false;
      }
      setSignatureError(false);
      return true;
    },
  }));

  const handleAgreeToggle = (e) => {
    const checked = e.target.checked;
    if (setFields) {
      setFields({ declarationAccepted: checked });
    } else if (handleChange) {
      handleChange({ target: { name: 'declarationAccepted', type: 'checkbox', checked } });
    }
  };

  const handleSignatureChange = (sigDataUrl) => {
    setSignatureError(false);
    if (setFields) {
      setFields({ signature: sigDataUrl });
    } else if (handleChange) {
      handleChange({ target: { name: 'signature', value: sigDataUrl } });
    }
  };

  const overview = [
    ['Applicant Name', formData.nameFull || `${formData.title || ''} Applicant`],
    ['NIC / Identification', formData.nic || 'Verified'],
    ['Contact Mobile', `+94 ${formData.mobileNumber || 'Verified'}`],
    ['Installation Address', formData.installAddress || formData.address || 'Colombo'],
  ];

  return (
    <div className="wz-step wz-step--narrow">
      <WizardStepHeader
        stepNumber={4}
        totalSteps={7}
        title="Digital Signature & Declaration"
        description="Review your application details, accept the terms and conditions, and sign digitally."
      />

      <dl className="wz-facts">
        {overview.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <section className="wz-block" aria-labelledby="decl-h">
        <h3 id="decl-h" className="wz-block__title">
          <FiFileText size={20} aria-hidden="true" />
          Customer Agreement &amp; Declaration
        </h3>

        <div className="wz-terms" tabIndex={0} role="region" aria-label="Declaration text">
          <p><strong>Declaration by Applicant:</strong></p>
          <p>1. I hereby confirm that all particulars furnished by me in this application are true and correct to the best of my knowledge.</p>
          <p>2. I agree to abide by the standard Terms and Conditions governing the provision of telecommunication services by Sri Lanka Telecom PLC (SLTMobitel).</p>
          <p>3. I acknowledge that the connection is subject to technical feasibility and network loop availability at the specified installation address.</p>
          <p>4. I authorize SLTMobitel to verify the information provided against the official records and credit databases.</p>
        </div>

        <label className={`wz-consent${isAgreed ? ' is-on' : ''}`}>
          <input type="checkbox" name="declarationAccepted" checked={isAgreed} onChange={handleAgreeToggle} />
          <span>
            I have read, understood, and accept the Customer Declaration and SLTMobitel Terms &amp; Conditions.{' '}
            <span className="req" aria-hidden="true">*</span>
          </span>
        </label>
      </section>

      <section className={`wz-block${signatureError ? ' has-error' : ''}`} aria-labelledby="sig-h">
        <h3 id="sig-h" className="wz-block__title">
          <FiEdit3 size={20} aria-hidden="true" />
          Digital Signature <span className="req" aria-hidden="true">*</span>
        </h3>
        <p className="wz-block__hint">
          Draw your signature in the box below with your mouse, trackpad, or finger on a touch screen.
        </p>
        <DigitalSignatureCanvas
          label="Applicant Digital Signature"
          required
          value={signatureVal}
          onChange={handleSignatureChange}
          error={signatureError ? 'Signature is required' : ''}
        />
      </section>
    </div>
  );
});

export default DeclarationStep;
