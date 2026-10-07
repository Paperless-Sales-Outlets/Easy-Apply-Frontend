import React from 'react';

const Row = ({ label, value }) => (
  <div>
    <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', wordBreak: 'break-word' }}>
      {value || <span style={{ color: '#94a3b8' }}>—</span>}
    </span>
  </div>
);

const Section = ({ title, onEdit, children }) => (
  <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1.1rem 1.25rem', backgroundColor: '#fff' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>{title}</h4>
      {onEdit && (
        <button type="button" className="auth-link-btn" onClick={onEdit}>Edit</button>
      )}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.8rem 1.25rem' }}>
      {children}
    </div>
  </div>
);

const Thumb = ({ src, label }) => src ? (
  <figure style={{ margin: 0 }}>
    <img src={src} alt={label} style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
    <figcaption style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>{label}</figcaption>
  </figure>
) : null;

/** Read-only summary of everything collected so far, shown before payment. */
export default function ReviewStep({ formData, selectedProduct, goTo, onEditCart }) {
  const fee = selectedProduct?.installationFee ?? 2500;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h3 style={{ color: '#0f172a', margin: '0 0 0.4rem 0', fontSize: '1.4rem', fontWeight: 800 }}>Review Your Application</h3>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Check everything below before you continue to payment.</p>
      </div>

      <Section title="Contact">
        <Row label="Mobile" value={formData.mobileNumber && `+94 ${formData.mobileNumber}`} />
        <Row label="Email" value={formData.email} />
      </Section>

      <Section title="Package" onEdit={onEditCart}>
        <Row label="Product" value={selectedProduct?.productName} />
        <Row label="Monthly" value={selectedProduct?.monthlyPrice != null && `Rs. ${Number(selectedProduct.monthlyPrice).toLocaleString()}`} />
        <Row label="Quantity" value={selectedProduct?.quantity || 1} />
        <Row label="Installation Fee" value={`Rs. ${Number(fee).toLocaleString()}`} />
      </Section>

      <Section title="Installation Location" onEdit={() => goTo('location')}>
        <Row label="Address" value={formData.installAddress || formData.address} />
        <Row label="City" value={formData.city} />
      </Section>

      <Section title="Identity (from your NIC)" onEdit={() => goTo('identity')}>
        <Row label="Full Name" value={formData.nameFull} />
        <Row label="NIC Number" value={formData.nic} />
        <Row label="Date of Birth" value={formData.dob} />
        <Row label="Gender" value={formData.gender} />
        <Row label="Address on NIC" value={formData.nicAddress} />
        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
          <Thumb src={formData.nicFront} label="NIC front" />
          <Thumb src={formData.nicBack} label="NIC back" />
          <Thumb src={formData.facePhoto} label="Selfie" />
        </div>
      </Section>

      <Section title="Digital Signature" onEdit={() => goTo('signature')}>
        <Row label="Declaration" value={formData.declarationAccepted ? 'Accepted' : 'Not accepted'} />
        {formData.signature && (
          <img src={formData.signature} alt="Your signature" style={{ maxHeight: '80px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
        )}
      </Section>
    </div>
  );
}
