// import React, { useState, useEffect, useRef } from "react";
import "./StationManager.css";

function StationManagerInfo({
  imageData,
  originPixelPos,
  originImageMeta,
  realDimensions,
  pixelLocation,
  coordLocation,
  pixelsPerMeter,
  scale,
  horizontalLines,
  verticalLines,
}) {
  return (
    <div className="station-content">
      {/* {originPixelPos && <div>{pixelsPerMeter}</div>} */}
      {/* {originPixelPos && <div>{scale}</div>} */}
      {/* {originPixelPos && <div>{pixelsPerMeter * scale}</div>} */}
      {/* {originPixelPos && <div>{originPixelPos.x}</div>} */}
      {/* {originPixelPos && <div>{originPixelPos.y}</div>} */}
      {/* {originPixelPos && <div>{horizontalLines}</div>} */}
      {/* {originPixelPos && <div>{verticalLines}</div>} */}
      {true && imageData && originPixelPos && (
        <div className="pixel-info" style={{ textAlign: "left" }}>
          <p>
            <b>Original</b> size: {originImageMeta.mapWidth} x{" "}
            {originImageMeta.mapHeight} pixels
            {", "}
            map origin: ({originImageMeta.origin[0].toFixed(2)},{" "}
            {originImageMeta.origin[1].toFixed(2)}) (m) (image
            origin@bottom-left)
          </p>
          <p>
            <b>Real</b> size: {realDimensions.width} x {realDimensions.height}{" "}
            pixels
            {", "}
            map origin: ({originPixelPos.x}, {originPixelPos.y}) pixels (image
            origin@top-left)
          </p>
          <p>
            <b>scale </b>
            {(realDimensions.height / originImageMeta.mapHeight).toFixed(4)}
          </p>
          <p>
            <b>Pixel Location:</b> ({pixelLocation.x}, {pixelLocation.y})
          </p>
          <p>
            <b>Map Center Coordinate:</b> ({coordLocation.x.toFixed(2)},{" "}
            {coordLocation.y.toFixed(2)})
          </p>
        </div>
      )}
    </div>
  );
}

export default StationManagerInfo;
