import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FiMapPin, FiHome, FiUploadCloud, FiCheckCircle, FiNavigation, FiFileText, FiCheck, FiX } from "react-icons/fi";
import api from "../../utils/api";
import AddressInputWithMap from "../../components/form/AddressInputWithMap";

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
  selectedAccount,
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
  const [selectedPlaceName, setSelectedPlaceName] = useState("");
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const searchWrapperRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Fetch Current Address from backend API using verified telephone number
  useEffect(() => {
    let isSubscribed = true;

    async function fetchCurrentAddress() {
      const telephone = formData?.telephone || formData?.tel || formData?.phone;

      if (!telephone) {
        if (isSubscribed) {
          setCurrentAddress({
            address1: formData?.addressLine1 || formData?.address || "",
            address2: formData?.addressLine2 || "",
            city: formData?.city || "",
            district: formData?.district || "",
            postalCode: formData?.postalCode || "",
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
          const currObj = (cust.currentAddress && typeof cust.currentAddress === 'object') ? cust.currentAddress : {};

          const addr1 = currObj.address1 || currObj.addressLine1 || cust.addressLine1 || cust.address1 || cust.address || "";
          const addr2 = currObj.address2 || currObj.addressLine2 || cust.addressLine2 || cust.address2 || "";
          const city = currObj.city || cust.city || "";
          const district = currObj.district || cust.district || "";
          const postalCode = currObj.postalCode || currObj.postal_code || cust.postalCode || cust.postal_code || "";

          if (isSubscribed) {
            setCurrentAddress({
              address1: addr1,
              address2: addr2,
              city,
              district,
              postalCode,
            });
          }
        } else if (isSubscribed) {
          setCurrentAddress({
            address1: formData?.addressLine1 || formData?.address || "",
            address2: formData?.addressLine2 || "",
            city: formData?.city || "",
            district: formData?.district || "",
            postalCode: formData?.postalCode || "",
          });
        }
      } catch (err) {
        console.error("Failed to load customer current address:", err);
        if (isSubscribed) {
          setCurrentAddress({
            address1: formData?.addressLine1 || formData?.address || "",
            address2: formData?.addressLine2 || "",
            city: formData?.city || "",
            district: formData?.district || "",
            postalCode: formData?.postalCode || "",
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
        const displayName = data.display_name || `${detectedRoad}, ${detectedCity}, Sri Lanka`;

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
        setSelectedPlaceName(displayName);
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
    setSelectedPlaceName(displayAddress || "");

    if (doReverseGeocode) {
      reverseGeocode(lat, lng);
    }
  }, [reverseGeocode]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!isMapModalOpen || !mapContainerRef.current || mapRef.current) return;

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
  }, [updateMarkerPosition, isMapModalOpen]);

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
    setSelectedPlaceName(place.display_name);
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
  const isAddress2Valid = true; // Address Line 2 is optional
  const isLandmarkValid = Boolean(relocationAddress.landmark && relocationAddress.landmark.trim() !== "");

  const isMapPinned = coordinates.lat !== null && coordinates.lng !== null;
  const isProofValid = Boolean(proofFile) && proofError === "";
  const isSketchValid = sketchError === "";

  const isFormValid =
    isDistrictValid &&
    isCityValid &&
    isPostalCodeValid &&
    isAddress1Valid &&
    isLandmarkValid &&
    isMapPinned &&
    isProofValid &&
    isSketchValid;

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
    <div style={{ width: "100%", margin: "0 auto", fontFamily: "inherit" }}>
      {/* Current Address Read-Only Section */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "1.75rem 2rem",
          marginBottom: "1.75rem",
          border: "1px solid #e2e8f0",
          borderLeft: "5px solid #0056b3",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div style={{ backgroundColor: "#eff6ff", color: "#0056b3", width: "34px", height: "34px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiMapPin size={18} />
            </div>
            <h4 style={{ margin: 0, color: "#0f172a", fontSize: "1.1rem", fontWeight: 800 }}>
              Current Registered Service Address
            </h4>
          </div>
          <span style={{ fontSize: "0.75rem", backgroundColor: "#f1f5f9", color: "#475569", padding: "0.3rem 0.75rem", borderRadius: "9999px", fontWeight: 800 }}>
            Read-Only (Verified from DB)
          </span>
        </div>

        {loadingCurrent ? (
          <p style={{ color: "#64748b", margin: 0, fontWeight: 600 }}>Loading current registered address...</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Address Line 1</div>
              <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", marginTop: "0.15rem" }}>{currentAddress.address1 || "—"}</div>
            </div>
            {currentAddress.address2 && (
              <div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Address Line 2</div>
                <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", marginTop: "0.15rem" }}>{currentAddress.address2}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>City & District</div>
              <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", marginTop: "0.15rem" }}>{currentAddress.city ? `${currentAddress.city}, ${currentAddress.district}` : "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Postal Code</div>
              <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0056b3", marginTop: "0.15rem" }}>{currentAddress.postalCode || "—"}</div>
            </div>
          </div>
        )}
      </div>

      <div>
        {/* Relocation Address Fields */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "1.75rem 2rem",
            marginBottom: "1.75rem",
            border: "1px solid #e2e8f0",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1.25rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.85rem" }}>
            <div style={{ backgroundColor: "#eff6ff", color: "#0056b3", width: "34px", height: "34px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiHome size={18} />
            </div>
            <h4 style={{ margin: 0, color: "#0f172a", fontSize: "1.1rem", fontWeight: 800 }}>
              1. New Relocation Address Details
            </h4>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "1.25rem" }}>
            <div>
              <label htmlFor="district-select" style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                District <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                id="district-select"
                value={relocationAddress.district}
                onChange={(e) => setRelocationAddress({ ...relocationAddress, district: e.target.value, city: "" })}
                onBlur={() => handleBlur("district")}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  border: shouldShowError("district", isDistrictValid) ? "1.5px solid #dc2626" : "1px solid #cbd5e1",
                  backgroundColor: shouldShowError("district", isDistrictValid) ? "#fef2f2" : "#ffffff",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">Select District</option>
                {SRI_LANKA_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
              {shouldShowError("district", isDistrictValid) && (
                <span style={{ fontSize: "0.8rem", color: "#dc2626", marginTop: "4px", display: "block", fontWeight: 700 }}>
                  ⚠️ District is required.
                </span>
              )}
            </div>

            <div>
              <label htmlFor="city-input" style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                City / Town <span style={{ color: "#dc2626" }}>*</span>
              </label>
              {DISTRICT_CITIES[relocationAddress.district] ? (
                <select
                  id="city-input"
                  value={relocationAddress.city}
                  onChange={(e) => setRelocationAddress({ ...relocationAddress, city: e.target.value })}
                  onBlur={() => handleBlur("city")}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: shouldShowError("city", isCityValid) ? "1.5px solid #dc2626" : "1px solid #cbd5e1",
                    backgroundColor: shouldShowError("city", isCityValid) ? "#fef2f2" : "#ffffff",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    outline: "none",
                    cursor: "pointer",
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
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: shouldShowError("city", isCityValid) ? "1.5px solid #dc2626" : "1px solid #cbd5e1",
                    backgroundColor: shouldShowError("city", isCityValid) ? "#fef2f2" : "#ffffff",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#0f172a",
                    outline: "none",
                  }}
                />
              )}
              {shouldShowError("city", isCityValid) && (
                <span style={{ fontSize: "0.8rem", color: "#dc2626", marginTop: "4px", display: "block", fontWeight: 700 }}>
                  ⚠️ City / Town is required.
                </span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="postal-code" style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155", display: "block", marginBottom: "0.4rem" }}>
              Postal Code (5 digits) <span style={{ color: "#dc2626" }}>*</span>
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
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                border: shouldShowError("postalCode", isPostalCodeValid) ? "1.5px solid #dc2626" : "1px solid #cbd5e1",
                backgroundColor: shouldShowError("postalCode", isPostalCodeValid) ? "#fef2f2" : "#ffffff",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#0f172a",
                outline: "none",
              }}
            />
            {shouldShowError("postalCode", isPostalCodeValid) && (
              <span style={{ fontSize: "0.8rem", color: "#dc2626", marginTop: "4px", display: "block", fontWeight: 700 }}>
                ⚠️ {!relocationAddress.postalCode ? "Postal Code is required." : "Postal Code must be exactly 5 numeric digits."}
              </span>
            )}
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="address-1" style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155", display: "block", marginBottom: "0.4rem" }}>
              Address Line 1 / Building / Shop Name <span style={{ color: "#dc2626" }}>*</span>
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
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                border: shouldShowError("address1", isAddress1Valid) ? "1.5px solid #dc2626" : "1px solid #cbd5e1",
                backgroundColor: shouldShowError("address1", isAddress1Valid) ? "#fef2f2" : "#ffffff",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#0f172a",
                outline: "none",
              }}
            />
            {shouldShowError("address1", isAddress1Valid) && (
              <span style={{ fontSize: "0.8rem", color: "#dc2626", marginTop: "4px", display: "block", fontWeight: 700 }}>
                ⚠️ Address Line 1 is required.
              </span>
            )}
          </div>

          <div>
            <label htmlFor="address-2" style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155", display: "block", marginBottom: "0.4rem" }}>
              Address Line 2 (Optional)
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
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#0f172a",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Map Location Card */}
        <div
          style={{
            backgroundColor: shouldShowError("map", isMapPinned) ? "#fef2f2" : "#ffffff",
            borderRadius: "16px",
            padding: "1.75rem 2rem",
            marginBottom: "1.75rem",
            border: shouldShowError("map", isMapPinned) ? "1.5px solid #dc2626" : "1px solid #e2e8f0",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.75rem" }}>
            <div style={{ backgroundColor: "#fef3c7", color: "#d97706", width: "34px", height: "34px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiNavigation size={18} />
            </div>
            <h4 style={{ margin: 0, color: "#0f172a", fontSize: "1.1rem", fontWeight: 800 }}>
              2. Relocation Location Pinning (Map)
            </h4>
          </div>

          <p style={{ fontSize: "0.88rem", color: "#64748b", marginBottom: "1.25rem", fontWeight: 500 }}>
            Search for the relocation address on the interactive map and drop the exact installation pin.
          </p>

          <button
            type="button"
            onClick={() => setIsMapModalOpen(true)}
            style={{
              padding: "0.75rem 1.75rem",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #0056b3 0%, #003b73 100%)",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: "0.9rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.55rem",
              boxShadow: "0 4px 16px rgba(0, 86, 179, 0.3)",
            }}
          >
            <FiMapPin size={18} />
            <span>Open Interactive Map Picker</span>
          </button>

          {coordinates.lat !== null && coordinates.lng !== null && (
            <div style={{ marginTop: "1.25rem", padding: "0.85rem 1.25rem", backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", color: "#14532d", fontSize: "0.88rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiCheckCircle size={18} style={{ color: "#16a34a" }} />
              <div>
                <strong>Selected Coordinates:</strong> {selectedPlaceName ? `${selectedPlaceName} — ` : ""}
                ({coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}) ✓
              </div>
            </div>
          )}

          {shouldShowError("map", isMapPinned) && (
            <span style={{ display: "block", marginTop: "0.75rem", fontSize: "0.8rem", color: "#dc2626", fontWeight: 700 }}>
              ⚠️ Please pick a location on the map to set the exact installation point.
            </span>
          )}
        </div>

        {/* Map Dialog Modal */}
        {isMapModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 20000,
              backgroundColor: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "960px",
                maxHeight: "90vh",
                overflow: "auto",
                backgroundColor: "#ffffff",
                borderRadius: "20px",
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
                position: "relative",
                padding: "1.75rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 900, color: "#0f172a" }}>
                    Select Installation Location on Map
                  </h3>
                  <p style={{ margin: "0.3rem 0 0", color: "#64748b", fontSize: "0.88rem", fontWeight: 500 }}>
                    Search city, street or landmark and click on the map to drop your pin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(false)}
                  style={{
                    border: "none",
                    background: "#f1f5f9",
                    color: "#64748b",
                    borderRadius: "50%",
                    width: "34px",
                    height: "34px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Close modal"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div style={{ marginBottom: "1rem", position: "relative" }}>
                <input
                  type="text"
                  placeholder="Search city, area, street or landmark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDownSearch}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowDropdown(true);
                  }}
                  style={{
                    width: "100%",
                    padding: "0.75rem 2.5rem 0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    style={{
                      position: "absolute",
                      right: "1.25rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      fontSize: "1rem",
                      cursor: "pointer",
                    }}
                    title="Clear Search"
                  >
                    <FiX size={16} />
                  </button>
                )}

                {showDropdown && suggestions.length > 0 && (
                  <ul
                    style={{
                      position: "absolute",
                      top: "calc(100% + 0.3rem)",
                      left: 0,
                      right: 0,
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "10px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                      zIndex: 10001,
                      maxHeight: "240px",
                      overflowY: "auto",
                    }}
                  >
                    {suggestions.map((item, idx) => (
                      <li
                        key={idx}
                        onClick={() => handleSelectSuggestion(item)}
                        style={{
                          padding: "0.85rem 1rem",
                          borderBottom: idx < suggestions.length - 1 ? "1px solid #f1f5f9" : "none",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: "#1e293b",
                        }}
                      >
                        📍 {item.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div
                ref={mapContainerRef}
                style={{ height: "420px", width: "100%", borderRadius: "14px", border: "1px solid #cbd5e1", marginBottom: "1.25rem" }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.85rem" }}>
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(false)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "10px",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    color: "#334155",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(false)}
                  style={{
                    padding: "0.75rem 1.75rem",
                    borderRadius: "10px",
                    backgroundColor: "#0056b3",
                    border: "none",
                    color: "#ffffff",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Confirm Location Pin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Additional Installation Details & Document Upload Section */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "1.75rem 2rem",
            marginBottom: "1.75rem",
            border: (shouldShowError("proof", isProofValid) || shouldShowError("sketch", isSketchValid)) ? "1.5px solid #dc2626" : "1px solid #e2e8f0",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1.25rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.85rem" }}>
            <div style={{ backgroundColor: "#f0fdf4", color: "#16a34a", width: "34px", height: "34px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiFileText size={18} />
            </div>
            <h4 style={{ margin: 0, color: "#0f172a", fontSize: "1.1rem", fontWeight: 800 }}>
              3. Additional Installation Details & Address Documents
            </h4>
          </div>

          {/* Landmark Input */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="landmark" style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155", display: "block", marginBottom: "0.4rem" }}>
              Nearest Landmark <span style={{ color: "#dc2626" }}>*</span>
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
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                border: shouldShowError("landmark", isLandmarkValid) ? "1.5px solid #dc2626" : "1px solid #cbd5e1",
                backgroundColor: shouldShowError("landmark", isLandmarkValid) ? "#fef2f2" : "#ffffff",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#0f172a",
                outline: "none",
              }}
            />
            {shouldShowError("landmark", isLandmarkValid) && (
              <span style={{ fontSize: "0.8rem", color: "#dc2626", marginTop: "4px", display: "block", fontWeight: 700 }}>
                ⚠️ Nearest Landmark is required.
              </span>
            )}
          </div>

          {/* Document Uploads Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {/* Proof of Address File Upload Dropzone */}
            <div>
              <label style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155", display: "block", marginBottom: "0.5rem" }}>
                Proof of New Address <span style={{ color: "#dc2626" }}>*</span>
              </label>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "1.5rem",
                  border: proofFile ? "2px stroke #10b981" : "2px dashed #93c5fd",
                  borderRadius: "12px",
                  backgroundColor: proofFile ? "#f0fdf4" : "#f8fafc",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  onChange={(e) => validateAndSetFile(e.target.files[0], setProofFile, setProofError, "Proof of address document")}
                />
                <FiUploadCloud size={30} style={{ color: proofFile ? "#16a34a" : "#0056b3", marginBottom: "0.5rem" }} />
                {proofFile ? (
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#15803d", display: "block" }}>
                      📄 {proofFile.name}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#166534", fontWeight: 600 }}>File Uploaded ✓</span>
                  </div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0056b3", display: "block" }}>
                      Upload Proof of Address
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Utility Bill, Grama Niladhari, PDF, JPG up to 5MB</span>
                  </div>
                )}
              </label>

              {proofError && <div style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.4rem", fontWeight: 700 }}>⚠️ {proofError}</div>}
              {showValidationErrors && !proofFile && !proofError && (
                <div style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.4rem", fontWeight: 700 }}>
                  ⚠️ Proof of new address document is required.
                </div>
              )}
            </div>

            {/* Route Sketch Upload Dropzone */}
            <div>
              <label style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155", display: "block", marginBottom: "0.5rem" }}>
                Route Sketch <span style={{ color: "#64748b", fontWeight: 500, fontSize: "0.8rem" }}>(Optional)</span>
              </label>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "1.5rem",
                  border: sketchFile ? "2px stroke #10b981" : "2px dashed #93c5fd",
                  borderRadius: "12px",
                  backgroundColor: sketchFile ? "#f0fdf4" : "#f8fafc",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  onChange={(e) => validateAndSetFile(e.target.files[0], setSketchFile, setSketchError, "Route sketch document")}
                />
                <FiUploadCloud size={30} style={{ color: sketchFile ? "#16a34a" : "#0056b3", marginBottom: "0.5rem" }} />
                {sketchFile ? (
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#15803d", display: "block" }}>
                      📄 {sketchFile.name}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#166534", fontWeight: 600 }}>File Uploaded ✓</span>
                  </div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0056b3", display: "block" }}>
                      Upload Route Sketch
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Handwritten map/sketch up to 5MB</span>
                  </div>
                )}
              </label>
              {sketchError && <div style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.4rem", fontWeight: 700 }}>⚠️ {sketchError}</div>}
            </div>

            {/* Authorization Letter Upload Dropzone */}
            <div>
              <label style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155", display: "block", marginBottom: "0.5rem" }}>
                Authorization Letter <span style={{ color: "#64748b", fontWeight: 500, fontSize: "0.8rem" }}>(Optional)</span>
              </label>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "1.5rem",
                  border: authorizationLetterFile ? "2px stroke #10b981" : "2px dashed #93c5fd",
                  borderRadius: "12px",
                  backgroundColor: authorizationLetterFile ? "#f0fdf4" : "#f8fafc",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  onChange={(e) => validateAndSetFile(e.target.files[0], setAuthorizationLetterFile, setAuthorizationLetterError, "Authorization letter")}
                />
                <FiUploadCloud size={30} style={{ color: authorizationLetterFile ? "#16a34a" : "#0056b3", marginBottom: "0.5rem" }} />
                {authorizationLetterFile ? (
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#15803d", display: "block" }}>
                      📄 {authorizationLetterFile.name}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#166534", fontWeight: 600 }}>File Uploaded ✓</span>
                  </div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0056b3", display: "block" }}>
                      Upload Authorization Letter
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Letter from property owner up to 5MB</span>
                  </div>
                )}
              </label>
              {authorizationLetterError && <div style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.4rem", fontWeight: 700 }}>⚠️ {authorizationLetterError}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}