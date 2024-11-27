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

  useEffect(() => {
    console.log(`activeTab: ${activeTab}`);
  }, [activeTab]);

  const loadData = async (table) => {
    const fetchedData = await fetchTable(table);
    const schema = await fetchTableSchema(table);
    switch (table) {
      case "robot":
        setDataRobot(fetchedData);
        setColumnsRobot(schema);
        break;
      case "map":
        setDataMap(fetchedData);
        setColumnsMap(schema);
        break;
      case "station":
        setDataStation(fetchedData);
        setColumnsStation(schema);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    loadData("robot");
    loadData("map");
    loadData("station");
  }, []);

  useEffect(() => {
    if (columnsStation.length > 0) {
      console.log(`columnsStation: ${JSON.stringify(columnsStation)}`);
    }
  }, [columnsStation]);

  const handleUpdate = async (table, id, updatedData) => {
    if (table === "robot") {
      await updateRobot(id, updatedData);
      const fetchedData = await fetchTable("robot");
      setDataRobot(fetchedData);
    } else if (table === "map") {
      await updateMap(id, updatedData);
      const fetchedData = await fetchTable("map");
      setDataMap(fetchedData);
    } else if (table === "station") {
      await updateStation(id, updatedData);
      const fetchedData = await fetchTable("station");
      setDataStation(fetchedData);
    }
    setActiveTab(table);
  };

  const handleDelete = async (table, id) => {
    if (table === "robot") {
      await deleteRobot(id);
      const fetchedData = await fetchTable("robot");
      setDataRobot(fetchedData);
    } else if (table === "map") {
      await deleteMap(id);
      const fetchedData = await fetchTable("map");
      setDataMap(fetchedData);
    } else if (table === "station") {
      await deleteStation(id);
      const fetchedData = await fetchTable("station");
      setDataStation(fetchedData);
    }
    setActiveTab(table);
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
            columnExcludes={["id"]}
            selectedTable={"robot"}
          />
        )}
      {activeTab === "map" && dataMap.length > 0 && columnsMap.length > 0 && (
        <DbTable
          data={dataMap}
          columns={columnsMap}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          columnExcludes={["id"]}
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
            columnExcludes={["id"]}
            selectedTable={"station"}
          />
        )}
    </div>
  );
};

export default Db;
