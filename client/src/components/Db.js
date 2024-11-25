import React, { useEffect, useState } from "react";
import {
  fetchMaps,
  createMap,
  updateMap,
  deleteMap,
  fetchRobotTypes,
} from "./database";
import DbTable from "./DbTable";

const Db = () => {
  const [maps, setMaps] = useState([]);
  const [robotTypes, setRobotTypes] = useState([]);
  const [newMap, setNewMap] = useState({ name: "", robottype_id: "", real: 0 });

  useEffect(() => {
    const loadData = async () => {
      setMaps(await fetchMaps());
      setRobotTypes(await fetchRobotTypes());
    };
    loadData();
  }, []);

  useEffect(() => {
    if (maps.length > 0) {
      debug();
    }
  }, [maps]);

  const handleCreateMap = async (mapData) => {
    const createdMap = await createMap(mapData);
    setMaps([...maps, createdMap]);
  };

  const handleUpdateMap = async (id, mapData) => {
    const updatedMap = await updateMap(id, mapData);
    setMaps(maps.map((map) => (map.id === id ? updatedMap : map)));
  };

  const handleDeleteMap = async (id) => {
    await deleteMap(id);
    setMaps(maps.filter((map) => map.id !== id));
  };

  const debug = async () => {
    console.log("maps", maps);
  };

  const columns = [
    { Header: "ID", accessor: "id" },
    { Header: "Name", accessor: "name" },
    { Header: "Robot Type", accessor: "robottype_id", isForeignKey: true },
    { Header: "Real", accessor: "real" },
  ];

  const foreignKeyOptions = {
    robottype_id: robotTypes,
  };

  return (
    <div>
      <h1>Database Management</h1>
      <DbTable
        data={maps}
        onCreate={handleCreateMap}
        onUpdate={handleUpdateMap}
        onDelete={handleDeleteMap}
        columns={columns}
        foreignKeyOptions={foreignKeyOptions}
      />
    </div>
  );
};

export default Db;
