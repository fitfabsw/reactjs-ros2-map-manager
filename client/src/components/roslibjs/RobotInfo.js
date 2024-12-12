import React, { useEffect, useState } from "react";
import { Card, Typography, CardContent, Box } from "@mui/material";
import ROSLIB from "roslib";
import ImuData from "./ImuData";
import ScanData from "./ScanData";

const RobotInfo = ({ ros, robot_namespace }) => {
  const [robotStatus, setRobotStatus] = useState(null);
  const [targetStation, setTargetStation] = useState(null);
  const [currentStation, setCurrentStation] = useState({
    station_key: "NA",
    map_key: "NA",
    stations: [],
  });
  const [lifecycleNodeStates, setLifecycleNodeStates] = useState({
    amcl: null,
    behavior_server: null,
    bt_navigator: null,
    controller_server: null,
    costmap_filter_info_server: null,
    "global_costmap/global_costmap": null,
    "local_costmap/local_costmap": null,
    planner_server: null,
    smoother_server: null,
    velocity_smoother: null,
    waypoint_follower: null,
  });

  const checkLifecycleNodesForStatus3 = () => {
    const expectedStates = {
      amcl: 3, // active
      behavior_server: 2, // inactive
      bt_navigator: 2, // inactive
      controller_server: 3, // active
      costmap_filter_info_server: 3, // active
      "global_costmap/global_costmap": 13, // activating, is this normal? TBD
      "local_costmap/local_costmap": 3, // active
      // not sure about the valid states of below four ndoes
      // planner_server: 3, // active
      // smoother_server: 3, // active
      // velocity_smoother: 3, // active
      // waypoint_follower: 3, // active
    };

    return Object.entries(expectedStates).every(
      ([nodeName, expectedStateId]) => {
        const currentNodeState = lifecycleNodeStates[nodeName];
        return currentNodeState && currentNodeState.id === expectedStateId;
      },
    );
  };

  const areAllLifecycleNodesActive = () => {
    return Object.values(lifecycleNodeStates).every(
      (state) => state && state.id === 3,
    );
  };

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

    const getLifecycleNodeState = (nodeName) => {
      const lifecycleClient = new ROSLIB.Service({
        ros: ros,
        name: `${robot_namespace}/${nodeName}/get_state`,
        serviceType: "lifecycle_msgs/srv/GetState",
      });

      lifecycleClient.callService(
        new ROSLIB.ServiceRequest(),
        function (result) {
          setLifecycleNodeStates((prevStates) => ({
            ...prevStates,
            [nodeName]: {
              id: result.current_state.id,
              label: result.current_state.label,
            },
          }));
        },
      );
    };

    const lifecycleNodes = [
      "amcl",
      "behavior_server",
      "bt_navigator",
      "controller_server",
      "costmap_filter_info_server",
      "global_costmap/global_costmap",
      "local_costmap/local_costmap",
      "planner_server",
      "smoother_server",
      "velocity_smoother",
      "waypoint_follower",
    ];
    // PRIMARY_STATE_UNKNOWN = 0
    // PRIMARY_STATE_UNCONFIGURED = 1
    // PRIMARY_STATE_INACTIVE = 2
    // PRIMARY_STATE_ACTIVE = 3
    // PRIMARY_STATE_FINALIZED = 4
    // TRANSITION_STATE_CONFIGURING = 10
    // TRANSITION_STATE_CLEANINGUP = 11
    // TRANSITION_STATE_SHUTTINGDOWN = 12
    // TRANSITION_STATE_ACTIVATING = 13
    // TRANSITION_STATE_DEACTIVATING = 14
    // TRANSITION_STATE_ERRORPROCESSING = 15

    lifecycleNodes.forEach(getLifecycleNodeState);
  }, [ros]);

  return (
    <Box display="flex" flexDirection="column" spacing={2}>
      <ImuData ros={ros} robot_namespace={robot_namespace} />
      <ScanData ros={ros} robot_namespace={robot_namespace} />
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
      <Card
        variant="outlined"
        sx={{
          backgroundColor:
            (robotStatus &&
              robotStatus.status === 3 &&
              !checkLifecycleNodesForStatus3()) ||
            (robotStatus &&
              robotStatus.status >= 10 &&
              !areAllLifecycleNodesActive())
              ? "lightcoral"
              : "white",
        }}
      >
        <CardContent>
          <Typography variant="h6">Lifecycle Nodes</Typography>
          {Object.entries(lifecycleNodeStates).map(([nodeName, state]) => (
            <Typography key={nodeName}>
              {`${nodeName}: ${state ? state.label : "Loading..."} (ID: ${state ? state.id : "N/A"})`}
            </Typography>
          ))}
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
      <Card
        sx={{
          backgroundColor:
            currentStation.station_key === "" ||
            currentStation.station_key === "NA"
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
    </Box>
  );
};

export default RobotInfo;
