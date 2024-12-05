// Reference:
// https://github.com/tasada038/ros2_robot_react_app
// https://wiki.ros.org/roslibjs/Tutorials/BasicRosFunctionality
// https://github.com/RobotWebTools/rosbridge_suite/issues/790

import "./Roslib.css";
import ROSLIB from "roslib";
import React, { useState, useEffect } from "react";

import Rosconnection from "./roslibjs/RosConnection";
// import CmdData from "./roslibjs/CmdData";
import RobotInfo from "./roslibjs/RobotInfo";
import MapData from "./roslibjs/MapData";

// import CameraData from "./components/CameraData";
// import MapandOdom from "./components/MapandOdom";

import {
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
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
        rosUrl="ws://192.168.0.184:9090"
        rosDomainId="89"
        setRos={setRos}
      />
      <h4>
        Connection: <span id="status">N/A</span>
      </h4>
      <MapData topics={topicInfo} />
      {robotNamespaces && (
        <Box display="flex" flexWrap="wrap" justifyContent="flex-start">
          {robotNamespaces.map((robotNamespace, index) => (
            <Box key={index} mb={2}>
              <Card className="fixed-card-group">
                <CardContent>
                  <Typography variant="h5" style={{ color: "blue" }}>
                    {robotNamespace}
                  </Typography>
                  <RobotInfo ros={ros} robot_namespace={robotNamespace} />
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}
      {ros && (
        <Box>
          <Box display="flex" justifyContent="center" alignItems="center">
            {topicInfo && (
              <Accordion className="mb-4 fixed-card-group">
                <AccordionSummary>
                  <Typography variant="h6">All Topics</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {topicInfo.map((topic, index) => (
                    <Typography key={index}>{topic}</Typography>
                  ))}
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        </Box>
      )}
    </>
  );
}

export default Roslibjs;
