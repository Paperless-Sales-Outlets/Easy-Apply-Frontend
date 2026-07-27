import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default marker icon path issue in bundlers (Webpack/Vite)
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

// District to Cities Mapping Sample
const DISTRICT_CITIES = {
  Colombo: ["Colombo 01", "Colombo 02", "Colombo 03", "Dehiwala", "Maharagama", "Nugegoda", "Piliyandala"],
  Gampaha: ["Gampaha", "Negombo", "Kelaniya", "Ja-Ela", "Wattala"],
  Kandy: ["Kandy", "Peradeniya", "Katugastota", "Gampola"],
  Galle: ["Galle", "Karapitiya", "Hikkaduwa", "Ambalangoda"],
};

export default function AddressStep({ isActive, onValidationChange, onDataChange }) {
  const { t } = useTranslation();

  // --- Section 1: Current Address (Read-Only) ---
  const [currentAddress, setCurrentAddress] = useState({
    address1: "",
    address2: "",
    city: "",
    district: "",
    postalCode: "",
  });
  const [loadingCurrent, setLoadingCurrent] = useState(true);

  // --- Section 2: Relocation Address ---
  const [relocationAddress, setRelocationAddress] = useState({
    district: "",
    city: "",
    postalCode: "",
    address1: "",
    address2: "",
  });

  // --- Map & Coordinates ---
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);

  // --- Section 3: Search Location ---
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- Section 7: Billing Address ---
  const [sameAsRelocation, setSameAsRelocation] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    address1: "",
    address2: "",
    city: "",
    district: "",
    postalCode: "",
  });

  // 1. Fetch Current Service Address on mount
  useEffect(() => {
    async function fetchCurrentAddress() {
      try {
        const response = await fetch("/api/customer/current-address");
        if (response.ok) {
          const data = await response.json();
          setCurrentAddress(data);
        } else {
          // Fallback demo data if API isn't live yet
          setCurrentAddress({
            address1: "45, Galle Road",
            address2: "",
            city: "Colombo 03",
            district: "Colombo",
            postalCode: "00300",
          });
        }
      } catch (err) {
        console.warn("Using fallback current address data.");
        setCurrentAddress({
          address1: "45, Galle Road",
          address2: "",
          city: "Colombo 03",
          district: "Colombo",
          postalCode: "00300",
        });
      } finally {
        setLoadingCurrent(false);
      }
    }
    fetchCurrentAddress();
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default view: Sri Lanka center
    const map = L.map(mapContainerRef.current).setView([7.8731, 80.7718], 8);
    
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    // Handle Click on Map
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      updateMarkerPosition(lat, lng, true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 3. Reverse Geocoding trigger
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      if (!response.ok) return;
      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;
        const detectedDistrict = addr.state_district || addr.state || addr.county || "";
        const detectedCity = addr.city || addr.town || addr.village || addr.suburb || "";
        const detectedPostcode = addr.postcode || "";
        const detectedRoad = addr.road || addr.pedestrian || addr.suburb || data.display_name.split(",")[0] || "";

        // Match detected district to SL list if possible
        const matchedDistrict = SRI_LANKA_DISTRICTS.find(
          (d) => d.toLowerCase() === detectedDistrict.replace("District", "").trim().toLowerCase()
        ) || "";

        setRelocationAddress((prev) => ({
          ...prev,
          district: matchedDistrict || prev.district,
          city: detectedCity || prev.city,
          postalCode: detectedPostcode || prev.postalCode,
          address1: detectedRoad ? `No ${detectedRoad}` : prev.address1,
        }));
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    }
  };

  // Move or Create Marker & Center Map
  const updateMarkerPosition = (lat, lng, triggerReverseGeocode = true) => {
    setCoordinates({ lat, lng });

    if (!mapRef.current) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], { draggable: true }).addTo(mapRef.current);
      
      marker.on("dragend", (e) => {
        const newCoords = e.target.getLatLng();
        setCoordinates({ lat: newCoords.lat, lng: newCoords.lng });
        reverseGeocode(newCoords.lat, newCoords.lng);
      });

      markerRef.current = marker;
    }

    mapRef.current.setView([lat, lng], 15);

    if (triggerReverseGeocode) {
      reverseGeocode(lat, lng);
    }
  };

  // 4. Handle Nominatim Place Search (Debounced)
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery + ", Sri Lanka"
          )}&limit=5&addressdetails=1`
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSuggestion = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    
    setSearchQuery(place.display_name);
    setSuggestions([]);
    
    updateMarkerPosition(lat, lng, true);
  };

  // 5. Section 6 Validation Check
  const isValid = Boolean(
    relocationAddress.district &&
    relocationAddress.city &&
    relocationAddress.postalCode &&
    relocationAddress.address1 &&
    coordinates.lat !== null &&
    coordinates.lng !== null
  );

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
    if (onDataChange) {
      onDataChange({
        district: relocationAddress.district,
        city: relocationAddress.city,
        postalCode: relocationAddress.postalCode,
        address1: relocationAddress.address1,
        address2: relocationAddress.address2,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        billingAddress: sameAsRelocation ? relocationAddress : billingAddress,
      });
    }
  }, [relocationAddress, coordinates, sameAsRelocation, billingAddress, isValid]);

  return (
    <div style={{ maxWidth: "850px", margin: "0 auto" }}>
      <h3 style={{ color: "var(--slt-blue, #0056a6)", marginBottom: "1.5rem" }}>
        {t("wizards.locationChange.address.heading", "Step 2 – Address & Relocation")}
      </h3>

      {/* SECTION 1: Current Service Address (Read Only) */}
      <div
        className="card"
        style={{
          padding: "1.5rem",
          border: "1px solid var(--border-color, #e0e0e0)",
          backgroundColor: "#f9fbfd",
          marginBottom: "1.5rem",
          borderRadius: "8px",
        }}
      >
        <h4 style={{ color: "var(--text-primary, #333)", marginBottom: "0.75rem", fontSize: "1.1rem" }}>
          {t("wizards.locationChange.address.currentHeading", "Current Service Address")}
          <span style={{ fontSize: "0.8rem", color: "#666", fontWeight: "normal", marginLeft: "8px" }}>(Read-Only)</span>
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

      {/* SECTION 2: Relocation Address */}
      <div
        className="card"
        style={{
          padding: "1.5rem",
          border: "1px solid var(--border-color, #e0e0e0)",
          marginBottom: "1.5rem",
          borderRadius: "8px",
        }}
      >
        <h4 style={{ color: "var(--text-primary, #333)", marginBottom: "1rem", fontSize: "1.1rem" }}>
          {t("wizards.locationChange.address.relocationHeading", "Relocation Address")}
        </h4>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label className="form-label" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
              District <span style={{ color: "red" }}>*</span>
            </label>
            <select
              className="form-control"
              value={relocationAddress.district}
              onChange={(e) => setRelocationAddress({ ...relocationAddress, district: e.target.value, city: "" })}
              required={isActive}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="">Select District</option>
              {SRI_LANKA_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
              City / Town <span style={{ color: "red" }}>*</span>
            </label>
            {DISTRICT_CITIES[relocationAddress.district] ? (
              <select
                className="form-control"
                value={relocationAddress.city}
                onChange={(e) => setRelocationAddress({ ...relocationAddress, city: e.target.value })}
                required={isActive}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              >
                <option value="">Select City</option>
                {DISTRICT_CITIES[relocationAddress.district].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="form-control"
                placeholder="Enter City"
                value={relocationAddress.city}
                onChange={(e) => setRelocationAddress({ ...relocationAddress, city: e.target.value })}
                required={isActive}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            )}
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label className="form-label" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
            Postal Code <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. 10280"
            value={relocationAddress.postalCode}
            onChange={(e) => setRelocationAddress({ ...relocationAddress, postalCode: e.target.value })}
            required={isActive}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label className="form-label" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
            Address Line 1 <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="No 25, Temple Road"
            value={relocationAddress.address1}
            onChange={(e) => setRelocationAddress({ ...relocationAddress, address1: e.target.value })}
            required={isActive}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div>
          <label className="form-label" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="2nd Floor, Apartment A"
            value={relocationAddress.address2}
            onChange={(e) => setRelocationAddress({ ...relocationAddress, address2: e.target.value })}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>
      </div>

      {/* SECTION 3: Search Location */}
      <div
        className="card"
        style={{
          padding: "1.5rem",
          border: "1px solid var(--border-color, #e0e0e0)",
          marginBottom: "1.5rem",
          borderRadius: "8px",
          position: "relative",
        }}
      >
        <h4 style={{ color: "var(--text-primary, #333)", marginBottom: "0.75rem", fontSize: "1.1rem" }}>
          Search Relocation Location
        </h4>
        <input
          type="text"
          className="form-control"
          placeholder="Search by landmark, street or area (e.g. Temple Road)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "100%", padding: "0.6rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        {isSearching && <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.25rem" }}>Searching places...</p>}

        {suggestions.length > 0 && (
          <ul
            style={{
              position: "absolute",
              top: "100%",
              left: "1.5rem",
              right: "1.5rem",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "0 0 4px 4px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              listStyle: "none",
              margin: 0,
              padding: 0,
              zIndex: 1000,
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                onClick={() => handleSelectSuggestion(item)}
                style={{
                  padding: "0.6rem 1rem",
                  borderBottom: idx < suggestions.length - 1 ? "1px solid #eee" : "none",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                📍 {item.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* SECTION 4: Interactive Map */}
      <div
        className="card"
        style={{
          padding: "1rem",
          border: "1px solid var(--border-color, #e0e0e0)",
          marginBottom: "1.5rem",
          borderRadius: "8px",
        }}
      >
        <h4 style={{ color: "var(--text-primary, #333)", marginBottom: "0.5rem", fontSize: "1.1rem" }}>
          Interactive Map Pinpoint
        </h4>
        <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.75rem" }}>
          Click anywhere on the map or drag the pin to set the exact installation point.
        </p>
        <div
          ref={mapContainerRef}
          style={{ height: "350px", width: "100%", borderRadius: "6px", border: "1px solid #ccc" }}
        />
      </div>

      {/* SECTION 7: Billing Address */}
      <div
        className="card"
        style={{
          padding: "1.5rem",
          border: "1px solid var(--border-color, #e0e0e0)",
          marginBottom: "1.5rem",
          borderRadius: "8px",
        }}
      >
        <h4 style={{ color: "var(--text-primary, #333)", marginBottom: "1rem", fontSize: "1.1rem" }}>
          Billing Address
        </h4>

        <label style={{ display: "flex", alignItems: "center", cursor: "pointer", marginBottom: "1rem" }}>
          <input
            type="checkbox"
            checked={sameAsRelocation}
            onChange={(e) => setSameAsRelocation(e.target.checked)}
            style={{ width: "18px", height: "18px", marginRight: "10px" }}
          />
          <span style={{ fontWeight: "500" }}>Same as relocation address</span>
        </label>

        {!sameAsRelocation && (
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
            <div style={{ marginBottom: "1rem" }}>
              <label className="form-label" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
                Billing Address Line 1
              </label>
              <input
                type="text"
                className="form-control"
                value={billingAddress.address1}
                onChange={(e) => setBillingAddress({ ...billingAddress, address1: e.target.value })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label className="form-label" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
                Billing Address Line 2
              </label>
              <input
                type="text"
                className="form-control"
                value={billingAddress.address2}
                onChange={(e) => setBillingAddress({ ...billingAddress, address2: e.target.value })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="form-label" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
                  City
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={billingAddress.city}
                  onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
                  District
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={billingAddress.district}
                  onChange={(e) => setBillingAddress({ ...billingAddress, district: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontWeight: "600", display: "block", marginBottom: "0.3rem" }}>
                  Postal Code
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={billingAddress.postalCode}
                  onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 8: Summary Box */}
      <div
        className="card"
        style={{
          padding: "1.25rem",
          backgroundColor: "#f4f8fb",
          border: "1px solid #bce0fd",
          borderRadius: "8px",
        }}
      >
        <h5 style={{ margin: "0 0 0.5rem 0", color: "#0056a6" }}>Selected Relocation Summary</h5>
        <div style={{ fontSize: "0.9rem", color: "#333", lineHeight: "1.5" }}>
          <p style={{ margin: 0 }}>
            <strong>Address:</strong>{" "}
            {[relocationAddress.address1, relocationAddress.city, relocationAddress.district, relocationAddress.postalCode]
              .filter(Boolean)
              .join(", ") || "Not selected yet"}
          </p>
          <p style={{ margin: "0.25rem 0 0 0" }}>
            <strong>Latitude:</strong> {coordinates.lat !== null ? coordinates.lat.toFixed(6) : "Not pinned"}
          </p>
          <p style={{ margin: "0.25rem 0 0 0" }}>
            <strong>Longitude:</strong> {coordinates.lng !== null ? coordinates.lng.toFixed(6) : "Not pinned"}
          </p>
        </div>
      </div>
    </div>
  );
}