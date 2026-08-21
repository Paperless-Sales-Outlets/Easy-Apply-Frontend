import React, { forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUploadCloud, FiFile } from 'react-icons/fi';
import { useVerifiedMobile, useVerifiedContext } from '../../components/verification';
import Field from '../../components/form/Field';
import Textarea from '../../components/form/Textarea';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../components/Icon';

const cardStyle = { padding: '2rem', border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(31, 38, 135, 0.05)', marginBottom: '1.5rem', borderRadius: '16px' };
const cardHeadingStyle = { color: 'var(--slt-blue)', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '600' };

const RichCard = ({ id, icon, label, checked, onChange, type = 'radio', name }) => (
  <motion.label 
    whileHover={{ scale: 1.02, y: -2, borderColor: 'rgba(15, 87, 168, 0.5)', boxShadow: '0 8px 24px rgba(15, 87, 168, 0.12)' }}
    whileTap={{ scale: 0.98 }}
    style={{ 
      display: 'flex', alignItems: 'center', gap: '1rem', 
      padding: '1rem 1.25rem', borderRadius: '12px', 
      border: checked ? '2px solid var(--slt-blue)' : '1px solid rgba(255,255,255,0.8)',
      background: checked ? 'rgba(15, 87, 168, 0.05)' : 'rgba(255, 255, 255, 0.8)',
      boxShadow: checked ? '0 4px 16px rgba(15, 87, 168, 0.15)' : '0 2px 10px rgba(31, 38, 135, 0.02)',
      cursor: 'pointer', 
      transition: 'all 0.2s ease',
      flex: '1 1 200px'
    }}
  >
    <input type={type} name={name} value={id} style={{ display: 'none' }} checked={checked} onChange={() => onChange(id)} />
    
    {icon && (
      <div style={{ 
        width: '40px', height: '40px', borderRadius: '10px', display: 'grid', placeItems: 'center', 
        backgroundColor: checked ? 'var(--slt-blue)' : 'rgba(15, 87, 168, 0.08)', 
        color: checked ? '#ffffff' : 'var(--slt-blue)', 
        transition: 'all 0.2s ease' 
      }}>
        <Icon name={icon} size={20} />
      </div>
    )}

    <span style={{ fontWeight: 600, fontSize: '0.95rem', flex: 1, color: checked ? 'var(--slt-blue)' : 'var(--text-primary)' }}>
      {label}
    </span>
    
    <div style={{
      width: '20px', height: '20px', borderRadius: type === 'radio' ? '50%' : '6px',
      border: checked ? '2px solid var(--slt-blue)' : '2px solid #e2e8f0',
      backgroundColor: checked ? 'var(--slt-blue)' : 'transparent',
      display: 'grid', placeItems: 'center',
      transition: 'all 0.2s ease'
    }}>
      <AnimatePresence>
        {checked && (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} style={{ color: '#fff', display: 'flex' }}>
            <Icon name="check" size={12} strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.label>
);

const RequestDetailsStep = forwardRef(({ isActive }, ref) => {
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [selectedService, setSelectedService] = React.useState('');
  const [selectedRequestType, setSelectedRequestType] = React.useState('');
  const fileInputRef = React.useRef(null);

  useImperativeHandle(ref, () => ({
    validate: () => {
      const descriptionText = document.querySelector('[name="description"]')?.value || '';
      if (!selectedService) {
        import('react-hot-toast').then(({ default: toast }) => toast.error('Please select a required service.'));
        return false;
      }
      if (!selectedRequestType) {
        import('react-hot-toast').then(({ default: toast }) => toast.error('Please select a request type.'));
        return false;
      }
      if (!descriptionText.trim() && !selectedFile) {
        import('react-hot-toast').then(({ default: toast }) => {
          toast.error('Please provide a description or upload a request document.');
        });
        return false;
      }
      return true; 
    }
  }));
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  const { selectedAccount } = useVerifiedContext();
  const isExisting = !!selectedAccount;
  const k = 'wizards.customerRequestAcceptance.requestDetails';

  const allServices = [
    { value: 'voice', label: t(`${k}.voice`), icon: 'smartphone' },
    { value: 'broadband', label: t(`${k}.broadband`), icon: 'trending-up' },
    { value: 'peoTv', label: t(`${k}.peoTv`), icon: 'check-square' },
  ];

  // If existing customer, only show services they actually have, otherwise show all.
  const services = isExisting && Array.isArray(selectedAccount?.services) 
    ? allServices.filter(s => selectedAccount.services.includes(s.value))
    : allServices;

  const requestTypes = [
    { value: 'billing', label: t(`${k}.billing`) },
    { value: 'serviceMod', label: t(`${k}.serviceMod`) },
    { value: 'hardware', label: t(`${k}.hardware`) },
    { value: 'otherRequest', label: t(`${k}.otherRequest`) },
  ];

  return (
    <div>
      {isExisting ? (
        <>
          {/* Already known from the verified account — carried through as hidden fields instead of re-asking. */}
          <input type="hidden" name="fullName" value={selectedAccount.fullName || selectedAccount.customerName || ''} />
          <input type="hidden" name="nic" value={selectedAccount.nic || ''} />
          <input type="hidden" name="telephone" value={selectedAccount.telephone || verifiedMobile || ''} />
          <input type="hidden" name="fixedNo" value={selectedAccount.telephone || ''} />
          <input type="hidden" name="mobileNo" value={selectedAccount.mobileNumber || verifiedMobile || ''} />
          <input type="hidden" name="email" value={selectedAccount.email || ''} />
        </>
      ) : (
        <div className="card" style={cardStyle}>
          <h4 style={cardHeadingStyle}>Applicant Details</h4>

          <Field name="fullName" label={t(`${k}.fullName`)} rules={{ required: true }} autoComplete="name" isActive={isActive} />

          <div className="field-row">
            <Field
              name="nic"
              label={t(`${k}.nicBrc`)}
              rules={{ required: true, kind: 'nic' }}
              helper={t(`${k}.nicHelper`)}
              isActive={isActive}
            />
            <Field
              name="telephone"
              label={t(`${k}.telephone`)}
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              rules={{ required: true, kind: 'phone' }}
              isActive={isActive}
            />
          </div>
        </div>
      )}

      <div className="card" style={cardStyle}>
        <h4 style={cardHeadingStyle}>{t(`${k}.requiredService`)}</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          {services.map(s => (
            <RichCard 
              key={s.value} 
              id={s.value} 
              icon={s.icon} 
              label={s.label} 
              name="service" 
              checked={selectedService === s.value} 
              onChange={setSelectedService} 
            />
          ))}
        </div>

        <h4 style={cardHeadingStyle}>{t(`${k}.requestType`)}</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {requestTypes.map(rt => (
            <RichCard 
              key={rt.value} 
              id={rt.value} 
              label={rt.label} 
              name="requestType" 
              checked={selectedRequestType === rt.value} 
              onChange={setSelectedRequestType} 
            />
          ))}
        </div>
      </div>

      {!isExisting && (
        <div className="card" style={cardStyle}>
          <h4 style={cardHeadingStyle}>{t(`${k}.contactDetails`)}</h4>
          <div className="field-row">
            <Field
              name="fixedNo"
              label={t(`${k}.fixed`)}
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              rules={{ kind: 'phone' }}
              isActive={isActive}
            />
            <Field
              name="mobileNo"
              label={t(`${k}.mobile`)}
              type="tel"
              inputMode="numeric"
              prefix="+94"
              defaultValue={verifiedMobile}
              rules={{ required: true, kind: 'mobile' }}
              helper={t(`${k}.mobilePrefill`)}
              isActive={isActive}
            />
            <Field
              name="email"
              label={t(`${k}.email`)}
              type="email"
              inputMode="email"
              autoComplete="email"
              rules={{ required: true, kind: 'email' }}
              isActive={isActive}
            />
          </div>
        </div>
      )}

      <div className="card" style={{ ...cardStyle, marginBottom: 0 }}>
        <h4 style={cardHeadingStyle}>{t(`${k}.descriptionHeading`)}</h4>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <Textarea
            name="description"
            label={t(`${k}.descriptionLabel`)}
            rules={{ required: false }}
            maxLength={500}
            placeholder={t(`${k}.description`)}
            helper={t(`${k}.descriptionHelper`)}
            isActive={isActive}
          />
        </div>

        <div style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Or Upload Request Document
        </div>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          If you have a written letter or document, you can upload it here instead of typing the description.
        </p>

        <div 
          style={{ 
            padding: '2.5rem 1.5rem', 
            backgroundColor: dragActive ? 'rgba(0, 174, 239, 0.08)' : 'rgba(248, 250, 252, 0.8)', 
            border: `2px dashed ${dragActive ? 'var(--slt-blue)' : 'rgba(15, 87, 168, 0.2)'}`, 
            borderRadius: '16px',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            position: 'relative'
          }}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
          onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              setSelectedFile(e.dataTransfer.files[0]);
              if (fileInputRef.current) {
                fileInputRef.current.files = e.dataTransfer.files;
              }
            }
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            name="requestDocument" 
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />
          {!selectedFile ? (
            <>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(15, 87, 168, 0.05)', display: 'grid', placeItems: 'center', margin: '0 auto 1rem auto', color: 'var(--slt-blue)' }}>
                <FiUploadCloud size={28} />
              </div>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                {dragActive ? 'Drop file here' : 'Click or drag file here to upload'}
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Supports PDF, DOC, PNG, JPG (Max 5MB)
              </p>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--slt-blue)' }}>
              <FiFile size={32} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{selectedFile.name}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                style={{ marginLeft: '1rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default RequestDetailsStep;
