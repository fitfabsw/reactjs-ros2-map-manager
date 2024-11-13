import React from "react";

const MetadataDisplay = ({
  imageMetadata,
  originPixelPos,
  imageProcessedMetadata,
}) => {
  if (!imageMetadata) return null;

  const formatNumber = (num) => Number(num).toFixed(2);

  return (
    <div className="image-metadata">
      <h3>圖像元數據</h3>
      <table>
        <tbody>
          <tr>
            <td>解析度:</td>
            <td>{formatNumber(imageMetadata.resolution)} m/像素</td>
          </tr>
          <tr>
            <td>原點 (m):</td>
            <td>
              ({formatNumber(imageMetadata.origin[0])},
              {formatNumber(imageMetadata.origin[1])})
            </td>
          </tr>
          <tr>
            <td>地圖尺寸 (像素):</td>
            <td>
              {imageMetadata.mapWidth} x {imageMetadata.mapHeight}
            </td>
          </tr>
          <tr>
            <td>地圖尺寸 (m):</td>
            <td>
              {formatNumber(imageMetadata.mapWidth * imageMetadata.resolution)}{" "}
              x{" "}
              {formatNumber(imageMetadata.mapHeight * imageMetadata.resolution)}
            </td>
          </tr>
          <tr>
            <td>原點像素位置:</td>
            <td>
              ({originPixelPos.x}, {originPixelPos.y})
            </td>
          </tr>
          <tr>
            <td>處理後地圖尺寸 (像素):</td>
            <td>
              {imageProcessedMetadata.mapWidth} x{" "}
              {imageProcessedMetadata.mapHeight}
            </td>
          </tr>
          <tr>
            <td>處理後地圖尺寸 (m):</td>
            <td>
              {formatNumber(
                imageProcessedMetadata.mapWidth * imageMetadata.resolution,
              )}{" "}
              x{" "}
              {formatNumber(
                imageProcessedMetadata.mapHeight * imageMetadata.resolution,
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MetadataDisplay;
