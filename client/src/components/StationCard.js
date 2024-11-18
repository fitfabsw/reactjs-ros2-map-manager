import React from "react";
import { useState } from "react";
import "./StationCard.css";

function StationCard({ station, onModify, onDelete }) {
  const [x, setX] = useState(station.x);
  const [y, setY] = useState(station.y);
  const [z, setZ] = useState(station.z);
  const [w, setW] = useState(station.w);
  const [type, setType] = useState(station.type);

  const [isEditable, setIsEditable] = useState(false);

  return (
    <div className="station-card">
      <h3>{station.st_name}</h3>
      <button onClick={() => setIsEditable(!isEditable)}>Modify</button>
      <button onClick={() => onDelete(station)}>Delete</button>
      <p>
        <b>Coordinates:</b> (x,y) =
        <input
          type="text"
          value={x}
          disabled={!isEditable}
          onChange={(e) => setX(e.target.value)}
        />
        <input
          type="text"
          value={y}
          disabled={!isEditable}
          onChange={(e) => setY(e.target.value)}
        />
      </p>
      <p>
        <b>Orientation:</b> (z, w) =
        <input
          type="text"
          value={z}
          disabled={!isEditable}
          onChange={(e) => setZ(e.target.value)}
        />
        <input
          type="text"
          value={w}
          disabled={!isEditable}
          onChange={(e) => setW(e.target.value)}
        />
      </p>
      <p>
        <b>Type:</b>
        <input
          type="text"
          value={type}
          disabled={!isEditable}
          onChange={(e) => setType(e.target.value)}
        />
      </p>
    </div>
  );
}

export default StationCard;
