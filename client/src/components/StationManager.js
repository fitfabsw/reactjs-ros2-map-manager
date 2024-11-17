import React, { useState, useEffect, useRef } from "react";
import "./StationManager.css";

function StationManager() {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [stationLists, setStationLists] = useState([]);
  const [selectedMapPath, setSelectedMapPath] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [originImageMeta, setOriginImageMeta] = useState(null);
  const [originalDimensions, setOriginalDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [realDimensions, setRealDimensions] = useState({ width: 0, height: 0 });
  const [stationDetails, setStationDetails] = useState(null);
  const [originPixelPos, setOriginPixelPos] = useState(null);
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
        setOriginImageMeta(data.metadata);
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

  // const handleGetImageElement = () => {
  const handleGetImageElement = async () => {
    if (imgRef.current) {
      console.log("Image Element:", imgRef.current); // 獲取 img 元素
      console.log("Image Width:", imgRef.current.width); // 獲取圖片寬度
      console.log("Image Height:", imgRef.current.height); // 獲取圖片高度
      setRealDimensions({
        width: imgRef.current.width,
        height: imgRef.current.height,
      });
      getOrigin();
      // getOrigin(originImageMeta);
    }
  };

  const fetchStationDetails = async (stl_id) => {
    try {
      const response = await fetch(`/api/stationlists/${stl_id}`);
      const data = await response.json();
      if (response.ok) {
        console.log("Station Details:", data);
        setStationDetails(data);
      } else {
        console.error("Error fetching station details:", data.error);
      }
    } catch (error) {
      console.error("Error fetching station details:", error);
    }
  };

  const getOrigin = async () => {
    const { mapWidth, mapHeight, origin, resolution } = originImageMeta;
    const [W, H] = [imgRef.current.width, imgRef.current.height]; // actual size in pixels
    const [w, h] = [mapWidth, mapHeight]; // original size in pixels
    const scale = H / h;
    const [originX, originY] = origin;
    console.log(
      `mapWidth: ${mapWidth}, mapHeight: ${mapHeight}, origin: ${origin}`,
    );
    console.log(`scale: ${scale}`);
    console.log(`width: ${w}, height: ${h}`);
    console.log(`Width: ${W}, Height: ${H}`);
    console.log(`originX: ${originX}, originY: ${originY}`);
    const pixelX = Math.round(
      (originX / resolution) * scale + (W - w * scale) / 2,
    );
    const pixelY = Math.round((h - originY / resolution) * scale);
    setOriginPixelPos({ x: pixelX, y: pixelY });
    console.log(`PixelX: ${pixelX}, PixelY: ${pixelY}`);
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
        {stationLists.length > 0 && (
          <div className="station-lists">
            <h2>Station Lists</h2>
            <div className="station-lists-grid">
              {stationLists.map((list) => (
                <button
                  key={list.id}
                  className="station-list-card"
                  onClick={() => fetchStationDetails(list.id)}
                >
                  <h3>{list.stl_name}</h3>
                  <div className="station-count">
                    Stations: {list.Stations?.length || 0}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {stationLists.length > 0 && stationDetails && (
          <div className="station-details">
            <h2>Station Details</h2>
            <pre>{JSON.stringify(stationDetails, null, 2)}</pre>
          </div>
        )}
      </div>
      <div className="station-content">
        <div
          className="image-display"
          style={{ position: "relative", display: "inline-block" }}
        >
          {imageData && (
            <img
              ref={imgRef}
              src={`data:image/png;base64,${imageData}`}
              alt="Map"
              onLoad={handleGetImageElement} // 在圖片加載後獲取元素
              style={{
                maxWidth: "100%",
                height: "auto",
                display: "block",
              }}
            />
          )}
          {originPixelPos && (
            <div
              className="origin-marker"
              style={{
                left: `${originPixelPos.x}px`,
                top: `${originPixelPos.y}px`,
              }}
            />
          )}
          {imageData && originPixelPos && (
            <div className="pixel-info">
              <p>
                <b>Original</b> size: {originImageMeta.mapWidth} x{" "}
                {originImageMeta.mapHeight} pixels
                {", "}
                map origin: ({originImageMeta.origin[0].toFixed(2)},{" "}
                {originImageMeta.origin[1].toFixed(2)}) (m) (image
                origin@bottom-left)
              </p>
              <p>
                <b>Real</b> size: {realDimensions.width} x{" "}
                {realDimensions.height} pixels
                {", "}
                map origin: ({originPixelPos.x}, {originPixelPos.y}) pixels
                (image origin@top-left)
              </p>
              <p>
                <b>scale </b>
                {(realDimensions.height / originImageMeta.mapHeight).toFixed(4)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StationManager;
