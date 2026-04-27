import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {

  const navigate = useNavigate();

  const features = [
    { title: "Live Tracking", icon: "📍", path: "/journey" },
    { title: "Emergency", icon: "🚨", path: "/sos" },
    { title: "Police Help", icon: "🚓", path: "/police" },
    { title: "Share", icon: "📲", path: "/share" },
  ];

  return (
    <div className="home">

      {/* FLOATING BACKGROUND */}
      <div className="bg-circle one"></div>
      <div className="bg-circle two"></div>

      {/* HERO */}
      <div className="hero-card">

        <h1>💖 Stay Safe</h1>

        <p>
          Smart protection with real-time tracking & instant alerts
        </p>

        <button onClick={() => navigate("/journey")}>
          🚀 Start Journey
        </button>

      </div>

      {/* QUICK ACTION GRID */}
      <div className="quick-grid">

        {features.map((f, i) => (
          <div
            key={i}
            className="quick-card"
            onClick={() => navigate(f.path)}
          >
            <div className="icon">{f.icon}</div>
            <h3>{f.title}</h3>
          </div>
        ))}

      </div>

      {/* FEATURE BANNER */}
      <div className="feature-banner">
        <h3>🛰 AI Safety Monitoring</h3>
        <p>Detect unusual stops & trigger alerts automatically</p>
      </div>

      {/* FLOATING SOS */}
      <button
        className="floating-sos"
        onClick={() => navigate("/sos")}
      >
        🚨
      </button>

    </div>
  );
}

export default Home;