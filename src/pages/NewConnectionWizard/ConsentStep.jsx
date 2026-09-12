import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ConsentStep = forwardRef(function ConsentStep({ formData, handleChange, isActive }, ref) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [decisions, setDecisions] = useState({});

  useEffect(() => {
    if (isActive) {
      loadConfig();
    }
  }, [isActive]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/consent/config?serviceType=new-connection');
      const data = res.data.data;
      setConfig(data);

      // Initialize decisions
      const initialDecisions = {};
      if (data && data.purposes) {
        data.purposes.forEach(p => {
          initialDecisions[p.purpose] = p.required ? true : false;
        });
      }
      setDecisions(initialDecisions);
    } catch (err) {
      console.error('Failed to load consent config:', err);
      // We don't block the wizard if ConsentHub is completely unreachable today, 
      // but we log the error.
      setError('Unable to load privacy preferences at this time.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecisionChange = (purpose, granted) => {
    setDecisions(prev => ({
      ...prev,
      [purpose]: granted
    }));
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      if (config && config.purposes) {
        // Ensure all required purposes are granted
        const missingRequired = config.purposes.some(p => p.required && !decisions[p.purpose]);
        if (missingRequired) {
          toast.error('You must accept all required privacy terms to proceed.');
          return false;
        }

        // Save choices into the New Connection wizard state
        const consentInfo = {
          privacyNoticeId: config.privacyNoticeId,
          privacyNoticeVersion: config.version,
          decisions: Object.keys(decisions).map(purpose => ({
            purpose,
            granted: decisions[purpose]
          }))
        };

        handleChange({ target: { name: 'consentInfo', value: consentInfo, type: 'custom' } });
      }
      return true;
    },
  }));

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading privacy choices...</div>;
  }

  if (error || !config) {
    return (
      <div>
        <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>Privacy & Consent</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          {error || 'Privacy preferences are currently unavailable. You may proceed.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1rem' }}>Privacy & Consent</h3>
      
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>
          {config.title || 'Privacy Notice'}
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {config.summary || 'Please review how we handle your data.'}
        </p>

        {config.purposes && config.purposes.map((purpose) => (
          <div key={purpose.purpose} style={{ 
            marginBottom: '1rem', 
            padding: '1rem', 
            backgroundColor: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, paddingRight: '1rem' }}>
                <h5 style={{ margin: '0 0 0.25rem 0', color: '#1e293b' }}>
                  {purpose.description || purpose.purpose}
                  {purpose.required && <span style={{ color: '#dc2626', marginLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>* Required</span>}
                </h5>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  {purpose.details || `Allow us to use your data for ${purpose.purpose} purposes.`}
                </p>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: purpose.required ? 'not-allowed' : 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!decisions[purpose.purpose]}
                    onChange={(e) => handleDecisionChange(purpose.purpose, e.target.checked)}
                    disabled={purpose.required}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--slt-blue)' }}
                  />
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#334155' }}>
                    {decisions[purpose.purpose] ? 'Granted' : 'Declined'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ConsentStep;
