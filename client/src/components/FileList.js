import React from "react";

const FileList = ({
  files,
  currentPath,
  selectedFilePath,
  isRotating,
  isCropping,
  handleFileClick,
}) => {
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
};

export default FileList;
