import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUser, FiMapPin, FiMail, FiCheck, FiNavigation, FiPhoneCall, FiCompass, FiZap, FiCrosshair, FiMaximize2 } from 'react-icons/fi';
import AddressInputWithMap from '../../components/form/AddressInputWithMap';
import LocationPickerModal from '../../components/form/LocationPickerModal';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { useVerifiedContext } from '../../components/verification';
import { getAuthUser } from '../../utils/authSession';
import { motion } from 'framer-motion';
import WizardStepHeader from '../../components/wizard/WizardStepHeader';

export const SRI_LANKA_AREA_CODES = [
  { code: '011', label: '011 — Western (Colombo & Suburbs)', keywords: ['colombo', 'dehiwala', 'mount lavinia', 'nugegoda', 'maharagama', 'kottawa', 'battaramulla', 'kotte', 'malabe', 'rajagiriya', 'moratuwa', 'piliyandala', 'homagama', 'padukka', 'hanwella', 'hokandara', 'thalawathugoda', 'pannipitiya'] },
  { code: '031', label: '031 — Western (Negombo & Chilaw)', keywords: ['negombo', 'ja-ela', 'chilaw', 'marawila', 'dankotuwa', 'katunayake', 'seeduwa', 'kochchikade', 'mahawewa'] },
  { code: '033', label: '033 — Western (Gampaha & Mirigama)', keywords: ['gampaha', 'kelaniya', 'wattala', 'mirigama', 'nittambuwa', 'veyangoda', 'kandana', 'ragama', 'kadawatha', 'ganemulla', 'kiribathgoda', 'delgoda', 'yakkala'] },
  { code: '038', label: '038 — Western (Panadura, Kalutara, Horana)', keywords: ['panadura', 'kalutara', 'horana', 'wadduwa', 'beruwala', 'aluthgama', 'mathugama', 'bandaragama', 'payagala'] },
  { code: '081', label: '081 — Central (Kandy & Peradeniya)', keywords: ['kandy', 'peradeniya', 'gampola', 'katugastota', 'kundasale', 'digana', 'teldeniya', 'nawalapitiya', 'wattegama', 'akurana', 'menikhinna', 'kadugannawa'] },
  { code: '052', label: '052 — Central (Nuwara Eliya & Hatton)', keywords: ['nuwara eliya', 'hatton', 'dickoya', 'talawakele', 'nanu oya', 'ragala', 'maskeliya', 'bogawantalawa'] },
  { code: '066', label: '066 — Central (Matale)', keywords: ['matale', 'dambulla', 'sigiriya', 'galewela', 'rattota', 'ukuwela', 'palapathwela'] },
  { code: '091', label: '091 — Southern (Galle & Hikkaduwa)', keywords: ['galle', 'hikkaduwa', 'ambalangoda', 'karapitiya', 'elpitiya', 'unawatuna', 'ahungalla', 'bentota', 'baddegama', 'koggala'] },
  { code: '041', label: '041 — Southern (Matara & Weligama)', keywords: ['matara', 'weligama', 'dikwella', 'hakmana', 'kamburupitiya', 'mirissa', 'akuressa', 'deniyaya'] },
  { code: '047', label: '047 — Southern (Hambantota & Tangalle)', keywords: ['hambantota', 'tangalle', 'ambalantota', 'beliatta', 'tissamaharama', 'kataragama', 'suriyawewa'] },
  { code: '021', label: '021 — Northern (Jaffna & Islands)', keywords: ['jaffna', 'chavakachcheri', 'point pedro', 'nallur', 'valvettithurai', 'karainagar', 'kayts', 'chunnakam', 'kopay', 'tellippalai'] },
  { code: '024', label: '024 — Northern (Vavuniya)', keywords: ['vavuniya', 'cheddikulam', 'omanthai'] },
  { code: '037', label: '037 — North Western (Kurunegala)', keywords: ['kurunegala', 'kuliyapitiya', 'pannala', 'narammala', 'wariyapola', 'giriulla', 'maho', 'ibbagamuwa', 'alawwa'] },
  { code: '032', label: '032 — North Western (Puttalam)', keywords: ['puttalam', 'wennappuwa', 'nattandiya', 'anamaduwa', 'kalpitiya', 'bingiriya'] },
  { code: '025', label: '025 — North Central (Anuradhapura)', keywords: ['anuradhapura', 'kekirawa', 'eppawala', 'medawachchiya', 'mihintale', 'galenbindunuwewa', 'nochchiyagama'] },
  { code: '027', label: '027 — North Central (Polonnaruwa)', keywords: ['polonnaruwa', 'hingurakgoda', 'kaduruwela', 'medirigiriya', 'wilikada', 'dimbulagala'] },
  { code: '055', label: '055 — Uva (Badulla & Bandarawela)', keywords: ['badulla', 'bandarawela', 'ella', 'haputale', 'diyatalawa', 'welimada', 'mahiyanganaya', 'passara', 'hali ela'] },
  { code: '045', label: '045 — Sabaragamuwa (Ratnapura)', keywords: ['ratnapura', 'balangoda', 'embilipitiya', 'kuruwita', 'pelmadulla', 'kahawatta', 'eheliyagoda'] },
  { code: '035', label: '035 — Sabaragamuwa (Kegalle)', keywords: ['kegalle', 'mawanella', 'rambukkana', 'warakapola', 'deraniyagala', 'ruwanwella', 'yatiyantota'] },
  { code: '026', label: '026 — Eastern (Trincomalee)', keywords: ['trincomalee', 'kinniya', 'mutur', 'kantale', 'nilaveli'] },
  { code: '065', label: '065 — Eastern (Batticaloa)', keywords: ['batticaloa', 'kattankudy', 'valaichchenai', 'eravur', 'kaluwanchikudy'] },
  { code: '067', label: '067 — Eastern (Ampara & Kalmunai)', keywords: ['ampara', 'kalmunai', 'samanthurai', 'akkaraipattu', 'pottuvil', 'arugam bay'] },
];

export function autoDetectAreaCode(addressStr) {
  if (!addressStr || typeof addressStr !== 'string') return null;
  const lower = addressStr.toLowerCase();
  for (const item of SRI_LANKA_AREA_CODES) {
    for (const kw of item.keywords) {
      if (lower.includes(kw)) {
        return item;
      }
    }
  }
  return null;
}

export const SRI_LANKA_CITY_POSTAL_DATA = [
  // ── Colombo Service Areas (Available for Fibre Loop in Demo) ──
  { label: 'Colombo 01 (Fort) - 00100', city: 'Colombo 01', district: 'Colombo', postalCode: '00100', areaCode: '011', fibreAvailable: true },
  { label: 'Colombo 02 (Slave Island) - 00200', city: 'Colombo 02', district: 'Colombo', postalCode: '00200', areaCode: '011', fibreAvailable: true },
  { label: 'Colombo 03 (Kollupitiya) - 00300', city: 'Colombo 03', district: 'Colombo', postalCode: '00300', areaCode: '011', fibreAvailable: true },
  { label: 'Colombo 04 (Bambalapitiya) - 00400', city: 'Colombo 04', district: 'Colombo', postalCode: '00400', areaCode: '011', fibreAvailable: true },
  { label: 'Colombo 05 (Havelock Town) - 00500', city: 'Colombo 05', district: 'Colombo', postalCode: '00500', areaCode: '011', fibreAvailable: true },
  { label: 'Colombo 06 (Wellawatte) - 00600', city: 'Colombo 06', district: 'Colombo', postalCode: '00600', areaCode: '011', fibreAvailable: true },
  { label: 'Colombo 07 (Cinnamon Gardens) - 00700', city: 'Colombo 07', district: 'Colombo', postalCode: '00700', areaCode: '011', fibreAvailable: true },
  { label: 'Colombo 08 (Borella) - 00800', city: 'Colombo 08', district: 'Colombo', postalCode: '00800', areaCode: '011', fibreAvailable: true },
  { label: 'Colombo 09 (Dematagoda) - 00900', city: 'Colombo 09', district: 'Colombo', postalCode: '00900', areaCode: '011', fibreAvailable: true },
  { label: 'Colombo 10 (Maradana) - 01000', city: 'Colombo 10', district: 'Colombo', postalCode: '01000', areaCode: '011', fibreAvailable: true },
  { label: 'Colombo 11 (Pettah) - 01100', city: 'Colombo 11', district: 'Colombo', postalCode: '01100', areaCode: '011', fibreAvailable: true },
  { label: 'Colombo 12 (Hulftsdorp) - 01200', city: 'Colombo 12', district: 'Colombo', postalCode: '01200', areaCode: '011', fibreAvailable: true },
  { label: 'Colombo 13 (Kotahena) - 01300', city: 'Colombo 13', district: 'Colombo', postalCode: '01300', areaCode: '011', fibreAvailable: true },
  { label: 'Colombo 14 (Grandpass) - 01400', city: 'Colombo 14', district: 'Colombo', postalCode: '01400', areaCode: '011', fibreAvailable: true },
  { label: 'Colombo 15 (Modara) - 01500', city: 'Colombo 15', district: 'Colombo', postalCode: '01500', areaCode: '011', fibreAvailable: true },
  { label: 'Dehiwala - 10350', city: 'Dehiwala', district: 'Colombo', postalCode: '10350', areaCode: '011', fibreAvailable: true },
  { label: 'Mount Lavinia - 10370', city: 'Mount Lavinia', district: 'Colombo', postalCode: '10370', areaCode: '011', fibreAvailable: true },
  { label: 'Nugegoda - 10250', city: 'Nugegoda', district: 'Colombo', postalCode: '10250', areaCode: '011', fibreAvailable: true },
  { label: 'Maharagama - 10280', city: 'Maharagama', district: 'Colombo', postalCode: '10280', areaCode: '011', fibreAvailable: true },
  { label: 'Kottawa - 10230', city: 'Kottawa', district: 'Colombo', postalCode: '10230', areaCode: '011', fibreAvailable: true },
  { label: 'Battaramulla - 10120', city: 'Battaramulla', district: 'Colombo', postalCode: '10120', areaCode: '011', fibreAvailable: true },
  { label: 'Sri Jayawardenepura Kotte - 10100', city: 'Sri Jayawardenepura Kotte', district: 'Colombo', postalCode: '10100', areaCode: '011', fibreAvailable: true },
  { label: 'Malabe - 10115', city: 'Malabe', district: 'Colombo', postalCode: '10115', areaCode: '011', fibreAvailable: true },
  { label: 'Rajagiriya - 10107', city: 'Rajagiriya', district: 'Colombo', postalCode: '10107', areaCode: '011', fibreAvailable: true },
  { label: 'Moratuwa - 10400', city: 'Moratuwa', district: 'Colombo', postalCode: '10400', areaCode: '011', fibreAvailable: true },
  { label: 'Piliyandala - 10300', city: 'Piliyandala', district: 'Colombo', postalCode: '10300', areaCode: '011', fibreAvailable: true },

  // ── Other Regions ──
  { label: 'Gampaha - 11000', city: 'Gampaha', district: 'Gampaha', postalCode: '11000', areaCode: '033', fibreAvailable: false },
  { label: 'Negombo - 11500', city: 'Negombo', district: 'Gampaha', postalCode: '11500', areaCode: '031', fibreAvailable: false },
  { label: 'Ja-Ela - 11350', city: 'Ja-Ela', district: 'Gampaha', postalCode: '11350', areaCode: '031', fibreAvailable: false },
  { label: 'Kelaniya - 11600', city: 'Kelaniya', district: 'Gampaha', postalCode: '11600', areaCode: '033', fibreAvailable: false },
  { label: 'Wattala - 11300', city: 'Wattala', district: 'Gampaha', postalCode: '11300', areaCode: '033', fibreAvailable: false },
  { label: 'Kandy - 20000', city: 'Kandy', district: 'Kandy', postalCode: '20000', areaCode: '081', fibreAvailable: false },
  { label: 'Peradeniya - 20400', city: 'Peradeniya', district: 'Kandy', postalCode: '20400', areaCode: '081', fibreAvailable: false },
  { label: 'Gampola - 20500', city: 'Gampola', district: 'Kandy', postalCode: '20500', areaCode: '081', fibreAvailable: false },
  { label: 'Dickoya - 22050', city: 'Dickoya', district: 'Nuwara Eliya', postalCode: '22050', areaCode: '052', fibreAvailable: false },
  { label: 'Hatton - 22000', city: 'Hatton', district: 'Nuwara Eliya', postalCode: '22000', areaCode: '052', fibreAvailable: false },
  { label: 'Nuwara Eliya (Rural) - 22200', city: 'Nuwara Eliya (Rural)', district: 'Nuwara Eliya', postalCode: '22200', areaCode: '052', fibreAvailable: false },
  { label: 'Galle - 80000', city: 'Galle', district: 'Galle', postalCode: '80000', areaCode: '091', fibreAvailable: false },
  { label: 'Hikkaduwa - 80240', city: 'Hikkaduwa', district: 'Galle', postalCode: '80240', areaCode: '091', fibreAvailable: false },
  { label: 'Matara - 81000', city: 'Matara', district: 'Matara', postalCode: '81000', areaCode: '041', fibreAvailable: false },
  { label: 'Jaffna - 40000', city: 'Jaffna', district: 'Jaffna', postalCode: '40000', areaCode: '021', fibreAvailable: false },
  { label: 'Kurunegala - 60000', city: 'Kurunegala', district: 'Kurunegala', postalCode: '60000', areaCode: '037', fibreAvailable: false },
  { label: 'Anuradhapura - 50000', city: 'Anuradhapura', district: 'Anuradhapura', postalCode: '50000', areaCode: '025', fibreAvailable: false },
  { label: 'Badulla - 90000', city: 'Badulla', district: 'Badulla', postalCode: '90000', areaCode: '055', fibreAvailable: false },
  { label: 'Ratnapura - 70000', city: 'Ratnapura', district: 'Ratnapura', postalCode: '70000', areaCode: '045', fibreAvailable: false },
  { label: 'Trincomalee - 31000', city: 'Trincomalee', district: 'Trincomalee', postalCode: '31000', areaCode: '026', fibreAvailable: false },
  { label: 'Batticaloa - 30000', city: 'Batticaloa', district: 'Batticaloa', postalCode: '30000', areaCode: '065', fibreAvailable: false },
  { label: 'Vavuniya (Outskirts) - 43000', city: 'Vavuniya (Outskirts)', district: 'Vavuniya', postalCode: '43000', areaCode: '024', fibreAvailable: false },
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
  const [autoDetectedPill, setAutoDetectedPill] = useState('');

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
        registeredAddress: formData.address || '',
      };
    }
    return {
      title: '',
      nameFull: '',
      nic: '',
      dob: '',
      email: formData.email || '',
      mobileNumber: formData.mobileNumber || mobileNumber || '',
      registeredAddress: formData.address || '',
    };
  })();

  // Location choice: 'current' (Old / Registered Service Location) vs 'new' (New Installation Location)
  const [locationType, setLocationType] = useState(formData.locationType || (knownProfile.registeredAddress ? 'current' : 'new'));

  // Sync profile fields to state
  useEffect(() => {
    if (!setFields) return;
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
      isExistingCustomer: selectedAccount || customerExists ? 'yes' : 'no',
    });
  }, [selectedAccount, authUser, customerExists]);

  // Sync address based on locationType
  useEffect(() => {
    if (!setFields) return;
    if (locationType === 'current') {
      const addr = knownProfile.registeredAddress || formData.address || '';
      const matched = autoDetectAreaCode(addr);
      setFields({
        installAddress: addr,
        address: addr,
        locationType: 'current',
        areaCode: matched ? matched.code : (formData.areaCode || '011'),
      });
      if (matched) {
        setAutoDetectedPill(`Auto-selected ${matched.code} for registered address`);
      }
    } else {
      setFields({
        locationType: 'new',
      });
    }
  }, [locationType, knownProfile.registeredAddress]);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  // Handle location coordinates selection from map or GPS
  const handleLocationSelect = (coords, addressText) => {
    if (!setFields) return;
    const newAddr = addressText || formData.installAddress || formData.address || '';
    const matched = autoDetectAreaCode(newAddr);
    setFields({
      installAddress: newAddr,
      address: newAddr,
      latitude: coords.lat,
      longitude: coords.lng,
      gpsCoordinates: coords,
      ...(matched ? { areaCode: matched.code } : {}),
    });
    if (matched) {
      setAutoDetectedPill(`Auto-selected Area Code ${matched.code} from GPS location`);
    }
  };

  // Direct High-Accuracy Device GPS Detection
  const handleDirectGpsDetect = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const cleanAddr = data?.display_name || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
          handleLocationSelect({ lat, lng }, cleanAddr);
          toast.success(`GPS Location locked: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`);
        } catch {
          handleLocationSelect({ lat, lng }, `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
          toast.success(`GPS Location locked: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`);
        } finally {
          setDetectingGps(false);
        }
      },
      (err) => {
        setDetectingGps(false);
        toast.error(err.code === 1 ? 'GPS location access denied.' : 'Unable to acquire GPS signal.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle address input change (typing, map picking, current GPS location)
  const handleAddressInputChange = (e) => {
    if (handleChange) handleChange(e);
    const newAddressVal = e.target.value;
    const matched = autoDetectAreaCode(newAddressVal);
    const updates = {
      installAddress: newAddressVal,
      address: newAddressVal,
    };
    if (e.coords) {
      updates.latitude = e.coords.lat;
      updates.longitude = e.coords.lng;
      updates.gpsCoordinates = e.coords;
    }
    if (matched) {
      updates.areaCode = matched.code;
      setAutoDetectedPill(`Auto-selected Area Code ${matched.code} from address`);
    }
    if (setFields) {
      setFields(updates);
    }
  };

  const handleCitySelect = (e) => {
    const cityName = e.target.value;
    const match = SRI_LANKA_CITY_POSTAL_DATA.find((c) => c.city === cityName);

    if (setFields) {
      const updates = {
        city: cityName,
        district: match?.district || '',
        postalCode: match?.postalCode || '',
        areaCode: match?.areaCode || formData.areaCode || '011',
      };
      if (!formData.installAddress || formData.installAddress === formData.city || formData.installAddress.trim() === '') {
        updates.installAddress = match ? `${match.city}, ${match.district}` : cityName;
        updates.address = updates.installAddress;
      }
      setFields(updates);
    }

  };

  const handleAreaCodeSelect = (e) => {
    const selectedCode = e.target.value;
    if (setFields) {
      setFields({
        areaCode: selectedCode,
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <WizardStepHeader 
        stepNumber={4} 
        totalSteps={9} 
        title="Service Location Selection" 
        description="Select your installation address. Pick from your existing service location, search address, pick on map, or use your current location." 
      />

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

      {/* ── Location Option Selection Tiles for Existing Customer (Old vs New Location) ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.85rem 0' }}>
          Choose Service Installation Option
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Option 1: Old / Registered Service Location (for Existing Customer) */}
          <div
            onClick={() => setLocationType('current')}
            style={{
              border: `2px solid ${locationType === 'current' ? '#0f57a8' : '#e2e8f0'}`,
              backgroundColor: locationType === 'current' ? '#f0f7ff' : '#ffffff',
              borderRadius: '14px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              boxShadow: locationType === 'current' ? '0 4px 14px rgba(15, 87, 168, 0.1)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.98rem', color: locationType === 'current' ? '#0f57a8' : '#1e293b', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FiMapPin size={16} /> Old / Registered Service Location
              </span>
              <input
                type="radio"
                name="locationOption"
                checked={locationType === 'current'}
                onChange={() => setLocationType('current')}
                style={{ accentColor: '#0f57a8', width: '18px', height: '18px' }}
              />
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontWeight: 600, lineHeight: 1.4 }}>
              {knownProfile.registeredAddress || 'Use existing registered account service address.'}
            </p>
          </div>

          {/* Option 2: New Installation Location */}
          <div
            onClick={() => setLocationType('new')}
            style={{
              border: `2px solid ${locationType === 'new' ? '#0f57a8' : '#e2e8f0'}`,
              backgroundColor: locationType === 'new' ? '#f0f7ff' : '#ffffff',
              borderRadius: '14px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              boxShadow: locationType === 'new' ? '0 4px 14px rgba(15, 87, 168, 0.1)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.98rem', color: locationType === 'new' ? '#0f57a8' : '#1e293b', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FiNavigation size={16} /> New Installation Location
              </span>
              <input
                type="radio"
                name="locationOption"
                checked={locationType === 'new'}
                onChange={() => setLocationType('new')}
                style={{ accentColor: '#0f57a8', width: '18px', height: '18px' }}
              />
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontWeight: 500, lineHeight: 1.4 }}>
              Specify a new installation location, select area code, pick on map, or use current location.
            </p>
          </div>
        </div>
      </div>

      {/* ── If New Location Selected: Area Code, City Dropdown & Interactive Address Input with GPS / Map Picker ── */}
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
          <div style={{ marginBottom: '1.25rem' }}>
            {/* City / Area Dropdown */}
            <div>
              <label
                htmlFor="nc-city-select"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.45rem' }}
              >
                <FiCompass size={15} color="#0f57a8" /> Select City / Region <span style={{ color: '#dc2626' }}>*</span>
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
                  -- Choose city or area --
                </option>
                {SRI_LANKA_CITY_POSTAL_DATA.map((item) => (
                  <option key={item.label} value={item.city}>
                    {item.label}
                  </option>
                ))}
              </select>

              {formData.city && (() => {
                const selectedCityData = SRI_LANKA_CITY_POSTAL_DATA.find((item) => item.city === formData.city);
                const isFibreReq = /fibre|fiber|ftth/i.test(selectedProduct?.productName || selectedProduct?.name || selectedProduct?.category || '');
                if (selectedCityData?.fibreAvailable === false && isFibreReq) {
                  return (
                    <div style={{ marginTop: '0.55rem', padding: '0.55rem 0.85rem', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', fontSize: '0.82rem', color: '#c2410c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <FiZap size={15} color="#ea580c" style={{ flexShrink: 0 }} />
                      <span>Fibre loop is not available in <strong>{selectedCityData.city}</strong> (Colombo areas only in demo). You can choose our 4G LTE Home Broadband network instead.</span>
                    </div>
                  );
                } else if (selectedCityData?.fibreAvailable && isFibreReq) {
                  return (
                    <div style={{ marginTop: '0.55rem', padding: '0.55rem 0.85rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '0.82rem', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <FiCheck size={15} color="#16a34a" style={{ flexShrink: 0 }} />
                      <span>Fibre loop coverage confirmed in <strong>{selectedCityData.city}</strong> (Colombo Demo Area).</span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          {/* Detailed Address Input with Map Pin & Current Location Detection */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Street Address &amp; Exact Location <span style={{ color: '#dc2626' }}>*</span>
              </label>

              {/* Direct GPS Quick Trigger */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={handleDirectGpsDetect}
                  disabled={detectingGps}
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#0f57a8',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <FiCrosshair size={12} />
                  {detectingGps ? 'Locking GPS...' : 'Auto-Detect GPS'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#166534',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <FiMapPin size={12} />
                  Pick Exact Spot on Map
                </button>
              </div>
            </div>

            <AddressInputWithMap
              name="installAddress"
              label=""
              value={formData.installAddress || ''}
              onChange={handleAddressInputChange}
              onLocationSelect={handleLocationSelect}
              selectedCoords={formData.latitude && formData.longitude ? { lat: formData.latitude, lng: formData.longitude } : null}
              placeholder="Enter installation address, click 'Pick on Map', or 'Detect My Location'..."
              required
            />

            {/* GPS Locked Confirmation Box & Mini Map Preview */}
            {formData.latitude && formData.longitude ? (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: '14px',
                  padding: '1rem',
                  marginTop: '0.85rem',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'grid', placeItems: 'center' }}>
                      <FiCheck size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#166534', letterSpacing: '0.5px' }}>
                        Exact GPS Location Selected
                      </span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                        Lat: {Number(formData.latitude).toFixed(5)}° N, Lng: {Number(formData.longitude).toFixed(5)}° E
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMapModalOpen(true)}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #86efac',
                      color: '#15803d',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '8px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <FiMaximize2 size={12} />
                    Adjust Exact Pin
                  </button>
                </div>

                {/* Leaflet Mini Map Preview */}
                <div style={{ height: '180px', width: '100%', borderRadius: '10px', overflow: 'hidden', border: '1px solid #bbf7d0', position: 'relative' }}>
                  <MapContainer
                    center={[formData.latitude, formData.longitude]}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[formData.latitude, formData.longitude]} />
                  </MapContainer>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      color: '#ffffff',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      zIndex: 1000,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    📍 Verified Installation Pin (OSS Ready)
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  marginTop: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  <FiCompass color="#0f57a8" size={16} />
                  <span>Pin exact location on map or use GPS to qualify Fibre FDP &amp; LTE coverage in next step.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  style={{
                    backgroundColor: '#0f57a8',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Pin Location on Map
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Standalone Map Modal triggered directly from CustomerInfoStep */}
      <LocationPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectAddress={handleLocationSelect}
        initialAddress={formData.installAddress || formData.address}
      />

    </motion.div>
  );
}
