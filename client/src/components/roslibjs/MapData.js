import Card from "react-bootstrap/Card";
import React, { useEffect, useState } from "react";
import ROSLIB from "roslib";

function MapData({ topics }) {
  const [ros, setRos] = useState(null);
  const [filterTopics, setFilterTopics] = useState([]);
  const [mapMeta, setMapMeta] = useState([]);

  useEffect(() => {
    const filteredall = topics.filter((topic) => topic.includes("map_server"));
    console.log(`filteredall: ${filteredall}`);

    const mapkeyData = filteredall.map((filtered) => {
      const parts = filtered.split("/");
      const mapkey = `/${parts[1]}/${parts[2]}`;
      const mapEnabled = hasTopic(`${mapkey}/map`);
      const newData = {
        mapkey: mapkey,
        enabled: mapEnabled,
      };
      return newData;
    });
    console.log(`mapkeyData: ${mapkeyData}`);
    console.log(JSON.stringify(mapkeyData));
    setMapMeta(mapkeyData);
  }, [topics]);

  const hasTopic = (topic) => {
    return topics.includes(topic);
  };

  return (
    <>
      {mapMeta &&
        mapMeta.map((map, index) => (
          <Card.Text key={index}>
            {map.mapkey} | {map.enabled ? "enabled" : "disabled"}
          </Card.Text>
        ))}
    </>
  );
}

export default MapData;
