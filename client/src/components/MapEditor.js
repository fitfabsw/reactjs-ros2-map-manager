import React, { useState, useRef, useCallback, useEffect } from "react";
import FileList from "./FileList";
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
      if (!selectedFilePath || !imageMetadata) {
        alert("Please select a file first");
        return;
      }
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

  const handleKeyPress = useCallback(
    (event) => {
      if (!isCropping && !isRotating) return;

      if (event.key === "Escape") {
        // ESC 鍵處理取消操作
        if (isCropping) {
          toggleCropping();
        } else if (isRotating) {
          toggleRotating();
        }
      } else if (event.key === "Enter") {
        // Enter 鍵處理確認操作
        if (isCropping) {
          handleCropComplete();
        } else if (isRotating) {
          handleRotationComplete();
        }
      }
    },
    [
      isCropping,
      isRotating,
      toggleCropping,
      toggleRotating,
      handleCropComplete,
      handleRotationComplete,
    ],
  );

  // 添加和移除鍵盤事件監聽器
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="map-editor">
      <div className="map-editor-container">
        <FileList
          setSelectedFilePath={setSelectedFilePath}
          currentPath={currentPath}
          setCurrentPath={setCurrentPath}
          selectedFilePath={selectedFilePath}
          isRotating={isRotating}
          isCropping={isCropping}
          setProcessedImageUrl={setProcessedImageUrl}
          setImageMetadata={setImageMetadata}
          setImageProcessedMetadata={setImageProcessedMetadata}
          setRotationAngle={setRotationAngle}
          setOriginPixelPos={setOriginPixelPos}
          setImageShowPixelSize={setImageShowPixelSize}
          setScale={setScale}
        />

        <div className="main-content">
          <h1>ROS2 Grid Map Editor</h1>
          <div>
            imageShowPixelSize={imageShowPixelSize.width},{" "}
            {imageShowPixelSize.height}
          </div>
          <div>scale: {scale}</div>
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
