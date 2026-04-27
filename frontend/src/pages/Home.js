import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

function Home() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false);

  /* 🌙 Toggle */
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  /* 🌙 Apply class */
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const features = [
    { title: "Track", icon: "📍", path: "/journey" },
    { title: "SOS", icon: "🚨", path: "/sos" },
    { title: "Police", icon: "🚓", path: "/police" },
    { title: "Share", icon: "📲", path: "/share" },
  ];

  return (
    <div className="home">

      {/* 🌙 THEME BUTTON */}
      <button className="theme-toggle" onClick={toggleTheme}>
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      {/* HEADER */}
      <div className="home-header">
        <h2>👋 Stay Safe</h2>
        <p>Women Safety App</p>
      </div>

      {/* MAIN CARD */}
      <div className="home-main-card">
        <h1>💖 Start Journey</h1>
        <p>Track your location and stay protected</p>

        <button
          className="home-main-btn"
          onClick={() => navigate("/journey")}
        >
          🚀 Start Journey
        </button>
      </div>

      {/* FEATURES */}
      <div className="home-grid">
        {features.map((f, i) => (
          <div
            key={i}
            className="home-card"
            onClick={() => navigate(f.path)}
          >
            <div className="home-icon">{f.icon}</div>
            <h3>{f.title}</h3>
          </div>
        ))}
      </div>

      {/* SOS */}
      <button
        className="home-sos"
        onClick={() => navigate("/sos")}
      >
        🚨
      </button>

    </div>
  );
}

export default Home;