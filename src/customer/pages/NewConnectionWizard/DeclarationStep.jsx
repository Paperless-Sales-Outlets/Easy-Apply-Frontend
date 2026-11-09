import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FiFileText, FiEdit3, FiCheckSquare } from 'react-icons/fi';
import DigitalSignatureCanvas from '../../components/form/DigitalSignatureCanvas';
import WizardStepHeader from '../../components/wizard/WizardStepHeader';
import api from '../../../shared/utils/api';

const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  padding: '1.5rem',
  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
};

// The consent wording lives in ConsentHub (CMS) in EN / SI / TA; show the customer's language, English as the fallback.
const consentText = (consent, language) => {
  const texts = consent.texts || {};
  return texts[String(language || 'en').slice(0, 2).toUpperCase()] || texts.EN || Object.values(texts)[0] || {};
};

const metaStyle = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem 2rem', marginTop: '0.85rem' };
const metaLabel = { display: 'block', fontSize: '0.75rem', color: '#64748b' };
const metaValue = { display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' };

const DeclarationStep = forwardRef(({ formData, handleChange, setFields }, ref) => {
  const { t, i18n } = useTranslation();
  const [signatureError, setSignatureError] = useState(false);
  const [consents, setConsents] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // loading | ready | error
  const accepted = Array.isArray(formData.consentsAccepted) ? formData.consentsAccepted : [];
  const signatureVal = formData.signature || '';

  const loadConsents = useCallback(async () => {
    setLoadState('loading');
    try {
      const res = await api.get('/consents/catalog');
      setConsents(res.data?.data || []);
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }, []);
  useEffect(() => { loadConsents(); }, [loadConsents]);

  const requiredCodes = consents.filter((c) => c.isMandatory === 'Y').map((c) => c.consentCode);
  const allRequiredAccepted = loadState === 'ready' && consents.length > 0 && requiredCodes.every((code) => accepted.includes(code));

  // Expose validation to parent wizard
  useImperativeHandle(ref, () => ({
    validate: () => {
      if (loadState !== 'ready' || consents.length === 0) {
        toast.error('Consents could not be loaded. Please retry.');
        return false;
      }
      if (!allRequiredAccepted) {
        toast.error(t('wizards.newConnection.declaration.mustAgree', 'Please accept all the consents to continue.'));
        return false;
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
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>Declaration</h3>
        </div>
        <div style={{ ...cardStyle, fontSize: '0.92rem', lineHeight: 1.6, color: '#334155' }}>
          I, <strong>{applicantName}</strong>, holder of NIC <strong>{formData.nic || '—'}</strong>, confirm that the information and
          documents I have provided in this application are true, accurate and my own. I understand that SLTMOBITEL may reject or
          cancel my application if any information is found to be false.
        </div>
      </div>

      {/* ── Consents (from ConsentHub) ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
          <FiCheckSquare size={20} style={{ color: 'var(--slt-blue)' }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>Consents</h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
          Each consent is a separate checkbox. No checkbox is ticked in advance.
        </p>

        {loadState === 'loading' && <div style={cardStyle}>Loading consents…</div>}
        {loadState === 'error' && (
          <div style={{ ...cardStyle, borderColor: '#ef4444' }}>
            <p style={{ margin: '0 0 0.75rem 0', color: '#b91c1c' }}>Could not load the consents.</p>
            <button type="button" className="btn btn-outline" onClick={loadConsents}>Retry</button>
          </div>
        )}
        {loadState === 'ready' && consents.map((consent) => {
          const { title, statement } = consentText(consent, i18n.language);
          const checked = accepted.includes(consent.consentCode);
          const meta = [['Data', consent.data], ['Action', consent.action], ['Valid for', consent.validFor]]
            .map(([label, value]) => [label, [].concat(value || []).join(', ')]).filter(([, value]) => value);
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
                <strong style={{ display: 'block', fontSize: '1.05rem', color: '#0f172a' }}>
                  {title}{consent.isMandatory === 'Y' && <span style={{ color: '#ef4444' }}> *</span>}
                </strong>
                <span style={{ display: 'block', fontSize: '0.92rem', lineHeight: 1.5, color: '#334155', marginTop: '0.25rem' }}>{statement}</span>
                <span style={metaStyle}>
                  {meta.map(([label, value]) => (
                    <span key={label}><span style={metaLabel}>{label}</span><span style={metaValue}>{value}</span></span>
                  ))}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {/* ── Digital Signature Canvas ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <FiEdit3 size={20} style={{ color: 'var(--slt-blue)' }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
            Signature <span style={{ color: '#ef4444' }}>*</span>
          </h3>
        </div>
        <div style={{ ...cardStyle, border: signatureError ? '2px solid #ef4444' : cardStyle.border }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0, marginBottom: '1rem' }}>
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
