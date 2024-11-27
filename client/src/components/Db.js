import React, { useEffect, useState } from "react";
import {
  fetchTable,
  fetchTableSchema,
  updateRobot,
  deleteRobot,
  updateMap,
  deleteMap,
  updateStation,
  deleteStation,
} from "./database";
import DbTable from "./DbTable";

const Db = () => {
  // robot
  const [dataRobot, setDataRobot] = useState([]);
  const [columnsRobot, setColumnsRobot] = useState([]);
  const [dataMap, setDataMap] = useState([]);
  const [columnsMap, setColumnsMap] = useState([]);
  const [dataStation, setDataStation] = useState([]);
  const [columnsStation, setColumnsStation] = useState([]);

  const loadDataStation = async () => {
    const fetchedData = await fetchTable("station");
    setDataStation(fetchedData);
    const schema = await fetchTableSchema("station");
    setColumnsStation(schema);
    console.log("Fetched Data Station:", fetchedData);
    console.log("Schema Station:", schema);
  };

  const loadDataRobot = async () => {
    const fetchedData = await fetchTable("robot");
    setDataRobot(fetchedData);
    const schema = await fetchTableSchema("robot");
    setColumnsRobot(schema);
    console.log("Fetched Data Robot:", fetchedData);
    console.log("Schema Robot:", schema);
  };

  const loadDataMap = async () => {
    const fetchedData = await fetchTable("map");
    setDataMap(fetchedData);
    const schema = await fetchTableSchema("map");
    setColumnsMap(schema);
    console.log("Fetched Data Map:", fetchedData);
    console.log("Schema Map:", schema);
  };

  useEffect(() => {
    loadDataRobot();
    loadDataMap();
    loadDataStation();
  }, []);

  const handleUpdate = async (table, id, updatedData) => {
    if (table === "robot") {
      await updateRobot(id, updatedData);
    } else if (table === "map") {
      await updateMap(id, updatedData);
    } else if (table === "station") {
      await updateStation(id, updatedData);
    }
    console.log(`updateData: ${JSON.stringify(updatedData)}`);
  };

  const handleDelete = async (table, id) => {
    let fetchedData = null;
    if (table === "robot") {
      await deleteRobot(id);
      fetchedData = await fetchTable("robot");
    } else if (table === "map") {
      await deleteMap(id);
      fetchedData = await fetchTable("map");
    } else if (table === "station") {
      await deleteStation(id);
      fetchedData = await fetchTable("station");
    }
    setDataRobot(fetchedData);
  };

  return (
    <div>
      <h1>Database Management</h1>
      <h2>Robot</h2>
      {dataRobot.length > 0 && columnsRobot.length > 0 && (
        <DbTable
          data={dataRobot}
          columns={columnsRobot}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          selectedTable={"robot"}
        />
      )}
      <h2>Map</h2>
      {dataMap.length > 0 && columnsMap.length > 0 && (
        <DbTable
          data={dataMap}
          columns={columnsMap}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          selectedTable={"map"}
        />
      )}
      <h2>Station</h2>
      {dataStation.length > 0 && columnsStation.length > 0 && (
        <DbTable
          data={dataStation}
          columns={columnsStation}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          selectedTable={"station"}
        />
      )}
    </div>
  );
};

export default Db;
