import React from "react";

function MetadataDisplay({ metadata }) {
  if (!metadata) {
    return null;
  }

  // 檢查必要的屬性是否存在
  const hasOrigin =
    metadata.origin &&
    typeof metadata.origin.x !== "undefined" &&
    typeof metadata.origin.y !== "undefined";
  const hasResolution = typeof metadata.resolution !== "undefined";
  const hasWidth = typeof metadata.width !== "undefined";
  const hasHeight = typeof metadata.height !== "undefined";

  return (
    <div className="metadata-display">
      <h3>Metadata</h3>
      {hasOrigin && (
        <div>
          <p>
            Origin: ({metadata.origin.x}, {metadata.origin.y})
          </p>
        </div>
      )}
      {hasResolution && (
        <div>
          <p>Resolution: {metadata.resolution}</p>
        </div>
      )}
      {hasWidth && hasHeight && (
        <div>
          <p>
            Dimensions: {metadata.width} x {metadata.height}
          </p>
        </div>
      )}
      {!hasOrigin && !hasResolution && !hasWidth && !hasHeight && (
        <p>No metadata available</p>
      )}
    </div>
  );
}

export default MetadataDisplay;
