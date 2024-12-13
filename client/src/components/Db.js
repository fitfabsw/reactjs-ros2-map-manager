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
  updateStationList,
  deleteStationList,
} from "./database";
import DbTable from "./DbTable";
import "./DbTable.css";

const Db = () => {
  const [dataRobot, setDataRobot] = useState([]);
  const [columnsRobot, setColumnsRobot] = useState([]);
  const [dataMap, setDataMap] = useState([]);
  const [columnsMap, setColumnsMap] = useState([]);
  const [dataStation, setDataStation] = useState([]);
  const [dataStationlist, setDataStationlist] = useState([]);
  const [columnsStationlist, setColumnsStationlist] = useState([]);
  const [columnsStation, setColumnsStation] = useState([]);
  const [activeTab, setActiveTab] = useState("robot");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    console.log(`activeTab: ${activeTab}`);
    // if (activeTab === "map") {
    // loadData("map");
    loadData(activeTab);
    // }
  }, [activeTab]);

  const loadData = async (table) => {
    setDataLoading(true);
    console.log("loadData!!");
    const fetchedData = await fetchTable(table);
    const schema = await fetchTableSchema(table);

    switch (table) {
      case "map":
        // 將 BLOB 轉換為狀態��述
        const dataWithBlobStatus = fetchedData.map((item) => ({
          ...item,
          pgm: item.pgm ? "BLOB" : "",
          yaml: item.yaml ? "BLOB" : "",
          thumbnail: item.thumbnail ? "BLOB" : "",
        }));
        console.log("dataWithBlobStatus", dataWithBlobStatus);
        setDataMap(dataWithBlobStatus);
        setColumnsMap(schema);
        break;
      case "robot":
        setDataRobot(fetchedData);
        setColumnsRobot(schema);
        break;
      case "station":
        setDataStation(fetchedData);
        setColumnsStation(schema);
        break;
      case "stationList":
        setDataStationlist(fetchedData);
        setColumnsStationlist(schema);
        break;
      default:
        break;
    }
    setDataLoading(false);
  };

  // useEffect(() => {
  //   loadData("robot");
  //   loadData("map");
  //   loadData("station");
  //   loadData("stationList");
  // }, []);

  const handleUpdate = async (table, id, updatedData) => {
    console.log("updatedData", updatedData);
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
    } else if (table === "stationList") {
      await updateStationList(id, updatedData);
      const fetchedData = await fetchTable("stationList");
      setDataStationlist(fetchedData);
    }
    setActiveTab(table);

    if (table === "map") {
      console.log("GHJ");
      await loadData("map");
    }
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
    } else if (table === "stationList") {
      await deleteStationList(id);
      const fetchedData = await fetchTable("stationList");
      setDataStationlist(fetchedData);
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
        <button
          className={`tab-button ${activeTab === "stationList" ? "active" : ""}`}
          onClick={() => setActiveTab("stationList")}
        >
          StationList
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
            dataLoading={dataLoading}
            setDataLoading={setDataLoading}
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
          dataLoading={dataLoading}
          setDataLoading={setDataLoading}
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
            dataLoading={dataLoading}
            setDataLoading={setDataLoading}
          />
        )}
      {activeTab === "stationList" &&
        dataStationlist.length > 0 &&
        columnsStationlist.length > 0 && (
          <DbTable
            data={dataStationlist}
            columns={columnsStationlist}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            columnExcludes={["id"]}
            selectedTable={"stationList"}
            dataLoading={dataLoading}
            setDataLoading={setDataLoading}
          />
        )}
    </div>
  );
};

export default Db;
