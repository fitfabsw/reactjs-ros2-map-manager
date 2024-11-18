import React, { useState, useEffect, useRef } from "react";
import "./StationManager.css";

function StationManagerLeftNormal({
  maps,
  selectedMap,
  stationLists,
  setStationLists,
  onChangeMap,
  stationDetails,
  fetchStationDetails,
}) {
  const [newStationListName, setNewStationListName] = useState("");

  const createStationList = async () => {
    if (!newStationListName || !selectedMap) return;

    try {
      const response = await fetch("/api/stationlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stl_name: newStationListName,
          mid: selectedMap,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setStationLists([...stationLists, data]); // 更新站點列表
        setNewStationListName(""); // 清空輸入框
      } else {
        console.error("Error creating station list:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating station list:", error);
    }
  };

  return (
    <div className="station-left-pandel">
      {false && (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>map</th>
              <th>robot</th>
              <th>map path</th>
              <th>map file (pgm, yaml)</th>
              <th>type</th>
            </tr>
          </thead>
          <tbody>
            {maps.map((map) => (
              <tr key={map.id}>
                <td>{map.id}</td>
                <td>{map.map}</td>
                <td>{map.Robottype?.name}</td>
                <td>{map.mappath}</td>
                <td>{map.mapname}</td>
                <td>{map.real ? "real" : "sim"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="map-selection">
        <h2>Select Map</h2>
        <select value={selectedMap || ""} onChange={onChangeMap}>
          <option value="">Select a map...</option>
          {maps.map((map) => (
            <option key={map.id} value={map.id}>
              {map.map} ({map.Robottype?.name})
            </option>
          ))}
        </select>
      </div>
      <div className="station-lists">
        <h2>Station Lists</h2>
        <div className="station-list-creation">
          <input
            type="text"
            placeholder="Station List Name"
            value={newStationListName}
            onChange={(e) => setNewStationListName(e.target.value)}
          />
          <button onClick={createStationList} className="station-list-card">
            Create Station List
          </button>
        </div>

        <div className="station-lists-grid">
          {stationLists.map((list) => (
            <button
              key={list.id}
              className="station-list-card"
              onClick={() => fetchStationDetails(list.id)}
            >
              <h3>{list.stl_name}</h3>
              <div className="station-count">
                Stations: {list.Stations?.length || 0}
              </div>
            </button>
          ))}
        </div>
      </div>
      {stationLists.length > 0 && stationDetails && (
        <div className="station-details">
          <h2>Station Details</h2>
          <pre>{JSON.stringify(stationDetails, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default StationManagerLeftNormal;
