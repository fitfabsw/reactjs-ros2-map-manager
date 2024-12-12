import React, { useState, useEffect } from "react";
import "./DbTable.css";

const DbTable = ({
  data,
  onUpdate,
  onDelete,
  columns,
  selectedTable,
  columnExcludes,
}) => {
  const [editEntry, setEditEntry] = useState(null);
  const [fileInputs, setFileInputs] = useState({});

  const handleEditChange = (e, accessor) => {
    const { value } = e.target;
    setEditEntry((prev) => ({ ...prev, [accessor]: value }));
  };

  const handleFileChange = (e, accessor) => {
    const file = e.target.files[0];
    if (file) {
      setFileInputs((prev) => ({ ...prev, [accessor]: file }));
    }
  };

  const handleUpdate = async (id) => {
    console.log("handleUpdate!");
    if (editEntry) {
      console.log("AA");
      for (const [key, file] of Object.entries(fileInputs)) {
        if (file) {
          console.log("BB");
          console.log(file);
          const formData = new FormData();
          formData.append("file", file);
          formData.append("column", key);
          formData.append("id", id);
          console.log("DD");

          await fetch(`/api/${selectedTable}/${id}/upload`, {
            method: "POST",
            body: formData,
          });
          console.log("EE");
        }
      }
      console.log("111");
      onUpdate(selectedTable, id, editEntry);
      console.log("222");
      setEditEntry(null);
      console.log("333");
      setFileInputs({});
      console.log("444");
    }
  };

  const handleCancel = () => {
    setEditEntry(null);
    setFileInputs({});
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      onDelete(selectedTable, id);
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      console.log({ data });
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
            {data.map((row) => (
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
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, col.column)}
                        />
                      ) : (
                        row[col.column]
                      )
                    ) : (
                      row[col.column]
                    )}
                  </td>
                ))}
                <td>
                  {editEntry && editEntry.id === row.id ? (
                    <>
                      <button onClick={() => handleUpdate(row.id)}>Save</button>
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
