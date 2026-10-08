import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiCheck, FiAlertCircle } from 'react-icons/fi';
import IdentityCaptureField from '../../components/form/IdentityCaptureField';
import WizardStepHeader from '../../components/wizard/WizardStepHeader';
import { validateNIC, cleanNIC, parseSriLankanNIC, parseSriLankanAddress } from '../../utils/nicParser';
import { scanNICTesseract as scanNIC } from '../../services/tesseractNicService';
import api from '../../utils/api';
import { getAuthUser, notifyAuthUpdated } from '../../utils/authSession';

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
 * NIC front, NIC back and a selfie — with live camera capture or file upload.
 * The NIC is OCR'd on-device and the fetched details land in the form, where the
 * customer can review and correct them before continuing.
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
      if (!formData.nicFront) e.nicFront = 'Upload or take a photo of the front of your NIC';
      if (!formData.nicBack) e.nicBack = 'Upload or take a photo of the back of your NIC';
      if (!formData.facePhoto) e.facePhoto = 'Take a live selfie or upload your portrait photo';
      if (!formData.nameFull?.trim()) e.nameFull = 'Full name is required';
      const nicCheck = validateNIC(formData.nic || '');
      if (!nicCheck.valid) e.nic = nicCheck.message || 'Enter a valid NIC number';
      setErrors(e);
      if (Object.keys(e).length) {
        toast.error('Please complete your identity verification.');
        return false;
      }

      // Persist verified identity details directly to backend DB & session
      const phone = formData.mobileNumber || getAuthUser()?.phone || localStorage.getItem('verifiedPhone') || '';
      api.post('/customers/sync-ocr', {
        phone,
        name: formData.nameFull,
        nic: cleanNIC(formData.nic || ''),
        dob: formData.dob,
        gender: formData.gender,
        title: formData.title,
        address: formData.nicAddress || formData.installAddress || formData.address,
        addressLine1: formData.addressLine1 || formData.installAddress || formData.address,
        addressLine2: formData.addressLine2,
        city: formData.city,
        district: formData.district,
        postalCode: formData.postalCode,
        nicFront: formData.nicFront,
        nicBack: formData.nicBack,
        facePhoto: formData.facePhoto,
      }).then((res) => {
        if (res.data?.customer) {
          localStorage.setItem('authCustomer', JSON.stringify(res.data.customer));
          localStorage.setItem('authUser', JSON.stringify(res.data.customer));
          notifyAuthUpdated();
        }
      }).catch((err) => {
        console.warn('Identity verification DB sync notice:', err?.message);
      });

      return true;
    },
  }));

  const scan = async () => {
    if (!front.current) return;
    const mySeq = ++seq.current;
    setStatus({ type: 'loading', message: 'Scanning NIC & fetching your details...' });
    try {
      const r = await scanNIC({
        nicFront: front.current,
        nicBack: back.current,
        onStatusChange: (st) => {
          if (seq.current !== mySeq) return;
          const statusType = st.status === 'ERROR' ? 'error' : st.status === 'SUCCESS' ? 'success' : 'loading';
          setStatus({
            type: statusType,
            message: st.message || 'Scanning NIC & fetching details...',
          });
        },
      });
      if (seq.current !== mySeq) return;
      if (r?.success) {
        // Parse structured address components
        const parsedAddress = parseSriLankanAddress(r.address, r.city, r.district);
        const found = {
          nameFull: r.fullName,
          nic: r.nicNumber && cleanNIC(r.nicNumber),
          dob: r.dob,
          gender: r.gender,
          title: r.suggestedTitle,
          nicAddress: r.address,
          addressLine1: parsedAddress.addressLine1 || r.address || '',
          addressLine2: parsedAddress.addressLine2 || '',
          city: parsedAddress.city || '',
          district: parsedAddress.district || '',
          postalCode: parsedAddress.postalCode || '',
        };
        const validFields = Object.fromEntries(Object.entries(found).filter(([, v]) => v));
        setFields(validFields);

        // Immediately sync extracted OCR details to database and update profile state
        const phone = formData.mobileNumber || getAuthUser()?.phone || localStorage.getItem('verifiedPhone') || '';
        if (phone || validFields.nic) {
          api.post('/customers/sync-ocr', {
            phone,
            name: validFields.nameFull || formData.nameFull,
            nic: validFields.nic || formData.nic,
            dob: validFields.dob || formData.dob,
            gender: validFields.gender || formData.gender,
            title: validFields.title || formData.title,
            address: validFields.nicAddress || formData.nicAddress,
            addressLine1: validFields.addressLine1 || formData.addressLine1,
            addressLine2: validFields.addressLine2 || formData.addressLine2,
            city: validFields.city || formData.city,
            district: validFields.district || formData.district,
            postalCode: validFields.postalCode || formData.postalCode,
            nicFront: front.current || formData.nicFront,
            nicBack: back.current || formData.nicBack,
            facePhoto: formData.facePhoto,
          }).then((res) => {
            if (res.data?.customer) {
              localStorage.setItem('authCustomer', JSON.stringify(res.data.customer));
              localStorage.setItem('authUser', JSON.stringify(res.data.customer));
              notifyAuthUpdated();
            }
          }).catch((err) => {
            console.warn('Silent OCR DB sync notice:', err?.message);
          });
        }

        setStatus({
          type: 'success',
          message: r.warnings?.[0]
            ? `Details fetched. ${r.warnings[0]}`
            : 'Details fetched successfully! Please review them below.',
        });
      } else {
        setStatus({ type: 'error', message: r?.message || 'Could not auto-read your NIC. You can verify or enter the details manually.' });
      }
    } catch (err) {
      if (seq.current !== mySeq) return;
      setStatus({ type: 'error', message: 'Could not auto-read your NIC. You can verify or enter the details manually.' });
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
          const val = name === 'nic' ? e.target.value.toUpperCase() : e.target.value;
          const updates = { [name]: val };
          if (name === 'nic') {
            const parsed = parseSriLankanNIC(cleanNIC(val));
            if (parsed?.isValid) {
              if (parsed.dob && !formData.dob) updates.dob = parsed.dob;
              if (parsed.gender && !formData.gender) updates.gender = parsed.gender === 'FEMALE' ? 'Female' : 'Male';
            }
          }
          setFields(updates);
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
        description="Provide your NIC details and complete identity verification by taking a photo or uploading an image." 
      />

      {status && (
        <div className={`nic-scan-banner ${status.type}`} style={{ marginBottom: '1.25rem' }}>
          {status.type === 'loading' && <span className="nic-scan-icon-spin"><FiRefreshCw size={18} /></span>}
          {status.type === 'success' && <FiCheck size={18} />}
          {status.type === 'error' && <FiAlertCircle size={18} />}
          <span>{status.message}</span>
        </div>
      )}

      <IdentityCaptureField
        label="NIC — Front Side"
        variant="document"
        required
        value={formData.nicFront}
        error={errors.nicFront}
        onChange={capture('nicFront', front, true)}
        instructions={['Place the front of your NIC on a flat, dark surface or upload a clear photo', 'Keep all four corners inside the frame', 'Avoid glare so the number is readable']}
      />
      <IdentityCaptureField
        label="NIC — Back Side"
        variant="document"
        required
        value={formData.nicBack}
        error={errors.nicBack}
        onChange={capture('nicBack', back, true)}
        instructions={['Turn the card over and capture or upload the reverse side', 'Keep the whole card inside the frame']}
      />
      <IdentityCaptureField
        label="Live Selfie"
        variant="face"
        required
        value={formData.facePhoto}
        error={errors.facePhoto}
        onChange={capture('facePhoto', { current: null }, false)}
        instructions={['Look straight at the camera or upload a clear portrait photo', 'Centre your face in the oval', 'No hat, sunglasses or face covering']}
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
