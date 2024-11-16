import React, { useEffect, useState } from "react";

const Stations = () => {
  const [maps, setMaps] = useState([]);

  useEffect(() => {
    // Call the API to fetch maps
    fetch("/api/maps")
      .then((response) => response.json())
      .then((data) => setMaps(data))
      .catch((error) => console.error("Error fetching maps:", error));
  }, []);

  return (
    <div>
      <h1>Stations</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {maps.map((map) => (
            <tr key={map.id}>
              <td>{map.id}</td>
              <td>{map.name}</td>
              <td>{map.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Stations;
