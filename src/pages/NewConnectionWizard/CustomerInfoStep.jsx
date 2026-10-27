import React, { useState, useEffect } from 'react';
import { FiUser, FiMapPin, FiCheck, FiNavigation, FiCompass, FiZap, FiCrosshair, FiMaximize2, FiHome } from 'react-icons/fi';
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
  { label: 'Colombo 01 (Fort)', city: 'Colombo 01', district: 'Colombo', postalCode: '00100', areaCode: '011', fibreAvailable: true, lat: 6.9344, lng: 79.8428 },
  { label: 'Colombo 02 (Slave Island)', city: 'Colombo 02', district: 'Colombo', postalCode: '00200', areaCode: '011', fibreAvailable: true, lat: 6.9214, lng: 79.8560 },
  { label: 'Colombo 03 (Kollupitiya)', city: 'Colombo 03', district: 'Colombo', postalCode: '00300', areaCode: '011', fibreAvailable: true, lat: 6.9056, lng: 79.8519 },
  { label: 'Colombo 04 (Bambalapitiya)', city: 'Colombo 04', district: 'Colombo', postalCode: '00400', areaCode: '011', fibreAvailable: true, lat: 6.8905, lng: 79.8561 },
  { label: 'Colombo 05 (Havelock Town)', city: 'Colombo 05', district: 'Colombo', postalCode: '00500', areaCode: '011', fibreAvailable: true, lat: 6.8824, lng: 79.8703 },
  { label: 'Colombo 06 (Wellawatte)', city: 'Colombo 06', district: 'Colombo', postalCode: '00600', areaCode: '011', fibreAvailable: true, lat: 6.8741, lng: 79.8606 },
  { label: 'Colombo 07 (Cinnamon Gardens)', city: 'Colombo 07', district: 'Colombo', postalCode: '00700', areaCode: '011', fibreAvailable: true, lat: 6.9070, lng: 79.8670 },
  { label: 'Colombo 08 (Borella)', city: 'Colombo 08', district: 'Colombo', postalCode: '00800', areaCode: '011', fibreAvailable: true, lat: 6.9175, lng: 79.8805 },
  { label: 'Colombo 09 (Dematagoda)', city: 'Colombo 09', district: 'Colombo', postalCode: '00900', areaCode: '011', fibreAvailable: true, lat: 6.9312, lng: 79.8800 },
  { label: 'Colombo 10 (Maradana)', city: 'Colombo 10', district: 'Colombo', postalCode: '01000', areaCode: '011', fibreAvailable: true, lat: 6.9250, lng: 79.8680 },
  { label: 'Colombo 11 (Pettah)', city: 'Colombo 11', district: 'Colombo', postalCode: '01100', areaCode: '011', fibreAvailable: true, lat: 6.9370, lng: 79.8510 },
  { label: 'Colombo 12 (Hulftsdorp)', city: 'Colombo 12', district: 'Colombo', postalCode: '01200', areaCode: '011', fibreAvailable: true, lat: 6.9360, lng: 79.8570 },
  { label: 'Colombo 13 (Kotahena)', city: 'Colombo 13', district: 'Colombo', postalCode: '01300', areaCode: '011', fibreAvailable: true, lat: 6.9480, lng: 79.8640 },
  { label: 'Colombo 14 (Grandpass)', city: 'Colombo 14', district: 'Colombo', postalCode: '01400', areaCode: '011', fibreAvailable: true, lat: 6.9530, lng: 79.8720 },
  { label: 'Colombo 15 (Modara)', city: 'Colombo 15', district: 'Colombo', postalCode: '01500', areaCode: '011', fibreAvailable: true, lat: 6.9680, lng: 79.8750 },
  { label: 'Dehiwala', city: 'Dehiwala', district: 'Colombo', postalCode: '10350', areaCode: '011', fibreAvailable: true, lat: 6.8511, lng: 79.8659 },
  { label: 'Mount Lavinia', city: 'Mount Lavinia', district: 'Colombo', postalCode: '10370', areaCode: '011', fibreAvailable: true, lat: 6.8344, lng: 79.8653 },
  { label: 'Nugegoda', city: 'Nugegoda', district: 'Colombo', postalCode: '10250', areaCode: '011', fibreAvailable: true, lat: 6.8649, lng: 79.8997 },
  { label: 'Maharagama', city: 'Maharagama', district: 'Colombo', postalCode: '10280', areaCode: '011', fibreAvailable: true, lat: 6.8480, lng: 79.9268 },
  { label: 'Kottawa', city: 'Kottawa', district: 'Colombo', postalCode: '10230', areaCode: '011', fibreAvailable: true, lat: 6.8413, lng: 79.9654 },
  { label: 'Battaramulla', city: 'Battaramulla', district: 'Colombo', postalCode: '10120', areaCode: '011', fibreAvailable: true, lat: 6.8986, lng: 79.9222 },
  { label: 'Sri Jayawardenepura Kotte', city: 'Sri Jayawardenepura Kotte', district: 'Colombo', postalCode: '10100', areaCode: '011', fibreAvailable: true, lat: 6.8914, lng: 79.9048 },
  { label: 'Malabe', city: 'Malabe', district: 'Colombo', postalCode: '10115', areaCode: '011', fibreAvailable: true, lat: 6.9042, lng: 79.9549 },
  { label: 'Rajagiriya', city: 'Rajagiriya', district: 'Colombo', postalCode: '10107', areaCode: '011', fibreAvailable: true, lat: 6.9092, lng: 79.8938 },
  { label: 'Moratuwa', city: 'Moratuwa', district: 'Colombo', postalCode: '10400', areaCode: '011', fibreAvailable: true, lat: 6.7730, lng: 79.8816 },
  { label: 'Piliyandala', city: 'Piliyandala', district: 'Colombo', postalCode: '10300', areaCode: '011', fibreAvailable: true, lat: 6.7989, lng: 79.9229 },

  // ── Other Regions ──
  { label: 'Gampaha', city: 'Gampaha', district: 'Gampaha', postalCode: '11000', areaCode: '033', fibreAvailable: false, lat: 7.0840, lng: 79.9939 },
  { label: 'Negombo', city: 'Negombo', district: 'Gampaha', postalCode: '11500', areaCode: '031', fibreAvailable: false, lat: 7.2008, lng: 79.8737 },
  { label: 'Ja-Ela', city: 'Ja-Ela', district: 'Gampaha', postalCode: '11350', areaCode: '031', fibreAvailable: false, lat: 7.0744, lng: 79.8920 },
  { label: 'Kelaniya', city: 'Kelaniya', district: 'Gampaha', postalCode: '11600', areaCode: '033', fibreAvailable: false, lat: 6.9553, lng: 79.9220 },
  { label: 'Wattala', city: 'Wattala', district: 'Gampaha', postalCode: '11300', areaCode: '033', fibreAvailable: false, lat: 6.9895, lng: 79.8923 },
  { label: 'Kandy', city: 'Kandy', district: 'Kandy', postalCode: '20000', areaCode: '081', fibreAvailable: false, lat: 7.2906, lng: 80.6337 },
  { label: 'Peradeniya', city: 'Peradeniya', district: 'Kandy', postalCode: '20400', areaCode: '081', fibreAvailable: false, lat: 7.2600, lng: 80.5960 },
  { label: 'Gampola', city: 'Gampola', district: 'Kandy', postalCode: '20500', areaCode: '081', fibreAvailable: false, lat: 7.1643, lng: 80.5694 },
  { label: 'Dickoya', city: 'Dickoya', district: 'Nuwara Eliya', postalCode: '22050', areaCode: '052', fibreAvailable: false, lat: 6.8700, lng: 80.6000 },
  { label: 'Hatton', city: 'Hatton', district: 'Nuwara Eliya', postalCode: '22000', areaCode: '052', fibreAvailable: false, lat: 6.8967, lng: 80.5956 },
  { label: 'Nuwara Eliya (Rural)', city: 'Nuwara Eliya (Rural)', district: 'Nuwara Eliya', postalCode: '22200', areaCode: '052', fibreAvailable: false, lat: 6.9497, lng: 80.7891 },
  { label: 'Galle', city: 'Galle', district: 'Galle', postalCode: '80000', areaCode: '091', fibreAvailable: false, lat: 6.0535, lng: 80.2210 },
  { label: 'Hikkaduwa', city: 'Hikkaduwa', district: 'Galle', postalCode: '80240', areaCode: '091', fibreAvailable: false, lat: 6.1408, lng: 80.1017 },
  { label: 'Matara', city: 'Matara', district: 'Matara', postalCode: '81000', areaCode: '041', fibreAvailable: false, lat: 5.9549, lng: 80.5550 },
  { label: 'Jaffna', city: 'Jaffna', district: 'Jaffna', postalCode: '40000', areaCode: '021', fibreAvailable: false, lat: 9.6615, lng: 80.0255 },
  { label: 'Kurunegala', city: 'Kurunegala', district: 'Kurunegala', postalCode: '60000', areaCode: '037', fibreAvailable: false, lat: 7.4863, lng: 80.3623 },
  { label: 'Anuradhapura', city: 'Anuradhapura', district: 'Anuradhapura', postalCode: '50000', areaCode: '025', fibreAvailable: false, lat: 8.3114, lng: 80.4037 },
  { label: 'Badulla', city: 'Badulla', district: 'Badulla', postalCode: '90000', areaCode: '055', fibreAvailable: false, lat: 6.9934, lng: 81.0550 },
  { label: 'Ratnapura', city: 'Ratnapura', district: 'Ratnapura', postalCode: '70000', areaCode: '045', fibreAvailable: false, lat: 6.6828, lng: 80.4035 },
  { label: 'Trincomalee', city: 'Trincomalee', district: 'Trincomalee', postalCode: '31000', areaCode: '026', fibreAvailable: false, lat: 8.5874, lng: 81.2152 },
  { label: 'Batticaloa', city: 'Batticaloa', district: 'Batticaloa', postalCode: '30000', areaCode: '065', fibreAvailable: false, lat: 7.7310, lng: 81.6747 },
  { label: 'Vavuniya (Outskirts)', city: 'Vavuniya (Outskirts)', district: 'Vavuniya', postalCode: '43000', areaCode: '024', fibreAvailable: false, lat: 8.7514, lng: 80.4971 },
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

export default function CustomerInfoStep({
  formData,
  handleChange,
  setFields,
  selectedProduct: selectedProductProp = null,
  stepNumber = 2,
  totalSteps = 7,
}) {
  const { mobileNumber, selectedAccount, customerExists: verifiedCustomerExists } = useVerifiedContext();
  const customerExists = Boolean(verifiedCustomerExists || selectedAccount);
  const selectedProduct = selectedProductProp || formData.selectedProduct || formData.product || null;
  const [authUser] = useState(getAuthUser);
  const [autoDetectedPill, setAutoDetectedPill] = useState('');

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
      const line = [authUser.addressLine1, authUser.addressLine2, authUser.city, authUser.district, authUser.postalCode]
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
      title: formData.title || 'Mr',
      nameFull: formData.nameFull || '',
      nic: sanitizeNic(formData.nic || ''),
      dob: formData.dob || '',
      email: formData.email || '',
      mobileNumber: formData.mobileNumber || mobileNumber || '',
      registeredAddress: '',
    };
  })();

  // Only existing customers with a registered address in DB can use Old / Registered Service Location
  const isExistingCustomer = Boolean(
    customerExists ||
    selectedAccount ||
    authUser ||
    formData.isExistingCustomer === 'yes' ||
    formData.isExistingCustomer === true
  );

  const hasRegisteredAddress = Boolean(
    isExistingCustomer &&
    knownProfile.registeredAddress &&
    knownProfile.registeredAddress.trim().length > 0
  );

  // Location choice: 'current' (Old / Registered Service Location) vs 'new' (New Installation Location)
  // If no registered address exists in DB, automatically default and lock to 'new'
  const [locationType, setLocationType] = useState(() => {
    if (!hasRegisteredAddress) return 'new';
    return formData.locationType === 'new' ? 'new' : 'current';
  });

  // Keep locationType synced to 'new' if no registered address exists
  useEffect(() => {
    if (!hasRegisteredAddress && locationType !== 'new') {
      setLocationType('new');
    }
  }, [hasRegisteredAddress, locationType]);

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
      isExistingCustomer: isExistingCustomer ? 'yes' : 'no',
    });
  }, [selectedAccount, authUser, customerExists, isExistingCustomer]);

  // Sync address based on locationType
  useEffect(() => {
    if (!setFields) return;
    if (locationType === 'current' && hasRegisteredAddress) {
      const addr = knownProfile.registeredAddress;
      const matched = autoDetectAreaCode(addr);
      setFields({
        installAddress: addr,
        address: addr,
        locationType: 'current',
        areaCode: matched ? matched.code : (formData.areaCode || ''),
      });
      if (matched) {
        setAutoDetectedPill(`Auto-selected ${matched.code} for registered address`);
      }
    } else {
      setFields({
        locationType: 'new',
      });
    }
  }, [locationType, hasRegisteredAddress, knownProfile.registeredAddress]);

  const currentCityMatch = SRI_LANKA_CITY_POSTAL_DATA.find((c) => c.city === formData.city) || null;
  const currentCityCoords = currentCityMatch && currentCityMatch.lat && currentCityMatch.lng
    ? { lat: currentCityMatch.lat, lng: currentCityMatch.lng }
    : (formData.latitude && formData.longitude ? { lat: Number(formData.latitude), lng: Number(formData.longitude) } : null);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  // Helper to compose full installation address from separate physical fields + city/postal
  const composeFullAddress = ({
    addressLine1 = formData.addressLine1 || '',
    addressLine2 = formData.addressLine2 || '',
    nearestLandmark = formData.nearestLandmark || formData.landmark || '',
    city = formData.city || '',
    postalCode = formData.postalCode || '',
  } = {}) => {
    const parts = [];
    if (addressLine1 && addressLine1.trim()) parts.push(addressLine1.trim());
    if (addressLine2 && addressLine2.trim()) parts.push(addressLine2.trim());
    if (nearestLandmark && nearestLandmark.trim()) parts.push(`Landmark: ${nearestLandmark.trim()}`);
    if (city && city.trim()) parts.push(city.trim());
    if (postalCode && postalCode.trim() && !city.includes(postalCode)) parts.push(postalCode.trim());
    return parts.join(', ');
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
          handleLocationSelect({ address: cleanAddr, coords: { lat, lng }, details: data?.address });
          toast.success(`GPS Location locked: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`);
        } catch {
          handleLocationSelect({ address: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`, coords: { lat, lng } });
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

  // Handle address line change (Address Line 1, Line 2, Landmark)
  const handleAddressLineChange = (field, value) => {
    const updated = {
      [field]: value,
    };
    if (field === 'nearestLandmark') {
      updated.landmark = value;
    }
    const full = composeFullAddress({
      ...formData,
      [field]: value,
    });
    updated.installAddress = full;
    updated.address = full;

    const matched = autoDetectAreaCode(full);
    if (matched) {
      updated.areaCode = matched.code;
      setAutoDetectedPill(`Auto-selected Area Code ${matched.code}`);
    }

    if (setFields) {
      setFields(updated);
    }
    if (handleChange) {
      handleChange({ target: { name: field, value } });
    }
  };

  const handleCitySelect = (e) => {
    const cityName = e.target.value;
    const match = SRI_LANKA_CITY_POSTAL_DATA.find((c) => c.city === cityName);

    if (setFields) {
      const full = composeFullAddress({
        ...formData,
        city: cityName,
        postalCode: match?.postalCode || '',
      });
      const updates = {
        city: cityName,
        district: match?.district || '',
        postalCode: match?.postalCode || '',
        latitude: match?.lat || null,
        longitude: match?.lng || null,
        areaCode: match?.areaCode || formData.areaCode || '',
        installAddress: full,
        address: full,
      };
      setFields(updates);
    }
  };

  const handleLocationSelect = (param1, param2) => {
    let address, coords, details;
    if (param1 && typeof param1 === 'object' && ('address' in param1 || 'coords' in param1)) {
      address = param1.address;
      coords = param1.coords;
      details = param1.details;
    } else {
      coords = param1;
      address = param2;
    }

    const updates = {};

    if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
      updates.latitude = coords.lat;
      updates.longitude = coords.lng;
      updates.gpsCoordinates = coords;

      // Reverse synchronize: detect closest city/area from map coordinates
      const { closest, distanceDeg } = findClosestCity(coords.lat, coords.lng);
      if (closest && distanceDeg < 0.45) {
        updates.city = closest.city;
        updates.district = closest.district;
        updates.postalCode = closest.postalCode;
        if (closest.areaCode) updates.areaCode = closest.areaCode;
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
          if (nameMatch.areaCode) updates.areaCode = nameMatch.areaCode;
        }
      }
    }

    // Pre-populate addressLine1 if currently empty
    if (address && typeof address === 'string') {
      if (!formData.addressLine1 || formData.addressLine1.trim() === '') {
        const cleanStreet = address.split(',')[0]?.trim() || address;
        updates.addressLine1 = cleanStreet;
      }
    }

    const full = composeFullAddress({
      ...formData,
      ...updates,
    });
    updates.installAddress = full || address || formData.installAddress || '';
    updates.address = updates.installAddress;

    const matched = autoDetectAreaCode(updates.installAddress);
    if (matched) {
      updates.areaCode = matched.code;
      setAutoDetectedPill(`Auto-selected Area Code ${matched.code} from location`);
    }

    if (setFields) {
      setFields(updates);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <WizardStepHeader
        stepNumber={stepNumber}
        totalSteps={totalSteps}
        title="Service Location Selection"
        description="Select your installation address, use a registered address, choose a map pin, or detect your current location."
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
          <ReadOnlyDetail label="Email Address" value={knownProfile.email || formData.email || ''} />
        </div>
      </div>

      {/* ── Location Option Selection Tiles for Existing Customer (Old vs New Location) ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.85rem 0' }}>
          Choose Service Installation Option
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: hasRegisteredAddress ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr', gap: '1rem' }}>
          {/* Option 1: Old / Registered Service Location — ONLY SHOWN IF ADDRESS EXISTS IN DB */}
          {hasRegisteredAddress && (
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
                {knownProfile.registeredAddress}
              </p>
            </div>
          )}

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
        {autoDetectedPill && (
          <p role="status" style={{ marginTop: '0.6rem', color: '#166534', fontSize: '0.8rem', fontWeight: 600 }}>
            {autoDetectedPill}
          </p>
        )}
      </div>

      {/* ── Registered Address Confirmation Card (when Old / Registered Service Location is selected) ── */}
      {locationType === 'current' && hasRegisteredAddress && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #bfdbfe',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 15px rgba(0, 86, 179, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <FiCheck size={15} />
            </div>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
              Service will be installed at your registered account address:
            </span>
          </div>
          <p style={{ margin: '0 0 0.4rem 2.1rem', fontSize: '0.98rem', fontWeight: 700, color: '#0f57a8' }}>
            {knownProfile.registeredAddress}
          </p>
          <p style={{ margin: '0 0 0 2.1rem', fontSize: '0.78rem', color: '#64748b' }}>
            To install at a different address, select &quot;New Installation Location&quot; above.
          </p>
        </motion.div>
      )}

      {/* ── If New Location Selected: Balanced Two-Column Layout ── */}
      {locationType === 'new' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #bfdbfe',
            borderRadius: '18px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 20px rgba(0, 86, 179, 0.04)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '1.75rem',
              alignItems: 'start',
            }}
          >
            {/* ──── LEFT COLUMN: Standard Physical Installation Address ──── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderBottom: '1.5px solid #f1f5f9',
                  paddingBottom: '0.65rem',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    color: '#0f57a8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FiHome size={16} />
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                    Physical Installation Address
                  </h5>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                    Premises details for technician dispatch, wiring &amp; billing
                  </p>
                </div>
              </div>

              {/* Address Line 1 */}
              <div>
                <label
                  htmlFor="nc-address-line1"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}
                >
                  Address Line 1 (House No. &amp; Street) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  id="nc-address-line1"
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1 || ''}
                  onChange={(e) => handleAddressLineChange('addressLine1', e.target.value)}
                  placeholder="e.g. No. 45/2, Temple Road"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.95rem',
                    fontSize: '0.92rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease',
                  }}
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label
                  htmlFor="nc-address-line2"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}
                >
                  Address Line 2 (Apartment, Unit, Floor) <span style={{ color: '#64748b', fontWeight: 500 }}>(Optional)</span>
                </label>
                <input
                  id="nc-address-line2"
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2 || ''}
                  onChange={(e) => handleAddressLineChange('addressLine2', e.target.value)}
                  placeholder="e.g. Lotus Residencies, 3rd Floor, Apt 3B"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.95rem',
                    fontSize: '0.92rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease',
                  }}
                />
              </div>

              {/* Nearest Landmark */}
              <div>
                <label
                  htmlFor="nc-nearest-landmark"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}
                >
                  Nearest Landmark <span style={{ color: '#64748b', fontWeight: 500 }}>(Optional)</span>
                </label>
                <input
                  id="nc-nearest-landmark"
                  type="text"
                  name="nearestLandmark"
                  value={formData.nearestLandmark || formData.landmark || ''}
                  onChange={(e) => handleAddressLineChange('nearestLandmark', e.target.value)}
                  placeholder="e.g. Opposite Sambuddha Jayanthi Temple, Near Water Tank"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.95rem',
                    fontSize: '0.92rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease',
                  }}
                />
              </div>

              {/* Formatted Address Live Preview Card */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  marginTop: '0.2rem',
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>
                  Formatted Installation Address:
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f57a8', lineHeight: 1.4 }}>
                  {formData.installAddress || formData.address || (formData.city ? `${formData.city}, Sri Lanka` : 'Fill address fields and select city on the right...')}
                </div>
              </div>
            </div>

            {/* ──── RIGHT COLUMN: Service Area & Map Verification ──── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderBottom: '1.5px solid #f1f5f9',
                  paddingBottom: '0.65rem',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    color: '#0f57a8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FiCompass size={16} />
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                    Service Area &amp; Map Location
                  </h5>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                    Verify regional Fibre loop feasibility &amp; LTE coverage
                  </p>
                </div>
              </div>

              {/* Select City / Region Dropdown */}
              <div>
                <label
                  htmlFor="nc-city-select"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}
                >
                  Select City / Region <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  id="nc-city-select"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleCitySelect}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.95rem',
                    fontSize: '0.92rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  required
                >
                  <option value="" disabled>Choose city or area</option>
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
                      <div style={{ marginTop: '0.45rem', padding: '0.45rem 0.75rem', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', fontSize: '0.78rem', color: '#c2410c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FiZap size={14} color="#ea580c" style={{ flexShrink: 0 }} />
                        <span>Demo coverage: Fibre unconfirmed in <strong>{selectedCityData.city}</strong>. OSS check will confirm.</span>
                      </div>
                    );
                  } else if (selectedCityData?.fibreAvailable && isFibreReq) {
                    return (
                      <div style={{ marginTop: '0.45rem', padding: '0.45rem 0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '0.78rem', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FiCheck size={14} color="#16a34a" style={{ flexShrink: 0 }} />
                        <span>Fibre loop available in <strong>{selectedCityData.city}</strong>. OSS feasibility check in next step.</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Single Unified Action Bar (NO DUPLICATE BUTTONS) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    Pin Location on Map
                  </label>
                  <div style={{ display: 'flex', gap: '0.45rem' }}>
                    <button
                      type="button"
                      onClick={handleDirectGpsDetect}
                      disabled={detectingGps}
                      style={{
                        backgroundColor: '#eff6ff',
                        border: '1.5px solid #bfdbfe',
                        color: '#0f57a8',
                        padding: '0.3rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease',
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
                        border: '1.5px solid #bbf7d0',
                        color: '#166534',
                        padding: '0.3rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <FiMapPin size={12} />
                      Pick on Map
                    </button>
                  </div>
                </div>

                {/* GPS Locked Confirmation Box & Mini Map Preview */}
                {formData.latitude && formData.longitude ? (
                  <div
                    style={{
                      backgroundColor: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      borderRadius: '14px',
                      padding: '0.85rem',
                      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'grid', placeItems: 'center' }}>
                          <FiCheck size={14} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#166534', letterSpacing: '0.5px' }}>
                            Exact GPS Coordinates Locked
                          </span>
                          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                            {Number(formData.latitude).toFixed(5)}° N, {Number(formData.longitude).toFixed(5)}° E
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
                          padding: '0.25rem 0.6rem',
                          borderRadius: '8px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <FiMaximize2 size={11} />
                        Adjust Pin
                      </button>
                    </div>

                    {/* Leaflet Mini Map Preview */}
                    <div style={{ height: '170px', width: '100%', borderRadius: '10px', overflow: 'hidden', border: '1px solid #bbf7d0', position: 'relative' }}>
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
                          bottom: '6px',
                          left: '6px',
                          backgroundColor: 'rgba(15, 23, 42, 0.8)',
                          color: '#ffffff',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          zIndex: 1000,
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        📍 Pinned Installation Spot
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '12px',
                      padding: '1.1rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      gap: '0.65rem',
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#eff6ff',
                        color: '#0f57a8',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <FiMapPin size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                        No Map Coordinates Pinned Yet
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '300px', marginTop: '0.15rem' }}>
                        Pin your exact spot on the map or use GPS to verify Fibre loop availability in the next step.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                      style={{
                        backgroundColor: '#0f57a8',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.45rem 0.95rem',
                        borderRadius: '10px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <FiMapPin size={13} />
                      Open Map Picker
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Standalone map modal for exact installation location */}
      <LocationPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectAddress={handleLocationSelect}
        initialAddress={formData.installAddress || formData.address}
      />

      {/* Contact email for billing and updates, from the verified session */}
      <input
        type="hidden"
        name="email"
        value={knownProfile.email || formData.email || ''}
        readOnly
      />
    </motion.div>
  );
}
