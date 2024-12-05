// Reference:
// https://github.com/tasada038/ros2_robot_react_app
// https://wiki.ros.org/roslibjs/Tutorials/BasicRosFunctionality
// https://github.com/RobotWebTools/rosbridge_suite/issues/790

import "./Roslib.css";
import ROSLIB from "roslib";
import React, { useState, useEffect } from "react";

import Rosconnection from "./roslibjs/RosConnection";
import CmdData from "./roslibjs/CmdData";
import RobotInfo from "./roslibjs/RobotInfo";
import MapData from "./roslibjs/MapData";

// import CameraData from "./components/CameraData";
// import MapandOdom from "./components/MapandOdom";

import {
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";

function Roslibjs() {
  const [ros, setRos] = useState(null);
  const [topicInfo, setTopicInfo] = useState([]);
  const [robotInfo, setRobotInfo] = useState([]);
  const [robotNamespaces, setRobotNamespaces] = useState([]);
  useEffect(() => {
    if (!ros) {
      return;
    }
    console.log("111111111111");
    const listRobotsClient = new ROSLIB.Service({
      ros: ros,
      name: "/listrobot",
      serviceType: "fitrobot_interfaces/srv/ListRobot",
    });
    listRobotsClient.callService(
      new ROSLIB.ServiceRequest(),
      function (result) {
        console.log("SERVICE! listrobot");
        if (result && Array.isArray(result.robot_info_list)) {
          console.log("JJ1");
          console.log(result.robot_info_list);
          setRobotInfo(result.robot_info_list);
          setRobotNamespaces(
            result.robot_info_list.map((robot) => robot.robot_namespace),
          );
        } else {
          console.log("JJ2");
          setRobotInfo([]);
        }
      },
    );

    console.log("444444444444");
    const topicsClient = new ROSLIB.Service({
      ros: ros,
      name: "/rosapi/topics",
      serviceType: "rosapi/Topics",
    });
    topicsClient.callService(new ROSLIB.ServiceRequest({}), function (result) {
      console.log("ASSSSS");
      if (result && Array.isArray(result.topics)) {
        console.log(result.topics);
        setTopicInfo(result.topics);
      } else {
        setTopicInfo([]);
      }
    });
    // }, [robotInfo, topicInfo]);
    // }, [robotInfo]);
    // }, []);
  }, [ros]);
  return (
    <>
      <Rosconnection
        // rosUrl="ws://172.20.10.2:9090"
        rosUrl="ws://192.168.0.184:9090"
        rosDomainId="89"
        setRos={setRos}
      />
      <h4>
        Connection: <span id="status">N/A</span>
      </h4>
      <MapData topics={topicInfo} />
      {robotNamespaces && (
        <Grid container spacing={2}>
          {robotNamespaces.map((robotNamespace, index) => (
            <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
              <Card className="mb-4 fixed-card-group">
                <CardContent>
                  <h4 style={{ fontSize: "1.5em", color: "blue" }}>
                    <b>{robotNamespace}</b>
                  </h4>
                  <br />
                  <RobotInfo ros={ros} robot_namespace={robotNamespace} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {ros && (
        <>
          <Grid container>
            <Grid item xs={12}>
              <div className="d-flex justify-content-center align-items-center">
                {topicInfo && (
                  <Accordion className="mb-4 fixed-card-group">
                    <AccordionSummary>
                      <h4>All Topics</h4>
                    </AccordionSummary>
                    <AccordionDetails>
                      {topicInfo.map((topic, index) => (
                        <Typography key={index}>{topic}</Typography>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                )}
              </div>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}

export default Roslibjs;
