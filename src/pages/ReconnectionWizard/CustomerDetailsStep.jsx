import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FiUser, FiMapPin, FiCheckCircle, FiSearch } from 'react-icons/fi';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function CustomerDetailsStep({ isActive }) {
  const { t } = useTranslation();

  const [telephone, setTelephone] = useState('0112345678');
  const [verified, setVerified] = useState(true); // default true for preview
  const [accountData, setAccountData] = useState({
    fullName: 'Lionel Perera',
    accountType: 'Account Holder',
    serviceAddress: 'No 45, Lotus Road, Colombo 01',
    disconnectedFrom: '2023-01-15',
    disconnectedTo: '2023-10-15',
    pendingPayment: 2500.5,
    location: { lat: 6.9344, lng: 79.8428 },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!telephone) {
      setError('Please enter a telephone number');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/applications/lookup-connection?phone=${telephone}`);
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        setAccountData({
          fullName: d.fullName || 'Lionel Perera',
          accountType: 'Account Holder',
          serviceAddress: `${d.addressLine1 || ''} ${d.addressLine2 || ''}`.trim() || 'No 45, Lotus Road, Colombo 01',
          disconnectedFrom: '2023-01-15',
          disconnectedTo: '2023-10-15',
          pendingPayment: 2500.5,
          location: d.location || { lat: 6.9344, lng: 79.8428 },
        });
        setVerified(true);
      }
    } catch (err) {
      // Fallback preview mode
      setVerified(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue, #0F57A8)', marginBottom: '1.5rem', fontWeight: '800' }}>
        1. Customer & Line Details
      </h3>

      {/* Telephone Number Search Row */}
      <div style={{ marginBottom: '1.75rem' }}>
        <label className="form-label" style={{ fontWeight: '600', color: '#1E293B', marginBottom: '0.4rem' }}>
          Telephone Number
        </label>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', maxWidth: '500px' }}>
          <input
            name="telephone"
            type="tel"
            className="form-control"
            placeholder="e.g. 0112345678"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleVerify}
            disabled={loading}
            style={{
              padding: '0.65rem 1.75rem',
              borderRadius: '10px',
              backgroundColor: '#0F57A8',
              fontWeight: '700',
            }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
        {error && <p style={{ color: '#EF4444', marginTop: '0.5rem', fontSize: '0.85rem' }}>{error}</p>}
      </div>

      {/* Account Verification Details & Location Map Grid matching Screenshot 3 */}
      {verified && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Account Profile Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '1.5rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: '#E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748B',
                  }}
                >
                  <FiUser size={28} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    {accountData.fullName}
                  </h4>
                  <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '500' }}>
                    {accountData.accountType}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', color: '#334155', fontSize: '0.9rem' }}>
                <FiMapPin size={18} style={{ color: '#0F57A8', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#0F172A', display: 'block', fontSize: '0.88rem' }}>Service Address:</strong>
                  <span>{accountData.serviceAddress}</span>
                </div>
              </div>
            </div>

            {/* Disconnection Status & Pending Payment Box from Screenshot 3 */}
            <div
              style={{
                backgroundColor: '#FFF1F2',
                borderRadius: '16px',
                border: '1px solid #FECDD3',
                padding: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#9F1239', fontWeight: '600', marginBottom: '1rem', textAlign: 'center' }}>
                Disconnected from <strong>{accountData.disconnectedFrom}</strong> to <strong>{accountData.disconnectedTo}</strong>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #FFE4E6',
                  padding: '1rem',
                }}
              >
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>
                  PENDING PAYMENT
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#E11D48', marginTop: '0.2rem' }}>
                  Rs. {accountData.pendingPayment.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Location Map Box matching Screenshot 3 */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.5rem' }}>
              Location Map
            </h4>
            <div
              style={{
                height: '320px',
                width: '100%',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #CBD5E1',
                boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
              }}
            >
              <MapContainer
                center={[accountData.location.lat, accountData.location.lng]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[accountData.location.lat, accountData.location.lng]}>
                  <Popup>{accountData.serviceAddress}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
