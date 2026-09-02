import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FiX, FiCheck, FiMapPin, FiNavigation, FiSearch } from 'react-icons/fi';
import { loadGoogleMapsScript } from '../../utils/loadGoogleMaps';
import { cleanGoogleAddress, cleanNominatimAddress, getFallbackAddressText } from '../../utils/addressFormatter';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Default center: Colombo, Sri Lanka
const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 };

// Leaflet helper components
function MapEventsHandler({ onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });
  return null;
}

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, Math.max(map.getZoom(), 15), { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function LocationPickerModal({ isOpen, onClose, onSelectAddress, initialAddress = '' }) {
  const [useGoogleMaps, setUseGoogleMaps] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [position, setPosition] = useState(DEFAULT_CENTER);
  const [addressText, setAddressText] = useState(initialAddress);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);

  // Refs for Google Maps native container & instances
  const googleMapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const autocompleteInputRef = useRef(null);
  const leafletMarkerRef = useRef(null);

  // Attempt to load Google Maps JS API when modal opens
  useEffect(() => {
    if (isOpen) {
      loadGoogleMapsScript()
        .then(() => {
          setUseGoogleMaps(true);
          setGoogleLoaded(true);
        })
        .catch((err) => {
          console.warn('Google Maps script failed to load, falling back to Leaflet:', err);
          setUseGoogleMaps(false);
        });
    }
  }, [isOpen]);

  // Initial user location detection
  useEffect(() => {
    if (isOpen) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setPosition(coords);
            reverseGeocode(coords.lat, coords.lng);
          },
          () => {
            reverseGeocode(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
          },
          { timeout: 8000 }
        );
      } else {
        reverseGeocode(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      }
    }
  }, [isOpen]);

  // Initialize Native Google Map when Google Maps API is active
  useEffect(() => {
    if (isOpen && useGoogleMaps && googleLoaded && googleMapRef.current) {
      const g = window.google.maps;
      
      if (!mapInstanceRef.current) {
        const map = new g.Map(googleMapRef.current, {
          center: position,
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
        });

        const marker = new g.Marker({
          position: position,
          map: map,
          draggable: true,
          animation: g.Animation.DROP,
          title: 'Drag to select address',
        });

        // Click on map to move marker
        map.addListener('click', (e) => {
          const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          marker.setPosition(newPos);
          setPosition(newPos);
          reverseGeocode(newPos.lat, newPos.lng);
        });

        // Drag marker end listener
        marker.addListener('dragend', () => {
          const p = marker.getPosition();
          const newPos = { lat: p.lat(), lng: p.lng() };
          setPosition(newPos);
          reverseGeocode(newPos.lat, newPos.lng);
        });

        mapInstanceRef.current = map;
        markerInstanceRef.current = marker;

        // Setup Places Autocomplete on input
        if (autocompleteInputRef.current) {
          const autocomplete = new g.places.Autocomplete(autocompleteInputRef.current, {
            fields: ['formatted_address', 'geometry', 'name'],
          });
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const loc = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };
              map.setCenter(loc);
              map.setZoom(16);
              marker.setPosition(loc);
              setPosition(loc);
              setAddressText(place.formatted_address || place.name);
            }
          });
        }
      } else {
        mapInstanceRef.current.setCenter(position);
        if (markerInstanceRef.current) {
          markerInstanceRef.current.setPosition(position);
        }
      }
    }
  }, [isOpen, useGoogleMaps, googleLoaded]);

  // Reverse Geocoding updating dynamically to pin position
  const reverseGeocode = async (lat, lng) => {
    setIsFetchingAddress(true);
    try {
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        const results = await new Promise((resolve) => {
          geocoder.geocode({ location: { lat, lng } }, (res, status) => {
            if (status === 'OK' && res && res.length > 0) resolve(res);
            else resolve(null);
          });
        });

        if (results) {
          const cleaned = cleanGoogleAddress(results);
          if (cleaned) {
            setAddressText(cleaned);
            setIsFetchingAddress(false);
            return;
          }
        }
      }

      // Fallback: OpenStreetMap Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await response.json();
      const cleanedNom = cleanNominatimAddress(data);
      if (cleanedNom) {
        setAddressText(cleanedNom);
      } else {
        setAddressText(getFallbackAddressText(lat, lng));
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
      setAddressText(getFallbackAddressText(lat, lng));
    } finally {
      setIsFetchingAddress(false);
    }
  };

  const handlePositionChange = (newLatLng) => {
    const latlng = { lat: newLatLng.lat, lng: newLatLng.lng };
    setPosition(latlng);
    reverseGeocode(latlng.lat, latlng.lng);

    if (useGoogleMaps && mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.panTo(latlng);
      markerInstanceRef.current.setPosition(latlng);
    }
  };

  const handleMarkerDragEnd = () => {
    const marker = leafletMarkerRef.current;
    if (marker != null) {
      const latLng = marker.getLatLng();
      handlePositionChange(latLng);
    }
  };

  const handleSearch = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        const res = await geocoder.geocode({ address: searchQuery });
        if (res.results && res.results[0]) {
          const loc = res.results[0].geometry.location;
          const coords = { lat: loc.lat(), lng: loc.lng() };
          handlePositionChange(coords);
          const cleaned = cleanGoogleAddress(res.results);
          setAddressText(cleaned || res.results[0].formatted_address);
          setIsSearching(false);
          return;
        }
      }

      // Fallback Search: Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        handlePositionChange(coords);
        const cleanedNom = cleanNominatimAddress(data[0]);
        setAddressText(cleanedNom || data[0].display_name);
      }
    } catch (err) {
      console.error('Search location error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        handlePositionChange(coords);
        setLocatingUser(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocatingUser(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    if (addressText) {
      onSelectAddress(addressText, position);
    }
    onClose();
  };

  const eventHandlers = useMemo(
    () => ({
      dragend: handleMarkerDragEnd,
    }),
    []
  );

  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        {/* Modal Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiMapPin style={{ color: '#0056b3', fontSize: '1.25rem' }} aria-hidden="true" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 600 }}>
              Select Location on Map
            </h3>
          </div>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Close modal">
            <FiX style={{ fontSize: '1.2rem' }} />
          </button>
        </div>

        {/* Search Bar & Geolocation */}
        <div style={searchContainerStyle}>
          <div role="search" style={{ display: 'flex', flex: '1', gap: '0.5rem' }}>
            <div style={inputWrapperStyle}>
              <FiSearch style={{ color: '#888', marginRight: '0.4rem' }} aria-hidden="true" />
              <input
                ref={autocompleteInputRef}
                type="text"
                aria-label="Search for a location"
                placeholder="Search city, street or landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Stop this from reaching the wizard form that wraps the modal.
                    e.preventDefault();
                    e.stopPropagation();
                    handleSearch();
                  }
                }}
                style={searchInputStyle}
              />
            </div>
            <button type="button" onClick={handleSearch} disabled={isSearching} style={searchBtnStyle}>
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingUser}
            style={locateBtnStyle}
            title="Use current GPS location"
          >
            <FiNavigation style={{ animation: locatingUser ? 'spin 1s linear infinite' : 'none' }} />
            {locatingUser ? 'Locating...' : 'My Location'}
          </button>
        </div>

        {/* Map Container Area (Native Google Map or Leaflet Fallback) */}
        <div style={{ position: 'relative', height: '360px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {useGoogleMaps ? (
            <div ref={googleMapRef} style={{ height: '100%', width: '100%' }} />
          ) : (
            <MapContainer
              center={position}
              zoom={14}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapRecenter center={position} />
              <MapEventsHandler onPositionChange={handlePositionChange} />
              <Marker
                draggable={true}
                eventHandlers={eventHandlers}
                position={position}
                ref={leafletMarkerRef}
              />
            </MapContainer>
          )}

          {/* Hint Overlay */}
          <div style={mapHintStyle}>
            <FiMapPin size={13} aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: "0.3rem" }} />Click or drag the marker to pinpoint exact address
          </div>
        </div>

        {/* Selected Address Display & Confirmation */}
        <div style={footerStyle}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
              SELECTED ADDRESS:
            </span>
            <p style={addressPreviewStyle}>
              {isFetchingAddress ? 'Detecting address...' : addressText || 'No location selected'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isFetchingAddress || !addressText}
              style={confirmBtnStyle}
            >
              <FiCheck style={{ marginRight: '0.3rem' }} />
              Confirm Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline styles for modal layout
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '1rem',
};

const modalContentStyle = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '700px',
  maxHeight: '92vh',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  display: 'flex',
  flexDirection: 'column',
  padding: '1.25rem',
  gap: '1rem',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #f1f5f9',
  paddingBottom: '0.75rem',
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.25rem',
  color: '#64748b',
  borderRadius: '8px',
};

const searchContainerStyle = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
};

const inputWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  padding: '0.4rem 0.75rem',
  backgroundColor: '#f8fafc',
};

const searchInputStyle = {
  border: 'none',
  outline: 'none',
  width: '100%',
  background: 'transparent',
  fontSize: '0.875rem',
};

const searchBtnStyle = {
  backgroundColor: '#0056b3',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '0.45rem 1.1rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const locateBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  backgroundColor: '#f0fdf4',
  color: '#15803d',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '0.45rem 0.9rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const mapHintStyle = {
  position: 'absolute',
  top: '12px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  padding: '0.35rem 0.9rem',
  borderRadius: '16px',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#0f172a',
  zIndex: 1000,
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  pointerEvents: 'none',
};

const footerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
  borderTop: '1px solid #f1f5f9',
  paddingTop: '0.75rem',
  flexWrap: 'wrap',
};

const addressPreviewStyle = {
  margin: '0.2rem 0 0 0',
  fontSize: '0.875rem',
  color: '#0f172a',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const cancelBtnStyle = {
  backgroundColor: '#f1f5f9',
  color: '#475569',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
};

const confirmBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#059669',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '0.5rem 1.15rem',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
};
