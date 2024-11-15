import React, { useState, useEffect } from "react";
import "./MaskManager.css";

function MaskManager() {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [masks, setMasks] = useState([]);

  useEffect(() => {
    // 載入地圖列表
    fetch("http://localhost:5000/api/maps")
      .then((res) => res.json())
      .then((data) => setMaps(data))
      .catch((err) => console.error("Error loading maps:", err));
  }, []);

  useEffect(() => {
    if (selectedMap) {
      // 載入選定地圖的遮罩
      fetch(`http://localhost:5000/api/maps/${selectedMap}/masks`)
        .then((res) => res.json())
        .then((data) => setMasks(data))
        .catch((err) => console.error("Error loading masks:", err));
    }
  }, [selectedMap]);

  return (
    <div className="mask-manager">
      <div className="map-selection">
        <h2>Select Map</h2>
        <select
          value={selectedMap || ""}
          onChange={(e) => setSelectedMap(e.target.value)}
        >
          <option value="">Select a map...</option>
          {maps.map((map) => (
            <option key={map.id} value={map.id}>
              {map.map} ({map.Robottype?.name})
            </option>
          ))}
        </select>
      </div>

      {selectedMap && (
        <div className="masks-grid">
          <h2>Masks</h2>
          <div className="mask-list">
            {masks.map((mask) => (
              <div key={mask.id} className="mask-card">
                <h3>{mask.name}</h3>
                <div className="mask-path">{mask.path}</div>
                {/* Add edit/delete buttons here */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MaskManager;
