import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiCheck, FiAlertCircle } from 'react-icons/fi';
import IdentityCaptureField from '../../components/form/IdentityCaptureField';
import WizardStepHeader from '../../components/wizard/WizardStepHeader';
import { validateNIC, cleanNIC } from '../../utils/nicParser';
import { scanNICTesseract as scanNIC } from '../../services/tesseractNicService';

const inputStyle = {
  width: '100%',
  padding: '0.75rem 0.9rem',
  fontSize: '0.92rem',
  borderRadius: '10px',
  border: '1.5px solid #cbd5e1',
  backgroundColor: '#fff',
  color: '#0f172a',
};

/**
 * NIC front, NIC back and a selfie — all from the live camera (no uploads).
 * The NIC is OCR'd on-device and the fetched details land in the form, where the
 * customer can correct them before they appear on the review page.
 */
const IdentityStep = forwardRef(({ formData, setFields }, ref) => {
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const seq = useRef(0);
  const front = useRef(formData.nicFront);
  const back = useRef(formData.nicBack);

  useImperativeHandle(ref, () => ({
    validate: () => {
      const e = {};
      if (!formData.nicFront) e.nicFront = 'Capture the front of your NIC';
      if (!formData.nicBack) e.nicBack = 'Capture the back of your NIC';
      if (!formData.facePhoto) e.facePhoto = 'Take a live selfie';
      if (!formData.nameFull?.trim()) e.nameFull = 'Full name is required';
      const nicCheck = validateNIC(formData.nic || '');
      if (!nicCheck.valid) e.nic = nicCheck.message || 'Enter a valid NIC number';
      setErrors(e);
      if (Object.keys(e).length) {
        toast.error('Please complete your identity verification.');
        return false;
      }
      return true;
    },
  }));

  const scan = async () => {
    if (!front.current) return;
    const mySeq = ++seq.current;
    setStatus({ type: 'loading', message: 'Fetching your details...' });
    try {
      const r = await scanNIC({
        nicFront: front.current,
        nicBack: back.current,
        onStatusChange: (st) => {
          if (seq.current !== mySeq) return;
          setStatus({
            type: st.status === 'ERROR' ? 'error' : st.status === 'SUCCESS' ? 'success' : 'loading',
            message: st.message || 'Fetching your details...',
          });
        },
      });
      if (seq.current !== mySeq) return;
      if (r?.success) {
        // Only overwrite what OCR actually found.
        const found = {
          nameFull: r.fullName,
          nic: r.nicNumber && cleanNIC(r.nicNumber),
          dob: r.dob,
          gender: r.gender,
          title: r.suggestedTitle,
          nicAddress: r.address,
        };
        setFields(Object.fromEntries(Object.entries(found).filter(([, v]) => v)));
        setStatus({ type: 'success', message: r.warnings?.[0] ? `Details fetched. ${r.warnings[0]}` : 'Details fetched. Please check them below.' });
      } else {
        setStatus({ type: 'error', message: r?.message || 'Could not read your NIC. Enter the details manually.' });
      }
    } catch (err) {
      if (seq.current !== mySeq) return;
      setStatus({ type: 'error', message: 'Could not read your NIC. Enter the details manually.' });
    }
  };

  const capture = (field, ref_, scanAfter) => (v) => {
    ref_.current = v;
    setFields({ [field]: v });
    setErrors((e) => ({ ...e, [field]: undefined }));
    if (v && scanAfter) scan();
  };

  const text = (name, label, type = 'text') => (
    <div>
      <label htmlFor={`id-${name}`} style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>{label}</label>
      <input
        id={`id-${name}`}
        type={type}
        style={{ ...inputStyle, borderColor: errors[name] ? '#dc2626' : '#cbd5e1' }}
        value={formData[name] || ''}
        onChange={(e) => {
          setFields({ [name]: name === 'nic' ? e.target.value.toUpperCase() : e.target.value });
          setErrors((er) => ({ ...er, [name]: undefined }));
        }}
      />
      {errors[name] && <span style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors[name]}</span>}
    </div>
  );

  return (
    <div>
      <WizardStepHeader 
        stepNumber={5} 
        totalSteps={9} 
        title="Identity & KYC — NIC, Selfie & OCR" 
        description="Provide your NIC details and complete identity verification." 
      />

      {status && (
        <div className={`nic-scan-banner ${status.type}`}>
          {status.type === 'loading' && <span className="nic-scan-icon-spin"><FiRefreshCw size={18} /></span>}
          {status.type === 'success' && <FiCheck size={18} />}
          {status.type === 'error' && <FiAlertCircle size={18} />}
          <span>{status.message}</span>
        </div>
      )}

      <IdentityCaptureField
        label="NIC — Front Side"
        variant="document"
        cameraOnly
        required
        value={formData.nicFront}
        error={errors.nicFront}
        onChange={capture('nicFront', front, true)}
        instructions={['Place the front of your NIC on a flat, dark surface', 'Keep all four corners inside the frame', 'Avoid glare so the number is readable']}
      />
      <IdentityCaptureField
        label="NIC — Back Side"
        variant="document"
        cameraOnly
        required
        value={formData.nicBack}
        error={errors.nicBack}
        onChange={capture('nicBack', back, true)}
        instructions={['Turn the card over and capture the reverse side', 'Keep the whole card inside the frame']}
      />
      <IdentityCaptureField
        label="Live Selfie"
        variant="face"
        cameraOnly
        required
        value={formData.facePhoto}
        error={errors.facePhoto}
        onChange={capture('facePhoto', { current: null }, false)}
        instructions={['Look straight at the camera in even lighting', 'Centre your face in the oval', 'No hat, sunglasses or face covering']}
      />

      <h4 style={{ margin: '1.5rem 0 0.75rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Details from your NIC</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
        {text('nameFull', 'Full Name')}
        {text('nic', 'NIC Number')}
        {text('dob', 'Date of Birth', 'date')}
        {text('gender', 'Gender')}
      </div>
      <div style={{ marginTop: '1rem' }}>{text('nicAddress', 'Address (as on NIC)')}</div>
    </div>
  );
});

export default IdentityStep;
