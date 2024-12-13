import React, { useState, useEffect } from "react";
import "./DbTable.css";
import { uploadFile } from "./database";

const DbTable = ({
  data,
  onUpdate,
  onDelete,
  columns,
  selectedTable,
  columnExcludes,
  dataLoading,
}) => {
  const [editEntry, setEditEntry] = useState(null);
  const [pgmFileInput, setPgmFileInput] = useState(null);
  const [thumbnailFileInput, setThumbnailFileInput] = useState(null);
  const [yamlFileInput, setYamlFileInput] = useState(null);
  // const [dataLoaded, setDataLoaded] = useState(false);

  const handleEditChange = (e, accessor) => {
    const { value } = e.target;
    setEditEntry((prev) => ({ ...prev, [accessor]: value }));
  };

  const handleFileChange = (file, accessor) => {
    console.log("handleFileChange!");
    if (file) {
      console.log("file", file);
      if (accessor === "pgm") {
        console.log("pgmFileInput", pgmFileInput);
        setPgmFileInput(file);
      } else if (accessor === "thumbnail") {
        console.log("thumbnailFileInput", thumbnailFileInput);
        setThumbnailFileInput(file);
      } else if (accessor === "yaml") {
        console.log("yamlFileInput", yamlFileInput);
        setYamlFileInput(file);
      }
    }
  };

  const FileInput = ({ accessor }) => {
    const handleFileChangeLocal = (file) => {
      if (file) {
        console.log("file", file);
        handleFileChange(file, accessor);
      }
    };

    return (
      <>
        {/* <input */}
        {/*   type="file" */}
        {/*   accept={accessor === "pgm" ? ".pgm" : "image/*"} */}
        {/*   onChange={(e) => handleFileChangeLocal(e.target.files[0])} */}
        {/*   style={{ display: "none" }} */}
        {/*   id={`file-input-${accessor}`} */}
        {/* /> */}

        {accessor === "pgm" && (
          <input
            type="file"
            accept={".pgm"}
            style={{ display: "none" }}
            id={`file-input-${accessor}`}
            onChange={(e) => handleFileChangeLocal(e.target.files[0])}
          />
        )}
        {accessor === "thumbnail" && (
          <input
            type="file"
            accept={"image/*"}
            style={{ display: "none" }}
            id={`file-input-${accessor}`}
            onChange={(e) => handleFileChangeLocal(e.target.files[0])}
          />
        )}
        {accessor === "yaml" && (
          <input
            type="file"
            accept={"*.yaml"}
            style={{ display: "none" }}
            id={`file-input-${accessor}`}
            onChange={(e) => handleFileChangeLocal(e.target.files[0])}
          />
        )}

        <label
          htmlFor={`file-input-${accessor}`}
          style={{
            cursor: "pointer",
            display: "inline-block",
            padding: "10px 15px",
            backgroundColor: "#007bff",
            color: "#fff",
            borderRadius: "5px",
            textAlign: "center",
            textDecoration: "none",
            transition: "background-color 0.3s",
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.backgroundColor = "#0056b3"; // 按下時的顏色
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.backgroundColor = "#007bff"; // 恢復顏色
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#007bff"; // 滑出時恢復顏色
          }}
        >
          選擇檔案
        </label>
        <br />
        {accessor === "pgm" && pgmFileInput && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "150px",
            }}
          >
            {pgmFileInput.name}
          </span>
        )}
        {accessor === "thumbnail" && thumbnailFileInput && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "150px",
            }}
          >
            {thumbnailFileInput.name}
          </span>
        )}
        {accessor === "thumbnail" && thumbnailFileInput && (
          <img
            src={URL.createObjectURL(thumbnailFileInput)}
            alt={accessor}
            style={{ width: "100px", height: "auto" }}
          />
        )}
        {accessor === "yaml" && yamlFileInput && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "150px",
            }}
          >
            {yamlFileInput.name}
          </span>
        )}
      </>
    );
  };

  const handleUpdate = async (id) => {
    console.log("handleUpdate!");
    if (editEntry) {
      console.log("AA");
      console.log("editEntry", editEntry);
      if (pgmFileInput) {
        await uploadFile(selectedTable, id, "pgm", pgmFileInput);
        ["pgm", "yaml", "thumbnail"].forEach((item) => delete editEntry[item]);
        onUpdate(selectedTable, id, editEntry);
      }
      if (thumbnailFileInput) {
        await uploadFile(selectedTable, id, "thumbnail", thumbnailFileInput);
        ["pgm", "yaml", "thumbnail"].forEach((item) => delete editEntry[item]);
        onUpdate(selectedTable, id, editEntry);
      }
      if (yamlFileInput) {
        await uploadFile(selectedTable, id, "yaml", yamlFileInput);
        ["pgm", "yaml", "thumbnail"].forEach((item) => delete editEntry[item]);
        onUpdate(selectedTable, id, editEntry);
      }
      console.log("DBT---1");
      setEditEntry(null);
      console.log("DBT---2");
      setPgmFileInput(null);
      setThumbnailFileInput(null);
      setYamlFileInput(null);
      console.log("DBT---3");
    }
  };

  const handleCancel = () => {
    setEditEntry(null);
    setPgmFileInput(null);
    setThumbnailFileInput(null);
    setYamlFileInput(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      onDelete(selectedTable, id);
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      console.log({ data });
      console.log("columns", columns);
    }
  }, [data]);

  return (
    <div>
      <h2>{columns.length > 0 ? columns[0].Header : "Table"}</h2>
      <div className="db-table">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.column}>{col.column}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!dataLoading &&
              data.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td key={`${row.id}-${col.column}`}>
                      {editEntry && editEntry.id === row.id ? (
                        ["TEXT", "INTEGER", "REAL"].includes(col.type) &&
                        !columnExcludes.includes(col.column) ? (
                          <input
                            type="text"
                            style={{ width: "78%" }}
                            value={editEntry[col.column] || ""}
                            onChange={(e) => handleEditChange(e, col.column)}
                          />
                        ) : col.type === "BLOB" ? (
                          <FileInput accessor={col.column} />
                        ) : (
                          row[col.column]
                        )
                      ) : col.type === "BLOB" ? (
                        row[col.column]
                      ) : (
                        row[col.column]
                      )}
                    </td>
                  ))}
                  <td>
                    {editEntry && editEntry.id === row.id ? (
                      <>
                        <button onClick={() => handleUpdate(row.id)}>
                          Save
                        </button>
                        <button onClick={handleCancel}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setEditEntry({ ...row })}>
                        Edit
                      </button>
                    )}
                    <button onClick={() => handleDelete(row.id)}>Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DbTable;
