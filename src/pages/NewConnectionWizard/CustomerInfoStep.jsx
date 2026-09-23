import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiUser, FiMapPin, FiPhone, FiMail, FiCheckCircle, FiCheck, FiNavigation } from 'react-icons/fi';
import AddressInputWithMap from '../../components/form/AddressInputWithMap';
import { useVerifiedContext } from '../../components/verification';
import { getAuthUser } from '../../utils/authSession';
import { motion } from 'framer-motion';

const SRI_LANKA_CITY_POSTAL_DATA = [
  { label: 'Colombo 01 (Fort) - 00100', city: 'Colombo 01', district: 'Colombo', postalCode: '00100' },
  { label: 'Colombo 02 (Slave Island) - 00200', city: 'Colombo 02', district: 'Colombo', postalCode: '00200' },
  { label: 'Colombo 03 (Kollupitiya) - 00300', city: 'Colombo 03', district: 'Colombo', postalCode: '00300' },
  { label: 'Colombo 04 (Bambalapitiya) - 00400', city: 'Colombo 04', district: 'Colombo', postalCode: '00400' },
  { label: 'Colombo 05 (Havelock Town) - 00500', city: 'Colombo 05', district: 'Colombo', postalCode: '00500' },
  { label: 'Colombo 06 (Wellawatte) - 00600', city: 'Colombo 06', district: 'Colombo', postalCode: '00600' },
  { label: 'Colombo 07 (Cinnamon Gardens) - 00700', city: 'Colombo 07', district: 'Colombo', postalCode: '00700' },
  { label: 'Colombo 08 (Borella) - 00800', city: 'Colombo 08', district: 'Colombo', postalCode: '00800' },
  { label: 'Colombo 09 (Dematagoda) - 00900', city: 'Colombo 09', district: 'Colombo', postalCode: '00900' },
  { label: 'Colombo 10 (Maradana) - 01000', city: 'Colombo 10', district: 'Colombo', postalCode: '01000' },
  { label: 'Colombo 11 (Pettah) - 01100', city: 'Colombo 11', district: 'Colombo', postalCode: '01100' },
  { label: 'Colombo 12 (Hulftsdorp) - 01200', city: 'Colombo 12', district: 'Colombo', postalCode: '01200' },
  { label: 'Colombo 13 (Kotahena) - 01300', city: 'Colombo 13', district: 'Colombo', postalCode: '01300' },
  { label: 'Colombo 14 (Grandpass) - 01400', city: 'Colombo 14', district: 'Colombo', postalCode: '01400' },
  { label: 'Colombo 15 (Modara) - 01500', city: 'Colombo 15', district: 'Colombo', postalCode: '01500' },
  { label: 'Dehiwala - 10350', city: 'Dehiwala', district: 'Colombo', postalCode: '10350' },
  { label: 'Mount Lavinia - 10370', city: 'Mount Lavinia', district: 'Colombo', postalCode: '10370' },
  { label: 'Nugegoda - 10250', city: 'Nugegoda', district: 'Colombo', postalCode: '10250' },
  { label: 'Maharagama - 10280', city: 'Maharagama', district: 'Colombo', postalCode: '10280' },
  { label: 'Kottawa - 10230', city: 'Kottawa', district: 'Colombo', postalCode: '10230' },
  { label: 'Battaramulla - 10120', city: 'Battaramulla', district: 'Colombo', postalCode: '10120' },
  { label: 'Sri Jayawardenepura Kotte - 10100', city: 'Sri Jayawardenepura Kotte', district: 'Colombo', postalCode: '10100' },
  { label: 'Malabe - 10115', city: 'Malabe', district: 'Colombo', postalCode: '10115' },
  { label: 'Rajagiriya - 10107', city: 'Rajagiriya', district: 'Colombo', postalCode: '10107' },
  { label: 'Moratuwa - 10400', city: 'Moratuwa', district: 'Colombo', postalCode: '10400' },
  { label: 'Piliyandala - 10300', city: 'Piliyandala', district: 'Colombo', postalCode: '10300' },
  { label: 'Gampaha - 11000', city: 'Gampaha', district: 'Gampaha', postalCode: '11000' },
  { label: 'Negombo - 11500', city: 'Negombo', district: 'Gampaha', postalCode: '11500' },
  { label: 'Ja-Ela - 11350', city: 'Ja-Ela', district: 'Gampaha', postalCode: '11350' },
  { label: 'Kelaniya - 11600', city: 'Kelaniya', district: 'Gampaha', postalCode: '11600' },
  { label: 'Wattala - 11300', city: 'Wattala', district: 'Gampaha', postalCode: '11300' },
  { label: 'Kandy - 20000', city: 'Kandy', district: 'Kandy', postalCode: '20000' },
  { label: 'Peradeniya - 20400', city: 'Peradeniya', district: 'Kandy', postalCode: '20400' },
  { label: 'Gampola - 20500', city: 'Gampola', district: 'Kandy', postalCode: '20500' },
  { label: 'Dickoya - 22050', city: 'Dickoya', district: 'Nuwara Eliya', postalCode: '22050' },
  { label: 'Hatton - 22000', city: 'Hatton', district: 'Nuwara Eliya', postalCode: '22000' },
  { label: 'Nuwara Eliya - 22200', city: 'Nuwara Eliya', district: 'Nuwara Eliya', postalCode: '22200' },
  { label: 'Galle - 80000', city: 'Galle', district: 'Galle', postalCode: '80000' },
  { label: 'Hikkaduwa - 80240', city: 'Hikkaduwa', district: 'Galle', postalCode: '80240' },
  { label: 'Matara - 81000', city: 'Matara', district: 'Matara', postalCode: '81000' },
  { label: 'Jaffna - 40000', city: 'Jaffna', district: 'Jaffna', postalCode: '40000' },
  { label: 'Kurunegala - 60000', city: 'Kurunegala', district: 'Kurunegala', postalCode: '60000' },
  { label: 'Anuradhapura - 50000', city: 'Anuradhapura', district: 'Anuradhapura', postalCode: '50000' },
  { label: 'Badulla - 90000', city: 'Badulla', district: 'Badulla', postalCode: '90000' },
  { label: 'Ratnapura - 70000', city: 'Ratnapura', district: 'Ratnapura', postalCode: '70000' },
  { label: 'Trincomalee - 31000', city: 'Trincomalee', district: 'Trincomalee', postalCode: '31000' },
  { label: 'Batticaloa - 30000', city: 'Batticaloa', district: 'Batticaloa', postalCode: '30000' },
  { label: 'Vavuniya - 43000', city: 'Vavuniya', district: 'Vavuniya', postalCode: '43000' },
];

const ReadOnlyDetail = ({ label, value }) => (
  <div>
    <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>
      {label}
    </span>
    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
      {value || <span style={{ color: '#94a3b8', fontWeight: 600 }}>N/A</span>}
    </span>
  </div>
);

export default function CustomerInfoStep({ formData, handleChange, setFields, selectedProduct }) {
  const { t } = useTranslation();
  const { mobileNumber, customerExists, selectedAccount } = useVerifiedContext();
  const [authUser] = useState(getAuthUser);

  // Retrieve user identity from verified context or OCR registration
  const knownProfile = (() => {
    if (selectedAccount) {
      return {
        title: selectedAccount.title || 'Mr',
        nameFull: selectedAccount.fullName || selectedAccount.customerName || '',
        nic: selectedAccount.nic || '',
        dob: selectedAccount.dob || '',
        email: selectedAccount.email || '',
        mobileNumber: selectedAccount.mobileNumber || selectedAccount.phoneNumber || mobileNumber || '',
        registeredAddress: selectedAccount.address || selectedAccount.addressLine1 || '',
      };
    }
    if (authUser) {
      const line = [authUser.addressLine1, authUser.addressLine2, authUser.city, authUser.postalCode]
        .filter(Boolean)
        .join(', ');
      return {
        title: authUser.title || 'Mr',
        nameFull: authUser.name || '',
        nic: authUser.NIC || authUser.nic || '',
        dob: authUser.dob || '',
        email: authUser.email || '',
        mobileNumber: authUser.phone || authUser.mobileNumber || mobileNumber || '',
        registeredAddress: line || authUser.address || '',
      };
    }
    return {
      title: 'Mr',
      nameFull: formData.nameFull || '',
      nic: formData.nic || '',
      dob: formData.dob || '',
      email: formData.email || '',
      mobileNumber: formData.mobileNumber || mobileNumber || '',
      registeredAddress: formData.address || '',
    };
  })();

  // Location choice: 'current' (registered address from OCR/profile) vs 'new'
  const [locationType, setLocationType] = useState('current');
  const [selectedCityObj, setSelectedCityObj] = useState(null);

  // Sync profile fields to state
  useEffect(() => {
    if (!setFields) return;
    setFields({
      title: knownProfile.title,
      nameFull: knownProfile.nameFull,
      nic: knownProfile.nic,
      dob: knownProfile.dob,
      email: knownProfile.email || formData.email || '',
      mobileNumber: knownProfile.mobileNumber || formData.mobileNumber || '',
      isExistingCustomer: selectedAccount ? 'yes' : 'no',
    });
  }, [selectedAccount, authUser]);

  // Sync address based on locationType
  useEffect(() => {
    if (!setFields) return;
    if (locationType === 'current') {
      const addr = knownProfile.registeredAddress || formData.address || '';
      setFields({
        installAddress: addr,
        address: addr,
        locationType: 'current',
      });
    } else {
      setFields({
        locationType: 'new',
      });
    }
  }, [locationType, knownProfile.registeredAddress]);

  const handleCitySelect = (e) => {
    const cityName = e.target.value;
    const match = SRI_LANKA_CITY_POSTAL_DATA.find((c) => c.city === cityName);
    setSelectedCityObj(match || null);

    if (setFields) {
      setFields({
        city: cityName,
        district: match?.district || '',
        postalCode: match?.postalCode || '',
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* ── Top Verified Profile Summary Card ── */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.75rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiUser color="#0056b3" /> Verified Customer Profile
          </h4>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <FiCheck size={12} /> Auto-Fetched from OCR
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '0.85rem 1.25rem' }}>
          <ReadOnlyDetail label="Full Name" value={knownProfile.nameFull} />
          <ReadOnlyDetail label="NIC / ID Number" value={knownProfile.nic} />
          <ReadOnlyDetail label="Verified Mobile" value={knownProfile.mobileNumber} />
          <ReadOnlyDetail label="Date of Birth" value={knownProfile.dob} />
        </div>
      </div>

      {/* ── Step Heading ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ color: '#0f172a', margin: '0 0 0.4rem 0', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Select Installation Location
        </h3>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
          Choose whether you want the new connection installed at your registered address or a new location.
        </p>
      </div>

      {/* ── Location Option Selection Tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {/* Tile 1: Current / Registered Address */}
        <div
          onClick={() => setLocationType('current')}
          style={{
            border: `2px solid ${locationType === 'current' ? '#0056b3' : '#e2e8f0'}`,
            backgroundColor: locationType === 'current' ? '#f0f7ff' : '#ffffff',
            borderRadius: '14px',
            padding: '1.25rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.98rem', color: locationType === 'current' ? '#0056b3' : '#1e293b', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FiMapPin size={16} /> Current / Registered Address
            </span>
            <input
              type="radio"
              name="locationOption"
              checked={locationType === 'current'}
              onChange={() => setLocationType('current')}
              style={{ accentColor: '#0056b3', width: '18px', height: '18px' }}
            />
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontWeight: 600, lineHeight: 1.4 }}>
            {knownProfile.registeredAddress || 'Registered address on file from your identity card / profile.'}
          </p>
        </div>

        {/* Tile 2: New Location */}
        <div
          onClick={() => setLocationType('new')}
          style={{
            border: `2px solid ${locationType === 'new' ? '#0056b3' : '#e2e8f0'}`,
            backgroundColor: locationType === 'new' ? '#f0f7ff' : '#ffffff',
            borderRadius: '14px',
            padding: '1.25rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.98rem', color: locationType === 'new' ? '#0056b3' : '#1e293b', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FiNavigation size={16} /> New Installation Location
            </span>
            <input
              type="radio"
              name="locationOption"
              checked={locationType === 'new'}
              onChange={() => setLocationType('new')}
              style={{ accentColor: '#0056b3', width: '18px', height: '18px' }}
            />
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontWeight: 500, lineHeight: 1.4 }}>
            Select a new city from dropdown and specify your premises address or pick on map.
          </p>
        </div>
      </div>

      {/* ── If New Location Selected: City Dropdown & Interactive Address Input ── */}
      {locationType === 'new' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #bfdbfe',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 15px rgba(0, 86, 179, 0.04)',
          }}
        >
          {/* 1. City Dropdown */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="nc-city-select"
              style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.45rem' }}
            >
              Select City / Area <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              id="nc-city-select"
              name="city"
              value={formData.city || ''}
              onChange={handleCitySelect}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                fontSize: '0.95rem',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontWeight: 600,
                outline: 'none',
              }}
              required
            >
              <option value="" disabled>
                -- Choose your city or area --
              </option>
              {SRI_LANKA_CITY_POSTAL_DATA.map((item) => (
                <option key={item.label} value={item.city}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Detailed Address & Map Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.45rem' }}>
              Street Address & Map Location <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <AddressInputWithMap
              name="installAddress"
              label="Installation Address"
              value={formData.installAddress || ''}
              onChange={handleChange}
              placeholder="e.g. No. 45, Temple Road, Mount Lavinia"
              required
            />
          </div>
        </motion.div>
      )}

      {/* ── Contact Email for Billing & Updates ── */}
      <div style={{ marginTop: '1.25rem' }}>
        <label htmlFor="nc-email" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.45rem' }}>
          <FiMail size={14} color="#64748b" /> Email Address (for order updates & e-bill)
        </label>
        <input
          id="nc-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="customer@example.com"
          value={formData.email || ''}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            fontSize: '0.95rem',
            borderRadius: '12px',
            border: '1.5px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: '#0f172a',
          }}
          required
        />
      </div>
    </motion.div>
  );
}
