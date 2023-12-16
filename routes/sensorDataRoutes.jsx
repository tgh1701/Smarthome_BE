const router = require("express").Router();
const { getAverageSensorData } = require("../database/database.jsx");

router.get("/", (req, res) => {
  getAverageSensorData((err, result) => {
    if (err) {
      console.error("Error fetching average sensor data from MySQL:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(result);
    }
  });
});

module.exports = router;
