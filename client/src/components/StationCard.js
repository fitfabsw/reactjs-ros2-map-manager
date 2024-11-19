import React, { useState } from "react";
import "./StationCard.css";

function StationCard({ station, onModify, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStation, setEditedStation] = useState({ ...station });

  const handleStartEditing = () => {
    setEditedStation({ ...station });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedStation({ ...station });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/stations/${station.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedStation),
      });

      if (response.ok) {
        const updatedStation = await response.json();
        onModify(updatedStation);
        setIsEditing(false);
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

        if (response.ok) {
          onDelete(station.id);
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

  return (
    <div className="station-card">
      {isEditing ? (
        <div className="station-card-edit">
          <input
            type="text"
            value={editedStation.st_name}
            onChange={(e) =>
              setEditedStation({ ...editedStation, st_name: e.target.value })
            }
            placeholder="站點名稱"
          />
          <input
            type="text"
            value={editedStation.x}
            onChange={(e) => handleCoordinateChange(e, "x")}
            placeholder="X 座標"
          />
          <input
            type="text"
            value={editedStation.y}
            onChange={(e) => handleCoordinateChange(e, "y")}
            placeholder="Y 座標"
          />
          <div className="station-card-actions">
            <button onClick={handleSave}>保存</button>
            <button onClick={handleCancel}>取消</button>
          </div>
        </div>
      ) : (
        <div className="station-card-view">
          <h3>{station.st_name}</h3>
          <p>X: {station.x}</p>
          <p>Y: {station.y}</p>
          <div className="station-card-actions">
            <button onClick={handleStartEditing}>修改</button>
            <button onClick={handleDelete}>刪除</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StationCard;
