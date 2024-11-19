import React, { useState } from "react";
import "./StationManager.css";
import StationCard from "./StationCard";

function StationManagerLeftNormal({
  maps,
  selectedMap,
  stationLists,
  setStationLists,
  onChangeMap,
  stationDetails,
  fetchStationDetails,
  // mode,
  // setmode,
  editMode,
  setEditMode,
  createStation,
  modifyStation,
  deleteStation,
  setStationPoints,
  setWaitingForLocation,
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
        setStationLists([...stationLists, data]);
        setNewStationListName("");
      } else {
        console.error("Error creating station list:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating station list:", error);
    }
  };

  const handleBackToNormal = async () => {
    setEditMode(false);
    setStationPoints(null);
    // 重新載入當前地圖的站點列表
    if (selectedMap) {
      try {
        const response = await fetch(`/api/maps/${selectedMap}/stationlists`);
        const data = await response.json();
        if (response.ok) {
          setStationLists(data);
        } else {
          console.error("重新載入站點列表失敗:", data.error);
        }
      } catch (error) {
        console.error("重新載入站點列表時發生錯誤:", error);
      }
    }
  };

  const handleCreateNewStation = () => {
    const newStation = {
      st_name: "New Station",
      x: 0,
      y: 0,
      stl_id: stationDetails.id,
      type: "station",
    };

    fetch("/api/stations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStation),
    })
      .then((response) => response.json())
      .then((createdStation) => {
        createStation(createdStation);
      })
      .catch((error) => {
        console.error("創建站點失敗:", error);
      });
  };

  return (
    <div className="station-left-panel">
      {!editMode && (
        <>
          <div className="map-selection">
            <h2>選擇地圖</h2>
            <select value={selectedMap || ""} onChange={onChangeMap}>
              <option value="">選擇地圖...</option>
              {maps.map((map) => (
                <option key={map.id} value={map.id}>
                  {map.map} ({map.Robottype?.name})
                </option>
              ))}
            </select>
          </div>
          <div className="station-lists">
            <h2>站點列表</h2>
            <div className="station-list-creation">
              <input
                type="text"
                placeholder="站點列表名稱"
                value={newStationListName}
                onChange={(e) => setNewStationListName(e.target.value)}
              />
              <button onClick={createStationList}>建立站點列表</button>
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
                    站點數量: {list.Stations?.length || 0}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      {editMode && (
        <>
          <div className="station-edit-header">
            <button onClick={handleBackToNormal}>返回一般模式</button>
            <button onClick={handleCreateNewStation}>新增站點</button>
          </div>
          <div className="station-cards">
            {stationDetails?.Stations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                onModify={(newDetails) => modifyStation(station.id, newDetails)}
                onDelete={() => deleteStation(station.id)}
                setWaitingForLocation={setWaitingForLocation}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default StationManagerLeftNormal;
