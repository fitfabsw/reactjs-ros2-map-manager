import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import React, { useEffect, useState } from "react";
import "./MapData.css";
import { Typography } from "@mui/material";

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
      <CardContent>
        <Typography variant="h6">Map Data</Typography>
        {mapMeta.length > 0 ? (
          mapMeta.map((map, index) => (
            <Typography
              key={index}
              className={map.enabled ? "active" : "inactive"}
            >
              {map.mapkey} | {map.enabled ? "Active" : "Inactive"}
            </Typography>
          ))
        ) : (
          <Typography>No map data available</Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default MapData;
