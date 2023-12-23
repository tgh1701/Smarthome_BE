const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const socketio = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const mqttClient = require("./mqtt/mqtt.jsx");
const {
  insertSensorData,
  insertFingerData,
  insertHistoryScanData,
  deleteFingerDataById,
  updateButtonsState,
  updateAutoMode,
} = require("./database/database.jsx");
const {
  sendEmailWarningHome,
  sendEmailWarningGarage,
  sendEmailGasWarningHome,
} = require("./email/email.jsx");
const autoModeRoute = require("./routes/autoModeRoutes.jsx");
const buttonsStateRoute = require("./routes/buttonsStateRoutes.jsx");
const fingerDataRoute = require("./routes/fingerDataRoutes.jsx");
const fingerScanDataRoute = require("./routes/fingerScanDataRoutes.jsx");
const sensorDataRoute = require("./routes/sensorDataRoutes.jsx");
const authUserRoute = require("./routes/authUserRoutes.jsx");

const app = express();
const server = http.createServer(app);
dotenv.config();
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});
app.use(cors());
app.use(bodyParser.json());
const port = process.env.PORT;

mqttClient.on("connect", () => {
  console.log("Connected to MQTT");
  mqttClient.subscribe("sensorsData", (err) => {
    if (err) {
      console.error("Error subscribing to MQTT topic:", err);
    }
  });
  mqttClient.subscribe("buttonsState/#", (err) => {
    if (err) {
      console.error("Error subscribing to MQTT topic:", err);
    }
  });
  mqttClient.subscribe("autoMode/#", (err) => {
    if (err) {
      console.error("Error subscribing to MQTT topic:", err);
    }
  });
  mqttClient.subscribe("finger/#", (err) => {
    if (err) {
      console.error("Error subscribing to MQTT topic:", err);
    }
  });
});

mqttClient.on("message", (topic, payload) => {
  if (topic.startsWith("sensorsData")) {
    const sensorsData = JSON.parse(payload.toString());
    if (sensorsData.Fire == 0) {
      sendEmailWarningHome();
    } else if (sensorsData.MQ5 > 1500) {
      sendEmailWarningGarage();
    } else if (sensorsData.MQ2 > 1500) {
      sendEmailGasWarningHome();
    }
    io.emit("sensorsData", { topic, payload: sensorsData });
    insertSensorData(sensorsData);
  } else if (topic.startsWith("buttonsState")) {
    const buttonLocation = topic.split("/")[1];
    const newState = parseInt(payload.toString());
    updateButtonsState(buttonLocation, newState);
    io.emit("buttonsState", {
      location: buttonLocation,
      payload: payload.toString(),
    });
  } else if (topic.startsWith("finger/fingerEnroll")) {
    const fingerEnrollData = JSON.parse(payload.toString());
    io.emit("fingerEnroll", { topic, payload: fingerEnrollData });
    insertFingerData(fingerEnrollData);
  } else if (topic.startsWith("finger/fingerDelete")) {
    const fingerDeleteData = JSON.parse(payload.toString());
    deleteFingerDataById(fingerDeleteData.id);
  } else if (topic.startsWith("finger/fingerScan")) {
    const fingerScanData = JSON.parse(payload.toString());
    io.emit("fingerScan", { topic, payload: fingerScanData });
    insertHistoryScanData(fingerScanData);
  } else if (topic.startsWith("autoMode/rain/status")) {
    const newState = parseInt(payload.toString());
    updateAutoMode("autoMode/rain/status", newState);
  } else if (topic.startsWith("autoMode/water/status")) {
    const newState = parseInt(payload.toString());
    updateAutoMode("autoMode/water/status", newState);
  }
});

io.on("connection", (socket) => {
  console.log("A client connected");
  socket.on("buttonsState", (payload) => {
    const { location, newState } = JSON.parse(payload);
    const mqttTopic = `buttonsState/${location}`;
    mqttClient.publish(mqttTopic, newState.toString());
  });
  socket.on("autoMode/water/status", (payload) => {
    const { newState } = JSON.parse(payload);
    const mqttTopic = "autoMode/water/status";
    mqttClient.publish(mqttTopic, newState.toString());
  });
  socket.on("autoMode/water/setTarget", (payload) => {
    const { newState } = JSON.parse(payload);
    const mqttTopic = "autoMode/water/setTarget";
    mqttClient.publish(mqttTopic, newState.toString());
  });
  socket.on("autoMode/rain/status", (payload) => {
    const { newState } = JSON.parse(payload);
    const mqttTopic = "autoMode/rain/status";
    mqttClient.publish(mqttTopic, newState.toString());
  });
  socket.on("finger/fingerControl", (payload) => {
    const { newState } = JSON.parse(payload);
    const mqttTopic = "finger/fingerControl";
    mqttClient.publish(mqttTopic, newState.toString());
  });
  socket.on("finger/fingerId", (payload) => {
    const { newState } = JSON.parse(payload);
    const mqttTopic = "finger/fingerId";
    mqttClient.publish(mqttTopic, newState.toString());
  });
  socket.on("finger/fingerName", (payload) => {
    const { fingerName } = JSON.parse(payload);
    const mqttTopic = "finger/fingerName";
    mqttClient.publish(mqttTopic, fingerName);
  });
  socket.on("finger/fingerEnroll", (payload) => {
    const { id, data, name } = JSON.parse(payload);
    const mqttTopic = `finger/fingerEnroll`;
    const fingerEnrollData = { id, data, name };
    mqttClient.publish(mqttTopic, JSON.stringify(fingerEnrollData));
  });
});

app.use("/api/autoMode", autoModeRoute);
app.use("/api/buttonsState", buttonsStateRoute);
app.use("/api/fingerData", fingerDataRoute);
app.use("/api/fingerScanData", fingerScanDataRoute);
app.use("/api/sensorData", sensorDataRoute);
app.use("/api/user", authUserRoute);

server.listen(port, () => console.log(`Server listening on port: ${port}`));
