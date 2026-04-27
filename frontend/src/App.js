import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./Navbar";
import Home from "./pages/Home";
import Journey from "./pages/Journey";
import About from "./pages/About";

import "./style.css";
import HelpPage from "./pages/HelpPage";

function App() {

  return (

    <Router>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/journey" element={<Journey />} />

        <Route path="/about" element={<About />} />
        <Route path="/help" element={<HelpPage />} />
      </Routes>

    </Router>

  )

}

export default App