import Card from "react-bootstrap/Card";
import React, { useEffect, useState } from "react";
import "./MapData.css";

function MapData({ topics }) {
  const [mapMeta, setMapMeta] = useState([]);

  useEffect(() => {
    const filteredTopics = topics.filter((topic) =>
      topic.includes("map_server"),
    );
    const mapData = filteredTopics.map((filtered) => {
      const parts = filtered.split("/");
      const mapkey = `/${parts[1]}/${parts[2]}`;
      const mapEnabled = hasTopic(`${mapkey}/map`);
      return { mapkey, enabled: mapEnabled };
    });
    setMapMeta(mapData);
  }, [topics]);

  const hasTopic = (topic) => {
    return topics.includes(topic);
  };

  return (
    <Card className="map-data-card">
      <Card.Body>
        <Card.Title>Map Data</Card.Title>
        {mapMeta.length > 0 ? (
          mapMeta.map((map, index) => (
            <Card.Text key={index}>
              {map.mapkey} | {map.enabled ? "Active" : "Inactive"}
            </Card.Text>
          ))
        ) : (
          <Card.Text>No map data available</Card.Text>
        )}
      </Card.Body>
    </Card>
  );
}

export default MapData;
