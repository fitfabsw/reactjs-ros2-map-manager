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
import "./DbTable.css";

const Db = () => {
  const [dataRobot, setDataRobot] = useState([]);
  const [columnsRobot, setColumnsRobot] = useState([]);
  const [dataMap, setDataMap] = useState([]);
  const [columnsMap, setColumnsMap] = useState([]);
  const [dataStation, setDataStation] = useState([]);
  const [columnsStation, setColumnsStation] = useState([]);
  const [activeTab, setActiveTab] = useState("robot");

  const loadDataStation = async () => {
    const fetchedData = await fetchTable("station");
    setDataStation(fetchedData);
    const schema = await fetchTableSchema("station");
    setColumnsStation(schema);
  };

  const loadDataRobot = async () => {
    const fetchedData = await fetchTable("robot");
    setDataRobot(fetchedData);
    const schema = await fetchTableSchema("robot");
    setColumnsRobot(schema);
  };

  const loadDataMap = async () => {
    const fetchedData = await fetchTable("map");
    setDataMap(fetchedData);
    const schema = await fetchTableSchema("map");
    setColumnsMap(schema);
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
    if (table === "robot") setDataRobot(fetchedData);
    else if (table === "map") setDataMap(fetchedData);
    else if (table === "station") setDataStation(fetchedData);
  };

  return (
    <div>
      <h1>Database Management</h1>
      <div className="tab-container">
        <button
          className={`tab-button ${activeTab === "robot" ? "active" : ""}`}
          onClick={() => setActiveTab("robot")}
        >
          Robot
        </button>
        <button
          className={`tab-button ${activeTab === "map" ? "active" : ""}`}
          onClick={() => setActiveTab("map")}
        >
          Map
        </button>
        <button
          className={`tab-button ${activeTab === "station" ? "active" : ""}`}
          onClick={() => setActiveTab("station")}
        >
          Station
        </button>
      </div>
      {activeTab === "robot" &&
        dataRobot.length > 0 &&
        columnsRobot.length > 0 && (
          <DbTable
            data={dataRobot}
            columns={columnsRobot}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            selectedTable={"robot"}
          />
        )}
      {activeTab === "map" && dataMap.length > 0 && columnsMap.length > 0 && (
        <DbTable
          data={dataMap}
          columns={columnsMap}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          selectedTable={"map"}
        />
      )}
      {activeTab === "station" &&
        dataStation.length > 0 &&
        columnsStation.length > 0 && (
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
