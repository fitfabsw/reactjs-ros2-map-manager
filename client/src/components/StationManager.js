import React, { useState, useEffect, useRef } from "react";
import "./StationManager.css";
import StationManagerLeftNormal from "./StationManagerLeftNormal";
import StationManagerInfo from "./StationManagerInfo";

function StationManager() {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [stationLists, setStationLists] = useState([]);
  const [imageData, setImageData] = useState(null);
  const [originImageMeta, setOriginImageMeta] = useState(null);
  const [realDimensions, setRealDimensions] = useState({ width: 0, height: 0 });
  const [stationDetails, setStationDetails] = useState(null);
  const [originPixelPos, setOriginPixelPos] = useState(null);
  const imgRef = useRef(null);
  const [pixelsPerMeter, setPixelsPerMeter] = useState(null);
  const [scale, setScale] = useState(1);
  // const [newStationListName, setNewStationListName] = useState("");
  // const [newStation, setNewStation] = useState({
  //   st_name: "",
  //   stl_id: "",
  //   x: "",
  //   y: "",
  //   z: "",
  //   w: "",
  //   type: "station", // 默認類型
  // });
  const [stationPoints, setStationPoints] = useState([]);

  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [pixelLocation, setPixelLocation] = useState({ x: 0, y: 0 });
  const [coordLocation, setCoordLocation] = useState({ x: 0, y: 0 });

  // useEffect(() => {
  //   if (processedImageUrl) {
  //     const img = new Image();
  //     img.src = processedImageUrl;
  //     img.onload = () => {
  //       setImageDimensions({ width: img.width, height: img.height });
  //     };
  //   }
  // }, [processedImageUrl]);

  function onChangeMap(e) {
    setSelectedMap(e.target.value);
    let found = maps.find((m) => m.id === parseInt(e.target.value));
    let mapfile = `${found.mappath}/${found.mapname}.pgm`;
    mapfile = mapfile.replace("/home/pi", "/home/zealzel");
    fetchImage(mapfile);
    setStationPoints(null);
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
      } else {
        console.error("Error fetching image:", data.error);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const handleGetImageElement = async () => {
    if (imgRef.current) {
      console.log("Image Element:", imgRef.current); // 獲取 img 元素
      console.log("Image Width:", imgRef.current.width); // 獲取圖片寬度
      console.log("Image Height:", imgRef.current.height); // 獲取圖片高度
      setRealDimensions({
        width: imgRef.current.width,
        height: imgRef.current.height,
      });
      setImageDimensions({
        width: imgRef.current.width,
        height: imgRef.current.height,
      });
      getOrigin();
    }
  };

  const PixelToCoordinate = (
    pixel,
    imageSizePixel,
    mapSizePixel,
    resolution,
    mapCenter,
  ) => {
    // 將像素位置轉換為地圖座標 (m)
    // pixel 像素位置: pixels
    // imageSizePixel 網圖尺寸: pixels
    // mapSizePixel 原圖尺寸: pixels
    // resolution 地圖分辨率: m/pixel
    // mapCenter 地圖原點座標: m
    const [W, H] = imageSizePixel; // actual size in pixels
    const [w, h] = mapSizePixel; //
    const [x, y] = pixel;
    const scale = H / h;
    return {
      x: ((x - (W - w * scale) / 2) * resolution) / scale - mapCenter[0],
      y: (h - y / scale) * resolution - mapCenter[1],
    };
  };

  const CoordinateToPixel = (
    mapSizePixel,
    imageSizePixel,
    mapPoint,
    resolution,
  ) => {
    // 將原地圖座標轉換為像素位置
    // mapPoint 地圖座標: m
    // mapSizePixel 原圖尺寸: pixels
    // imageSizePixel 網圖尺寸: pixels
    // resolution 地圖分辨率: m/pixel
    const [w, h] = mapSizePixel; // original size in pixels
    const [W, H] = imageSizePixel; // actual size in pixels
    const [x, y] = mapPoint; //
    const scale = H / h;
    return {
      x: Math.round((x / resolution) * scale + (W - w * scale) / 2),
      y: Math.round((h - y / resolution) * scale),
    };
  };

  const getOrigin = async () => {
    const { mapWidth, mapHeight, origin, resolution } = originImageMeta;
    const [W, H] = [imgRef.current.width, imgRef.current.height]; // actual size in pixels
    const [w, h] = [mapWidth, mapHeight]; // original size in pixels
    const scale = H / h;
    setScale(scale);
    const originPixel = CoordinateToPixel([w, h], [W, H], origin, resolution);
    setOriginPixelPos(originPixel);
    setPixelsPerMeter(1 / originImageMeta.resolution);
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

  const fetchStationDetails = async (stl_id) => {
    try {
      const response = await fetch(`/api/stationlists/${stl_id}`);
      const data = await response.json();
      if (response.ok) {
        console.log("Station Details:", data);
        setStationDetails(data);
        const stationPoints_ = data.Stations.map((station) => {
          const { mapWidth, mapHeight, origin, resolution } = originImageMeta;
          return CoordinateToPixel(
            [mapWidth, mapHeight],
            [imgRef.current.width, imgRef.current.height],
            [origin[0] + station.x, origin[1] + station.y],
            resolution,
          );
        });
        setStationPoints(stationPoints_);
      } else {
        console.error("Error fetching station details:", data.error);
      }
    } catch (error) {
      console.error("Error fetching station details:", error);
    }
  };
  // 計算需要的格線數量
  const calculateGridLines = () => {
    if (!realDimensions.width || !realDimensions.height) return { h: 0, v: 0 };

    // 確保格線數量足夠覆蓋整個圖像
    const horizontalLines = Math.ceil(
      realDimensions.height / (pixelsPerMeter * scale),
    );
    const verticalLines = Math.ceil(
      realDimensions.width / (pixelsPerMeter * scale),
    );
    return {
      h: horizontalLines,
      v: verticalLines,
    };
  };

  const { h: horizontalLines, v: verticalLines } = calculateGridLines();

  const handleMouseMove = (event) => {
    const rect = event.target.getBoundingClientRect(); // 獲取圖片的邊界矩形
    const x = Math.round(event.clientX - rect.left); // 計算 x 坐標
    const y = Math.round(event.clientY - rect.top); // 計算 y 坐標
    setPixelLocation({ x, y }); // 更新像素位置

    const { mapWidth, mapHeight, origin, resolution } = originImageMeta;
    const [W, H] = [imgRef.current.width, imgRef.current.height]; // actual size in pixels
    const [w, h] = [mapWidth, mapHeight]; // original size in pixels
    const scale = H / h;
    setScale(scale);
    setCoordLocation(
      PixelToCoordinate([x, y], [W, H], [w, h], resolution, origin),
    );
  };

  return (
    <div className="station-container">
      <StationManagerLeftNormal
        maps={maps}
        selectedMap={selectedMap}
        stationLists={stationLists}
        setStationLists={setStationLists}
        onChangeMap={onChangeMap}
        setStationDetails={setStationDetails}
        originImageMeta={originImageMeta}
        CoordinateToPixel={CoordinateToPixel}
        fetchStationDetails={fetchStationDetails}
      />
      <div className="station-content">
        <div className="image-display">
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
              onMouseMove={handleMouseMove}
            />
          )}
          {imageData && (
            <svg
              className="grid-overlay"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
              viewBox={`0 0 ${realDimensions.width} ${realDimensions.height}`}
              preserveAspectRatio="none"
            >
              {/* 水平線 */}
              {Array.from({ length: horizontalLines }).map((_, index) => (
                <line
                  key={`h-${index}`}
                  x1="0"
                  y1={
                    (originPixelPos.y % (pixelsPerMeter * scale)) +
                    index * pixelsPerMeter * scale
                  }
                  x2={imageDimensions.width}
                  y2={
                    (originPixelPos.y % (pixelsPerMeter * scale)) +
                    index * pixelsPerMeter * scale
                  }
                  stroke="rgba(128,128,128,0.3)"
                  strokeWidth="1"
                />
              ))}
              {/* 垂直線 */}
              {Array.from({ length: verticalLines }).map((_, index) => (
                <line
                  key={`v-${index}`}
                  x1={
                    (originPixelPos.x % (pixelsPerMeter * scale)) +
                    index * pixelsPerMeter * scale
                  }
                  y1="0"
                  x2={
                    (originPixelPos.x % (pixelsPerMeter * scale)) +
                    index * pixelsPerMeter * scale
                  }
                  y2={imageDimensions.height}
                  stroke="rgba(128,128,128,0.3)"
                  strokeWidth="1"
                />
              ))}
            </svg>
          )}
          {originPixelPos && (
            <div
              className="origin-marker"
              style={{
                left: `${originPixelPos.x}px`,
                top: `${originPixelPos.y}px`,
                backgroundColor: "black",
              }}
            />
          )}
          {stationPoints &&
            stationPoints.map((point) => (
              <div
                className="origin-marker"
                style={{
                  left: `${point.x}px`,
                  top: `${point.y}px`,
                  backgroundColor: "red",
                }}
              />
            ))}
          <StationManagerInfo
            imageData={imageData}
            originPixelPos={originPixelPos}
            originImageMeta={originImageMeta}
            realDimensions={realDimensions}
            pixelLocation={pixelLocation}
            coordLocation={coordLocation}
            pixelsPerMeter={pixelsPerMeter}
            scale={scale}
            horizontalLines={horizontalLines}
            verticalLines={verticalLines}
          />
        </div>
      </div>
    </div>
  );
}

export default StationManager;
