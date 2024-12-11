import React from "react";
import "./Logs.css";

const Logs = () => {
  return (
    <div className="logs-container">
      <div className="logs-filter">
        <h1>Logs Page</h1>
        <p>This is the content of the Logs page.</p>
      </div>
      <div className="logs-column">
        <h2>Additional Information</h2>
        <p>This section can contain additional logs or details.</p>
      </div>
    </div>
  );
};

export default Logs; 