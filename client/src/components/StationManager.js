import React, { useState, useEffect, useRef } from "react";
import "./StationManager.css";

function StationManager() {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [stationLists, setStationLists] = useState([]);
  const [selectedMapPath, setSelectedMapPath] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [originalDimensions, setOriginalDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [realDimensions, setRealDimensions] = useState({ width: 0, height: 0 });
  const imgRef = useRef(null);

  function onChangeMap(e) {
    setSelectedMap(e.target.value);
    let found = maps.find((m) => m.id === parseInt(e.target.value));
    let mapfile = `${found.mappath}/${found.mapname}.pgm`;
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
        body: JSON.stringify({ filePath: mapfile }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Image Data:", data.image);
        setImageData(data.image);
        setOriginalDimensions({
          width: data.metadata.mapWidth,
          height: data.metadata.mapHeight,
        });
        console.log(
          "Original Dimensions:",
          data.metadata.mapWidth,
          data.metadata.mapHeight,
        );
      } else {
        console.error("Error fetching image:", data.error);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const handleGetImageElement = () => {
    if (imgRef.current) {
      console.log("Image Element:", imgRef.current); // 獲取 img 元素
      console.log("Image Width:", imgRef.current.width); // 獲取圖片寬度
      console.log("Image Height:", imgRef.current.height); // 獲取圖片高度
      setRealDimensions({
        width: imgRef.current.width,
        height: imgRef.current.height,
      });
    }
  };

  useEffect(() => {
    fetch("/api/maps")
      .then((res) => res.json())
      .then((data) => setMaps(data))
      .catch((err) => console.error("Error loading maps:", err));
  }, []);

  useEffect(() => {
    if (selectedMap) {
      fetch(`/api/maps/${selectedMap}/stationlists`)
        .then((res) => res.json())
        .then((data) => setStationLists(data))
        .catch((err) => console.error("Error loading station lists:", err));
    }
  }, [selectedMap]);

  return (
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
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="station-content">
        {imageData && (
          <div className="image-display">
            <img
              ref={imgRef}
              src={`data:image/png;base64,${imageData}`}
              alt="Map"
              onLoad={handleGetImageElement} // 在圖片加載後獲取元素
            />
          </div>
        )}
        {imageData && (
          <div className="pixel-info">
            <p>
              Original Dimensions: {originalDimensions.width} x{" "}
              {originalDimensions.height} pixels
            </p>
            <p>
              Real Dimensions: {realDimensions.width} x {realDimensions.height}{" "}
              pixels
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StationManager;
