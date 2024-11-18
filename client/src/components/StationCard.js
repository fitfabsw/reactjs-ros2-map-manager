import React from "react";
import "./StationCard.css";

function StationCard({ station }) {
  return (
    <div className="station-card">
      <h3>{station.st_name}</h3>
      {/* <h3>{JSON.stringify(station)}</h3> */}
      {/* <p>ID: {station.id}</p> */}
      <p>
        <b>Coordinates:</b> (x,y) = ({station.x}m, {station.y}m)
      </p>
      <p>
        <b>Orientation:</b> (z, w) = ({station.z}, {station.w})
      </p>
      <p>
        <b>Type:</b> {station.type}
      </p>
    </div>
  );
}

export default StationCard;
