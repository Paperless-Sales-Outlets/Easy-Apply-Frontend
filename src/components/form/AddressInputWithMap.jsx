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
  disabled = false,
  readOnly = false,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [internalValue, setInternalValue] = useState(value || '');
  const textareaRef = useRef(null);

  // A hidden <input> that Google Maps Autocomplete attaches to.
  // google.maps.places.Autocomplete ONLY accepts HTMLInputElement —
  // passing a <textarea> throws "InvalidValueError: not an instance of HTMLInputElement".
  const hiddenInputRef = useRef(null);

  // Sync internalValue with controlled value prop
  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  // Initialize Google Places Autocomplete on the hidden <input>.
  // Falls back gracefully — the textarea + map picker still work without it.
  useEffect(() => {
    if (disabled || readOnly) return;

    loadGoogleMapsScript()
      .then((gMaps) => {
        if (!hiddenInputRef.current || !gMaps?.places?.Autocomplete) return;
        try {
          const autocomplete = new gMaps.places.Autocomplete(hiddenInputRef.current, {
            types: ['geocode', 'establishment'],
          });
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place?.formatted_address) {
              const cleaned = cleanGoogleAddress([place]);
              triggerChange(cleaned || place.formatted_address);
            } else if (place?.name) {
              triggerChange(place.name);
            }
            // Clear the hidden input after selection so it doesn't show stale text
            if (hiddenInputRef.current) hiddenInputRef.current.value = '';
          });
        } catch (e) {
          console.warn('Google Maps Autocomplete init failed:', e);
        }
      })
      .catch((err) => {
        console.warn('Google Maps Autocomplete not enabled:', err);
      });
  }, [disabled, readOnly]);

  const triggerChange = (newAddressValue) => {
    setInternalValue(newAddressValue);
    if (onChange) {
      onChange({ target: { name, value: newAddressValue } });
    }
  };

  const handleInputChange = (e) => {
    if (disabled || readOnly) return;
    setInternalValue(e.target.value);
    if (onChange) onChange(e);
  };

  const handleDetectLocation = () => {
    if (disabled || readOnly) return;
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
          // Try Google Maps Geocoding first
          if (window.google?.maps?.Geocoder) {
            const geocoder = new window.google.maps.Geocoder();
            const results = await new Promise((resolve) => {
              geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (res, status) => {
                resolve(status === 'OK' && res ? res : null);
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

          triggerChange(cleanedNom || getFallbackAddressText());
          setStatusMessage('Location detected!');
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
        setStatusMessage(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission denied.'
            : 'Location unavailable.'
        );
        setTimeout(() => setStatusMessage(''), 3000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleModalSelectAddress = (selectedAddress) => {
    if (disabled || readOnly) return;
    triggerChange(selectedAddress);
    setStatusMessage('Address selected from map!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  return (
    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
      {label && <label className="form-label">{label}</label>}

      {/* Hidden <input> for Google Maps Autocomplete widget — must be an HTMLInputElement */}
      {!disabled && !readOnly && (
        <input
          ref={hiddenInputRef}
          type="text"
          placeholder="Search for an address..."
          style={{
            width: '100%',
            padding: '0.45rem 0.75rem',
            fontSize: '0.9rem',
            border: '1px solid var(--line, #d9e2ef)',
            borderRadius: 'var(--radius, 12px) var(--radius, 12px) 0 0',
            outline: 'none',
            fontFamily: 'inherit',
            marginBottom: '-1px',
            backgroundColor: '#fff',
            color: 'var(--text, #16233a)',
          }}
          aria-label="Search address with autocomplete"
        />
      )}

      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          name={name}
          className={className}
          rows={rows}
          value={internalValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled || readOnly}
          readOnly={readOnly}
          style={{
            width: '100%',
            resize: 'vertical',
            borderRadius: disabled || readOnly ? 'var(--radius, 12px)' : '0 0 var(--radius, 12px) var(--radius, 12px)',
            backgroundColor: disabled || readOnly ? '#f8fafc' : undefined,
            cursor: disabled || readOnly ? 'not-allowed' : undefined,
            color: disabled || readOnly ? '#334155' : undefined,
          }}
        />
      </div>

      {/* Action Buttons: Detect Location & Pick on Map */}
      {!disabled && !readOnly && (
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
      )}

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
