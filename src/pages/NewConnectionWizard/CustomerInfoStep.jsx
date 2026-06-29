import React from 'react';

export default function CustomerInfoStep() {
  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>1. Customer Information</h3>
      
      <div className="form-group">
        <label className="form-label">1.1 Customer type</label>
        <div className="radio-group">
          <label className="radio-label">
            <input type="radio" name="customerType" value="home" className="radio-input" /> Home
          </label>
          <label className="radio-label">
            <input type="radio" name="customerType" value="office" className="radio-input" /> Office
          </label>
          <label className="radio-label">
            <input type="radio" name="customerType" value="religious" className="radio-input" /> Religious
          </label>
        </div>
      </div>

      <div className="form-group flex gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">Title</label>
          <select className="form-control" defaultValue="">
            <option value="" disabled>Select</option>
            <option value="Rev">Rev</option>
            <option value="Mr">Mr</option>
            <option value="Ms">Ms</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div style={{ flex: '3' }}>
          <label className="form-label">1.2 Name in full</label>
          <input type="text" className="form-control" placeholder="Personal or Business name" />
        </div>
      </div>

      <div className="form-group flex gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">1.3 Date of birth</label>
          <input type="date" className="form-control" />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">1.4 NIC / Passport / Business Reg No.</label>
          <input type="text" className="form-control" />
        </div>
      </div>

      <div className="form-group flex gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">1.5 VAT registration number (if available)</label>
          <input type="text" className="form-control" />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">1.6 Tax exemption reference number (if available)</label>
          <input type="text" className="form-control" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">1.7 Permanent Principle address</label>
        <textarea className="form-control" rows="3"></textarea>
      </div>

      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>1.8 Contact details</h4>
      
      <div className="form-group flex gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">a. Name (Contact person)</label>
          <input type="text" className="form-control" />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">b. Designation</label>
          <input type="text" className="form-control" />
        </div>
      </div>

      <div className="form-group flex gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">c. Fixed Number</label>
          <input type="tel" className="form-control" />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">Mobile Number (Mandatory)</label>
          <input type="tel" className="form-control" required />
        </div>
      </div>

      <div className="form-group flex gap-4">
        <div style={{ flex: '1' }}>
          <label className="form-label">Fax Number</label>
          <input type="tel" className="form-control" />
        </div>
        <div style={{ flex: '1' }}>
          <label className="form-label">E-mail (Mandatory)</label>
          <input type="email" className="form-control" required />
        </div>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        (This mobile number will be used to send billing information and other communications in future)
      </p>

    </div>
  );
}
