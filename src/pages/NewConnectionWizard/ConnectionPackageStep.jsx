import React from 'react';

export default function ConnectionPackageStep() {
  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>3. Mode of Connection & Packages</h3>
      
      <div className="form-group">
        <label className="form-label">3.1 Mode of Connection</label>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}></th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Voice (Telephone)</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Broadband</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>PEO TV</th>
            </tr>
          </thead>
          <tbody>
            {['Fibre', 'Home 4G', 'Copper'].map(type => (
              <tr key={type}>
                <td style={{ padding: '0.5rem', fontWeight: '500' }}>{type}</td>
                <td style={{ padding: '0.5rem' }}><input type="checkbox" className="checkbox-input" /></td>
                <td style={{ padding: '0.5rem' }}><input type="checkbox" className="checkbox-input" /></td>
                <td style={{ padding: '0.5rem' }}><input type="checkbox" className="checkbox-input" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Note: For a single SLTMobitel Fibre Connectivity, you can get 02 Voice & 03 PEO TV connections.</p>
      </div>

      <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>4. Package Details</h4>
      
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <h5 style={{ color: 'var(--slt-blue)', marginBottom: '1rem' }}>4.1 Voice Package</h5>
        <div className="form-group flex gap-4">
          <label className="checkbox-label" style={{ flex: '1' }}>
            <input type="checkbox" className="checkbox-input" /> 4.1.1 My phone
          </label>
        </div>
        <div className="form-group flex gap-4">
          <label className="checkbox-label" style={{ flex: '1' }}>
            <input type="checkbox" className="checkbox-input" /> 4.1.2 Home 4G Voice Pal (Premium)
          </label>
          <label className="checkbox-label" style={{ flex: '1' }}>
            <input type="checkbox" className="checkbox-input" /> 4.1.2 Home 4G Voice Pal (Basic)
          </label>
        </div>
        <div className="form-group flex gap-4">
          <label className="checkbox-label" style={{ flex: '1' }}>
            <input type="checkbox" className="checkbox-input" /> 4.1.3 Home 4G - Standard Voice
          </label>
        </div>
        <div className="form-group flex gap-4 items-center">
          <label className="form-label" style={{ margin: 0, flex: '2' }}>4.1.4 SLT IDD default on Copper & Fibre. Deactivate?</label>
          <div className="radio-group" style={{ flex: '1' }}>
            <label className="radio-label"><input type="radio" name="deactIDD" value="yes" className="radio-input" /> Yes</label>
            <label className="radio-label"><input type="radio" name="deactIDD" value="no" className="radio-input" /> No</label>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <h5 style={{ color: 'var(--slt-blue)', marginBottom: '1rem' }}>4.2 Broadband Package</h5>
        <div className="form-group">
          <label className="form-label">Select Package</label>
          <select className="form-control" defaultValue="">
            <option value="" disabled>Select a Broadband Package</option>
            <optgroup label="Time Based Packages">
              <option value="web-lite">Web Lite</option>
              <option value="web-starter">Web Starter</option>
              <option value="web-family">Web Family Plus</option>
            </optgroup>
            <optgroup label="Anytime Packages">
              <option value="any-joy">Any Joy</option>
              <option value="any-beat">Any Beat</option>
              <option value="any-flix">Any Flix</option>
            </optgroup>
            <optgroup label="Unlimited Broadband">
              <option value="fibre-unlimited-10">Fibre Unlimited 10</option>
              <option value="lte-unlimited-2">LTE Unlimited 2</option>
              <option value="adsl-unlimited-2">ADSL Unlimited 2</option>
            </optgroup>
          </select>
        </div>
        
        <div className="form-group flex gap-4 items-center">
          <label className="form-label" style={{ margin: 0, flex: '1' }}>4.2.1 Static IP Required?</label>
          <div className="radio-group" style={{ flex: '1' }}>
            <label className="radio-label"><input type="radio" name="staticIP" value="yes" className="radio-input" /> Yes</label>
            <label className="radio-label"><input type="radio" name="staticIP" value="no" className="radio-input" /> No</label>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <h5 style={{ color: 'var(--slt-blue)', marginBottom: '1rem' }}>4.3 PEO TV Package</h5>
        <div className="form-group">
          <div className="radio-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {['PEO Titanium', 'PEO Platinum', 'PEO Entertainment', 'PEO Gold', 'PEO Silver Plus', 'PEO Silver', 'PEO Family', 'PEO Unnatham', 'Other'].map(pkg => (
              <label key={pkg} className="checkbox-label">
                <input type="checkbox" className="checkbox-input" /> {pkg}
              </label>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
