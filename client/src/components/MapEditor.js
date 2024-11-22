import React, { useState, useRef, useCallback, useEffect } from "react";
import ImageProcessingArea from "./ImageProcessingArea";
import ControlPanel from "./ControlPanel";
import "./MapEditor.css";

function MapEditor() {
  const [selectedFilePath, setSelectedFilePath] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [currentPath, setCurrentPath] = useState("");
  const [imageMetadata, setImageMetadata] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [crop, setCrop] = useState(null);
  const [originalImageState, setOriginalImageState] = useState(null);
  const [mapNames, setMapNames] = useState([]);
  const [maps, setMaps] = useState([]);

  // 圖片處理狀態
  const [isRotating, setIsRotating] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [originPixelPos, setOriginPixelPos] = useState(null);
  const [imageProcessedMetadata, setImageProcessedMetadata] = useState(null);
  const [scale, setScale] = useState(1);
  const [imageShowPixelSize, setImageShowPixelSize] = useState(false);

  const rotationTimeoutRef = useRef(null);
  const previousUrl = useRef(null);

  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // 添加對 file-list 的 ref
  const fileListRef = useRef(null);

  // 組件卸載時清理 URL
  React.useEffect(() => {
    return () => {
      if (previousUrl.current) {
        URL.revokeObjectURL(previousUrl.current);
      }
    };
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch("/save-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ angle: rotationAngle }),
      });

      if (!response.ok) {
        throw new Error("Failed to save image");
      }

      const data = await response.json();
      setSaveMessage(data.message);

      // 3秒後清除消息
      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error saving image:", error);
      setSaveMessage("Error saving image: " + error.message);
    }
  };

  const toggleRotating = () => {
    if (!isRotating) {
      // 進入旋轉模式時，保存當前狀態
      setOriginalImageState({
        imageUrl: processedImageUrl,
        metadata: imageProcessedMetadata,
        originPos: originPixelPos,
      });
    } else {
      // 取消旋轉時，恢復原始狀態
      if (originalImageState) {
        setProcessedImageUrl(originalImageState.imageUrl);
        setImageProcessedMetadata(originalImageState.metadata);
        setOriginPixelPos(originalImageState.originPos);
      }
      // setOriginalImageState(null); // 清除保存的原始狀態
      handleRotationCancel();
    }
    setRotationAngle(0);
    setIsRotating(!isRotating);
  };

  const toggleCropping = () => {
    setIsCropping(!isCropping);
    if (!isCropping) {
      // 初始化裁剪區域
      setCrop({
        unit: "%",
        width: 30,
        height: 30,
        x: 35,
        y: 35,
      });
    } else {
      setCrop(null);
    }
  };

  const handleRotationChange = (angle) => {
    setRotationAngle(angle);
    handleRotation(angle);
  };

  const handleRotationCancel = async () => {
    try {
      const response = await fetch("/rotate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ angle: rotationAngle, action: "cancel" }),
      });
      if (!response.ok) {
        throw new Error("Failed to rotate cancel");
      }
    } catch (error) {
      console.error("Error rotating image:", error);
      alert(`Error rotating image: ${error.message}`);
    }
  };

  const handleRotationComplete = async () => {
    try {
      const response = await fetch("/rotate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ angle: rotationAngle, action: "apply" }),
      });
      if (!response.ok) {
        throw new Error("Failed to rotate image");
      }
      const data = await response.json();
      const blob = await fetch(`data:image/png;base64,${data.image}`).then(
        (res) => res.blob(),
      );
      setProcessedImageUrl(URL.createObjectURL(blob));
      setImageProcessedMetadata(data.metadata);
      setIsRotating(false);
      setRotationAngle(0);

      // 更新原點位置
      const { resolution } = imageMetadata;
      const { mapWidth, mapHeight, origin, scale } = data.metadata;
      setScale(scale);

      const [originX, originY] = origin;
      const [H, W] = [mapHeight, mapWidth].map((v) => v * resolution);
      const pixelX = Math.round((originX / resolution) * scale);
      const pixelY = Math.round(((H - originY) / resolution) * scale);
      setOriginPixelPos({ x: pixelX, y: pixelY });
      setOriginalImageState(null); // 清除保存的原始狀態
      setImageShowPixelSize({
        width: Math.round(mapWidth * scale),
        height: Math.round(mapHeight * scale),
      });
      // console.log(
      //   `setImageShowPixelSize: width: ${imageShowPixelSize.width}, height: ${imageShowPixelSize.height}`,
      // );
    } catch (error) {
      console.error("Error rotating image:", error);
      alert(`Error rotating image: ${error.message}`);
    }
  };

  const handleCropComplete = async () => {
    if (!crop || !processedImageUrl) return;
    try {
      const response = await fetch("/crop-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ crop }),
      });
      if (!response.ok) {
        throw new Error("Failed to crop image");
      }
      const data = await response.json();
      const blob = await fetch(`data:image/png;base64,${data.image}`).then(
        (res) => res.blob(),
      );
      setProcessedImageUrl(URL.createObjectURL(blob));
      setImageProcessedMetadata(data.metadata);

      console.log(`imageProcessedMetadata: ${JSON.stringify(data.metadata)}`);
      const { resolution } = imageMetadata;
      const { mapWidth, mapHeight, origin, scale } = data.metadata;
      const [originX, originY] = origin;
      const H = mapHeight * resolution; // m
      const pixelX = Math.round((originX / resolution) * scale);
      const pixelY = Math.round(((H - originY) / resolution) * scale);
      setOriginPixelPos({ x: pixelX, y: pixelY });
      setImageShowPixelSize({
        width: Math.round(mapWidth * scale),
        height: Math.round(mapHeight * scale),
      });
      setScale(scale);
      setIsCropping(false);
      setCrop(null);
    } catch (error) {
      console.error("Error cropping image:", error);
      alert(`Error cropping image: ${error.message}`);
    }
  };

  const handleRotation = useCallback(
    async (angle) => {
      // if (!selectedFilePath || !imageMetadata) {
      //   alert("Please select a file first");
      //   return;
      // }
      setRotationAngle(angle);
      if (rotationTimeoutRef.current) {
        clearTimeout(rotationTimeoutRef.current);
      }
      rotationTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch("/rotate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ angle: angle }),
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || "Failed to convert image");
          }
          const data = await response.json();
          // 直接從 base64 創建 blob
          const blob = await fetch(`data:image/png;base64,${data.image}`).then(
            (res) => res.blob(),
          );
          setProcessedImageUrl(URL.createObjectURL(blob));
          setImageProcessedMetadata(data.metadata);
          console.log(
            `imageProcessedMetadata: ${JSON.stringify(data.metadata)}`,
          );
          console.log(
            `imageProcessedMetadata: ${JSON.stringify(imageProcessedMetadata)}`,
          );
          // 計算旋轉後的原點位置
          const { resolution } = imageMetadata;
          const { mapWidth, mapHeight, origin, scale } = data.metadata;
          const [originX, originY] = origin;
          const [H, W] = [mapHeight, mapWidth].map((v) => v * resolution);
          const pixelX = Math.round((originX / resolution) * scale);
          const pixelY = Math.round(((H - originY) / resolution) * scale);
          setOriginPixelPos({ x: pixelX, y: pixelY });
          setScale(scale);
          setImageShowPixelSize({
            width: Math.round(mapWidth * scale),
            height: Math.round(mapHeight * scale),
          });
        } catch (error) {
          console.error("Error rotating image:", error);
        }
      }, 10);
    },
    [selectedFilePath, imageMetadata],
  );

  // 更新 handleKeyPress 以防止滾動條的影響
  const handleKeyPress = useCallback(
    (event) => {
      if (
        fileListRef.current &&
        document.activeElement === fileListRef.current
      ) {
        console.log("key!", event.key);
        if (event.key === "ArrowDown") {
          event.preventDefault(); // 防止滾動條的影響
          setSelectedRowIndex((prevIndex) =>
            prevIndex === null ? 0 : Math.min(prevIndex + 1, maps.length - 1),
          );
        } else if (event.key === "ArrowUp") {
          event.preventDefault(); // 防止滾動條的影響
          setSelectedRowIndex((prevIndex) =>
            prevIndex === null ? 0 : Math.max(prevIndex - 1, 0),
          );
        }
      }
    },
    [maps, selectedRowIndex],
  );

  // 添加和移除鍵盤事件監聽器
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    console.log("selectedRowIndex", selectedRowIndex);
    console.log("maps[selectedRowIndex]", maps[selectedRowIndex]);
    if (maps.length > 0) {
      console.log("maps[selectedRowIndex].id", maps[selectedRowIndex].id);
      handleFileClick(maps[selectedRowIndex].id);
    }
  }, [selectedRowIndex]);

  // 新增 useEffect 來從資料庫獲取地圖名稱
  useEffect(() => {
    const fetchMapNames = async () => {
      try {
        const response = await fetch("/api/maps"); // 假設有一個 API 來獲取地圖名稱
        if (!response.ok) {
          throw new Error("Failed to fetch map names");
        }
        const data = await response.json();
        setMaps(data);
      } catch (error) {
        console.error("Error fetching map names:", error);
      }
    };

    fetchMapNames();
  }, []);

  const handleFileClick = async (mapId) => {
    console.log("handleFileClick");
    console.log(mapId);
    try {
      const response = await fetch("/convert-pgm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mapId: mapId }),
      });
      if (!response.ok) {
        const error = await response.json();
        console.error("Error fetching image:", data.error);
        throw new Error(error.details || "Failed to convert image");
      }
      const data = await response.json();
      console.log("Image Data:", data.image);
      const blob = await fetch(`data:image/png;base64,${data.image}`).then(
        (res) => res.blob(),
      );
      setProcessedImageUrl(URL.createObjectURL(blob));
      setImageMetadata(data.metadata);
      setImageProcessedMetadata(data.metadata);
      const { resolution, mapWidth, mapHeight, origin, scale } = data.metadata;

      console.log(`imageMetadata: ${JSON.stringify(data.metadata)}`);

      // 計算原點的像素位置
      const [x, y] = origin; // in meter
      console.log(`origin: ${origin}`);
      console.log(`x: ${x}`);
      console.log(`y: ${y}`);
      console.log(`resolution: ${resolution}`);

      const H = mapHeight * resolution; // m
      const pixelX = Math.round((x / resolution) * scale);
      const pixelY = Math.round(((H - y) / resolution) * scale);

      console.log(`pixelX: ${pixelX}`);
      console.log(`pixelY: ${pixelY}`);

      setOriginPixelPos({ x: pixelX, y: pixelY });
      console.log(`scale: ${scale}`);
      setRotationAngle(0);
      setScale(scale);
      setImageShowPixelSize({
        width: Math.round(mapWidth * scale),
        height: Math.round(mapHeight * scale),
      });
    } catch (error) {
      console.error("Error fetching map details:", error);
      alert(`Error fetching map details: ${error.message}`);
    }
  };

  const handleRowClick = (index) => {
    setSelectedRowIndex(index); // 設定選中的行索引
    handleFileClick(index + 1);
  };

  return (
    <div className="map-editor">
      <div className="map-editor-container">
        <div className="file-list" ref={fileListRef} tabIndex={0}>
          <h2>Maps</h2>
          <table>
            <thead>
              <tr>
                <th>Real</th>
                <th>Name</th>
                <th>Robot Type</th>
              </tr>
            </thead>
            <tbody>
              {maps.map((e, index) => (
                <tr
                  key={`${e.name}/${e.Robottype.name}`}
                  onClick={() => handleRowClick(index)} // 點擊行時高亮
                  style={{
                    cursor: "pointer",
                    backgroundColor:
                      selectedRowIndex === index ? "#e3f2fd" : "transparent", // 高亮顯示
                  }}
                >
                  <td>{e.real}</td>
                  <td>{e.name}</td>
                  <td>{e.Robottype.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="main-content">
          <h1>ROS2 Grid Map Editor</h1>
          <ControlPanel
            processedImageUrl={processedImageUrl}
            isRotating={isRotating}
            isCropping={isCropping}
            imageMetadata={imageMetadata}
            originPixelPos={originPixelPos}
            imageProcessedMetadata={imageProcessedMetadata}
            handleSave={handleSave}
            toggleCropping={toggleCropping}
            toggleRotating={toggleRotating}
            handleCropComplete={handleCropComplete}
            handleRotationComplete={handleRotationComplete}
            rotationAngle={rotationAngle}
            handleRotationChange={handleRotationChange}
            scale={scale}
            imageShowPixelSize={imageShowPixelSize}
          />
          <ImageProcessingArea
            saveMessage={saveMessage}
            selectedFilePath={selectedFilePath}
            isRotating={isRotating}
            rotationAngle={rotationAngle}
            handleRotationChange={handleRotationChange}
            processedImageUrl={processedImageUrl}
            isCropping={isCropping}
            crop={crop}
            setCrop={setCrop}
            originPixelPos={originPixelPos}
            imageMetadata={imageMetadata}
            scale={scale}
          />
        </div>
      </div>
    </div>
  );
}

export default MapEditor;
