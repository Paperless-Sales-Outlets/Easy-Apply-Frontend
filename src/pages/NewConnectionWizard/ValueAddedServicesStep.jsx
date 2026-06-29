import React from 'react';

export default function ValueAddedServicesStep() {
  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>5. Value Added Services & Agreement</h3>
      
      <div className="form-group">
        <label className="form-label">5.1 Required additional VAS services (Voice customers get free VAS bundle)</label>
        <div className="radio-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {[
            'A. Call back on busy', 'B. Password call barring', 
            'C. Selective Call Rejection/Acceptance', 'D. Do not disturb service',
            'E. Secretary Service', 'F. Complete call on no response',
            'G. Metering pulses/ polarity reversals', 'H. Hunting',
            'I. Abbreviated Dialling', 'J. Conference', 'K. Detail Bill', 'L. Other'
          ].map(vas => (
            <label key={vas} className="checkbox-label">
              <input type="checkbox" className="checkbox-input" /> {vas}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group mt-4">
        <label className="form-label">5.2 Other Value Added Services</label>
        <div className="radio-group">
          {['a) Hitflix', 'b) TeleLife', 'c) Sisu connect', 'd) Metering Pulses', 'e) Other'].map(vas => (
            <label key={vas} className="checkbox-label">
              <input type="checkbox" className="checkbox-input" /> {vas}
            </label>
          ))}
        </div>
      </div>

      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Customer Agreement</h4>
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: '1rem' }}>
          I/We do hereby declare and confirm that the information above, furnished by me/us are true and correct. I/We confirm that I/We have received, read and understood the 'Terms and Conditions for the Provision of Telecommunication Services by Sri Lanka Telecom PLC (SLT), which are also available on SLTMobitel website www.sltmobitel.lk.
        </p>
        <label className="checkbox-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
          <input type="checkbox" className="checkbox-input" required /> I agree to the Terms and Conditions
        </label>
      </div>
      
    </div>
  );
}
