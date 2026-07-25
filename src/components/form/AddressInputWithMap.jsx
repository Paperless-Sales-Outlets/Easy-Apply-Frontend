import React, { useState, useEffect, useRef } from 'react';
import { FiMapPin, FiNavigation } from 'react-icons/fi';
import LocationPickerModal from './LocationPickerModal';
import { loadGoogleMapsScript } from '../../utils/loadGoogleMaps';
import { cleanGoogleAddress, cleanNominatimAddress, getFallbackAddressText } from '../../utils/addressFormatter';

export default function AddressInputWithMap({
  name = 'address',
  label = 'Address',
  value = '',
  onChange,
  placeholder = 'Enter address...',
  rows = 3,
  required = false,
  className = 'form-control',
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [internalValue, setInternalValue] = useState(value || '');
  const autocompleteInputRef = useRef(null);

  // Sync internalValue with controlled value prop
  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  // Initialize Google Places Autocomplete if API key is provided
  useEffect(() => {
    loadGoogleMapsScript()
      .then((gMaps) => {
        if (!autocompleteInputRef.current || !gMaps.places) return;
        const autocomplete = new gMaps.places.Autocomplete(autocompleteInputRef.current, {
          types: ['geocode', 'establishment'],
        });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place && place.formatted_address) {
            const cleaned = cleanGoogleAddress([place]);
            triggerChange(cleaned || place.formatted_address);
          } else if (place && place.name) {
            triggerChange(place.name);
          }
        });
      })
      .catch((err) => {
        console.warn('Google Maps Autocomplete not enabled:', err);
      });
  }, []);

  const triggerChange = (newAddressValue) => {
    setInternalValue(newAddressValue);

    if (onChange) {
      onChange({
        target: {
          name,
          value: newAddressValue,
        },
      });
    }
  };

  const handleInputChange = (e) => {
    setInternalValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setStatusMessage('Detecting current location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Check for Google Maps Geocoding API with callback support
          if (window.google && window.google.maps && window.google.maps.Geocoder) {
            const geocoder = new window.google.maps.Geocoder();
            const results = await new Promise((resolve) => {
              geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (res, status) => {
                if (status === 'OK' && res) resolve(res);
                else resolve(null);
              });
            });

            const cleaned = cleanGoogleAddress(results);
            if (cleaned) {
              triggerChange(cleaned);
              setStatusMessage('Location detected!');
              setIsDetectingLocation(false);
              setTimeout(() => setStatusMessage(''), 3000);
              return;
            }
          }

          // Fallback: OpenStreetMap Nominatim Reverse Geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();
          const cleanedNom = cleanNominatimAddress(data);

          if (cleanedNom) {
            triggerChange(cleanedNom);
            setStatusMessage('Location detected!');
          } else {
            triggerChange(getFallbackAddressText());
            setStatusMessage('Location detected!');
          }
        } catch (error) {
          console.error('Error fetching address:', error);
          setStatusMessage('Failed to get address.');
        } finally {
          setIsDetectingLocation(false);
          setTimeout(() => setStatusMessage(''), 3000);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setStatusMessage('Location permission denied.');
        } else {
          setStatusMessage('Location unavailable.');
        }
        setTimeout(() => setStatusMessage(''), 3000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleModalSelectAddress = (selectedAddress) => {
    triggerChange(selectedAddress);
    setStatusMessage('Address selected from map!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  return (
    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
      {label && <label className="form-label">{label}</label>}

      <div style={{ position: 'relative' }}>
        <textarea
          ref={autocompleteInputRef}
          name={name}
          className={className}
          rows={rows}
          value={internalValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          style={{ width: '100%', resize: 'vertical' }}
        />
      </div>

      {/* Action Buttons: Detect Location & Pick on Map */}
      <div style={actionsContainerStyle}>
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isDetectingLocation}
          style={actionButtonStyle}
          title="Auto-detect current location"
        >
          <FiNavigation style={{ color: '#0284c7', fontSize: '0.95rem' }} />
          {isDetectingLocation ? 'Detecting...' : 'Detect My Location'}
        </button>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={actionButtonStyle}
          title="Open interactive map to select address"
        >
          <FiMapPin style={{ color: '#16a34a', fontSize: '0.95rem' }} />
          Pick on Map
        </button>

        {statusMessage && (
          <span style={statusMessageStyle}>
            {statusMessage}
          </span>
        )}
      </div>

      {/* Interactive Map Modal */}
      <LocationPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectAddress={handleModalSelectAddress}
        initialAddress={internalValue}
      />
    </div>
  );
}

const actionsContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginTop: '0.4rem',
  flexWrap: 'wrap',
};

const actionButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  backgroundColor: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  padding: '0.35rem 0.75rem',
  fontSize: '0.8rem',
  fontWeight: 500,
  color: '#334155',
  cursor: 'pointer',
  transition: 'all 0.15s ease-in-out',
};

const statusMessageStyle = {
  fontSize: '0.75rem',
  color: '#0284c7',
  fontWeight: 500,
  marginLeft: 'auto',
};
