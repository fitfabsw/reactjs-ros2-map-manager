import React, { useState } from "react";
import "./DbTable.css";

const DbTable = ({
  data,
  onCreate,
  onUpdate,
  onDelete,
  columns,
  foreignKeyOptions,
}) => {
  const [newEntry, setNewEntry] = useState({});
  const [editEntry, setEditEntry] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEntry({ ...newEntry, [name]: value });
  };

  const handleCreate = () => {
    onCreate(newEntry);
    setNewEntry({});
  };

  const handleEditChange = (e, accessor) => {
    const { value } = e.target;
    setEditEntry((prev) => ({ ...prev, [accessor]: value === "True" }));
  };

  const handleUpdate = (id) => {
    onUpdate(id, editEntry);
    setEditEntry(null);
    window.location.reload();
  };

  const handleCancel = () => {
    setEditEntry(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      onDelete(id);
    }
  };

  return (
    <div>
      <h2>Map</h2>
      <div className="db-table">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.accessor}>{col.Header}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                {columns.map((col) => (
                  <td key={col.accessor}>
                    {col.accessor === "id" ? (
                      row[col.accessor]
                    ) : col.accessor === "robottype_id" ? (
                      editEntry && editEntry.id === row.id ? (
                        <select
                          value={editEntry[col.accessor] || ""}
                          onChange={(e) => handleEditChange(e, col.accessor)}
                        >
                          {foreignKeyOptions.robottype_id.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      ) : row.Robottype ? (
                        row.Robottype.name
                      ) : (
                        "N/A"
                      )
                    ) : col.accessor === "real" ? (
                      editEntry && editEntry.id === row.id ? (
                        <select
                          value={editEntry[col.accessor] ? "True" : "False"}
                          onChange={(e) => handleEditChange(e, col.accessor)}
                        >
                          <option value="True">True</option>
                          <option value="False">False</option>
                        </select>
                      ) : row[col.accessor] ? (
                        "True"
                      ) : (
                        "False"
                      )
                    ) : editEntry && editEntry.id === row.id ? (
                      <input
                        type="text"
                        value={editEntry[col.accessor] || ""}
                        onChange={(e) => handleEditChange(e, col.accessor)}
                      />
                    ) : (
                      row[col.accessor]
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
