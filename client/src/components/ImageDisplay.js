// import React from "react";
//
// function ImageDisplay({ selectedFile, processedImage }) {
//   if (!selectedFile && !processedImage) {
//     return <div className="image-display">No image selected</div>;
//   }
//
//   return (
//     <div className="image-display">
//       {processedImage ? (
//         <img
//           src={`data:image/png;base64,${processedImage}`}
//           alt="Processed"
//           style={{ maxWidth: "100%", height: "auto" }}
//         />
//       ) : selectedFile?.convertedImage ? (
//         <img
//           src={`data:image/png;base64,${selectedFile.convertedImage}`}
//           alt={selectedFile.name}
//           style={{ maxWidth: "100%", height: "auto" }}
//           onError={(e) => {
//             console.error("Error loading image:", e);
//             e.target.style.display = "none";
//           }}
//         />
//       ) : (
//         <div className="image-display">Loading image...</div>
//       )}
//     </div>
//   );
// }
//
// export default ImageDisplay;

import React, { useEffect, useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ImageDisplay = ({
  processedImageUrl,
  isCropping,
  crop,
  setCrop,
  originPixelPos,
  rotationAngle,
  imageMetadata,
}) => {
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
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
    const horizontalLines = Math.ceil(
      Math.max(imageDimensions.height, originPixelPos.y * 2) / pixelsPerMeter,
    );
    const verticalLines = Math.ceil(
      Math.max(imageDimensions.width, originPixelPos.x * 2) / pixelsPerMeter,
    );

    return {
      h: horizontalLines * 2, // 乘以2確保兩側都有足夠的線
      v: verticalLines * 2,
    };
  };

  const { h: horizontalLines, v: verticalLines } = calculateGridLines();

  return (
    <div>
      <div className="image-display">
        {isCropping ? (
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            aspect={undefined}
          >
            <img src={processedImageUrl} alt="Processed" />
          </ReactCrop>
        ) : (
          <>
            <img
              src={processedImageUrl}
              alt="Processed"
              style={{
                maxWidth: "100%",
                transition: "transform 0.2s ease",
              }}
            />
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
            >
              {/* 水平線 */}
              {Array.from({ length: horizontalLines }).map((_, index) => (
                <line
                  key={`h-${index}`}
                  x1="0%"
                  y1={`${
                    originPixelPos.y +
                    (index - Math.ceil(horizontalLines / 2)) * pixelsPerMeter
                  }px`}
                  x2="100%"
                  y2={`${
                    originPixelPos.y +
                    (index - Math.ceil(horizontalLines / 2)) * pixelsPerMeter
                  }px`}
                  stroke="rgba(115,115,115,0.5)"
                  strokeWidth="1"
                />
              ))}
              {/* 垂直線 */}
              {Array.from({ length: verticalLines }).map((_, index) => (
                <line
                  key={`v-${index}`}
                  x1={`${
                    originPixelPos.x +
                    (index - Math.ceil(verticalLines / 2)) * pixelsPerMeter
                  }px`}
                  y1="0%"
                  x2={`${
                    originPixelPos.x +
                    (index - Math.ceil(verticalLines / 2)) * pixelsPerMeter
                  }px`}
                  y2="100%"
                  stroke="rgba(115,115,115,0.5)"
                  strokeWidth="1"
                />
              ))}
            </svg>
            <div
              className="origin-marker"
              style={{
                left: `${originPixelPos.x}px`,
                top: `${originPixelPos.y}px`,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ImageDisplay;
