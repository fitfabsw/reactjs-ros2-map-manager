import React, { useState, useEffect } from "react";
import "./StationManager.css";

function StationManager() {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [stationLists, setStationLists] = useState([]);

  useEffect(() => {
    // 載入地圖列表
    console.log("AAAAAAAAAAAAA StationManager");
    fetch("/api/maps")
      .then((res) => res.json())
      .then((data) => setMaps(data))
      .catch((err) => console.error("Error loading maps:", err));
  }, []);

  useEffect(() => {
    if (selectedMap) {
      // 載入選定地圖的站點列表
      fetch(`http://localhost:5000/api/maps/${selectedMap}/stationlists`)
        .then((res) => res.json())
        .then((data) => setStationLists(data))
        .catch((err) => console.error("Error loading station lists:", err));
    }
  }, [selectedMap]);

  console.log("maps", maps);

  return (
    <div className="station-manager">
      <h1>Stations</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>map</th>
            <th>name</th>
          </tr>
        </thead>
        <tbody>
          {maps.map((map) => (
            <tr key={map.id}>
              <td>{map.id}</td>
              <td>{map.map}</td>
              <td>{map.mapname}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
        <div className="station-lists">
          <h2>Station Lists</h2>
          <div className="station-lists-grid">
            {stationLists.map((list) => (
              <div key={list.id} className="station-list-card">
                <h3>{list.stl_name}</h3>
                <div className="station-count">
                  Stations: {list.Stations?.length || 0}
                </div>
                {/* Add edit/delete buttons here */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StationManager;
