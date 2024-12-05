import React, { useEffect, useState } from "react";
import ROSLIB from "roslib";
import ImuData from "./ImuData";
import Card from "react-bootstrap/Card";

const RobotInfo = ({ ros, robot_namespace }) => {
  // const [myData, setMyData] = useState(null);
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
      const { type, name, x, y, z, w } = message;
      setTargetStation(() => {
        return message;
      });
    });
    const currentStationClient = new ROSLIB.Service({
      ros: ros,
      name: `${robot_namespace}/list_current_stations`,
      serviceType: "fitrobot_interfaces/srv/ListCurrentStation",
    });
    currentStationClient.callService(
      new ROSLIB.ServiceRequest(),
      function (result) {
        console.log("SERVICE! listcurrentstation");
        if (result && Array.isArray(result.station_list)) {
          console.log("GGG");
          console.log(result.station_key);
          const station_key = result.station_key;
          const map_key = result.map_key;
          setCurrentStation(() => {
            return { station_key, map_key, stations: result.station_list };
          });
          // Station[] station_list
          // string type
          // string name
          // float64 x
          // float64 y
          // float64 z
          // float64 w
          // string map_key
          // string station_key
          // setRobotInfo(result.robot_info_list);
          // setRobotNamespaces(
          //   result.robot_info_list.map((robot) => robot.robot_namespace),
          // );
        } else {
          console.log("JJ2");
          setCurrentStation(() => {
            return {
              station_key: "",
              map_key: "",
              stations: [],
            };
          });
        }
      },
    );
  }, [ros]);
  // }, []);

  return (
    <>
      <Card className="mb-4 fixed-card">
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
            ? `TargetStation: ${targetStation.name} | (${targetStation.x},{" "}
                ${targetStation.y}, ${targetStation.z}, ${targetStation.w})`
            : `TargetStation: `}
        </Card.Body>
      </Card>
      <ImuData ros={ros} robot_namespace={robot_namespace} />
      {
        <Card className="mb-4 fixed-card">
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
      }
    </>
  );
};

export default RobotInfo;
