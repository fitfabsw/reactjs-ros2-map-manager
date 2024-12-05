import React, { useEffect, useState } from "react";
import ROSLIB from "roslib";
import ImuData from "./ImuData";
import Card from "react-bootstrap/Card";

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

  const robotStatusCardStyle =
    robotStatus && robotStatus.status < 10
      ? { backgroundColor: "#f8d7da", borderColor: "#f5c6cb" }
      : {};

  const currentStationCardStyle =
    currentStation.station_key === ""
      ? { backgroundColor: "#f8d7da", borderColor: "#f5c6cb" }
      : {};

  return (
    <>
      <Card className="mb-4 fixed-card" style={robotStatusCardStyle}>
        <Card.Body>
          <Card.Title>RobotStatus</Card.Title>
          <Card.Text>
            {robotStatus && (
              <>
                {`RobotStatus: ${robotStatus.status}`}
                <br />
              </>
            )}
          </Card.Text>
        </Card.Body>
      </Card>
      <Card className="mb-4 fixed-card">
        <Card.Body>
          <Card.Title>Target Station</Card.Title>
          {targetStation
            ? `TargetStation: ${targetStation.name} | (${targetStation.x}, ${targetStation.y}, ${targetStation.z}, ${targetStation.w})`
            : `TargetStation: `}
        </Card.Body>
      </Card>
      <ImuData ros={ros} robot_namespace={robot_namespace} />
      <Card className="mb-4 fixed-card" style={currentStationCardStyle}>
        <Card.Body>
          <Card.Title>Current Stations</Card.Title>
          <Card.Text>
            {`station_key: ${currentStation.station_key}`}
            <br />
            {`map_key: ${currentStation.map_key}`}
            <br />
          </Card.Text>
        </Card.Body>
      </Card>
    </>
  );
};

export default RobotInfo;
