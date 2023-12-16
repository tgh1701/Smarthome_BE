const router = require("express").Router();
const { getFingerScanData } = require("../database/database.jsx");

router.get("/", (req, res) => {
  getFingerScanData((err, result) => {
    if (err) {
      console.error("Error fetching finger scan data from MySQL:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(result);
    }
  });
});

module.exports = router;
