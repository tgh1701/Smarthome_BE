const router = require("express").Router();
const { getFingerData } = require("../database/database.jsx");

router.get("/", (req, res) => {
  getFingerData((err, result) => {
    if (err) {
      console.error("Error fetching finger data from MySQL:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(result);
    }
  });
});

module.exports = router;
