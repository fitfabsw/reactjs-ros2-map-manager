import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";
import ROSLIB from "roslib";

const ScanData = ({ ros, robot_namespace }) => {
  // const [scanData, setScanData] = useState(null);
  const [scanDataDict, setScanDataDict] = useState({});
  const [isActive, setIsActive] = useState(false); // 開關狀態
  const [scanTopics, setScanTopics] = useState([]);
  const [clients, setClients] = useState([]);
  useEffect(() => {
    console.log("gGGGG");
    if (robot_namespace.includes("/lino2")) {
      console.log(`AA robot_namespace: ${robot_namespace}`);
      setScanTopics(["scan1", "scan2"]);
    } else {
      console.log(`BB robot_namespace: ${robot_namespace}`);
      setScanTopics(["scan"]);
    }
  }, []);

  useEffect(() => {
    // if (!ros || !isActive) {
    if (!ros || !scanTopics) {
      return;
    }

    console.log("ADF");
    console.log(`scanTopics: ${scanTopics}`);
    scanTopics.map((each) => {
      console.log(`each: ${each}`);
      const scanTopic = new ROSLIB.Topic({
        ros: ros,
        name: `${robot_namespace}/${each}`,
        messageType: "sensor_msgs/LaserScan",
      });
      scanTopic.subscribe((message) => {
        // setScanData(message);
        // setScanDataArray((prev) => [...prev, message]);
        setScanDataDict((prev) => ({ ...prev, [each]: message }));
      });
      setClients((prev) => [...prev, scanTopic]);
    });

    return () => {
      clients.map((each) => {
        each.unsubscribe();
      });
    };
  }, [ros, robot_namespace, isActive, scanTopics]);

  return (
    <div>
      {Object.keys(scanDataDict).length > 0 ? (
        <div>
          {Object.entries(scanDataDict).map(([key, scanData]) => (
            <Card
              sx={{
                backgroundColor: !scanData ? "lightcoral" : "white",
                variant: "outlined",
              }}
            >
              <CardContent>
                <Typography variant="h6">Scan Data ({key})</Typography>
                {scanData && (
                  <Button onClick={() => setIsActive(!isActive)}>
                    {isActive ? "Stop Updating" : "Start Updating"}
                  </Button>
                )}
                {scanData ? (
                  isActive ? (
                    <div>
                      <Typography>
                        Ranges: {scanData.ranges.slice(0, 10).join(", ")}
                        {scanData.ranges.length > 10 ? "..." : ""}
                      </Typography>
                      <Typography>Angle Min: {scanData.angle_min}</Typography>
                      <Typography>Angle Max: {scanData.angle_max}</Typography>
                    </div>
                  ) : (
                    <></>
                  )
                ) : (
                  <Typography>Loading scan data...</Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Typography>No scan data available.</Typography>
      )}
    </div>
  );
};

export default ScanData;
