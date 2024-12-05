import React, { useEffect, useState } from "react";
import { Card, Typography, CardContent } from "@mui/material";
import ROSLIB from "roslib";
import ImuData from "./ImuData";

const RobotInfo = ({ ros, robot_namespace }) => {
  const [robotStatus, setRobotStatus] = useState(null);
  const [targetStation, setTargetStation] = useState(null);
  const [currentStation, setCurrentStation] = useState({
    station_key: "NA",
    map_key: "NA",
    stations: [],
  });

  useEffect(() => {
    if (!ros) {
      return;
    }

    let robotstatusTopic = new ROSLIB.Topic({
      ros: ros,
      name: `${robot_namespace}/robot_status`,
      messageType: "fitrobot_interfaces/msg/RobotStatus",
    });
    robotstatusTopic.subscribe((message) => {
      const robotstatus = message.status;
      setRobotStatus(() => {
        return { status: robotstatus };
      });
    });

    let targetStationTopic = new ROSLIB.Topic({
      ros: ros,
      name: `${robot_namespace}/target_station`,
      messageType: "fitrobot_interfaces/msg/Station",
    });
    targetStationTopic.subscribe((message) => {
      setTargetStation(() => message);
    });

    const currentStationClient = new ROSLIB.Service({
      ros: ros,
      name: `${robot_namespace}/list_current_stations`,
      serviceType: "fitrobot_interfaces/srv/ListCurrentStation",
    });
    currentStationClient.callService(
      new ROSLIB.ServiceRequest(),
      function (result) {
        if (result && Array.isArray(result.station_list)) {
          const { station_key, map_key } = result;
          setCurrentStation(() => ({
            station_key,
            map_key,
            stations: result.station_list,
          }));
        } else {
          setCurrentStation(() => ({
            station_key: "NA",
            map_key: "NA",
            stations: [],
          }));
        }
      },
    );
  }, [ros]);

  return (
    <>
      {`currentStation.station_key: ${currentStation.station_key}`}
      <Card
        sx={{
          backgroundColor:
            robotStatus && robotStatus.status < 10 ? "lightcoral" : "white",
          variant: "outlined",
        }}
      >
        <CardContent>
          <Typography variant="h6">Robot Status</Typography>
          <Typography>
            {robotStatus ? `RobotStatus: ${robotStatus.status}` : "Loading..."}
          </Typography>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6">Target Station</Typography>
          <Typography>
            {targetStation
              ? `TargetStation: ${targetStation.name}`
              : "No target station"}
          </Typography>
        </CardContent>
      </Card>
      <ImuData ros={ros} robot_namespace={robot_namespace} />
      <Card
        sx={{
          backgroundColor:
            (currentStation.station_key === "") |
            (currentStation.station_key === "NA")
              ? "lightcoral"
              : "white",
        }}
      >
        <CardContent>
          <Typography variant="h6">Current Stations</Typography>
          <Typography>
            {`station_key: ${currentStation.station_key}`}
            <br />
            {`map_key: ${currentStation.map_key}`}
          </Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default RobotInfo;
