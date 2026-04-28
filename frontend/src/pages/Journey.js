import React, { useState, useEffect, useRef } from "react";
import MapView from "../components/MapView";
import CameraCapture from "../components/CameraCapture";
import { io } from "socket.io-client";
import "./journey.css";

const socket = io("http://localhost:5000");

function Journey() {
  const [originCoords, setOriginCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [info, setInfo] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const [currentAddress, setCurrentAddress] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [destinationInput, setDestinationInput] = useState("");

  const recognitionRef = useRef(null);

  /* 🔍 GET ADDRESS */
  const getAddress = async (lat, lng, setFunc) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      setFunc(data.display_name);
    } catch (err) {
      console.log(err);
    }
  };

  /* 📍 LOCATION TRACK */
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition((pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      setOriginCoords({ lat, lng: lon });
      getAddress(lat, lon, setCurrentAddress);

      fetch("https://women-safety-navigation-system.onrender.com/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });

      socket.emit("location", { lat, lon });
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  /* 🎤 VOICE RECOGNITION (NEW) */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.toLowerCase();

      console.log("🎤 Heard:", transcript);

      if (
        transcript.includes("help help") ||
        transcript.includes("save me") ||
        transcript.includes("emergency")
      ) {
        handleVoiceEmergency();
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
    };

    recognition.start();
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, [originCoords]);

  /* 🎯 DESTINATION SEARCH */
  const handleDestination = async () => {
    if (!destinationInput) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${destinationInput}`
      );
      const data = await res.json();

      if (data.length > 0) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };

        setDestinationCoords(coords);
        setDestAddress(data[0].display_name);
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* 📷 CAMERA */
  const handleCapture = async (img) => {
    setCapturedImage(img);

    await fetch("https://women-safety-navigation-system.onrender.com/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: img }),
    });
  };

  /* 🚨 SOS */
  const triggerEmergency = async () => {
    if (!originCoords) return;

    await fetch("https://women-safety-navigation-system.onrender.com/sos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lat: originCoords.lat,
        lon: originCoords.lng,
      }),
    });

    alert("🚨 SOS Sent");
  };

  /* 📤 WHATSAPP */
  const shareLocation = () => {
    if (!originCoords) return;

    const link = `https://maps.google.com/?q=${originCoords.lat},${originCoords.lng}`;
    const message = `🚨 EMERGENCY! I need help. My location:\n${link}`;

    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
  };

  /* 🚨🔥 VOICE EMERGENCY FULL ACTION */
  const handleVoiceEmergency = async () => {
    alert("🚨 Voice Emergency Triggered!");

    await triggerEmergency();   // send to server
    shareLocation();            // send WhatsApp

    // Optional: auto capture photo
    if (capturedImage) {
      await fetch("https://women-safety-navigation-system.onrender.com/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: capturedImage }),
      });
    }
  };

  return (
    <div className="app">

      <div className="header-card glass">
        <h2>🛡️ Women Safety Monitor</h2>
      </div>

      {/* 📷 CAMERA */}
      <div className="section-card glass">
        <CameraCapture onCapture={handleCapture} />
      </div>

      {/* 🗺️ MAP */}
      <div className="map-wrap glass">
        <MapView
          origin={originCoords}
          destination={destinationCoords}
          setInfo={setInfo}
        />
      </div>

      {/* 📊 INFO */}
      <div className="section-card glass">
        <p>🚗 Distance: {info?.distance || "--"} km</p>
        <p>⏱ Time: {info?.time || "--"} min</p>
      </div>

      {/* 🎯 DESTINATION */}
      <div className="section-card glass">
        <h3>🎯 Set Destination</h3>

        <input
          type="text"
          placeholder="Enter destination..."
          value={destinationInput}
          onChange={(e) => setDestinationInput(e.target.value)}
        />

        <button className="primary-btn" onClick={handleDestination}>
          Set Destination
        </button>
      </div>

      {/* 📍 DETAILS */}
      <div className="section-card glass">
        <h3>📍 Journey Details</h3>

        <p><strong>Current:</strong><br />{currentAddress || "Fetching..."}</p>
        <p><strong>Destination:</strong><br />{destAddress || "Not selected"}</p>
      </div>

      {/* 📤 SHARE */}
      <button className="share-btn" onClick={shareLocation}>
        📤 Share Location (WhatsApp)
      </button>

      {/* 🚨 SOS */}
      <button className="sos-btn" onClick={triggerEmergency}>
        🚨 SOS
      </button>

    </div>
  );
}

export default Journey;