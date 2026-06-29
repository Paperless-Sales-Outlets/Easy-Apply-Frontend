import React from 'react';

export default function ServiceInfoStep() {
  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>2. Service Information</h3>
      
      <div className="form-group">
        <label className="form-label">2.1 Service installation address</label>
        <textarea className="form-control" rows="3"></textarea>
      </div>

      <div className="form-group">
        <label className="form-label">2.2 Billing Address with Postal code</label>
        <textarea className="form-control" rows="3" placeholder="If different from 2.1 above"></textarea>
      </div>

      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>2.3 If you are already an SLTMobitel customer</h4>
      
      <div className="form-group flex gap-4 items-center">
        <div style={{ flex: '1' }}>
          <label className="form-label">(a) Existing Telephone/Account number</label>
          <input type="text" className="form-control" />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">(b) Do you need a separate bill for the new service?</label>
          <div className="radio-group">
            <label className="radio-label">
              <input type="radio" name="separateBill" value="yes" className="radio-input" /> Yes
            </label>
            <label className="radio-label">
              <input type="radio" name="separateBill" value="no" className="radio-input" /> No
            </label>
          </div>
        </div>
      </div>

      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>2.4 Your preferred billing mode</h4>
      <div className="form-group radio-group">
        <label className="radio-label">
          <input type="radio" name="billingMode" value="email" className="radio-input" /> (a) e-bill (via email)
        </label>
        <label className="radio-label">
          <input type="radio" name="billingMode" value="sms" className="radio-input" /> (b) e-bill (via SMS)
        </label>
        <label className="radio-label">
          <input type="radio" name="billingMode" value="post" className="radio-input" /> (c) Printed bill (Via Post)
        </label>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>* Think of nature before printing</p>

    </div>
  );
}
