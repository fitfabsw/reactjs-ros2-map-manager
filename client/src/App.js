import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import MapEditor from "./components/MapEditor";
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
