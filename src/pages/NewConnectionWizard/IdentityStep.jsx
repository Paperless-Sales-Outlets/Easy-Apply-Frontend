import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiCheck, FiAlertCircle, FiZap } from 'react-icons/fi';
import IdentityCaptureField from '../../components/form/IdentityCaptureField';
import WizardStepHeader from '../../components/wizard/WizardStepHeader';
import { validateNIC, cleanNIC, deriveGenderAndDOBFromNIC, deriveServiceAreaFromAddress } from '../../utils/nicParser';
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
 * NIC front, NIC back and a selfie — all from the live camera or file upload.
 * The NIC is OCR'd on-device and details (gender derived from 5th/6th/7th digits, DOB,
 * address, service area) automatically land in the form.
 */
const IdentityStep = forwardRef(({ formData, setFields }, ref) => {
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const seq = useRef(0);
  const front = useRef(formData.nicFront);
  const back = useRef(formData.nicBack);

  useImperativeHandle(ref, () => ({
    validate: () => {
      const e = {};
      if (!formData.nicFront) e.nicFront = 'Capture or upload the front of your NIC';
      if (!formData.nicBack) e.nicBack = 'Capture or upload the back of your NIC';
      if (!formData.facePhoto) e.facePhoto = 'Take a live selfie or upload headshot';
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

  const scan = async (overrideFront, overrideBack) => {
    const activeFront = overrideFront || front.current || formData.nicFront;
    const activeBack = overrideBack || back.current || formData.nicBack;

    if (!activeFront && !activeBack) {
      toast.error('Please upload or capture your NIC front or back side first.');
      return;
    }

    const mySeq = ++seq.current;
    setIsScanning(true);
    setStatus({ type: 'loading', message: 'Fetching details from NIC (On-Device OCR)...' });

    try {
      const r = await scanNIC({
        nicFront: activeFront,
        nicBack: activeBack,
        onStatusChange: (st) => {
          if (seq.current !== mySeq) return;
          setStatus({
            type: st.status === 'ERROR' ? 'error' : st.status === 'SUCCESS' ? 'success' : 'loading',
            message: st.message || 'Extracting your details...',
          });
        },
      });

      if (seq.current !== mySeq) return;

      const nicVal = r.nicNumber ? cleanNIC(r.nicNumber) : (formData.nic ? cleanNIC(formData.nic) : '');
      const derived = nicVal ? deriveGenderAndDOBFromNIC(nicVal) : null;
      const addrVal = r.address || formData.nicAddress || '';
      const areaDerived = addrVal ? deriveServiceAreaFromAddress(addrVal) : null;

      const found = {};
      if (r.fullName) found.nameFull = r.fullName;
      if (nicVal) found.nic = nicVal;
      if (derived?.dob || r.dob) found.dob = derived?.dob || r.dob;
      if (derived?.gender || r.gender) {
        found.gender = derived?.gender || r.gender;
        found.title = (derived?.gender || r.gender) === 'Female' ? 'Ms.' : 'Mr.';
      }
      if (addrVal) found.nicAddress = addrVal;
      if (areaDerived?.city) found.city = areaDerived.city;
      if (areaDerived?.district) found.district = areaDerived.district;
      if (areaDerived?.district) found.serviceArea = `${areaDerived.city}, ${areaDerived.district}`;

      // Populate extracted fields
      if (Object.keys(found).length > 0) {
        setFields(found);
        setStatus({
          type: 'success',
          message: `Successfully extracted: ${[found.nic && 'NIC', found.nameFull && 'Name', found.gender && 'Gender', found.dob && 'DOB', found.nicAddress && 'Address'].filter(Boolean).join(', ')}`,
        });
        toast.success('NIC details auto-filled!');
      } else {
        setStatus({
          type: 'error',
          message: r?.message || 'Could not auto-detect text clearly. Please verify or enter details below.',
        });
      }
    } catch (err) {
      if (seq.current !== mySeq) return;
      console.warn('NIC scan failed:', err);
      setStatus({ type: 'error', message: 'Could not read NIC image. Please enter details manually below.' });
    } finally {
      setIsScanning(false);
    }
  };

  const capture = (field, ref_, scanAfter) => (v) => {
    ref_.current = v;
    setFields({ [field]: v });
    setErrors((e) => ({ ...e, [field]: undefined }));
    if (v && scanAfter) {
      if (field === 'nicFront') scan(v, back.current);
      else if (field === 'nicBack') scan(front.current, v);
      else scan();
    }
  };

  const handleFieldChange = (name, val) => {
    const updates = { [name]: val };

    if (name === 'nic') {
      const upperVal = val.toUpperCase();
      updates.nic = upperVal;
      const derived = deriveGenderAndDOBFromNIC(upperVal);
      if (derived) {
        if (derived.gender) updates.gender = derived.gender;
        if (derived.dob) updates.dob = derived.dob;
        updates.title = derived.gender === 'Female' ? 'Ms.' : 'Mr.';
      }
    }

    if (name === 'nicAddress') {
      const areaDerived = deriveServiceAreaFromAddress(val);
      if (areaDerived) {
        updates.city = areaDerived.city;
        updates.district = areaDerived.district;
        updates.serviceArea = `${areaDerived.city}, ${areaDerived.district}`;
        updates.installAddress = updates.installAddress || val;
      }
    }

    setFields(updates);
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const text = (name, label, type = 'text') => (
    <div>
      <label htmlFor={`id-${name}`} style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>{label}</label>
      <input
        id={`id-${name}`}
        type={type}
        style={{ ...inputStyle, borderColor: errors[name] ? '#dc2626' : '#cbd5e1' }}
        value={formData[name] || ''}
        onChange={(e) => handleFieldChange(name, e.target.value)}
      />
      {errors[name] && <span style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors[name]}</span>}
    </div>
  );

  return (
    <div>
      <WizardStepHeader 
        stepNumber={2} 
        totalSteps={6} 
        title="Identity & KYC — NIC, Selfie & OCR" 
        description="Provide your NIC details and complete identity verification." 
      />

      {status && (
        <div className={`nic-scan-banner ${status.type}`} style={{ marginBottom: '1.25rem' }}>
          {status.type === 'loading' && <span className="nic-scan-icon-spin"><FiRefreshCw size={18} /></span>}
          {status.type === 'success' && <FiCheck size={18} />}
          {status.type === 'error' && <FiAlertCircle size={18} />}
          <span>{status.message}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <IdentityCaptureField
          label="NIC — Front Side"
          variant="document"
          required
          value={formData.nicFront}
          error={errors.nicFront}
          onChange={capture('nicFront', front, true)}
          instructions={['Upload a photo (JPG/PNG) or capture front side with camera', 'Ensure NIC number and name are legible']}
        />
        <IdentityCaptureField
          label="NIC — Back Side"
          variant="document"
          required
          value={formData.nicBack}
          error={errors.nicBack}
          onChange={capture('nicBack', back, true)}
          instructions={['Upload a photo or capture reverse side with camera', 'Contains residential address & barcode']}
        />
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <IdentityCaptureField
          label="Live Selfie"
          variant="face"
          required
          value={formData.facePhoto}
          error={errors.facePhoto}
          onChange={capture('facePhoto', { current: null }, false)}
          instructions={['Look straight at the camera or upload a clear headshot photo', 'No sunglasses or face covering']}
        />
      </div>

      {/* Manual Trigger Button for Scanning */}
      {(formData.nicFront || formData.nicBack) && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => scan()}
            disabled={isScanning}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#0f57a8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.65rem 1.25rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: isScanning ? 'wait' : 'pointer',
              boxShadow: '0 4px 12px rgba(15, 87, 168, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <FiZap size={16} /> {isScanning ? 'Extracting Details...' : 'Re-Scan NIC & Auto-Fill Details'}
          </button>
        </div>
      )}

      <div style={{ backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.5rem', marginTop: '1rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
          Details from your NIC
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
          {text('nameFull', 'Full Name')}
          {text('nic', 'NIC Number')}
          {text('dob', 'Date of Birth', 'date')}
          {text('gender', 'Gender')}
        </div>
        <div style={{ marginTop: '1rem' }}>
          {text('nicAddress', 'Address (as on NIC)')}
        </div>
      </div>
    </div>
  );
});

export default IdentityStep;
