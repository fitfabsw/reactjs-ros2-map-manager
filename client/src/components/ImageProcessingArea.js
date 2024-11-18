import React from "react";
import ImageDisplay from "./ImageDisplay";

const ImageProcessingArea = ({
  saveMessage,
  isRotating,
  rotationAngle,
  handleRotationChange,
  processedImageUrl,
  isCropping,
  crop,
  setCrop,
  originPixelPos,
  imageMetadata,
  scale,
}) => {
  return (
    <>
      {saveMessage && <div className="save-message">{saveMessage}</div>}

      {isRotating && (
        <div className="rotation-control">
          <label>Rotate Image: {rotationAngle}°</label>
          <input
            type="range"
            min="-180"
            max="180"
            value={rotationAngle}
            onChange={(e) => handleRotationChange(e.target.value)}
          />
        </div>
      )}

      {processedImageUrl && (
        <ImageDisplay
          processedImageUrl={processedImageUrl}
          isCropping={isCropping}
          crop={crop}
          setCrop={setCrop}
          originPixelPos={originPixelPos}
          rotationAngle={rotationAngle}
          imageMetadata={imageMetadata}
          scale={scale}
        />
      )}
    </>
  );
};

export default ImageProcessingArea;
