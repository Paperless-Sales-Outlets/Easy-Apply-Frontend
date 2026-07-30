import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../utils/api";

// Fix default Leaflet marker icon paths in React environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Gampaha",
  "Galle", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Moneragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
  "Trincomalee", "Vavuniya"
];

const DISTRICT_CITIES = {
  Colombo: ["Colombo 01", "Colombo 02", "Colombo 03", "Dehiwala", "Maharagama", "Nugegoda", "Piliyandala"],
  Gampaha: ["Gampaha", "Negombo", "Kelaniya", "Ja-Ela", "Wattala"],
  Kandy: ["Kandy", "Peradeniya", "Katugastota", "Gampola"],
  Galle: ["Galle", "Karapitiya", "Hikkaduwa", "Ambalangoda"],
  Vavuniya: ["Vavuniya", "Cheddikulam", "Nedunkeni"],
  Trincomalee: ["Trincomalee", "Kinniya", "Muttur", "Kadaiparichchan"]
};

const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE_MB = 5;

export default function AddressStep({
  isActive = true,
  formData,
  onValidationChange,
  onDataChange,
  showValidationErrors = false
}) {
  const { t } = useTranslation();

  const onValidationChangeRef = useRef(onValidationChange);
  const onDataChangeRef = useRef(onDataChange);

  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
    onDataChangeRef.current = onDataChange;
  }, [onValidationChange, onDataChange]);

  const [currentAddress, setCurrentAddress] = useState({
    address1: "",
    address2: "",
    city: "",
    district: "",
    postalCode: "",
  });
  const [loadingCurrent, setLoadingCurrent] = useState(true);

  const [relocationAddress, setRelocationAddress] = useState({
    district: "",
    city: "",
    postalCode: "",
    address1: "",
    address2: "",
    landmark: "",
  });

  // Updated: Track touched state for all fields
  const [touched, setTouched] = useState({
    district: false,
    city: false,
    postalCode: false,
    address1: false,
    address2: false,
    landmark: false,
  });

  const [proofFile, setProofFile] = useState(null);
  const [proofError, setProofError] = useState("");
  const [sketchFile, setSketchFile] = useState(null);
  const [sketchError, setSketchError] = useState("");
  const [authorizationLetterFile, setAuthorizationLetterFile] = useState(null);
  const [authorizationLetterError, setAuthorizationLetterError] = useState("");
  const [brcFile, setBrcFile] = useState(null);
  const [brcError, setBrcError] = useState("");

  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const searchWrapperRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);

  // Fetch Current Address from backend API using verified telephone number
  useEffect(() => {
    let isSubscribed = true;

    async function fetchCurrentAddress() {
      const telephone = formData?.telephone || formData?.tel;

      if (!telephone) {
        if (isSubscribed) {
          setCurrentAddress({
            address1: "No customer telephone provided",
            address2: "",
            city: "",
            district: "",
            postalCode: "",
          });
          setLoadingCurrent(false);
        }
        return;
      }

      try {
        setLoadingCurrent(true);
        const response = await api.get(`/customers/${telephone}`);
        if (response.data && response.data.success && response.data.data) {
          const cust = response.data.data;
          const addr = cust.currentAddress || {
            address1: cust.address1 || "",
            address2: cust.address2 || "",
            city: cust.city || "",
            district: cust.district || "",
            postalCode: cust.postal_code || cust.postalCode || "",
          };

          if (isSubscribed) {
            setCurrentAddress({
              address1: addr.address1 || addr.addressLine1 || "",
              address2: addr.address2 || addr.addressLine2 || "",
              city: addr.city || "",
              district: addr.district || "",
              postalCode: addr.postalCode || addr.postal_code || "",
            });
          }
        } else if (isSubscribed) {
          setCurrentAddress({
            address1: "Address details not found",
            address2: "",
            city: "",
            district: "",
            postalCode: "",
          });
        }
      } catch (err) {
        console.error("Failed to load customer current address:", err);
        if (isSubscribed) {
          setCurrentAddress({
            address1: "Address details unavailable",
            address2: "",
            city: "",
            district: "",
            postalCode: "",
          });
        }
      } finally {
        if (isSubscribed) {
          setLoadingCurrent(false);
        }
      }
    }

    fetchCurrentAddress();

    return () => {
      isSubscribed = false;
    };
  }, [formData?.telephone, formData?.tel]);

  // Handle outside click for search suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reverse Geocoding via OpenStreetMap
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      if (!response.ok) return;
      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;
        const detectedDistrict = addr.state_district || addr.state || addr.county || "";
        const detectedCity = addr.city || addr.town || addr.village || addr.suburb || "";
        const detectedPostcode = addr.postcode || "";
        const detectedRoad = addr.road || addr.pedestrian || addr.suburb || data.display_name.split(",")[0] || "";

        const matchedDistrict = SRI_LANKA_DISTRICTS.find(
          (d) => d.toLowerCase() === detectedDistrict.replace("District", "").trim().toLowerCase()
        ) || "";

        setRelocationAddress((prev) => ({
          ...prev,
          district: matchedDistrict || prev.district,
          city: detectedCity || prev.city,
          postalCode: /^\d{5}$/.test(detectedPostcode) ? detectedPostcode : prev.postalCode,
          address1: prev.address1 || (detectedRoad ? `No ${detectedRoad}` : ""),
        }));
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  }, []);

  // Marker and Viewport Update
  const updateMarkerPosition = useCallback((lat, lng, doReverseGeocode = true, popupText = "") => {
    setCoordinates({ lat, lng });

    if (!mapRef.current) return;
    mapRef.current.invalidateSize();

    const displayAddress = popupText || "Selected Location";

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.getPopup().setContent(`<b>Selected Relocation Point</b><br/>${displayAddress}`);
    } else {
      const marker = L.marker([lat, lng], { draggable: true }).addTo(mapRef.current);
      marker.bindPopup(`<b>Selected Relocation Point</b><br/>${displayAddress}`);

      marker.on("dragend", (e) => {
        const newCoords = e.target.getLatLng();
        setCoordinates({ lat: newCoords.lat, lng: newCoords.lng });
        reverseGeocode(newCoords.lat, newCoords.lng);
      });

      markerRef.current = marker;
    }

    mapRef.current.setView([lat, lng], 13);
    markerRef.current.openPopup();

    if (doReverseGeocode) {
      reverseGeocode(lat, lng);
    }
  }, [reverseGeocode]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([7.8731, 80.7718], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      updateMarkerPosition(lat, lng, true);
    });

    const resizeTimer = setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 300);

    return () => {
      clearTimeout(resizeTimer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [updateMarkerPosition]);

  // Recalculate map dimensions on tab/active step transition
  useEffect(() => {
    if (isActive && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 200);
    }
  }, [isActive]);

  // Location Search Handling
  useEffect(() => {
    const query = searchQuery.trim();

    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setNoResultsFound(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setNoResultsFound(false);
      try {
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&bbox=79.5,5.8,81.9,9.9`
        );

        if (response.ok) {
          const data = await response.json();
          const places = data.features.map((item) => {
            const props = item.properties;
            const name = props.name || "";
            const city = props.city || props.town || props.district || "";
            const state = props.state || "";
            const formatted = [name, city, state, "Sri Lanka"].filter(Boolean).join(", ");

            return {
              display_name: formatted,
              lat: item.geometry.coordinates[1],
              lon: item.geometry.coordinates[0],
            };
          });

          setSuggestions(places);
          setShowDropdown(true);
          setNoResultsFound(places.length === 0);
        } else {
          setSuggestions([]);
          setNoResultsFound(true);
        }
      } catch (err) {
        console.error("Location search error:", err);
        setSuggestions([]);
        setNoResultsFound(true);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSuggestion = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);

    setSearchQuery(place.display_name);
    setShowDropdown(false);
    updateMarkerPosition(lat, lng, true, place.display_name);
  };

  const executeDirectSearch = async (queryText) => {
    if (!queryText.trim()) return;
    setIsSearching(true);
    setShowDropdown(false);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          queryText + ", Sri Lanka"
        )}&limit=1`
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          updateMarkerPosition(lat, lng, true, data[0].display_name);
          setNoResultsFound(false);
        } else {
          setNoResultsFound(true);
        }
      }
    } catch (err) {
      console.error("Direct search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDownSearch = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      } else if (searchQuery.trim().length >= 2) {
        executeDirectSearch(searchQuery);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    setNoResultsFound(false);
  };

  const validateAndSetFile = (file, setFile, setError, fieldName) => {
    if (!file) {
      setError(`${fieldName} is required.`);
      setFile(null);
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError("Invalid file type. Supported formats: PDF, JPG, PNG, JPEG.");
      setFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB maximum limit.`);
      setFile(null);
      return;
    }

    setError("");
    setFile(file);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation Rules (All fields are now mandatory)
  const isDistrictValid = Boolean(relocationAddress.district && relocationAddress.district.trim() !== "");
  const isCityValid = Boolean(relocationAddress.city && relocationAddress.city.trim() !== "");
  const isPostalCodeValid = /^\d{5}$/.test((relocationAddress.postalCode || "").trim());
  const isAddress1Valid = Boolean(relocationAddress.address1 && relocationAddress.address1.trim() !== "");
  const isAddress2Valid = Boolean(relocationAddress.address2 && relocationAddress.address2.trim() !== "");
  const isLandmarkValid = Boolean(relocationAddress.landmark && relocationAddress.landmark.trim() !== "");

  const isMapPinned = coordinates.lat !== null && coordinates.lng !== null;
  const isProofUploaded = proofFile !== null && proofError === "";
  const isSketchUploaded = sketchFile !== null && sketchError === "";

  const isFormValid =
    isDistrictValid &&
    isCityValid &&
    isPostalCodeValid &&
    isAddress1Valid &&
    isAddress2Valid &&
    isLandmarkValid &&
    isMapPinned &&
    isProofUploaded &&
    isSketchUploaded;

  const shouldShowError = (field, isValid) => {
    return (touched[field] || showValidationErrors) && !isValid;
  };

  // Sync Form State with Parent Component
  useEffect(() => {
    if (onValidationChangeRef.current) {
      onValidationChangeRef.current(isFormValid);
    }

    if (onDataChangeRef.current) {
      // Build a human-readable current address string for the summary
      const currentAddressParts = [
        currentAddress.address1,
        currentAddress.address2,
        currentAddress.city,
        currentAddress.district,
        currentAddress.postalCode,
      ].filter(Boolean);
      const currentAddressStr = currentAddressParts.length > 0
        ? currentAddressParts.join(', ')
        : '';

      // Build a human-readable new/relocation address string for the summary
      const newAddressParts = [
        relocationAddress.address1,
        relocationAddress.address2,
        relocationAddress.city,
        relocationAddress.district,
        relocationAddress.postalCode,
      ].filter(Boolean);
      const newAddressStr = newAddressParts.length > 0
        ? newAddressParts.join(', ')
        : '';

      onDataChangeRef.current({
        // Relocation address individual fields
        district: relocationAddress.district,
        city: relocationAddress.city,
        postalCode: relocationAddress.postalCode,
        address1: relocationAddress.address1,
        address2: relocationAddress.address2,
        landmark: relocationAddress.landmark,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        // Formatted address strings for the Agreement summary
        currentAddress: currentAddressStr,
        newAddress: newAddressStr,
        // Files with the keys AgreementStep expects
        proofOfAddress: proofFile || null,
        authorizationLetter: authorizationLetterFile || null,
        brc: brcFile || null,
        sketchFile: sketchFile,
      });
    }
  }, [
    relocationAddress,
    coordinates,
    proofFile,
    sketchFile,
    authorizationLetterFile,
    brcFile,
    currentAddress,
    isFormValid,
  ]);

  return (
    <div style={{ maxWidth: "850px", margin: "0 auto", fontFamily: "inherit" }}>
      <h3 style={{ color: "#0056a6", marginBottom: "1.5rem" }}>
        {t("wizards.locationChange.address.heading", "Step 2 – Address & Relocation")}
      </h3>

      {/* Current Address Read-Only Section */}
      <div
        className="card"
        style={{
          padding: "1.5rem",
          border: "1px solid #e0e0e0",
          backgroundColor: "#f9fbfd",
          marginBottom: "1.5rem",
          borderRadius: "8px",
        }}
      >
        <h4 style={{ color: "#333", marginBottom: "0.75rem", fontSize: "1.1rem" }}>
          Current Service Address <span style={{ fontSize: "0.8rem", color: "#666", fontWeight: "normal" }}>(Read-Only)</span>
        </h4>
        {loadingCurrent ? (
          <p style={{ color: "#777" }}>Loading current address...</p>
        ) : (
          <div style={{ lineHeight: "1.6", color: "#444", fontWeight: "500" }}>
            <p style={{ margin: 0 }}>{currentAddress.address1}</p>
            {currentAddress.address2 && <p style={{ margin: 0 }}>{currentAddress.address2}</p>}
            <p style={{ margin: 0 }}>{currentAddress.city}</p>
            <p style={{ margin: 0 }}>{currentAddress.district}</p>
            <p style={{ margin: 0 }}>{currentAddress.postalCode}</p>
          </div>
        )}
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Relocation Address Fields */}
        <div
          className="card"
          style={{
            padding: "1.5rem",
            border: "1px solid #e0e0e0",
            marginBottom: "1.5rem",
            borderRadius: "8px",
            backgroundColor: "#fff"
          }}
        >
          <h4 style={{ color: "#333", marginBottom: "1rem", fontSize: "1.1rem" }}>Relocation Address</h4>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label htmlFor="district-select" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
                District <span style={{ color: "red" }}>*</span>
              </label>
              <select
                id="district-select"
                value={relocationAddress.district}
                onChange={(e) => setRelocationAddress({ ...relocationAddress, district: e.target.value, city: "" })}
                onBlur={() => handleBlur("district")}
                style={{
                  width: "100%",
                  padding: "0.55rem",
                  borderRadius: "4px",
                  border: shouldShowError("district", isDistrictValid) ? "1px solid #dc3545" : "1px solid #ccc",
                  backgroundColor: shouldShowError("district", isDistrictValid) ? "#fff8f8" : "#fff"
                }}
              >
                <option value="">Select District</option>
                {SRI_LANKA_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
              {shouldShowError("district", isDistrictValid) && (
                <span style={{ fontSize: "0.8rem", color: "#dc3545", marginTop: "4px", display: "block" }}>
                  District is required.
                </span>
              )}
            </div>

            <div>
              <label htmlFor="city-input" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
                City / Town <span style={{ color: "red" }}>*</span>
              </label>
              {DISTRICT_CITIES[relocationAddress.district] ? (
                <select
                  id="city-input"
                  value={relocationAddress.city}
                  onChange={(e) => setRelocationAddress({ ...relocationAddress, city: e.target.value })}
                  onBlur={() => handleBlur("city")}
                  style={{
                    width: "100%",
                    padding: "0.55rem",
                    borderRadius: "4px",
                    border: shouldShowError("city", isCityValid) ? "1px solid #dc3545" : "1px solid #ccc",
                    backgroundColor: shouldShowError("city", isCityValid) ? "#fff8f8" : "#fff"
                  }}
                >
                  <option value="">Select City</option>
                  {DISTRICT_CITIES[relocationAddress.district].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <input
                  id="city-input"
                  type="text"
                  placeholder="Enter City"
                  value={relocationAddress.city}
                  onChange={(e) => setRelocationAddress({ ...relocationAddress, city: e.target.value })}
                  onBlur={() => handleBlur("city")}
                  style={{
                    width: "100%",
                    padding: "0.55rem",
                    borderRadius: "4px",
                    border: shouldShowError("city", isCityValid) ? "1px solid #dc3545" : "1px solid #ccc",
                    backgroundColor: shouldShowError("city", isCityValid) ? "#fff8f8" : "#fff"
                  }}
                />
              )}
              {shouldShowError("city", isCityValid) && (
                <span style={{ fontSize: "0.8rem", color: "#dc3545", marginTop: "4px", display: "block" }}>
                  City / Town is required.
                </span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="postal-code" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
              Postal Code (5 digits) <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="postal-code"
              type="text"
              placeholder="e.g. 10280"
              maxLength={5}
              value={relocationAddress.postalCode}
              onChange={(e) => setRelocationAddress({ ...relocationAddress, postalCode: e.target.value.replace(/\D/g, "") })}
              onBlur={() => handleBlur("postalCode")}
              style={{
                width: "100%",
                padding: "0.55rem",
                borderRadius: "4px",
                border: shouldShowError("postalCode", isPostalCodeValid) ? "1px solid #dc3545" : "1px solid #ccc",
                backgroundColor: shouldShowError("postalCode", isPostalCodeValid) ? "#fff8f8" : "#fff"
              }}
            />
            {shouldShowError("postalCode", isPostalCodeValid) && (
              <span style={{ fontSize: "0.8rem", color: "#dc3545", marginTop: "4px", display: "block" }}>
                {!relocationAddress.postalCode ? "Postal Code is required." : "Postal Code must be exactly 5 numeric digits."}
              </span>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="address-1" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
              Address Line 1 / Building / Shop Name <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="address-1"
              type="text"
              placeholder="No 25, Temple Road or Jeevanantham Stores"
              value={relocationAddress.address1}
              onChange={(e) => setRelocationAddress({ ...relocationAddress, address1: e.target.value })}
              onBlur={() => handleBlur("address1")}
              style={{
                width: "100%",
                padding: "0.55rem",
                borderRadius: "4px",
                border: shouldShowError("address1", isAddress1Valid) ? "1px solid #dc3545" : "1px solid #ccc",
                backgroundColor: shouldShowError("address1", isAddress1Valid) ? "#fff8f8" : "#fff"
              }}
            />
            {shouldShowError("address1", isAddress1Valid) && (
              <span style={{ fontSize: "0.8rem", color: "#dc3545", marginTop: "4px", display: "block" }}>
                Address Line 1 is required.
              </span>
            )}
          </div>

          <div>
            <label htmlFor="address-2" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
              Address Line 2 <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="address-2"
              type="text"
              placeholder="2nd Floor, Apartment A"
              value={relocationAddress.address2}
              onChange={(e) => setRelocationAddress({ ...relocationAddress, address2: e.target.value })}
              onBlur={() => handleBlur("address2")}
              style={{
                width: "100%",
                padding: "0.55rem",
                borderRadius: "4px",
                border: shouldShowError("address2", isAddress2Valid) ? "1px solid #dc3545" : "1px solid #ccc",
                backgroundColor: shouldShowError("address2", isAddress2Valid) ? "#fff8f8" : "#fff"
              }}
            />
            {shouldShowError("address2", isAddress2Valid) && (
              <span style={{ fontSize: "0.8rem", color: "#dc3545", marginTop: "4px", display: "block" }}>
                Address Line 2 is required.
              </span>
            )}
          </div>
        </div>

        {/* Location Search Bar */}
        <div
          className="card"
          ref={searchWrapperRef}
          style={{
            padding: "1.5rem",
            border: "1px solid #e0e0e0",
            marginBottom: "1.5rem",
            borderRadius: "8px",
            position: "relative",
            zIndex: 1000,
            backgroundColor: "#fff",
            overflow: "visible",
          }}
        >
          <h4 style={{ color: "#333", marginBottom: "0.75rem", fontSize: "1.1rem" }}>
            Search Relocation Location
          </h4>

          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search city/area (e.g., Trincomalee) - Press Enter to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDownSearch}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              style={{
                width: "100%",
                padding: "0.65rem 2.2rem 0.65rem 0.65rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                outline: "none",
                boxSizing: "border-box"
              }}
            />

            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                style={{
                  position: "absolute",
                  right: isSearching ? "85px" : "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#888",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  padding: "2px 6px"
                }}
                title="Clear Search"
              >
                ✕
              </button>
            )}

            {isSearching && (
              <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem", color: "#666" }}>
                Searching...
              </span>
            )}

            {/* Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <ul
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0 0 6px 6px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
                  listStyle: "none",
                  margin: "4px 0 0 0",
                  padding: 0,
                  zIndex: 99999,
                  maxHeight: "220px",
                  overflowY: "auto",
                }}
              >
                {suggestions.map((item, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelectSuggestion(item)}
                    style={{
                      padding: "0.7rem 1rem",
                      borderBottom: idx < suggestions.length - 1 ? "1px solid #f1f5f9" : "none",
                      cursor: "pointer",
                      fontSize: "0.88rem",
                      color: "#1e293b",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      backgroundColor: "#ffffff",
                      transition: "background-color 0.15s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                  >
                    <span style={{ color: "#0056a6" }}>📍</span>
                    <span>{item.display_name}</span>
                  </li>
                ))}
              </ul>
            )}

            {noResultsFound && !isSearching && searchQuery.length >= 2 && (
              <div
                style={{
                  marginTop: "0.5rem",
                  padding: "0.6rem 0.8rem",
                  backgroundColor: "#fffbe6",
                  border: "1px solid #ffe58f",
                  borderRadius: "4px",
                  fontSize: "0.83rem",
                  color: "#856404",
                }}
              >
                💡 Area name not found in map search? Try entering the district/city name directly or click on the map below to drop the pin.
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div
          className="card"
          style={{
            padding: "1rem",
            border: shouldShowError("map", isMapPinned) ? "1px solid #dc3545" : "1px solid #e0e0e0",
            backgroundColor: shouldShowError("map", isMapPinned) ? "#fff8f8" : "#fff",
            marginBottom: "1.5rem",
            borderRadius: "8px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <h4 style={{ color: "#333", marginBottom: "0.5rem", fontSize: "1.1rem" }}>
            Interactive Map Pinpoint <span style={{ color: "red" }}>*</span>
          </h4>
          <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.75rem" }}>
            Click anywhere on the map or drag the pin to set the exact installation point.
          </p>
          <div
            ref={mapContainerRef}
            style={{ height: "350px", width: "100%", borderRadius: "6px", border: "1px solid #ccc", zIndex: 1 }}
          />
          {shouldShowError("map", isMapPinned) && (
            <span style={{ fontSize: "0.8rem", color: "#dc3545", marginTop: "6px", display: "block", fontWeight: "500" }}>
              Please click or drop a pin on the map to set the exact installation location.
            </span>
          )}
        </div>

        {/* Document Upload Section */}
        <div
          className="card"
          style={{
            padding: "1.5rem",
            border: (shouldShowError("proof", isProofUploaded) || shouldShowError("sketch", isSketchUploaded)) ? "1px solid #dc3545" : "1px solid #e0e0e0",
            backgroundColor: (shouldShowError("proof", isProofUploaded) || shouldShowError("sketch", isSketchUploaded)) ? "#fff8f8" : "#fff",
            marginBottom: "1.5rem",
            borderRadius: "8px",
          }}
        >
          <h4 style={{ color: "#333", marginBottom: "1rem", fontSize: "1.1rem" }}>Additional Installation Details</h4>

          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="landmark" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
              Nearest Landmark <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="landmark"
              type="text"
              placeholder="e.g. Near Clock Tower / Opposite People's Bank"
              value={relocationAddress.landmark}
              onChange={(e) => setRelocationAddress({ ...relocationAddress, landmark: e.target.value })}
              onBlur={() => handleBlur("landmark")}
              style={{
                width: "100%",
                padding: "0.55rem",
                borderRadius: "4px",
                border: shouldShowError("landmark", isLandmarkValid) ? "1px solid #dc3545" : "1px solid #ccc",
                backgroundColor: shouldShowError("landmark", isLandmarkValid) ? "#fff8f8" : "#fff"
              }}
            />
            {shouldShowError("landmark", isLandmarkValid) && (
              <span style={{ fontSize: "0.8rem", color: "#dc3545", marginTop: "4px", display: "block" }}>
                Nearest Landmark is required.
              </span>
            )}
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="proof-file" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
              Proof of New Address <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="proof-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => validateAndSetFile(e.target.files[0], setProofFile, setProofError, "Proof of address document")}
              style={{ display: "block", width: "100%", padding: "0.4rem 0" }}
            />
            <span style={{ fontSize: "0.8rem", color: "#666" }}>Supported Formats: PDF, JPG, PNG, JPEG (Max 5MB)</span>

            {shouldShowError("proof", isProofUploaded) && !proofError && (
              <div style={{ color: "#dc3545", fontSize: "0.82rem", marginTop: "4px", fontWeight: "500" }}>
                Proof of address document is required.
              </div>
            )}

            {proofError && <div style={{ color: "#dc3545", fontSize: "0.82rem", marginTop: "4px" }}>{proofError}</div>}

            {proofFile && (
              <div style={{ color: "#0056a6", fontSize: "0.85rem", marginTop: "6px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>✓ Uploaded: {proofFile.name} ({(proofFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                <button
                  type="button"
                  onClick={() => { setProofFile(null); setProofError(""); }}
                  style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline" }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="sketch-file" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
              Route Sketch <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="sketch-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => validateAndSetFile(e.target.files[0], setSketchFile, setSketchError, "Route sketch document")}
              style={{ display: "block", width: "100%", padding: "0.4rem 0" }}
            />
            <span style={{ fontSize: "0.8rem", color: "#666" }}>Supported Formats: PDF, JPG, PNG, JPEG (Max 5MB)</span>

            {shouldShowError("sketch", isSketchUploaded) && !sketchError && (
              <div style={{ color: "#dc3545", fontSize: "0.82rem", marginTop: "4px", fontWeight: "500" }}>
                Route sketch document is required.
              </div>
            )}

            {sketchError && <div style={{ color: "#dc3545", fontSize: "0.82rem", marginTop: "4px" }}>{sketchError}</div>}

            {sketchFile && (
              <div style={{ color: "#0056a6", fontSize: "0.85rem", marginTop: "6px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>✓ Uploaded: {sketchFile.name} ({(sketchFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                <button
                  type="button"
                  onClick={() => { setSketchFile(null); setSketchError(""); }}
                  style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline" }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Authorization Letter (Optional) */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="auth-letter-file" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
              Authorization Letter <span style={{ color: "#888", fontWeight: "400", fontSize: "0.85rem" }}>(Optional)</span>
            </label>
            <input
              id="auth-letter-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => validateAndSetFile(e.target.files[0], setAuthorizationLetterFile, setAuthorizationLetterError, "Authorization letter")}
              style={{ display: "block", width: "100%", padding: "0.4rem 0" }}
            />
            <span style={{ fontSize: "0.8rem", color: "#666" }}>Supported Formats: PDF, JPG, PNG, JPEG (Max 5MB)</span>
            {authorizationLetterError && <div style={{ color: "#dc3545", fontSize: "0.82rem", marginTop: "4px" }}>{authorizationLetterError}</div>}
            {authorizationLetterFile && (
              <div style={{ color: "#0056a6", fontSize: "0.85rem", marginTop: "6px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>✓ Uploaded: {authorizationLetterFile.name} ({(authorizationLetterFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                <button
                  type="button"
                  onClick={() => { setAuthorizationLetterFile(null); setAuthorizationLetterError(""); }}
                  style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline" }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>


        </div>
      </form>
    </div>
  );
}