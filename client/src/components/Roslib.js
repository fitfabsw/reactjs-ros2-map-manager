// Reference:
// https://github.com/tasada038/ros2_robot_react_app
// https://wiki.ros.org/roslibjs/Tutorials/BasicRosFunctionality
// https://github.com/RobotWebTools/rosbridge_suite/issues/790

import "./Roslib.css";
import Card from "react-bootstrap/Card";
import ROSLIB from "roslib";
import React, { useState, useEffect } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import Rosconnection from "./roslibjs/RosConnection";
import CmdData from "./roslibjs/CmdData";
import GeneralData from "./roslibjs/GeneralData";
import ImuData from "./roslibjs/ImuData";
import Header from "./roslibjs/Header";
import Footer from "./roslibjs/Footer";
import { Row, Col } from "react-bootstrap";

// import CameraData from "./components/CameraData";
// import MapandOdom from "./components/MapandOdom";

function Roslibjs() {
  const [ros, setRos] = useState(null);
  const [topicInfo, setTopicInfo] = useState([]);
  useEffect(() => {
    if (!ros) {
      return;
    }
    const topicsClient = new ROSLIB.Service({
      ros: ros,
      name: "/rosapi/topics",
    });
    topicsClient.callService(new ROSLIB.ServiceRequest(), function (result) {
      if (result && Array.isArray(result.topics)) {
        console.log(result.topics);
        setTopicInfo(result.topics);
      } else {
        setTopicInfo([]);
      }
    });
  }, []);
  // }, [ros]);
  return (
    <>
      <Rosconnection
        rosUrl="ws://172.20.10.2:9090"
        // rosUrl="ws://192.168.0.184:9090"
        rosDomainId="89"
        setRos={setRos}
      />
      {ros && (
        <>
          <Row>
            <Col>
              <div className="d-flex justify-content-center align-items-center">
                {topicInfo && (
                  <Card className="mb-4" style={{ width: "48rem" }}>
                    <Card.Body>
                      <Card.Title>All Topics</Card.Title>
                      {topicInfo.map((topic, index) => (
                        <Card.Text key={index}>{topic}</Card.Text>
                      ))}
                    </Card.Body>
                  </Card>
                )}
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="d-flex justify-content-center align-items-center">
                <GeneralData ros={ros} />
              </div>
            </Col>
            <Col>
              <div className="d-flex justify-content-center align-items-center">
                <CmdData ros={ros} />
              </div>
            </Col>
            <Col>
              <div className="d-flex justify-content-center align-items-center">
                <ImuData ros={ros} />
              </div>
            </Col>
          </Row>
        </>
      )}

      <hr />
      <h3>
        Connection: <span id="status">N/A</span>
      </h3>
    </>
  );
}

export default Roslibjs;
