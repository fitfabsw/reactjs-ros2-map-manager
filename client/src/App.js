import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import MapEditor from "./components/MapEditor";
import StationManager from "./components/StationManager";
import Db from "./components/Db";
import "./App.css";

function Home() {
  const handleRestartCentralService = async () => {
    try {
      const response = await fetch("/restart-service", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        alert(data.message); // 顯示成功消息
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`); // 顯示錯誤消息
      }
    } catch (error) {
      console.error("Error calling restart service API:", error);
      alert("Failed to restart service");
    }
  };

  return (
    <div>
      <h1>Home</h1>
      <button
        style={{ marginLeft: "20px" }}
        onClick={handleRestartCentralService}
      >
        Restart Central Service
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map-editor" element={<MapEditor />} />
          <Route path="/stations" element={<StationManager />} />
          <Route path="/db" element={<Db />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
