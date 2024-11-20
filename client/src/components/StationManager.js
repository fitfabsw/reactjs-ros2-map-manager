import React, { useState, useEffect, useRef } from "react";
import "./StationManager.css";
import StationManagerLeftNormal from "./StationManagerLeftNormal";
import StationManagerInfo from "./StationManagerInfo";
import StationCard from "./StationCard";

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
  // const [mode, setMode] = useState("normal");
  const [editMode, setEditMode] = useState(false);

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

  useEffect(() => {
    // if (mode === "edit" && imageData) {
    if (editMode && imageData) {
      handleGetImageElement();
    }
  }, [editMode, imageData]);

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

  const modifyStation = async (stationId, newDetails) => {
    try {
      // 更新本地狀態
      setStationDetails((prevDetails) => {
        const updatedStations = prevDetails.Stations.map((station) =>
          station.id === stationId ? { ...station, ...newDetails } : station,
        );
        return { ...prevDetails, Stations: updatedStations };
      });

      // 更新站點位置標記
      const { mapWidth, mapHeight, origin, resolution } = originImageMeta;
      const newPoint = CoordinateToPixel(
        [mapWidth, mapHeight],
        [imgRef.current.width, imgRef.current.height],
        [origin[0] + newDetails.x, origin[1] + newDetails.y],
        resolution,
      );

      setStationPoints((prevPoints) =>
        prevPoints.map((point, index) =>
          stationDetails.Stations[index].id === stationId ? newPoint : point,
        ),
      );
    } catch (error) {
      console.error("修改站點時發生錯誤:", error);
    }
  };

  const createStation = async (newStation) => {
    try {
      setStationDetails((prevDetails) => {
        const updatedStations = [...prevDetails.Stations, newStation];
        return { ...prevDetails, Stations: updatedStations };
      });

      // 計算新站點在地圖上的位置
      const newPoint = CoordinateToPixel(
        [originImageMeta.mapWidth, originImageMeta.mapHeight],
        [imgRef.current.width, imgRef.current.height],
        [
          originImageMeta.origin[0] + newStation.x,
          originImageMeta.origin[1] + newStation.y,
        ],
        originImageMeta.resolution,
      );

      setStationPoints((prevPoints) => [...prevPoints, newPoint]);
    } catch (error) {
      console.error("創建站點時發生錯誤:", error);
    }
  };

  const deleteStation = async (stationId) => {
    try {
      // 找到要刪除的站點的順序
      const stationToDelete = stationDetails.Stations.find(
        (s) => s.id === stationId,
      );
      const deletedOrder = stationToDelete.order;

      // 更新本地狀態
      setStationDetails((prevDetails) => {
        // 過濾掉要刪除的站點
        const updatedStations = prevDetails.Stations.filter(
          (station) => station.id !== stationId,
        );

        // 更新後續站點的順序
        const reorderedStations = updatedStations.map((station) => {
          if (station.order > deletedOrder) {
            return { ...station, order: station.order - 1 };
          }
          return station;
        });

        return { ...prevDetails, Stations: reorderedStations };
      });

      // 移除站點位置標記
      setStationPoints((prevPoints) =>
        prevPoints.filter(
          (_, index) => stationDetails.Stations[index].id !== stationId,
        ),
      );

      // 更新後端
      // 1. 刪除站點
      // await fetch(`/api/stations/${stationId}`, {
      //   method: "DELETE",
      // });

      // 2. 更新其他站點的順序
      // const updatedStations = stationDetails.Stations.filter(
      //   (s) => s.id !== stationId && s.order > deletedOrder,
      // ).map((s) => ({
      //   id: s.id,
      //   order: s.order - 1,
      // }));
      //
      // // 批量更新其他站點的順序
      // console.log("GGGG");
      // if (updatedStations.length > 0) {
      //   await fetch("/api/stations/batch-update-order", {
      //     method: "PUT",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(updatedStations),
      //   });
      // }
      console.log("KKKK");
    } catch (error) {
      console.error("刪除站點時發生錯誤:", error);
    }
  };

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
        setEditMode(true);
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

  const [draggingStationId, setDraggingStationId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleStationDragStart = (event, stationId) => {
    event.preventDefault(); // 防止預設的曳行為
    const stationCard = document.querySelector(
      `[data-station-id="${stationId}"]`,
    );
    const isEditing = stationCard?.getAttribute("data-editing") === "true";

    if (isEditing) {
      setDraggingStationId(stationId);
      setIsDragging(true);

      // 添加全局滑鼠事件監聽
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }
  };

  const handleStationDragEnd = () => {
    setDraggingStationId(null);
    setIsDragging(false);
  };

  const handleMouseMove = (event) => {
    if (!imgRef.current) return; // 確保 imgRef.current 存在

    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(event.clientY - rect.top);

    // 檢查滑鼠是否在圖片範圍內
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setPixelLocation({ x, y });

      const { mapWidth, mapHeight, origin, resolution } = originImageMeta;
      const [W, H] = [imgRef.current.width, imgRef.current.height];
      const [w, h] = [mapWidth, mapHeight];
      const scale = H / h;
      setScale(scale);

      const newCoord = PixelToCoordinate(
        [x, y],
        [W, H],
        [w, h],
        resolution,
        origin,
      );

      // 將座標值限制到兩位小數
      newCoord.x = parseFloat(newCoord.x.toFixed(2));
      newCoord.y = parseFloat(newCoord.y.toFixed(2));

      setCoordLocation(newCoord);

      // 如果正在等待選擇位置，更新預覽
      if (waitingForLocation) {
        const updatedStation = {
          ...stationDetails.Stations.find((s) => s.id === waitingForLocation),
          x: newCoord.x,
          y: newCoord.y,
        };

        // 更新 stationDetails 中的座標（即時預覽）
        setStationDetails((prev) => ({
          ...prev,
          Stations: prev.Stations.map((s) =>
            s.id === waitingForLocation ? updatedStation : s,
          ),
        }));
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      handleStationDragEnd();
    }
  };

  // 新增全局滑鼠移動處理函數
  const handleGlobalMouseMove = (event) => {
    if (isDragging && imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect();
      const x = Math.round(event.clientX - rect.left);
      const y = Math.round(event.clientY - rect.top);

      // 檢查是否在圖片範圍內
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        handleMouseMove({
          target: imgRef.current,
          clientX: event.clientX,
          clientY: event.clientY,
        });
      }
    }
  };

  // 新增全局滑鼠放開處理函數
  const handleGlobalMouseUp = () => {
    if (isDragging) {
      handleStationDragEnd();
      // 移除全局事件監聽
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    }
  };

  // 添加新的狀態
  const [waitingForLocation, setWaitingForLocation] = useState(null); // 存儲等���位置選擇的站點 ID

  // 添加點擊地圖處理函數
  const [originalStation, setOriginalStation] = useState(null); // 新增狀態來保存原始站點

  const handleMapClick = (event) => {
    if (waitingForLocation) {
      const rect = event.target.getBoundingClientRect();
      const x = Math.round(event.clientX - rect.left);
      const y = Math.round(event.clientY - rect.top);

      const { mapWidth, mapHeight, origin, resolution } = originImageMeta;
      const [W, H] = [imgRef.current.width, imgRef.current.height];
      const [w, h] = [mapWidth, mapHeight];

      const newCoord = PixelToCoordinate(
        [x, y],
        [W, H],
        [w, h],
        resolution,
        origin,
      );
      console.log("newCoord:", newCoord);

      // 更新站點位置
      const updatedStation = {
        ...stationDetails.Stations.find((s) => s.id === waitingForLocation),
        x: parseFloat(newCoord.x.toFixed(2)),
        y: parseFloat(newCoord.y.toFixed(2)),
      };

      // 更新 stationDetails 中的座標（即時預覽）
      setStationDetails((prev) => ({
        ...prev,
        Stations: prev.Stations.map((s) =>
          s.id === waitingForLocation ? updatedStation : s,
        ),
      }));

      // 更新地圖上的位置點圖示
      setStationPoints((prevPoints) =>
        prevPoints.map((point, index) =>
          stationDetails.Stations[index].id === waitingForLocation
            ? { x: x, y: y }
            : point,
        ),
      );
    }
  };

  const handleSave = async () => {
    // ... existing save logic ...

    // 在保存後重置狀態
    setWaitingForLocation(null); // 提示消失
    setOriginalStation(null); // 清空原始位置
    setIsDragging(false); // 確保拖曳狀態重置
    setSelectedStationId(null); // 清除選中的站點
    // 這裡可以添加其他需要重置的狀態
  };

  const handleCancel = () => {
    // 恢復到原始位置
    if (originalStation) {
      const updatedStation = {
        ...stationDetails.Stations.find((s) => s.id === waitingForLocation),
        x: originalStation.x,
        y: originalStation.y,
      };

      setStationDetails((prev) => ({
        ...prev,
        Stations: prev.Stations.map((s) =>
          s.id === waitingForLocation ? updatedStation : s,
        ),
      }));
      setOriginalStation(null); // 清空原始位置
    }

    // 重置等待位置狀態
    setWaitingForLocation(null); // 提示消失
    setIsDragging(false); // 確保拖曳狀態重置
    setSelectedStationId(null); // 清除選中的站點
  };

  // 添加新的狀態
  const [selectedStationId, setSelectedStationId] = useState(null);

  return (
    <div className="station-container">
      <StationManagerLeftNormal
        maps={maps}
        selectedMap={selectedMap}
        stationLists={stationLists}
        setStationLists={setStationLists}
        onChangeMap={onChangeMap}
        stationDetails={stationDetails}
        fetchStationDetails={fetchStationDetails}
        // mode={mode}
        // setMode={setMode}
        editMode={editMode}
        setEditMode={setEditMode}
        createStation={createStation}
        modifyStation={modifyStation}
        deleteStation={deleteStation}
        setStationPoints={setStationPoints}
        draggingStationId={draggingStationId}
        waitingForLocation={waitingForLocation}
        setWaitingForLocation={setWaitingForLocation}
        selectedStationId={selectedStationId}
        setSelectedStationId={setSelectedStationId}
        setStationDetails={setStationDetails}
      />
      <div className="station-content">
        <div className="image-display">
          {waitingForLocation && (
            <div className="location-prompt">請選擇欲更動之位置</div>
          )}
          {imageData && (
            <img
              ref={imgRef}
              src={`data:image/png;base64,${imageData}`}
              alt="Map"
              onLoad={handleGetImageElement}
              style={{
                maxWidth: "100%",
                height: "auto",
                display: "block",
                cursor: waitingForLocation ? "crosshair" : "default",
              }}
              onClick={handleMapClick}
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
            stationPoints.map((point, index) => {
              const station = stationDetails.Stations[index];
              const stationCard = document.querySelector(
                `[data-station-id="${station.id}"]`,
              );
              const isEditing =
                stationCard?.getAttribute("data-editing") === "true";
              const isSelected = selectedStationId === station.id;

              return (
                <div key={station.id}>
                  <div
                    className={`station-marker ${station.type} ${
                      draggingStationId === station.id ? "dragging" : ""
                    } ${isSelected ? "selected" : ""}`}
                    style={{
                      left: `${point.x}px`,
                      top: `${point.y}px`,
                      cursor: isEditing
                        ? isDragging
                          ? "grabbing"
                          : "grab"
                        : "default",
                      pointerEvents: isEditing ? "auto" : "none",
                    }}
                    onMouseDown={(e) => handleStationDragStart(e, station.id)}
                    onClick={() => setSelectedStationId(station.id)}
                  />
                  {isSelected && (
                    <div
                      className="station-label"
                      style={{
                        left: `${point.x + 15}px`,
                        top: `${point.y - 10}px`,
                      }}
                    >
                      {station.st_name}
                    </div>
                  )}
                </div>
              );
            })}
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
