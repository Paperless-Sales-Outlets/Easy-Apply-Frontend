import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Icon from '../../components/Icon';
import SLTLoader from '../../components/SLTLoader';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function CustomerDetailsStep({ isActive, onVerifySuccess }) {
  const { t } = useTranslation();

  const [telephone, setTelephone] = useState('');
  const [fullName, setFullName] = useState('');
  const [nic, setNic] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');

  const [disconnectedFrom, setDisconnectedFrom] = useState('');
  const [disconnectedTo, setDisconnectedTo] = useState('');
  const [outstandingBalance, setOutstandingBalance] = useState('');

  const [location, setLocation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async () => {
    if (!telephone) {
      setError('Please enter a telephone number');
      toast.error('Please enter a telephone number');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/applications/lookup-connection?phone=${telephone}`);
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        setFullName(d.fullName || '');
        setNic(d.nic || '');
        setContactNo(d.contactNo || '');
        setAddressLine1(d.addressLine1 || '');
        setAddressLine2(d.addressLine2 || '');
        setDisconnectedFrom(d.disconnectedFrom || '');
        setDisconnectedTo(d.disconnectedTo || '');
        setOutstandingBalance(d.outstandingBalance !== undefined ? d.outstandingBalance : '');
        setLocation(d.location || null);
        setIsVerified(true);
        if (onVerifySuccess) {
          onVerifySuccess(d);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Connection not found';
      setError(msg);
      toast.error(msg);
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 style={{ color: 'var(--slt-blue)', marginBottom: '1.5rem' }}>{t('wizards.reconnection.customerInfo.heading')}</h3>

      <div className="form-group">
        <label className="form-label">{t('wizards.reconnection.customerInfo.telephone')}</label>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            name="telephone"
            type="tel"
            inputMode="numeric"
            pattern="^([1-9][0-9]{8}|0[0-9]{9})$"
            title="Enter 9 digits (not starting with 0) or 10 digits starting with 0"
            className="form-control"
            required={isActive}
            value={telephone}
            onChange={(e) => {
              setTelephone(e.target.value);
              setIsVerified(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleVerify();
              }
            }}
            style={{ flex: 1, maxWidth: '350px' }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleVerify}
            disabled={loading}
            style={{ minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {loading ? <SLTLoader size={24} /> : 'Verify'}
          </button>
        </div>
        {error && <p style={{ color: 'var(--danger, red)', marginTop: '0.5rem', fontSize: '0.85rem' }}>{error}</p>}
      </div>

      <AnimatePresence mode="wait">
        {!isVerified ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              marginTop: '2rem',
              border: '2px dashed var(--line)',
              borderRadius: '16px',
              backgroundColor: 'var(--surface-color, #fafafa)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div style={{ padding: '1rem', backgroundColor: 'rgba(15, 87, 168, 0.05)', borderRadius: '50%', color: 'var(--slt-blue)' }}>
              <Icon name="globe" size={32} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Account Lookup</h4>
              <p style={{ margin: 0, fontSize: '0.95rem', maxWidth: '400px' }}>
                Please enter your SLT-MOBITEL telephone number above and click Verify. We will securely retrieve your existing account information.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="verified-fields"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            {/* Hidden fields to preserve form submission data */}
            <input type="hidden" name="fullName" value={fullName} />
            <input type="hidden" name="nic" value={nic} />
            <input type="hidden" name="addressLine1" value={addressLine1} />
            <input type="hidden" name="addressLine2" value={addressLine2} />
            <input type="hidden" name="amountToPay" value={outstandingBalance} />

            <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>

              <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Profile Card */}
                <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(15, 87, 168, 0.1)', display: 'grid', placeItems: 'center', color: 'var(--slt-blue)' }}>
                      <Icon name="user" size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{fullName}</h4>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Account Holder</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      <Icon name="map-pin" size={18} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                        <strong>Service Address:</strong><br />
                        {[addressLine1, addressLine2].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status & Dues Card */}
                <div className="card" style={{ padding: '1.5rem', backgroundColor: 'rgba(220,53,69,0.05)', border: '1px solid rgba(220,53,69,0.2)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ color: 'var(--danger)', marginTop: '0.2rem' }}>
                      <Icon name="alert-circle" size={18} />
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        Disconnected from <strong>{disconnectedFrom}</strong> to <strong>{disconnectedTo}</strong>
                      </p>
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid rgba(220,53,69,0.2)' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Payment</p>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>Rs. {outstandingBalance}</p>
                  </div>
                </div>

              </div>

              {location && (
                <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Location Map</h4>
                  <div style={{ flex: '1', minHeight: '250px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <MapContainer center={[location.lat, location.lng]} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[location.lat, location.lng]}>
                        <Popup>
                          {[addressLine1, addressLine2].filter(Boolean).join(', ')}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}
