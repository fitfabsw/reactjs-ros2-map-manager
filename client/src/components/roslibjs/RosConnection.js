/*-------------------------------
The MIT License (MIT)

Copyright (c) 2023 Takumi Asada.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
-------------------------------*/

import React, { useState, useEffect } from "react";
import { Button, TextField, Box } from "@mui/material";
import ROSLIB from "roslib";

const RosConnection = ({ setRos }) => {
  const [rosUrl, setRosUrl] = useState("ws://192.168.0.184:9090"); // 預設值
  const [rosDomainId, setRosDomainId] = useState("89");

  // 在組件加載時檢索 URL
  useEffect(() => {
    const savedUrl = localStorage.getItem("rosUrl");
    if (savedUrl) {
      setRosUrl(savedUrl);
    }
  }, []);

  const connectToRos = () => {
    const ros = new ROSLIB.Ros({
      url: rosUrl,
    });

    ros.on("connection", () => {
      setRos(ros);
      document.getElementById("status").innerHTML = "successful";
      console.log("Connected to ROSBridge WebSocket server.");
    });

    ros.on("error", function (error) {
      console.log("Error connecting to ROSBridge WebSocket server: ", error);
    });

    ros.on("close", function () {
      console.log("Connection to ROSBridge WebSocket server closed.");
    });

    // 保存 URL 到 localStorage
    localStorage.setItem("rosUrl", rosUrl);
  };

  return (
    <Box display="flex" alignItems="center">
      <TextField
        label="ROS WebSocket URL"
        variant="outlined"
        value={rosUrl}
        onChange={(e) => setRosUrl(e.target.value)}
        fullWidth
        margin="normal"
        style={{ width: "80%", marginLeft: "10px", marginRight: "10px" }}
      />
      <Box display="flex" alignItems="center" style={{ marginTop: "10px" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={connectToRos}
          style={{ marginRight: "10px" }}
        >
          Connect
        </Button>
        <h4>
          Connection: <span id="status">N/A</span>
        </h4>
      </Box>
    </Box>
  );
};

export default RosConnection;
