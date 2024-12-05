import React, { useEffect, useState } from "react";
import ROSLIB from "roslib";
import Card from "react-bootstrap/Card";

const GeneralData = ({ ros }) => {
  // const [myData, setMyData] = useState(null);
  const [robotStatus, setRobotStatus] = useState(null);
  const [targetStation, setTargetStation] = useState(null);

  useEffect(() => {
    if (!ros) {
      return;
    }

    let robotstatusTopic = new ROSLIB.Topic({
      ros: ros,
      name: "/lino2_1234/robot_status",
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
      name: "/lino2_1234/target_station",
      messageType: "fitrobot_interfaces/msg/Station",
    });
    // string type
    // string name
    // float64 x
    // float64 y
    // float64 z
    // float64 w
    targetStationTopic.subscribe((message) => {
      const { type, name, x, y, z, w } = message;
      setTargetStation(() => {
        return message;
      });
    });
  }, []);

  return (
    <>
      <Card className="mb-4" style={{ width: "48rem" }}>
        <Card.Body>
          <Card.Title>RobotStatus Data</Card.Title>
          <Card.Text>
            {robotStatus && <p>RobotStatus: {robotStatus.status}</p>}
            {targetStation && (
              <p>
                TargetStation: {targetStation.name} | ({targetStation.x},{" "}
                {targetStation.y}, {targetStation.z}, {targetStation.w})
              </p>
            )}
          </Card.Text>
        </Card.Body>
      </Card>
    </>
  );
};

export default GeneralData;
