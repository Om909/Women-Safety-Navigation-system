import React, { useEffect, useState, useRef } from "react";
import "./help.css";

function HelpPage() {
  const [location, setLocation] = useState(null);
  const [voiceOn, setVoiceOn] = useState(false);
  const recognitionRef = useRef(null);

  /* 📍 GET LOCATION */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.log(err)
    );
  }, []);

  /* 📲 WHATSAPP SHARE */
  const shareWhatsApp = () => {
    if (!location) return alert("Location not ready");

    const link = `https://maps.google.com/?q=${location.lat},${location.lng}`;

    const message = `🚨 HELP!
I am in danger.

📍 My Live Location:
${link}`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  /* 🚨 SOS */
  const triggerSOS = async () => {
    if (!location) return;

    try {
      await fetch("https://women-safety-navigation-system.onrender.com/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat: location.lat,
          lon: location.lng,
        }),
      });

      // 📳 vibration feedback
      if (navigator.vibrate) {
        navigator.vibrate([400, 200, 400]);
      }

      shareWhatsApp();
      alert("🚨 SOS Sent!");
    } catch (err) {
      console.log(err);
    }
  };

  /* 🎤 VOICE SYSTEM (FIXED + STRONG) */
  useEffect(() => {
    if (!voiceOn) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const text =
        event.results[event.results.length - 1][0].transcript.toLowerCase();

      console.log("🎤 Heard:", text);

      // 🔥 SMART DETECTION (REALISTIC)
      if (
        text.includes("help") ||
        text.includes("help help") ||
        text.includes("bachao") ||
        text.includes("save me") ||
        text.includes("emergency")
      ) {
        alert("🚨 Voice SOS Triggered!");
        triggerSOS();
      }
    };

    // 🔄 AUTO RESTART (VERY IMPORTANT FIX)
    recognition.onend = () => {
      if (voiceOn) {
        recognition.start();
      }
    };

    recognition.onerror = (e) => {
      console.log("Speech error:", e.error);
    };

    recognition.start();
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [voiceOn]);

  return (
    <div className="help-page">

      <h1>🚨 EMERGENCY MODE</h1>

      {/* LOCATION */}
      <p>
        📍 {location
          ? `${location.lat}, ${location.lng}`
          : "Fetching location..."}
      </p>

      {/* SOS BUTTON */}
      <button className="help-btn" onClick={triggerSOS}>
        🚨 HELP NOW
      </button>

      {/* WHATSAPP */}
      <button className="wa-btn" onClick={shareWhatsApp}>
        📲 Share on WhatsApp
      </button>

      {/* VOICE */}
      <button onClick={() => setVoiceOn(!voiceOn)}>
        🎤 Voice {voiceOn ? "ON" : "OFF"}
      </button>

    </div>
  );
}

export default HelpPage;