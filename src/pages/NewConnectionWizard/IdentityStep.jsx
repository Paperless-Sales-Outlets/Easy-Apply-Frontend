import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  FiRefreshCw, 
  FiCheck, 
  FiAlertCircle, 
  FiShield, 
  FiCheckCircle, 
  FiUserPlus, 
  FiInfo,
  FiSearch
} from 'react-icons/fi';
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
 * Identity & KYC Step:
 * 1. Prompt customer to enter NIC and click Verify.
 * 2. If existing customer found in DB:
 *    - Automatically waive NIC Front & NIC Back uploads (hides them).
 *    - Only Live Selfie is mandatory.
 *    - Auto-fills registered customer details from SLT database.
 * 3. If new customer (not found in DB):
 *    - Keeps all upload fields (NIC Front, NIC Back, Live Selfie) visible and mandatory.
 *    - OCR auto-scans NIC Front/Back to extract and verify details.
 */
const IdentityStep = forwardRef(({ formData, setFields }, ref) => {
  const sanitize = (val) => (!val || typeof val !== 'string' || val.startsWith('NIC-') ? '' : val);

  const [nicInput, setNicInput] = useState(() => sanitize(formData.nic));
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [nicVerified, setNicVerified] = useState(false);
  const [isVerifyingNic, setIsVerifyingNic] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState(null);

  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const seq = useRef(0);
  const front = useRef(formData.nicFront);
  const back = useRef(formData.nicBack);

  // Sync internal state if parent formData.nic is passed initially
  useEffect(() => {
    const cleanInitial = sanitize(formData.nic);
    if (cleanInitial && !nicInput) {
      setNicInput(cleanInitial);
    }
  }, [formData.nic, nicInput]);

  const handleVerifyNic = async (manualNic) => {
    const rawNic = manualNic !== undefined ? manualNic : (nicInput || formData.nic || '');
    const clean = cleanNIC(sanitize(rawNic));

    if (!clean) {
      setErrors((prev) => ({ ...prev, nicInput: 'Please enter your NIC number' }));
      return;
    }

    const check = validateNIC(clean);
    if (!check.valid) {
      setErrors((prev) => ({ ...prev, nicInput: check.message || 'Invalid NIC format. Use 9 digits + V/X or 12 digits.' }));
      return;
    }

    setErrors((prev) => ({ ...prev, nicInput: undefined, nic: undefined }));
    setIsVerifyingNic(true);
    setVerifyMessage(null);

    try {
      const res = await api.get('/customers/profile', { params: { nic: clean } });
      const cust = res.data?.customer;
      const custNic = cust?.NIC || cust?.nic || '';
      const isGenuine = cust && !custNic.startsWith('NIC-') && (cust.name !== 'Customer' || cust.addressLine1 || cust.phone);

      if (res.data?.success && cust && isGenuine) {
        setIsExistingCustomer(true);
        setNicVerified(true);

        const updates = {
          nic: clean,
          nameFull: cust.name || cust.fullName || cust.nameFull || formData.nameFull || '',
          dob: cust.dob || formData.dob || '',
          gender: cust.gender || formData.gender || '',
          title: cust.title || formData.title || '',
          nicAddress: cust.address || cust.addressLine1 || formData.nicAddress || '',
          addressLine1: cust.addressLine1 || cust.address || formData.addressLine1 || '',
          addressLine2: cust.addressLine2 || formData.addressLine2 || '',
          city: cust.city || formData.city || '',
          district: cust.district || formData.district || '',
          postalCode: cust.postalCode || formData.postalCode || '',
          isExistingCustomer: true,
          nicVerified: true,
        };

        // If DOB/Gender missing in DB record, parse from NIC mathematically
        const parsed = parseSriLankanNIC(clean);
        if (parsed?.isValid) {
          if (!updates.dob && parsed.dob) updates.dob = parsed.dob;
          if (!updates.gender && parsed.gender) updates.gender = parsed.gender === 'FEMALE' ? 'Female' : 'Male';
        }

        setFields(updates);
        setErrors((prev) => ({ ...prev, nicFront: undefined, nicBack: undefined, nic: undefined }));
        setVerifyMessage({
          type: 'existing',
          title: 'Existing SLT Customer Verified',
          description: 'Your customer records were found in the SLT database. Physical NIC Front & Back document uploads have been waived. Please take or upload a Live Selfie to complete verification.',
        });
        toast.success('Existing customer record verified!');

        // Update auth session
        try {
          localStorage.setItem('authCustomer', JSON.stringify(cust));
          localStorage.setItem('authUser', JSON.stringify(cust));
          notifyAuthUpdated();
        } catch (sessionErr) {
          console.warn('Session update warning:', sessionErr);
        }
      } else {
        handleNewCustomerRecord(clean);
      }
    } catch (err) {
      if (err.response?.status === 404 || !err.response) {
        handleNewCustomerRecord(clean);
      } else {
        console.warn('NIC profile lookup notice:', err.message);
        handleNewCustomerRecord(clean);
      }
    } finally {
      setIsVerifyingNic(false);
    }
  };

  const handleNewCustomerRecord = (clean) => {
    setIsExistingCustomer(false);
    setNicVerified(true);

    const updates = {
      nic: clean,
      isExistingCustomer: false,
      nicVerified: true,
    };

    const parsed = parseSriLankanNIC(clean);
    if (parsed?.isValid) {
      if (!formData.dob && parsed.dob) updates.dob = parsed.dob;
      if (!formData.gender && parsed.gender) updates.gender = parsed.gender === 'FEMALE' ? 'Female' : 'Male';
    }

    setFields(updates);
    setVerifyMessage({
      type: 'new',
      title: 'New Customer Application',
      description: 'No prior SLT connection was found for this NIC. All fields are mandatory: please upload your NIC Front, NIC Back, and Live Selfie.',
    });
    toast.success('NIC format validated. Please upload the required documents.');
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      const e = {};
      const activeNic = cleanNIC(formData.nic || nicInput || '');
      const nicCheck = validateNIC(activeNic);

      if (!nicCheck.valid) {
        e.nic = nicCheck.message || 'Enter a valid NIC number';
      }

      if (!formData.nameFull?.trim()) {
        e.nameFull = 'Full name is required';
      }

      if (!formData.facePhoto) {
        e.facePhoto = 'Take a live selfie or upload your portrait photo';
      }

      // If NOT an existing customer, NIC Front and Back are mandatory
      if (!isExistingCustomer) {
        if (!formData.nicFront) e.nicFront = 'Upload or take a photo of the front of your NIC';
        if (!formData.nicBack) e.nicBack = 'Upload or take a photo of the back of your NIC';
      }

      setErrors(e);
      if (Object.keys(e).length) {
        toast.error('Please complete all mandatory identity requirements.');
        return false;
      }

      // Persist verified identity details directly to backend DB & session
      const phone = formData.mobileNumber || getAuthUser()?.phone || localStorage.getItem('verifiedPhone') || '';
      api.post('/customers/sync-ocr', {
        phone,
        name: formData.nameFull,
        nic: activeNic,
        dob: formData.dob,
        gender: formData.gender,
        title: formData.title,
        address: formData.nicAddress || formData.installAddress || formData.address,
        addressLine1: formData.addressLine1 || formData.installAddress || formData.address,
        addressLine2: formData.addressLine2,
        city: formData.city,
        district: formData.district,
        postalCode: formData.postalCode,
        nicFront: formData.nicFront || '',
        nicBack: formData.nicBack || '',
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
    setStatus({ type: 'loading', message: 'Scanning NIC & extracting details...' });
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
        const parsedAddress = parseSriLankanAddress(r.address, r.city, r.district);
        const extractedNic = r.nicNumber ? cleanNIC(r.nicNumber) : '';
        const found = {
          nameFull: r.fullName,
          nic: extractedNic || formData.nic,
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
        if (extractedNic) {
          setNicInput(extractedNic);
        }

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
            ? `Details extracted. ${r.warnings[0]}`
            : 'Details extracted successfully! Please review them below.',
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
      <label htmlFor={`id-${name}`} style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
        {label}
      </label>
      <input
        id={`id-${name}`}
        type={type}
        style={{ ...inputStyle, borderColor: errors[name] ? '#dc2626' : '#cbd5e1' }}
        value={formData[name] || ''}
        onChange={(e) => {
          const val = name === 'nic' ? e.target.value.toUpperCase() : e.target.value;
          const updates = { [name]: val };
          if (name === 'nic') {
            setNicInput(val);
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
        stepNumber={3} 
        totalSteps={7} 
        title="Identity & KYC — NIC & Photo Verification" 
        description="Verify your National Identity Card number to check your status with SLT and complete identity verification." 
      />

      {/* ── Top NIC Verification Gateway ─────────────────────────── */}
      <div 
        style={{
          background: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '14px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <div 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0056b3',
            }}
          >
            <FiShield size={18} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
              NIC Verification & Customer Check
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
              Enter your NIC to verify your customer status. Existing customers skip NIC document uploads!
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px' }}>
            <input
              id="nic-lookup-input"
              type="text"
              placeholder="e.g. 199012345678 or 901234567V"
              value={nicInput}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setNicInput(val);
                setFields({ nic: val });
                setErrors((prev) => ({ ...prev, nicInput: undefined, nic: undefined }));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleVerifyNic();
                }
              }}
              style={{
                ...inputStyle,
                borderColor: errors.nicInput ? '#dc2626' : '#cbd5e1',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            />
            {errors.nicInput && (
              <span style={{ color: '#dc2626', fontSize: '0.78rem', display: 'block', marginTop: '0.25rem' }}>
                {errors.nicInput}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleVerifyNic()}
            disabled={isVerifyingNic}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0 1.4rem',
              minHeight: '45px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: isExistingCustomer ? '#059669' : '#0056b3',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: isVerifyingNic ? 'wait' : 'pointer',
              transition: 'background-color 0.2s ease',
              boxShadow: '0 2px 6px rgba(0, 86, 179, 0.2)',
            }}
          >
            {isVerifyingNic ? (
              <>
                <FiRefreshCw size={16} className="animate-spin" />
                <span>Verifying...</span>
              </>
            ) : isExistingCustomer ? (
              <>
                <FiCheck size={16} />
                <span>Verified Existing</span>
              </>
            ) : nicVerified ? (
              <>
                <FiSearch size={16} />
                <span>Re-verify NIC</span>
              </>
            ) : (
              <>
                <FiSearch size={16} />
                <span>Verify Status</span>
              </>
            )}
          </button>
        </div>

        {/* ── Verification Result Status Banner ──────────────────── */}
        {verifyMessage && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              border: `1px solid ${verifyMessage.type === 'existing' ? '#bbf7d0' : '#bfdbfe'}`,
              backgroundColor: verifyMessage.type === 'existing' ? '#f0fdf4' : '#eff6ff',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <div style={{ marginTop: '0.1rem', flexShrink: 0 }}>
              {verifyMessage.type === 'existing' ? (
                <FiCheckCircle size={20} color="#16a34a" />
              ) : (
                <FiUserPlus size={20} color="#2563eb" />
              )}
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: verifyMessage.type === 'existing' ? '#166534' : '#1e40af',
                  marginBottom: '0.2rem',
                }}
              >
                {verifyMessage.title}
              </div>
              <div
                style={{
                  fontSize: '0.82rem',
                  lineHeight: '1.4',
                  color: verifyMessage.type === 'existing' ? '#15803d' : '#1d4ed8',
                }}
              >
                {verifyMessage.description}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── OCR Scanner Status (For New Customer NIC Uploads) ────── */}
      {status && (
        <div className={`nic-scan-banner ${status.type}`} style={{ marginBottom: '1.25rem' }}>
          {status.type === 'loading' && <span className="nic-scan-icon-spin"><FiRefreshCw size={18} /></span>}
          {status.type === 'success' && <FiCheck size={18} />}
          {status.type === 'error' && <FiAlertCircle size={18} />}
          <span>{status.message}</span>
        </div>
      )}

      {/* ── Conditional Document Upload Section ──────────────────── */}
      {isExistingCustomer ? (
        /* If Existing Customer: Hide NIC uploads and display waived notice */
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#f8fafc',
            border: '1.5px dashed #cbd5e1',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <FiCheckCircle size={22} color="#059669" />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
              NIC Documents Waived
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Your National Identity Card is already registered with SLT. Only a Live Selfie is required.
            </div>
          </div>
        </div>
      ) : (
        /* If New Customer / Unverified: Keep NIC Front and Back upload fields visible & mandatory */
        <>
          <IdentityCaptureField
            label="NIC — Front Side"
            variant="document"
            required
            value={formData.nicFront}
            error={errors.nicFront}
            onChange={capture('nicFront', front, true)}
            instructions={[
              'Place the front of your NIC on a flat, dark surface or upload a clear photo',
              'Keep all four corners inside the frame',
              'Avoid glare so the number is readable',
            ]}
          />
          <IdentityCaptureField
            label="NIC — Back Side"
            variant="document"
            required
            value={formData.nicBack}
            error={errors.nicBack}
            onChange={capture('nicBack', back, true)}
            instructions={[
              'Turn the card over and capture or upload the reverse side',
              'Keep the whole card inside the frame',
            ]}
          />
        </>
      )}

      {/* Live Selfie is MANDATORY for both existing and new customers */}
      <IdentityCaptureField
        label="Live Selfie"
        variant="face"
        required
        value={formData.facePhoto}
        error={errors.facePhoto}
        onChange={capture('facePhoto', { current: null }, false)}
        instructions={[
          'Look straight at the camera or upload a clear portrait photo',
          'Centre your face in the oval',
          'No hat, sunglasses or face covering',
        ]}
      />

      {/* ── Details from your NIC ───────────────────────────────── */}
      <h4 style={{ margin: '1.5rem 0 0.75rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
        Details from your NIC
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
        {text('nameFull', 'Full Name')}
        {text('nic', 'NIC Number')}
        {text('dob', 'Date of Birth', 'date')}
        {text('gender', 'Gender')}
      </div>
      <div style={{ marginTop: '1rem' }}>
        {text('nicAddress', 'Address (as on NIC)')}
      </div>
    </div>
  );
});

export default IdentityStep;
