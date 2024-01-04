const mqtt = require("mqtt");

const options = {
  host: "192.168.0.119", // PC
  // host: "192.168.0.154", // MAC
  // host: "172.20.10.2", // MAC with Iphone
  port: 1883,
};
const mqttClient = mqtt.connect(options);

module.exports = mqttClient;
