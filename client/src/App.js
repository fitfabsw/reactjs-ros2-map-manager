import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import MapEditor from "./components/MapEditor";
import StationManager from "./components/StationManager";
import Db from "./components/Db";
import "./App.css";

function Home() {
  return <h1>Home</h1>;
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
