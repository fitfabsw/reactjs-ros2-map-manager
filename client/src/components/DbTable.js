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
  setDataLoading,
}) => {
  const [editEntry, setEditEntry] = useState(null);
  const [fileInput, setFileInput] = useState(null);
  // const [dataLoaded, setDataLoaded] = useState(false);

  const handleEditChange = (e, accessor) => {
    const { value } = e.target;
    setEditEntry((prev) => ({ ...prev, [accessor]: value }));
  };

  const handleFileChange = (e, accessor) => {
    console.log("handleFileChange!");
    const file = e.target.files[0];
    if (file) {
      console.log("file", file);
      setFileInput(file);
    }
  };

  const handleUpdate = async (id) => {
    console.log("handleUpdate!");
    if (editEntry) {
      console.log("AA");
      console.log("editEntry", editEntry);
      if (fileInput) {
        console.log("BB");
        console.log("key", "pgm");
        console.log("file", fileInput);
        await uploadFile(selectedTable, id, "pgm", fileInput);
        ["pgm", "yaml", "thumbnail"].forEach((item) => delete editEntry[item]);
        onUpdate(selectedTable, id, editEntry);
      } else {
        console.log("11111");
        ["pgm", "yaml", "thumbnail"].forEach((item) => delete editEntry[item]);
        onUpdate(selectedTable, id, editEntry);
        console.log("22222");
      }
      console.log("DBT---1");
      setEditEntry(null);
      console.log("DBT---2");
      setFileInput(null);
      console.log("DBT---3");
    }
  };

  const handleCancel = () => {
    setEditEntry(null);
    setFileInput(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      onDelete(selectedTable, id);
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      console.log({ data });
      // setDataLoaded(false);
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
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, col.column)}
                            />
                            {fileInput && (
                              <img
                                src={URL.createObjectURL(fileInput)}
                                alt={col.column}
                                style={{ width: "100px", height: "auto" }}
                              />
                            )}
                          </>
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
