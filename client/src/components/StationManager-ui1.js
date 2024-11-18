import React, { useState, useEffect } from "react";
import "./StationManager.css";

function StationManager() {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [stationLists, setStationLists] = useState([]);
  const [newStationListName, setNewStationListName] = useState("");
  const [newStation, setNewStation] = useState({
    st_name: "",
    stl_id: "",
    x: "",
    y: "",
    z: "",
    w: "",
    type: "station", // 默認類型
  });

  useEffect(() => {
    fetch("/api/maps")
      .then((res) => res.json())
      .then((data) => setMaps(data))
      .catch((err) => console.error("Error loading maps:", err));
  }, []);

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

  const createStation = async () => {
    if (!newStation.st_name || !newStation.stl_id) return;

    try {
      const response = await fetch("/api/stations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStation),
      });
      if (response.ok) {
        const data = await response.json();
        // 更新站點列表或執行其他操作
        setNewStation({
          st_name: "",
          stl_id: "",
          x: "",
          y: "",
          z: "",
          w: "",
          type: "station",
        }); // 清空輸入框
      } else {
        console.error("Error creating station:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating station:", error);
    }
  };

  return (
    <div className="station-manager">
      <h1>Station Management</h1>

      <div className="station-list-creation">
        <h2>Create Station List</h2>
        <input
          type="text"
          placeholder="Station List Name"
          value={newStationListName}
          onChange={(e) => setNewStationListName(e.target.value)}
        />
        <select
          value={selectedMap || ""}
          onChange={(e) => setSelectedMap(e.target.value)}
        >
          <option value="">Select a map...</option>
          {maps.map((map) => (
            <option key={map.id} value={map.id}>
              {map.map}
            </option>
          ))}
        </select>
        <button onClick={createStationList}>Create Station List</button>
      </div>

      <div className="station-creation">
        <h2>Create Station</h2>
        <input
          type="text"
          placeholder="Station Name"
          value={newStation.st_name}
          onChange={(e) =>
            setNewStation({ ...newStation, st_name: e.target.value })
          }
        />
        <select
          value={newStation.stl_id}
          onChange={(e) =>
            setNewStation({ ...newStation, stl_id: e.target.value })
          }
        >
          <option value="">Select Station List...</option>
          {stationLists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.stl_name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="X"
          value={newStation.x}
          onChange={(e) => setNewStation({ ...newStation, x: e.target.value })}
        />
        <input
          type="number"
          placeholder="Y"
          value={newStation.y}
          onChange={(e) => setNewStation({ ...newStation, y: e.target.value })}
        />
        <input
          type="number"
          placeholder="Z"
          value={newStation.z}
          onChange={(e) => setNewStation({ ...newStation, z: e.target.value })}
        />
        <input
          type="number"
          placeholder="W"
          value={newStation.w}
          onChange={(e) => setNewStation({ ...newStation, w: e.target.value })}
        />
        <select
          value={newStation.type}
          onChange={(e) =>
            setNewStation({ ...newStation, type: e.target.value })
          }
        >
          <option value="station">Station</option>
          <option value="start">Start</option>
          <option value="end">End</option>
        </select>
        <button onClick={createStation}>Create Station</button>
      </div>

      <div className="existing-station-lists">
        <h2>Existing Station Lists</h2>
        <ul>
          {stationLists.map((list) => (
            <li key={list.id}>{list.stl_name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default StationManager;
