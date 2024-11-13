import React from "react";
import MetadataDisplay from "./MetadataDisplay";

const ControlPanel = ({
  processedImageUrl,
  isRotating,
  isCropping,
  imageMetadata,
  originPixelPos,
  imageProcessedMetadata,
  handleSave,
  toggleCropping,
  toggleRotating,
  handleCropComplete,
  handleRotationComplete,
  rotationAngle,
  handleRotationChange,
}) => {
  return (
    <div className="control-section">
      <div className="control-panel">
        <div className="main-buttons">
          <button
            className="control-button"
            onClick={handleSave}
            disabled={!processedImageUrl || isRotating || isCropping}
          >
            Save Current Image
          </button>
          <button
            className="control-button"
            onClick={toggleCropping}
            disabled={!processedImageUrl || isRotating}
          >
            Crop Image
          </button>
          <button
            className="control-button"
            onClick={toggleRotating}
            disabled={!processedImageUrl || isCropping}
          >
            Rotate Image
          </button>
        </div>
        <div className="action-buttons">
          {(isCropping || isRotating) && (
            <button
              className="control-button cancel"
              onClick={isCropping ? toggleCropping : toggleRotating}
            >
              Cancel
            </button>
          )}
          {isCropping && (
            <button
              className="control-button confirm"
              onClick={handleCropComplete}
            >
              Apply Crop
            </button>
          )}
          {isRotating && (
            <button
              className="control-button confirm"
              onClick={handleRotationComplete}
            >
              Apply Rotation
            </button>
          )}
        </div>
        {!isRotating && !isCropping && (
          <MetadataDisplay
            imageMetadata={imageMetadata}
            originPixelPos={originPixelPos}
            imageProcessedMetadata={imageProcessedMetadata}
          />
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
