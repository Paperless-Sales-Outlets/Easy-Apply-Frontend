import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, 16, {
      animate: true,
      duration: 1.2,
    });
  }, [position, map]);

  return null;
}

export default function AddressStep({ isActive }) {
  const { t } = useTranslation();

  const [billingEffective, setBillingEffective] =
  useState("immediately");



const [position, setPosition] = useState([
  6.9271,
  79.8612,
]);

const mapRef = useRef(null);

  const [sameAsService, setSameAsService] =
    useState(false);

    // Search States
const [searchText, setSearchText] = useState("");
const [searchResults, setSearchResults] = useState([]);
const [isSearching, setIsSearching] = useState(false);

// Service Address
const [serviceAddress, setServiceAddress] = useState({
  address1: "",
  address2: "",
  city: "",
  district: "",
  postalCode: "",
  latitude: 6.9271,
  longitude: 79.8612,
});
  
useEffect(() => {
  const timer = setTimeout(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }
  }, 500);

  return () => clearTimeout(timer);
}, []);

const searchLocation = async (value) => {

  setSearchText(value);

  if (value.length < 3) {
    setSearchResults([]);
    return;
  }

  setIsSearching(true);

  try {

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        value
      )}&countrycodes=lk&limit=5&addressdetails=1`
    );

    const data = await response.json();

    setSearchResults(data);

  } catch (error) {

    console.error(error);

  }

  setIsSearching(false);

};

const selectLocation = (location) => {
  const lat = parseFloat(location.lat);
  const lon = parseFloat(location.lon);

  setSearchText(location.display_name);
  setSearchResults([]);

  setPosition([lat, lon]);

  setServiceAddress((prev) => ({
    ...prev,
    latitude: lat,
    longitude: lon,
  }));
};

  return (
    <div>
      <h3
        style={{
          color: "var(--slt-blue)",
          marginBottom: "1.5rem",
        }}
      >
        {t(
          "wizards.locationChange.address.heading"
        )}
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "1.5rem",
        }}
      >
        {/* LEFT SIDE */}
        <div>
          {/* SERVICE ADDRESS */}
          <div
            className="card"
            style={{
              padding: "1.5rem",
              border:
                "1px solid var(--border-color)",
              boxShadow: "none",
              marginBottom: "1.5rem",
            }}
          >
            <h4
              style={{
                color: "var(--text-primary)",
              }}
            >
              1.2 Service Address
            </h4>

            <p
              style={{
                color:
                  "var(--text-secondary)",
                marginBottom: "1rem",
              }}
            >
              Enter the new address where you
              want the service to be installed.
            </p>

            <div className="form-group">
              <label className="form-label">
                Search Location
              </label>

              <input
    type="text"
    className="form-control"
    placeholder="Search by address, area or landmark"
    value={searchText}
    onChange={(e)=>searchLocation(e.target.value)}
/>



{isSearching && (
    <p
        style={{
            marginTop:"10px",
            color:"#777",
            fontSize:"14px"
        }}
    >
        Searching...
    </p>
)}

{searchResults.length>0 && (

<div
style={{
    marginTop:"10px",
    border:"1px solid #ddd",
    borderRadius:"10px",
    overflow:"hidden",
    background:"#fff"
}}
>

{
searchResults.map((item) => (
  <div
    key={item.place_id}
    onClick={() => selectLocation(item)}
    style={{
      padding: "12px",
      cursor: "pointer",
      borderBottom: "1px solid #eee",
    }}
  >
    📍 {item.display_name}
  </div>
))
}

</div>

)}


            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
              }}
            >
              <div
                className="form-group"
                style={{ flex: 1 }}
              >
                <label className="form-label">
                  Address Line 1
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="House No, Street Name"
                />
              </div>

              <div
                className="form-group"
                style={{ flex: 1 }}
              >
                <label className="form-label">
                  Address Line 2
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Area, Apartment, Building"
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
              }}
            >
              <div
                className="form-group"
                style={{ flex: 1 }}
              >
                <label className="form-label">
                  City / Town
                </label>

                <select className="form-control">
                  <option>
                    Select City
                  </option>
                </select>
              </div>

              <div
                className="form-group"
                style={{ flex: 1 }}
              >
                <label className="form-label">
                  District
                </label>

                <select className="form-control">
                  <option>
                    Select District
                  </option>
                </select>
              </div>

              <div
                className="form-group"
                style={{ flex: 1 }}
              >
                <label className="form-label">
                  Postal Code
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Postal Code"
                />
              </div>
            </div>

            <div
              style={{
                background:
                  "rgba(0,90,255,0.05)",
                padding: "0.75rem",
                borderRadius: "10px",
                color:
                  "var(--text-secondary)",
                fontSize: "0.85rem",
              }}
            >
              Please ensure this is the exact
              location where you want the
              service to be installed.
            </div>
          </div>

          {/* BILLING ADDRESS */}
          <div
            className="card"
            style={{
              padding: "1.5rem",
              border:
                "1px solid var(--border-color)",
              boxShadow: "none",
            }}
          >
            <h4
              style={{
                color: "var(--text-primary)",
              }}
            >
              1.3 Billing Address
            </h4>

            <p
              style={{
                color:
                  "var(--text-secondary)",
              }}
            >
              Enter the address where you want
              to receive the bills.
            </p>

            <div
              style={{
                margin: "1rem 0",
              }}
            >
              <label>
                <input
                  type="checkbox"
                  checked={sameAsService}
                  onChange={() =>
                    setSameAsService(
                      !sameAsService
                    )
                  }
                />{" "}
                Same as service address
              </label>
            </div>

            {!sameAsService && (
              <>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                  }}
                >
                  <input
                    type="text"
                    className="form-control"
                    placeholder="House No, Street Name"
                  />

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Area, Apartment, Building"
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    marginTop: "1rem",
                  }}
                >
                  <select className="form-control">
                    <option>
                      Select City
                    </option>
                  </select>

                  <select className="form-control">
                    <option>
                      Select District
                    </option>
                  </select>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Postal Code"
                  />
                </div>
              </>
            )}

            <div
              className="radio-group"
              style={{
                marginTop: "1.5rem",
              }}
            >
              <label className="radio-label">
                <input
                  type="radio"
                  value="immediately"
                  checked={
                    billingEffective ===
                    "immediately"
                  }
                  onChange={(e) =>
                    setBillingEffective(
                      e.target.value
                    )
                  }
                />
                Immediately
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  value="after"
                  checked={
                    billingEffective ===
                    "after"
                  }
                  onChange={(e) =>
                    setBillingEffective(
                      e.target.value
                    )
                  }
                />
                After Service Activation
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div>
          <div
            className="card"
            style={{
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <h4>Select Location on Map</h4>

            <p
              style={{
                color:
                  "var(--text-secondary)",
              }}
            >
              Drag the pin to the exact
              location.
            </p>

            <div
  style={{
    marginTop: "1rem",
    borderRadius: "12px",
    overflow: "hidden",
  }}
>
  <MapContainer
  center={position}
  zoom={13}
  ref={mapRef}
  style={{
    width: "100%",
    height: "320px",
  }}
>
  <TileLayer
    attribution="&copy; OpenStreetMap contributors"
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />

  <Marker position={position}>
    <Popup>Selected Location</Popup>
  </Marker>
</MapContainer>
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <h4>Selected Location</h4>

            <p>No.123, Main Street</p>
            <p>Colombo 07, Sri Lanka</p>
            <p>6.9271° N, 79.8612° E</p>
          </div>

          <div
            className="card"
            style={{
              padding: "1rem",
            }}
          >
            <h4>
              Estimated Route from Current
              Location
            </h4>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginTop: "1rem",
              }}
            >
              <div>
                <p>Distance</p>
                <strong>8.4 km</strong>
              </div>

              <div>
                <p>Time</p>
                <strong>22 mins</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}