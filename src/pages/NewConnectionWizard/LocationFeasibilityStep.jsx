import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AddressInputWithMap from '../../components/form/AddressInputWithMap';
import {
  FiMapPin,
  FiCheckCircle,
  FiAlertCircle,
  FiWifi,
  FiZap,
  FiActivity,
  FiPhoneCall,
  FiLoader,
  FiHome,
} from 'react-icons/fi';

export default function LocationFeasibilityStep({ formData, handleChange, onFeasibilityStatusChange }) {
  const { t } = useTranslation();

  const isExistingCustomer = formData.isExistingCustomer === 'yes';
  const [locationMode, setLocationMode] = useState(isExistingCustomer ? 'existing' : 'new');
  const [checking, setChecking] = useState(false);
  const [feasibilityResult, setFeasibilityResult] = useState(formData.feasibilityStatus || null);

  // Sync install address when location mode changes
  useEffect(() => {
    if (locationMode === 'existing' && formData.address) {
      handleChange({
        target: { name: 'installAddress', value: formData.address },
      });
    }
  }, [locationMode, formData.address]);

  const handleLocationModeChange = (mode) => {
    setLocationMode(mode);
    setFeasibilityResult(null);
    onFeasibilityStatusChange(null);
    if (mode === 'existing' && formData.address) {
      handleChange({
        target: { name: 'installAddress', value: formData.address },
      });
    } else if (mode === 'new') {
      handleChange({
        target: { name: 'installAddress', value: '' },
      });
    }
  };

  const runFeasibilityCheck = () => {
    const targetAddress = locationMode === 'existing' ? formData.address : formData.installAddress;
    if (!targetAddress || targetAddress.trim().length < 5) {
      alert('Please enter or select a valid installation address first.');
      return;
    }

    setChecking(true);
    setFeasibilityResult(null);

    setTimeout(() => {
      setChecking(false);
      const mockResult = {
        status: 'approved',
        fibreAvailable: true,
        voiceAvailable: true,
        maxSpeed: '1 Gbps',
        signalQuality: '98% (Excellent)',
        nearestDP: '110m',
        estimatedTime: '24 - 48 Hours',
        message: 'High-speed Fibre optical line & Voice port available at this location.',
      };
      setFeasibilityResult(mockResult);
      onFeasibilityStatusChange(mockResult);
    }, 1200);
  };

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue, #0F57A8)', marginBottom: '0.5rem' }}>
        2. Installation Location & Connectivity Check
      </h3>
      <p style={{ color: 'var(--text-secondary, #64748B)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
        Select where to install your new connection and check network port availability.
      </p>

      {/* Location Option Selector for Existing Customers */}
      {isExistingCustomer && (
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <label style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0F172A', display: 'block', marginBottom: '0.75rem' }}>
            Where would you like to install the new connection?
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => handleLocationModeChange('existing')}
              style={{
                padding: '1rem',
                borderRadius: '10px',
                border: locationMode === 'existing' ? '2px solid #0F57A8' : '1px solid #CBD5E1',
                backgroundColor: locationMode === 'existing' ? '#EFF6FF' : '#FFFFFF',
                color: locationMode === 'existing' ? '#1E3A8A' : '#475569',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
              }}
            >
              <FiHome size={22} style={{ color: locationMode === 'existing' ? '#0F57A8' : '#64748B' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem' }}>Registered / Existing Address</strong>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Use current account installation address</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleLocationModeChange('new')}
              style={{
                padding: '1rem',
                borderRadius: '10px',
                border: locationMode === 'new' ? '2px solid #0F57A8' : '1px solid #CBD5E1',
                backgroundColor: locationMode === 'new' ? '#EFF6FF' : '#FFFFFF',
                color: locationMode === 'new' ? '#1E3A8A' : '#475569',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
              }}
            >
              <FiMapPin size={22} style={{ color: locationMode === 'new' ? '#0F57A8' : '#64748B' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem' }}>New Installation Address</strong>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Specify a new premises location</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Address Display / Map Picker */}
      {locationMode === 'existing' ? (
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Installation Address (Registered Customer Address)</label>
          <input
            type="text"
            className="form-control"
            value={formData.address || ''}
            readOnly
            style={{ backgroundColor: '#F1F5F9', cursor: 'not-allowed', fontWeight: '500' }}
          />
        </div>
      ) : (
        <div style={{ marginBottom: '1.5rem' }}>
          <AddressInputWithMap
            name="installAddress"
            label="New Installation Address (Specify Exact Premises)"
            value={formData.installAddress || ''}
            onChange={handleChange}
            required
          />
        </div>
      )}

      {/* Feasibility Check Trigger & Results Panel */}
      <div
        style={{
          border: '1px dashed #0F57A8',
          backgroundColor: '#F0F9FF',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ color: '#0369A1', margin: 0, fontSize: '1.05rem', fontWeight: '700' }}>
              Network Feasibility & Coverage Check
            </h4>
            <p style={{ color: '#0C4A6E', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              Verify Fibre optical network capacity and Voice port availability at this address.
            </p>
          </div>

          <button
            type="button"
            onClick={runFeasibilityCheck}
            disabled={checking}
            style={{
              padding: '0.65rem 1.4rem',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: '#0F57A8',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: checking ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(15, 87, 168, 0.25)',
            }}
          >
            {checking ? (
              <>
                <FiLoader className="spin" size={16} />
                <span>Checking Connectivity...</span>
              </>
            ) : (
              <>
                <FiActivity size={16} />
                <span>Check Location Connectivity</span>
              </>
            )}
          </button>
        </div>

        {/* Feasibility Result Box */}
        {feasibilityResult && (
          <div
            style={{
              marginTop: '1.25rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid #10B981',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <FiCheckCircle size={22} style={{ color: '#10B981' }} />
              <strong style={{ color: '#065F46', fontSize: '1rem' }}>
                Feasibility Approved — Connection Available!
              </strong>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#334155', marginBottom: '1rem' }}>
              {feasibilityResult.message}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                backgroundColor: '#F0FDF4',
                padding: '0.85rem',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#166534' }}>
                <FiZap size={14} />
                <span>Max Speed: <strong>{feasibilityResult.maxSpeed}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#166534' }}>
                <FiPhoneCall size={14} />
                <span>Voice Port: <strong>Mandatory / Active</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#166534' }}>
                <FiWifi size={14} />
                <span>Signal Quality: <strong>{feasibilityResult.signalQuality}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
