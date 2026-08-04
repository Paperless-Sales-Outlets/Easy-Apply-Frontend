import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
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
            style={{ flex: 1 }}
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

      <AnimatePresence>
        {isVerified && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">{t('wizards.reconnection.customerInfo.fullName')}</label>
              <input 
                name="fullName" 
                type="text" 
                className="form-control" 
                required={isActive} 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                readOnly
              />
            </div>

            <div className="form-group flex flex-col-mobile gap-4">
              <div style={{ flex: '1' }}>
                <label className="form-label">{t('wizards.reconnection.customerInfo.nicBrc')}</label>
                <input 
                  name="nic" 
                  type="text" 
                  className="form-control" 
                  required={isActive} 
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  readOnly
                />
              </div>
              <div style={{ flex: '1' }}>
                <label className="form-label">{t('wizards.reconnection.customerInfo.contactNo')}</label>
                <input 
                  name="contactNo" 
                  type="tel" 
                  inputMode="numeric"
                  pattern="^([1-9][0-9]{8}|0[0-9]{9})$"
                  maxLength={10}
                  title="Enter 9 digits (not starting with 0) or 10 digits starting with 0"
                  className="form-control" 
                  required={isActive} 
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                  readOnly
                />
              </div>
            </div>

            <div className="form-group flex flex-col-mobile gap-4">
              <div style={{ flex: '1' }}>
                <label className="form-label">Address Line 1 *</label>
                <input 
                  name="addressLine1" 
                  type="text" 
                  className="form-control" 
                  required={isActive} 
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  readOnly
                />
              </div>
              <div style={{ flex: '1' }}>
                <label className="form-label">Address Line 2 *</label>
                <input 
                  name="addressLine2" 
                  type="text" 
                  className="form-control" 
                  required={isActive} 
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  readOnly
                />
              </div>
            </div>

            {location && (
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Place the pin in your home/business location</label>
                <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <MapContainer center={[location.lat, location.lng]} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[location.lat, location.lng]}>
                      <Popup>
                        {addressLine1} <br /> {addressLine2}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
