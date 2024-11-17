import React, { useState, useEffect } from "react";
import "./StationManager.css";

function StationManager() {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [stationLists, setStationLists] = useState([]);
  const [selectedMapPath, setSelectedMapPath] = useState(null);
  const [imageData, setImageData] = useState(null);

  function onChangeMap(e) {
    setSelectedMap(e.target.value);
    console.log("e.target.value", e.target.value);
    console.log("typeof e.target.value", typeof e.target.value);
    let found = maps.find((m) => {
      return m.id === parseInt(e.target.value);
    });
    console.log("found", found);
    let mapfile = `${found.mappath}/${found.mapname}.pgm`;
    console.log("mapfile", mapfile);
    mapfile = mapfile.replace("/home/pi", "/home/zealzel");
    setSelectedMapPath(mapfile);
    fetchImage(mapfile);
  }

  const fetchImage = async (mapfile) => {
    try {
      const response = await fetch("/convert-pgm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath: mapfile, max_dimension: 0 }),
      });
      const data = await response.json();
      if (response.ok) {
        setImageData(data.image);
      } else {
        console.error("Error fetching image:", data.error);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

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
      fetch(`/api/maps/${selectedMap}/stationlists`)
        .then((res) => res.json())
        .then((data) => setStationLists(data))
        .catch((err) => console.error("Error loading station lists:", err));
    }
  }, [selectedMap]);

  console.log("maps", maps);

  return (
    <div className="station-manager">
      <div className="station-container">
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
          {/* <p> selectedMap: {selectedMap}</p> */}
          {/* <p> selectedMapPath: {selectedMapPath}</p> */}
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
        <div className="station-content">
          {imageData && (
            <div className="image-display">
              <img src={`data:image/png;base64,${imageData}`} alt="Map" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StationManager;
