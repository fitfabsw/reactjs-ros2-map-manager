import React, { useEffect, useState, useRef } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ImageDisplay = ({
  processedImageUrl,
  isCropping,
  crop,
  setCrop,
  originPixelPos,
  imageMetadata,
  scale,
}) => {
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const containerRef = useRef(null);
  const pixelsPerMeter = imageMetadata ? 1 / imageMetadata.resolution : 50;

  useEffect(() => {
    if (processedImageUrl) {
      const img = new Image();
      img.src = processedImageUrl;
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
    }
  }, [processedImageUrl]);

  // 計算需要的格線數量
  const calculateGridLines = () => {
    if (!imageDimensions.width || !imageDimensions.height)
      return { h: 0, v: 0 };

    // 確保格線數量足夠覆蓋整個圖像
    console.log(
      `ABC width: ${imageDimensions.width}, height: ${imageDimensions.height}, pixelsPerMeter: ${pixelsPerMeter}, scale: ${scale}`,
    );
    // const horizontalLines = Math.ceil(
    //   (imageDimensions.height / pixelsPerMeter) * scale,
    // );
    // const verticalLines = Math.ceil(
    //   (imageDimensions.width / pixelsPerMeter) * scale,
    // );
    const horizontalLines = Math.ceil(
      imageDimensions.height / (pixelsPerMeter * scale),
    );
    const verticalLines = Math.ceil(
      imageDimensions.width / (pixelsPerMeter * scale),
    );
    console.log(
      `horizontalLines: ${horizontalLines}, verticalLines: ${verticalLines}`,
    );

    return {
      h: horizontalLines,
      v: verticalLines,
    };
  };

  const { h: horizontalLines, v: verticalLines } = calculateGridLines();

  return (
    <div className="image-container" ref={containerRef}>
      {isCropping ? (
        <ReactCrop crop={crop} onChange={(c) => setCrop(c)} aspect={undefined}>
          <img src={processedImageUrl} alt="Processed" />
        </ReactCrop>
      ) : (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={processedImageUrl}
            alt="Processed"
            style={{
              maxWidth: "100%",
              height: "auto",
              display: "block",
            }}
          />
          <div> {pixelsPerMeter * scale} </div>
          <div> {originPixelPos.x} </div>
          <div> {-(originPixelPos.x % (pixelsPerMeter * scale))} </div>
          {processedImageUrl && (
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
              viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
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
              {/* origin垂直線 */}
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
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;
