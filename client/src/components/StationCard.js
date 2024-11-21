import React, { useState, useEffect } from "react";
import "./StationCard.css";

function StationCard({
  station,
  onModify,
  onDelete,
  waitingForLocation,
  setWaitingForLocation,
  selectedStationId,
  setSelectedStationId,
  stationDetails,
  editingStationId,
  setEditingStationId,
  disabled,
  setStationPoints,
  stationPoints,
  CoordToPixel,
  setStationDetails,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStation, setEditedStation] = useState({ ...station });
  const [originalStation, setOriginalStation] = useState(null); // 新增狀態來保存原始站點
  const [originalDetails, setOriginalDetails] = useState(null);

  const stationTypes = ["start", "end", "station"];

  // 當 station prop 更新時，同步更新 editedStation
  useEffect(() => {
    setEditedStation({ ...station });
  }, [station]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isEditing) return;
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditing, editedStation]);

  const handleStartEditing = () => {
    if (disabled) return;
    setEditedStation({ ...station });
    setIsEditing(true);
    setEditingStationId(station.id);
    setOriginalStation({ ...station });
    const originalDetails = stationDetails.Stations.filter(
      (e) => e.id === station.id,
    )[0];
    setOriginalDetails(originalDetails);
  };

  const handleCancel = () => {
    console.log("originalStation", originalStation);
    console.log("editedStation", editedStation);
    console.log("waitingForLocation", waitingForLocation);

    // 恢復地圖上的位置點圖示
    console.log("stationDetails", stationDetails);
    console.log("stationPoints", stationPoints);
    const originPointPixel = CoordToPixel(originalStation);
    console.log("originPointPixel", originPointPixel);
    setStationPoints((prevPoints) =>
      prevPoints.map((point, index) =>
        stationDetails.Stations[index].id === waitingForLocation
          ? { x: originPointPixel.x, y: originPointPixel.y } // 恢復原始位置
          : point,
      ),
    );
    setStationDetails((prevDetails) => {
      const updatedStations = prevDetails.Stations.map((station) =>
        station.id === waitingForLocation
          ? { ...station, ...originalDetails }
          : station,
      );
      return { ...prevDetails, Stations: updatedStations };
    });
    console.log("originalDetails", originalDetails);
    console.log("stationDetails", stationDetails);
    console.log("stationPoints", stationPoints);

    setEditedStation(originalStation);
    setIsEditing(false);
    setEditingStationId(null);
    setWaitingForLocation(null);
    setOriginalStation(null); // 清空原始位置

    // 重置等待位置狀態
    setSelectedStationId(null); // 清除選中的站點
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/stations/${station.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...editedStation, z: 1.0, w: 0.0 }),
        // body: JSON.stringify(editedStation),
      });

      console.log("JKJKJK");
      if (response.ok) {
        const updatedStation = await response.json();
        console.log("updatedStation", updatedStation);
        onModify(updatedStation);
        setIsEditing(false);
        setEditingStationId(null);
        setWaitingForLocation(null);
        setOriginalStation(null); // 清空原始位置
      } else {
        console.error("更新站點失敗");
      }
    } catch (error) {
      console.error("更新站點時發生錯誤:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("確定要刪除此站點嗎？")) {
      try {
        const response = await fetch(`/api/stations/${station.id}`, {
          method: "DELETE",
        });

        const deletedOrder = station.order;
        if (response.ok) {
          onDelete(station.id);

          const updatedStations = stationDetails.Stations.filter(
            (s) => s.id !== station.id && s.order > deletedOrder,
          ).map((s) => ({
            id: s.id,
            order: s.order - 1,
          }));

          // 批量更新其他站點的順序
          console.log("HHHH");
          console.log(`updatedStations: ${JSON.stringify(updatedStations)}`);
          for (const updatedStation of updatedStations) {
            await fetch(`/api/stations/${updatedStation.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ order: updatedStation.order }),
            });
          }
        } else {
          console.error("刪除站點失敗");
        }
      } catch (error) {
        console.error("刪除站點時發生錯誤:", error);
      }
    }
  };

  const handleCoordinateChange = (e, coordinate) => {
    const value = e.target.value;
    if (
      value === "" || // 空值
      value === "-" || // 負號
      value === "." || // 單個小數點
      value === "-." || // 負數的小數點
      /^-?\d*\.?\d{0,2}$/.test(value) // 允許數字和最多兩位小數
    ) {
      setEditedStation({
        ...editedStation,
        [coordinate]:
          value === "" || value === "-" || value === "." || value === "-."
            ? value
            : value.endsWith(".")
              ? value
              : parseFloat(value),
      });
    }
  };

  const handleLocationSelect = () => {
    console.log("JJJJJ");
    setWaitingForLocation(station.id);
    console.log("station.id", station.id);
    console.log("waitingForLocation", waitingForLocation);
  };

  return (
    <div
      className={`station-card ${waitingForLocation === station.id ? "waiting" : ""} ${
        selectedStationId === station.id ? "selected" : ""
      } ${disabled ? "disabled" : ""}`}
      data-station-id={station.id}
      data-editing={isEditing}
      onClick={() => !disabled && setSelectedStationId(station.id)}
    >
      {isEditing ? (
        <div className="station-card-edit">
          <div className="input-group">
            <label>站點名稱</label>
            <input
              type="text"
              value={editedStation.st_name}
              onChange={(e) =>
                setEditedStation({ ...editedStation, st_name: e.target.value })
              }
              placeholder="請輸入站點名稱"
            />
          </div>

          <div className="input-group">
            <label>站點類型</label>
            <select
              value={editedStation.type || "station"}
              onChange={(e) =>
                setEditedStation({ ...editedStation, type: e.target.value })
              }
            >
              {stationTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="coordinates-group">
            <div className="coordinates-row">
              <div className="coordinate-input">
                <label>X:</label>
                <input
                  type="text"
                  value={editedStation.x}
                  onChange={(e) => handleCoordinateChange(e, "x")}
                />
              </div>
              <div className="coordinate-input">
                <label>Y:</label>
                <input
                  type="text"
                  value={editedStation.y}
                  onChange={(e) => handleCoordinateChange(e, "y")}
                />
              </div>
            </div>
            <button
              onClick={handleLocationSelect}
              className={`location-select-btn ${waitingForLocation === station.id ? "waiting" : ""}`}
            >
              {waitingForLocation === station.id ? "請點選新位置" : "選擇位置"}
            </button>
          </div>

          <div className="station-card-actions">
            <button onClick={handleSave}>保存 (Enter)</button>
            <button onClick={handleCancel}>取消 (Esc)</button>
          </div>
        </div>
      ) : (
        <div className="station-card-view">
          <h3>{station.st_name}</h3>
          <p>
            <span>類型:</span>
            <span>{station.type || "station"}</span>
          </p>
          <p>
            <span>X:</span>
            {/* <span>{editedStation.x}</span> */}
            <span>{station.x}</span>
          </p>
          <p>
            <span>Y:</span>
            {/* <span>{editedStation.y}</span> */}
            <span>{station.y}</span>
          </p>
          <div className="station-card-actions">
            <button onClick={handleStartEditing} disabled={disabled}>
              修改
            </button>
            <button onClick={handleDelete} disabled={disabled}>
              刪除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StationCard;
