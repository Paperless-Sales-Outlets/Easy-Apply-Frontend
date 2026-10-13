import React from 'react';
import WizardStepHeader from '../../components/wizard/WizardStepHeader';
import { FiCheckCircle } from 'react-icons/fi';

const Row = ({ label, value }) => (
  <div>
    <dt>{label}</dt>
    <dd>{value || <span className="muted-dash">—</span>}</dd>
  </div>
);

const Section = ({ title, onEdit, children }) => (
  <section className="wz-review">
    <div className="wz-review__head">
      <h3>{title}</h3>
      {onEdit && (
        <button type="button" className="btn-ds btn-ds--text" onClick={onEdit} style={{ minHeight: 40 }}>
          Edit
        </button>
      )}
    </div>
    <dl className="wz-review__grid">{children}</dl>
  </section>
);

const Thumb = ({ src, label }) =>
  src ? (
    <figure className="wz-thumb">
      <img src={src} alt={label} />
      <figcaption>{label}</figcaption>
    </figure>
  ) : null;

/** Read-only summary of everything collected and paid, shown before final submission to tracking. */
export default function ReviewStep({ formData, selectedProduct, goTo, onEditCart }) {
  const fee = selectedProduct?.installationFee ?? 2500;
  return (
    <div className="wz-step">
      <WizardStepHeader 
        stepNumber={6} 
        totalSteps={7} 
        title="Review & Submit Application" 
        description="Verify all your details and confirmed payment before final submission." 
      />

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
        <div className="wz-thumbs">
          <Thumb src={formData.nicFront} label="NIC front" />
          <Thumb src={formData.nicBack} label="NIC back" />
          <Thumb src={formData.facePhoto} label="Selfie" />
        </div>
      </Section>

      <Section title="Digital Signature" onEdit={() => goTo('signature')}>
        <Row label="Declaration" value={formData.declarationAccepted ? 'Accepted' : 'Not accepted'} />
        {formData.signature && (
          <img className="wz-signature" src={formData.signature} alt="Your signature" />
        )}
      </Section>

      <Section title="Payment Details" onEdit={() => goTo('payment')}>
        <div>
          <dt>Payment Status</dt>
          <dd className="wz-paid">
            <FiCheckCircle size={16} aria-hidden="true" /> Paid &amp; Confirmed
          </dd>
        </div>
        <Row label="Payment Reference" value={formData.paymentReference || 'PAY-ONLINE-VERIFIED'} />
        <Row label="Installation Fee Paid" value={`Rs. ${Number(fee).toLocaleString()}`} />
      </Section>
    </div>
  );
}
