import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();

  return (
    <nav className="navbar">

      {/* LOGO */}
      <div className="nav-logo" onClick={() => navigate("/")}>
        💖 Women Safety
      </div>

      {/* LINKS */}
      <div className="nav-links">

        <NavLink to="/" className="nav-item">
          🏠 Home
        </NavLink>

        <NavLink to="/journey" className="nav-item">
          🚗 Journey
        </NavLink>

        <NavLink to="/about" className="nav-item">
          ℹ️ About
        </NavLink>

      </div>

      {/* QUICK SOS BUTTON */}
      <button
        className="nav-sos"
        onClick={() => navigate("/journey")}
      >
        🚨 SOS
      </button>

    </nav>
  );
}

export default Navbar;