import React, { useEffect, useState } from "react";
import ROSLIB from "roslib";
import ImuData from "./ImuData";
import Card from "react-bootstrap/Card";

const RobotInfo = ({ ros, robot_namespace }) => {
  // const [myData, setMyData] = useState(null);
  const [robotStatus, setRobotStatus] = useState(null);
  const [targetStation, setTargetStation] = useState(null);

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
  }, []);

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
    </>
  );
};

export default RobotInfo;
