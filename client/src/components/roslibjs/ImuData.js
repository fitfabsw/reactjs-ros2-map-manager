import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import ROSLIB from "roslib";

const ImuData = ({ ros, robot_namespace }) => {
  const [imuData, setImuData] = useState(null);

  useEffect(() => {
    if (!ros) {
      return;
    }

    const imuTopic = new ROSLIB.Topic({
      ros: ros,
      name: `${robot_namespace}/imu/data`,
      messageType: "sensor_msgs/Imu",
    });

    // Calculate Euler
    function getEulerAngles(q) {
      const qw = q.w;
      const qx = q.x;
      const qy = q.y;
      const qz = q.z;
      const sinr = 2.0 * (qw * qx + qy * qz);
      const cosr = 1.0 - 2.0 * (qx * qx + qy * qy);
      const roll = Math.atan2(sinr, cosr);

      const sinp = 2.0 * (qw * qy - qz * qx);
      let pitch;
      if (Math.abs(sinp) >= 1) {
        pitch = (Math.PI / 2.0) * Math.sign(sinp);
      } else {
        pitch = Math.asin(sinp);
      }

      const siny = 2.0 * (qw * qz + qx * qy);
      const cosy = 1.0 - 2.0 * (qy * qy + qz * qz);
      const yaw = Math.atan2(siny, cosy);

      return {
        roll: roll,
        pitch: pitch,
        yaw: yaw,
      };
    }

    imuTopic.subscribe((message) => {
      const eulerAngles = getEulerAngles(message.orientation);
      // console.log('Received message on ' + listener_imu.name + ': ', eulerAngles);

      const roll = (eulerAngles.roll * 180.0) / Math.PI;
      const pitch = (eulerAngles.pitch * 180.0) / Math.PI;
      const yaw = (eulerAngles.yaw * 180.0) / Math.PI;
      const sec = message.header.stamp.sec;

      setImuData((prevState) => {
        const newData = {
          roll: roll.toFixed(2),
          pitch: pitch.toFixed(2),
          yaw: yaw.toFixed(2),
          sec: sec,
        };
        return { ...prevState, ...newData };
      });
    });

    return () => {
      imuTopic.unsubscribe();
    };
  }, [ros, robot_namespace]);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">IMU Data</Typography>
        {imuData ? (
          <div>
            <Typography>Roll: {imuData.roll}</Typography>
            <Typography>Pitch: {imuData.pitch}</Typography>
            <Typography>Yaw: {imuData.yaw}</Typography>
            <Typography>Sec: {imuData.sec}</Typography>
          </div>
        ) : (
          <Typography>Loading IMU data...</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ImuData;
