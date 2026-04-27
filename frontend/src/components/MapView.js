import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  CircleMarker
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

/* ICONS */
const userIcon = new L.DivIcon({
  className: "user-marker",
  html: `<div class="pulse-dot"></div>`,
});

const destIcon = new L.DivIcon({
  className: "dest-marker",
  html: "📍",
});

/* FOLLOW USER */
function FollowUser({ origin }) {
  const map = useMap();

  useEffect(() => {
    if (origin?.lat && origin?.lng) {
      map.flyTo([origin.lat, origin.lng], 16, {
        duration: 1.5,
      });
    }
  }, [origin]);

  return null;
}

/* ROUTING */
function Routing({ origin, destination, setInfo }) {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!origin || !destination || !map) return;

    // 🔥 SAFE REMOVE OLD ROUTE
    if (routingRef.current) {
      try {
        routingRef.current.off();   // 🧠 remove events
        routingRef.current.remove(); // 🧹 remove control
      } catch (e) {
        console.log("Safe remove skipped");
      }
      routingRef.current = null;
    }

    const control = L.Routing.control({
      waypoints: [
        L.latLng(origin.lat, origin.lng),
        L.latLng(destination.lat, destination.lng),
      ],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      lineOptions: {
        styles: [{ color: "#1a73e8", weight: 6 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      createMarker: () => null,
      show: false,
    });

    control.on("routesfound", (e) => {
      const route = e.routes[0];

      const distance = (route.summary.totalDistance / 1000).toFixed(2);
      const time = (route.summary.totalTime / 60).toFixed(0);

      setInfo({ distance, time });
    });

    control.addTo(map);
    routingRef.current = control;

    return () => {
      if (routingRef.current) {
        try {
          routingRef.current.off();   // 🔥 VERY IMPORTANT
          routingRef.current.remove();
        } catch (e) {
          console.log("Cleanup skipped");
        }
        routingRef.current = null;
      }
    };
  }, [origin, destination, map]);

  return null;
}

/* MAIN */
function MapView({ origin, destination, setInfo }) {
  const [search, setSearch] = useState("");

  const handleSearch = async () => {
    if (!search) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${search}`
    );
    const data = await res.json();

    if (!data.length) return alert("Location not found");

    const coords = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

    window.setDestinationFromSearch(coords);
  };

  if (!origin) return <p>📍 Loading map...</p>;

  return (
    <div className="map-container">

      {/* 🔍 GOOGLE STYLE SEARCH */}
      <div className="search-bar">
        <input
          placeholder="Search location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>

      {/* 🗺 MAP */}
      <MapContainer
        center={[origin.lat, origin.lng]}
        zoom={15}
        className="map-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={[origin.lat, origin.lng]} icon={userIcon} />

        <CircleMarker
          center={[origin.lat, origin.lng]}
          radius={25}
          pathOptions={{ color: "#1a73e8", fillOpacity: 0.2 }}
        />

        {destination && (
          <Marker
            position={[destination.lat, destination.lng]}
            icon={destIcon}
          />
        )}

        <FollowUser origin={origin} />

        {destination && (
          <Routing
            origin={origin}
            destination={destination}
            setInfo={setInfo}
          />
        )}
      </MapContainer>

      {/* 📊 BOTTOM CARD */}
      <div className="bottom-card">
        <p>🚗 Live Tracking Active</p>
        <span>Stay safe on your journey</span>
      </div>

      {/* 🎯 CENTER BUTTON */}
      <button
        className="center-btn"
        onClick={() => window.location.reload()}
      >
        📍
      </button>

    </div>
  );
}

export default MapView;