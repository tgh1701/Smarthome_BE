const mqtt = require("mqtt");

const options = {
  host: "192.168.0.119",
  port: 1883,
};
const mqttClient = mqtt.connect(options);

module.exports = mqttClient;
