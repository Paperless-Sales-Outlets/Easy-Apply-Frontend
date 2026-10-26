import React, { useState, useEffect } from 'react';
import { FiUser, FiMapPin, FiCheck, FiNavigation } from 'react-icons/fi';
import AddressInputWithMap from '../../components/form/AddressInputWithMap';
import { useVerifiedContext } from '../../components/verification';
import { getAuthUser } from '../../utils/authSession';
import { motion } from 'framer-motion';
import WizardStepHeader from '../../components/wizard/WizardStepHeader';

export const SRI_LANKA_CITY_POSTAL_DATA = [
  { label: 'Colombo 01 (Fort)', city: 'Colombo 01', district: 'Colombo', postalCode: '00100', lat: 6.9344, lng: 79.8428 },
  { label: 'Colombo 02 (Slave Island)', city: 'Colombo 02', district: 'Colombo', postalCode: '00200', lat: 6.9214, lng: 79.8560 },
  { label: 'Colombo 03 (Kollupitiya)', city: 'Colombo 03', district: 'Colombo', postalCode: '00300', lat: 6.9056, lng: 79.8519 },
  { label: 'Colombo 04 (Bambalapitiya)', city: 'Colombo 04', district: 'Colombo', postalCode: '00400', lat: 6.8905, lng: 79.8561 },
  { label: 'Colombo 05 (Havelock Town)', city: 'Colombo 05', district: 'Colombo', postalCode: '00500', lat: 6.8824, lng: 79.8703 },
  { label: 'Colombo 06 (Wellawatte)', city: 'Colombo 06', district: 'Colombo', postalCode: '00600', lat: 6.8741, lng: 79.8606 },
  { label: 'Colombo 07 (Cinnamon Gardens)', city: 'Colombo 07', district: 'Colombo', postalCode: '00700', lat: 6.9070, lng: 79.8670 },
  { label: 'Colombo 08 (Borella)', city: 'Colombo 08', district: 'Colombo', postalCode: '00800', lat: 6.9175, lng: 79.8805 },
  { label: 'Colombo 09 (Dematagoda)', city: 'Colombo 09', district: 'Colombo', postalCode: '00900', lat: 6.9312, lng: 79.8800 },
  { label: 'Colombo 10 (Maradana)', city: 'Colombo 10', district: 'Colombo', postalCode: '01000', lat: 6.9250, lng: 79.8680 },
  { label: 'Colombo 11 (Pettah)', city: 'Colombo 11', district: 'Colombo', postalCode: '01100', lat: 6.9370, lng: 79.8510 },
  { label: 'Colombo 12 (Hulftsdorp)', city: 'Colombo 12', district: 'Colombo', postalCode: '01200', lat: 6.9360, lng: 79.8570 },
  { label: 'Colombo 13 (Kotahena)', city: 'Colombo 13', district: 'Colombo', postalCode: '01300', lat: 6.9480, lng: 79.8640 },
  { label: 'Colombo 14 (Grandpass)', city: 'Colombo 14', district: 'Colombo', postalCode: '01400', lat: 6.9530, lng: 79.8720 },
  { label: 'Colombo 15 (Modara)', city: 'Colombo 15', district: 'Colombo', postalCode: '01500', lat: 6.9680, lng: 79.8750 },
  { label: 'Dehiwala', city: 'Dehiwala', district: 'Colombo', postalCode: '10350', lat: 6.8511, lng: 79.8659 },
  { label: 'Mount Lavinia', city: 'Mount Lavinia', district: 'Colombo', postalCode: '10370', lat: 6.8344, lng: 79.8653 },
  { label: 'Nugegoda', city: 'Nugegoda', district: 'Colombo', postalCode: '10250', lat: 6.8649, lng: 79.8997 },
  { label: 'Maharagama', city: 'Maharagama', district: 'Colombo', postalCode: '10280', lat: 6.8480, lng: 79.9268 },
  { label: 'Kottawa', city: 'Kottawa', district: 'Colombo', postalCode: '10230', lat: 6.8413, lng: 79.9654 },
  { label: 'Battaramulla', city: 'Battaramulla', district: 'Colombo', postalCode: '10120', lat: 6.8986, lng: 79.9222 },
  { label: 'Sri Jayawardenepura Kotte', city: 'Sri Jayawardenepura Kotte', district: 'Colombo', postalCode: '10100', lat: 6.8914, lng: 79.9048 },
  { label: 'Malabe', city: 'Malabe', district: 'Colombo', postalCode: '10115', lat: 6.9042, lng: 79.9549 },
  { label: 'Rajagiriya', city: 'Rajagiriya', district: 'Colombo', postalCode: '10107', lat: 6.9092, lng: 79.8938 },
  { label: 'Moratuwa', city: 'Moratuwa', district: 'Colombo', postalCode: '10400', lat: 6.7730, lng: 79.8816 },
  { label: 'Piliyandala', city: 'Piliyandala', district: 'Colombo', postalCode: '10300', lat: 6.7989, lng: 79.9229 },
  { label: 'Gampaha', city: 'Gampaha', district: 'Gampaha', postalCode: '11000', lat: 7.0840, lng: 79.9939 },
  { label: 'Negombo', city: 'Negombo', district: 'Gampaha', postalCode: '11500', lat: 7.2008, lng: 79.8737 },
  { label: 'Ja-Ela', city: 'Ja-Ela', district: 'Gampaha', postalCode: '11350', lat: 7.0744, lng: 79.8920 },
  { label: 'Kelaniya', city: 'Kelaniya', district: 'Gampaha', postalCode: '11600', lat: 6.9553, lng: 79.9220 },
  { label: 'Wattala', city: 'Wattala', district: 'Gampaha', postalCode: '11300', lat: 6.9895, lng: 79.8923 },
  { label: 'Kandy', city: 'Kandy', district: 'Kandy', postalCode: '20000', lat: 7.2906, lng: 80.6337 },
  { label: 'Peradeniya', city: 'Peradeniya', district: 'Kandy', postalCode: '20400', lat: 7.2600, lng: 80.5960 },
  { label: 'Gampola', city: 'Gampola', district: 'Kandy', postalCode: '20500', lat: 7.1643, lng: 80.5694 },
  { label: 'Dickoya', city: 'Dickoya', district: 'Nuwara Eliya', postalCode: '22050', lat: 6.8700, lng: 80.6000 },
  { label: 'Hatton', city: 'Hatton', district: 'Nuwara Eliya', postalCode: '22000', lat: 6.8967, lng: 80.5956 },
  { label: 'Nuwara Eliya', city: 'Nuwara Eliya', district: 'Nuwara Eliya', postalCode: '22200', lat: 6.9497, lng: 80.7891 },
  { label: 'Galle', city: 'Galle', district: 'Galle', postalCode: '80000', lat: 6.0535, lng: 80.2210 },
  { label: 'Hikkaduwa', city: 'Hikkaduwa', district: 'Galle', postalCode: '80240', lat: 6.1408, lng: 80.1017 },
  { label: 'Matara', city: 'Matara', district: 'Matara', postalCode: '81000', lat: 5.9549, lng: 80.5550 },
  { label: 'Jaffna', city: 'Jaffna', district: 'Jaffna', postalCode: '40000', lat: 9.6615, lng: 80.0255 },
  { label: 'Kurunegala', city: 'Kurunegala', district: 'Kurunegala', postalCode: '60000', lat: 7.4863, lng: 80.3623 },
  { label: 'Anuradhapura', city: 'Anuradhapura', district: 'Anuradhapura', postalCode: '50000', lat: 8.3114, lng: 80.4037 },
  { label: 'Badulla', city: 'Badulla', district: 'Badulla', postalCode: '90000', lat: 6.9934, lng: 81.0550 },
  { label: 'Ratnapura', city: 'Ratnapura', district: 'Ratnapura', postalCode: '70000', lat: 6.6828, lng: 80.4035 },
  { label: 'Trincomalee', city: 'Trincomalee', district: 'Trincomalee', postalCode: '31000', lat: 8.5874, lng: 81.2152 },
  { label: 'Batticaloa', city: 'Batticaloa', district: 'Batticaloa', postalCode: '30000', lat: 7.7310, lng: 81.6747 },
  { label: 'Vavuniya', city: 'Vavuniya', district: 'Vavuniya', postalCode: '43000', lat: 8.7514, lng: 80.4971 },
];

export const findClosestCity = (lat, lng) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') return { closest: null, distanceDeg: Infinity };
  let closest = null;
  let minDistance = Infinity;
  for (const item of SRI_LANKA_CITY_POSTAL_DATA) {
    if (typeof item.lat === 'number' && typeof item.lng === 'number') {
      const d = Math.hypot(item.lat - lat, item.lng - lng);
      if (d < minDistance) {
        minDistance = d;
        closest = item;
      }
    }
  }
  return { closest, distanceDeg: minDistance };
};

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

export default function CustomerInfoStep({ formData, handleChange, setFields }) {
  const { mobileNumber, selectedAccount } = useVerifiedContext();
  const [authUser] = useState(getAuthUser);

  // Retrieve user identity from verified context or OCR registration
  const knownProfile = (() => {
    const sanitizeNic = (val) => {
      if (!val || typeof val !== 'string') return '';
      if (val.startsWith('NIC-')) return '';
      return val;
    };

    if (selectedAccount) {
      return {
        title: selectedAccount.title || 'Mr',
        nameFull: selectedAccount.fullName || selectedAccount.customerName || '',
        nic: sanitizeNic(selectedAccount.nic || ''),
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
        nic: sanitizeNic(authUser.NIC || authUser.nic || ''),
        dob: authUser.dob || '',
        email: authUser.email || '',
        mobileNumber: authUser.phone || authUser.mobileNumber || mobileNumber || '',
        registeredAddress: line || authUser.address || '',
      };
    }
    return {
      title: 'Mr',
      nameFull: formData.nameFull || '',
      nic: sanitizeNic(formData.nic || ''),
      dob: formData.dob || '',
      email: formData.email || '',
      mobileNumber: formData.mobileNumber || mobileNumber || '',
      registeredAddress: formData.address || '',
    };
  })();

  // Location choice: 'current' (registered address from OCR/profile) vs 'new'
  const [locationType, setLocationType] = useState(formData.locationType || (knownProfile.registeredAddress ? 'current' : 'new'));

  // Sync profile fields to state
  useEffect(() => {
    if (!setFields) return;
    // Only fill what is known — identity details are captured later from the NIC
    // and must survive the customer coming back to this step.
    const known = {
      title: knownProfile.title,
      nameFull: knownProfile.nameFull,
      nic: knownProfile.nic,
      dob: knownProfile.dob,
      email: knownProfile.email || formData.email,
      mobileNumber: knownProfile.mobileNumber || formData.mobileNumber,
    };
    setFields({
      ...Object.fromEntries(Object.entries(known).filter(([, v]) => v)),
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

  const currentCityMatch = SRI_LANKA_CITY_POSTAL_DATA.find((c) => c.city === formData.city) || null;
  const currentCityCoords = currentCityMatch && currentCityMatch.lat && currentCityMatch.lng
    ? { lat: currentCityMatch.lat, lng: currentCityMatch.lng }
    : (formData.latitude && formData.longitude ? { lat: Number(formData.latitude), lng: Number(formData.longitude) } : null);

  const handleCitySelect = (e) => {
    const cityName = e.target.value;
    const match = SRI_LANKA_CITY_POSTAL_DATA.find((c) => c.city === cityName);

    if (setFields) {
      setFields({
        city: cityName,
        district: match?.district || '',
        postalCode: match?.postalCode || '',
        latitude: match?.lat || null,
        longitude: match?.lng || null,
      });
    }
  };

  const handleLocationSelect = ({ address, coords, details }) => {
    const updates = {
      installAddress: address,
      address,
    };

    if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
      updates.latitude = coords.lat;
      updates.longitude = coords.lng;

      // Reverse synchronize: detect closest city/area from map coordinates
      const { closest, distanceDeg } = findClosestCity(coords.lat, coords.lng);
      if (closest && distanceDeg < 0.45) {
        updates.city = closest.city;
        updates.district = closest.district;
        updates.postalCode = closest.postalCode;
      } else if (details?.city) {
        // Fallback: match by city/suburb text from reverse geocode
        const nameMatch = SRI_LANKA_CITY_POSTAL_DATA.find(
          (c) =>
            c.city.toLowerCase().includes(details.city.toLowerCase()) ||
            details.city.toLowerCase().includes(c.city.toLowerCase())
        );
        if (nameMatch) {
          updates.city = nameMatch.city;
          updates.district = nameMatch.district;
          updates.postalCode = nameMatch.postalCode;
        }
      }
    }

    if (setFields) {
      setFields(updates);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <WizardStepHeader 
        stepNumber={2} 
        totalSteps={7} 
        title="Service Location Map" 
        description="Pin the location where the SLT service will be installed or select from your saved addresses." 
      />

      {/* ── Top Verified Profile Summary Card (Reference Image 2) ── */}
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
            <FiUser color="#0f57a8" /> Contact Details & Verification
          </h4>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <FiCheck size={12} /> Verified by OTP
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '0.85rem 1.25rem' }}>
          <ReadOnlyDetail label="Mobile Number" value={knownProfile.mobileNumber && `+94 ${knownProfile.mobileNumber}`} />
          <ReadOnlyDetail label="Email Address" value={knownProfile.email || formData.email || 'name@example.com'} />
        </div>
      </div>

      {/* ── Location Option Selection Tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {/* Tile 1: Current / Registered Address — only when SLT already holds one */}
        {knownProfile.registeredAddress && <div
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
            {knownProfile.registeredAddress}
          </p>
        </div>}

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
              onLocationSelect={handleLocationSelect}
              defaultCenter={currentCityCoords}
              placeholder="e.g. No. 45, Temple Road, Mount Lavinia"
              required
            />
          </div>
        </motion.div>
      )}

      {/* ── Contact Email for Billing & Updates (Passed from verified session) ── */}
      <input
        type="hidden"
        name="email"
        value={knownProfile.email || formData.email || ''}
      />
    </motion.div>
  );
}
