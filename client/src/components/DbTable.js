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

  const handleEditChange = (e, accessor) => {
    const { value } = e.target;
    setEditEntry((prev) => ({ ...prev, [accessor]: value }));
  };

  const handleUpdate = (id) => {
    onUpdate(selectedTable, id, editEntry);
    setEditEntry(null);
  };

  const handleCancel = () => {
    setEditEntry(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      onDelete(selectedTable, id);
    }
  };

  // useEffect(() => {
  //   console.log(`columnExcludes: ${JSON.stringify(columnExcludes)}`);
  //   if (columnExcludes) {
  //     console.log(`columnExcludes: ${JSON.stringify(columnExcludes)}`);
  //   }
  // }, [columnExcludes]);

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
