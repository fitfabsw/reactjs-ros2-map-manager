import React, { useState, useEffect } from "react";
// import "./FileList.css";
import "./MapEditor.css";

function FileList({
  currentPath,
  setCurrentPath,
  setSelectedFilePath,
  setProcessedImageUrl,
  setImageMetadata,
  setImageProcessedMetadata,
  setOriginPixelPos,
  setRotationAngle,
  setSelectedFile,
  isCropping,
  isRotating,
  selectedFilePath,
}) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  const fetchFiles = async (path = null) => {
    try {
      const url = path ? `/files?path=${encodeURIComponent(path)}` : "/files";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }
      const data = await response.json();
      setFiles(data.files);
      setCurrentPath(data.currentPath);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  // const fetchFiles = async (path = "") => {
  //   try {
  //     const url = path ? `/files?path=${encodeURIComponent(path)}` : "/files";
  //     const response = await fetch(url);
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch files");
  //     }
  //     const data = await response.json();
  //     setFiles(data.files || []);
  //     if (data.currentPath !== undefined) {
  //       setCurrentPath(data.currentPath);
  //     }
  //   } catch (error) {
  //     setError("無法載入文件列表");
  //     console.error("Error fetching files:", error);
  //   }
  // };

  useEffect(() => {
    fetchFiles(currentPath);
  }, []);

  const handleFileClick = async (file) => {
    if (file.isDirectory) {
      fetchFiles(file.path);
      return;
    }
    setSelectedFilePath(file.path);
    const isPgm = file.name.toLowerCase().endsWith(".pgm");
    if (!isPgm) {
      alert("Please select a PGM file");
      return;
    }
    try {
      const response = await fetch("/convert-pgm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath: file.path }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Failed to convert image");
      }
      const data = await response.json();
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
      setSelectedFile(file);
      setRotationAngle(0);
    } catch (error) {
      console.error("Error processing file:", error);
      alert(`Error processing file: ${error.message}`);
    }
  };

  const handleBackClick = () => {
    if (currentPath) {
      const parentPath = currentPath.split("/").slice(0, -1).join("/");
      fetchFiles(parentPath);
    }
  };

  return (
    <div className={`file-list ${isRotating || isCropping ? "disabled" : ""}`}>
      <h2>Files</h2>
      <div className="current-path">{currentPath}</div>
      <div className="files">
        {files.map((file) => {
          const isPgm = file.name.toLowerCase().endsWith(".pgm");
          return (
            <div
              key={file.path}
              className={`file-item ${file.isDirectory ? "directory" : ""}
                ${file.path === selectedFilePath ? "selected" : ""}
                ${isPgm ? "pgm-file" : ""}`}
              onClick={() =>
                !isRotating && !isCropping && handleFileClick(file)
              }
            >
              <span className="file-name">{file.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FileList;
