import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FiFileText, FiEdit3, FiCheckSquare } from 'react-icons/fi';
import DigitalSignatureCanvas from '../../components/form/DigitalSignatureCanvas';
import WizardStepHeader from '../../components/wizard/WizardStepHeader';
import api from '../../../shared/utils/api';

const cardStyle = {
  backgroundColor: 'var(--paper)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--grey-200)',
  padding: '1.5rem',
  boxShadow: 'var(--shadow-md)',
};

// The consent wording lives in ConsentHub (CMS) in EN / SI / TA; show the customer's language, English as the fallback.
const consentText = (consent, language) => {
  const texts = consent.texts || {};
  return texts[String(language || 'en').slice(0, 2).toUpperCase()] || texts.EN || Object.values(texts)[0] || {};
};


const DeclarationStep = forwardRef(({ formData, handleChange, setFields }, ref) => {
  const { t, i18n } = useTranslation();
  const [signatureError, setSignatureError] = useState(false);
  const [consents, setConsents] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // loading | ready | fallback
  const accepted = Array.isArray(formData.consentsAccepted) ? formData.consentsAccepted : [];
  const signatureVal = formData.signature || '';

  const loadConsents = useCallback(async () => {
    setLoadState('loading');
    try {
      const res = await api.get('/consents/catalog');
      const list = res.data?.data;
      if (Array.isArray(list) && list.length > 0) {
        setConsents(list);
        setLoadState('ready');
      } else {
        setLoadState('fallback');
      }
    } catch {
      // ConsentHub unreachable or offline -> smoothly fall back to standard Terms & Conditions
      setLoadState('fallback');
    }
  }, []);
  useEffect(() => { loadConsents(); }, [loadConsents]);

  const requiredCodes = consents.filter((c) => c.isMandatory === 'Y').map((c) => c.consentCode);
  const allRequiredAccepted = loadState === 'ready' && consents.length > 0 && requiredCodes.every((code) => accepted.includes(code));

  // Expose validation to parent wizard
  useImperativeHandle(ref, () => ({
    validate: () => {
      if (loadState === 'fallback') {
        if (!formData.declarationAccepted) {
          toast.error(t('wizards.newConnection.declaration.mustAgreeFallback', 'Please accept the Terms & Conditions and Service Declaration to continue.'));
          return false;
        }
      } else if (loadState === 'ready' && consents.length > 0) {
        if (!allRequiredAccepted) {
          toast.error(t('wizards.newConnection.declaration.mustAgree', 'Please accept all the consents to continue.'));
          return false;
        }
      } else if (loadState === 'loading') {
        toast.error('Loading consents, please wait...');
        return false;
      } else {
        if (!formData.declarationAccepted) {
          toast.error(t('wizards.newConnection.declaration.mustAgreeFallback', 'Please accept the Terms & Conditions and Service Declaration to continue.'));
          return false;
        }
      }
      if (!signatureVal || signatureVal.trim() === '') {
        setSignatureError(true);
        toast.error(t('wizards.newConnection.declaration.mustSign', 'Please sign in the signature box to continue.'));
        return false;
      }
      setSignatureError(false);
      return true;
    },
  }));

  const handleFallbackCheckbox = (checked) => {
    if (setFields) {
      setFields({
        declarationAccepted: checked,
        consentsAccepted: checked ? ['TERMS_AND_CONDITIONS_FALLBACK'] : [],
      });
    } else if (handleChange) {
      handleChange({ target: { name: 'declarationAccepted', type: 'checkbox', checked } });
      handleChange({ target: { name: 'consentsAccepted', value: checked ? ['TERMS_AND_CONDITIONS_FALLBACK'] : [] } });
    }
  };

  const toggleConsent = (code, checked) => {
    const next = checked ? [...new Set([...accepted, code])] : accepted.filter((c) => c !== code);
    const nextAll = requiredCodes.length > 0 && requiredCodes.every((c) => next.includes(c));
    if (setFields) {
      // declarationAccepted stays the flag the rest of the wizard and the backend already use
      setFields({ consentsAccepted: next, declarationAccepted: nextAll });
    } else if (handleChange) {
      handleChange({ target: { name: 'consentsAccepted', value: next } });
      handleChange({ target: { name: 'declarationAccepted', type: 'checkbox', checked: nextAll } });
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

  const applicantName = formData.nameFull || `${formData.title || ''} Applicant`;
  const installAddress = formData.installAddress || formData.address || 'Colombo';

  return (
    <div className="new-connection-declaration-step" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <WizardStepHeader
        stepNumber={4}
        totalSteps={7}
        title="Digital Signature and Consent"
        description={`Please read the declaration and each consent below, then sign to continue. Your application is for ${formData.product?.name || 'the selected package'} at ${installAddress}.`}
      />

      {/* ── Declaration ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <FiFileText size={20} style={{ color: 'var(--slt-blue)' }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#131f33', fontWeight: 700 }}>Declaration</h3>
        </div>
        <div style={{ ...cardStyle, fontSize: '0.92rem', lineHeight: 1.6, color: '#26344b' }}>
          I, <strong>{applicantName}</strong>, holder of NIC <strong>{formData.nic || '—'}</strong>, confirm that the information and
          documents I have provided in this application are true, accurate and my own. I understand that SLTMOBITEL may reject or
          cancel my application if any information is found to be false.
        </div>
      </div>

      {/* ── Consents (from ConsentHub or Fallback) ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
          <FiCheckSquare size={20} style={{ color: 'var(--slt-blue)' }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#131f33', fontWeight: 700 }}>
            {loadState === 'fallback' ? 'Terms & Conditions' : 'Consents'}
          </h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#52627a', margin: '0 0 0.75rem 0' }}>
          {loadState === 'fallback'
            ? 'Please review and accept the standard terms and conditions to proceed with your application.'
            : 'Each consent is a separate checkbox. No checkbox is ticked in advance.'}
        </p>

        {loadState === 'loading' && <div style={cardStyle}>Loading consents…</div>}

        {loadState === 'fallback' && (
          <label
            style={{
              ...cardStyle,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
              cursor: 'pointer',
              userSelect: 'none',
              border: formData.declarationAccepted
                ? '1.5px solid var(--slt-blue, #0056b3)'
                : '1px solid var(--grey-300, #cbd5e1)',
              backgroundColor: formData.declarationAccepted ? 'var(--blue-50, #eff6ff)' : 'var(--paper)',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              type="checkbox"
              checked={Boolean(formData.declarationAccepted)}
              onChange={(e) => handleFallbackCheckbox(e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                marginTop: '3px',
                cursor: 'pointer',
                accentColor: 'var(--slt-blue)',
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1 }}>
              <strong style={{ display: 'block', fontSize: '1.02rem', color: '#131f33' }}>
                I accept the Terms & Conditions and Service Declaration{' '}
                <span style={{ color: '#d92d20' }}>*</span>
              </strong>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  lineHeight: 1.55,
                  color: '#475569',
                  marginTop: '0.35rem',
                }}
              >
                I confirm that I have read, understood, and agree to abide by the standard Terms & Conditions, service agreements, and privacy policies of Sri Lanka Telecom PLC (SLTMOBITEL) for this connection.
              </span>
            </span>
          </label>
        )}

        {loadState === 'ready' && consents.map((consent) => {
          const { title, statement } = consentText(consent, i18n.language);
          const checked = accepted.includes(consent.consentCode);
          return (
            <label
              key={consent.consentCode}
              style={{ ...cardStyle, display: 'flex', alignItems: 'flex-start', gap: '0.85rem', cursor: 'pointer', userSelect: 'none', marginBottom: '1rem' }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => toggleConsent(consent.consentCode, e.target.checked)}
                style={{ width: '20px', height: '20px', marginTop: '3px', cursor: 'pointer', accentColor: 'var(--slt-blue)', flexShrink: 0 }}
              />
              <span style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '1.05rem', color: '#131f33' }}>
                  {title}{consent.isMandatory === 'Y' && <span style={{ color: '#d92d20' }}> *</span>}
                </strong>
                <span style={{ display: 'block', fontSize: '0.92rem', lineHeight: 1.5, color: '#26344b', marginTop: '0.25rem' }}>{statement}</span>
              </span>
            </label>
          );
        })}
      </div>

      {/* ── Digital Signature Canvas ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <FiEdit3 size={20} style={{ color: 'var(--slt-blue)' }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#131f33', fontWeight: 700 }}>
            Signature <span style={{ color: '#d92d20' }}>*</span>
          </h3>
        </div>
        <div style={{ ...cardStyle, border: signatureError ? '2px solid #d92d20' : cardStyle.border }}>
          <p style={{ fontSize: '0.85rem', color: '#52627a', marginTop: 0, marginBottom: '1rem' }}>
            Sign in the box below. Your signature will be added to your application form, which will be digitally signed and kept as
            your official application record.
          </p>
          <DigitalSignatureCanvas
            label="Draw your signature here"
            required
            value={signatureVal}
            onChange={handleSignatureChange}
            error={signatureError ? 'Please sign in the signature box to continue.' : ''}
          />
        </div>
      </div>
    </div>
  );
});

export default DeclarationStep;
