const router = require("express").Router();
const { getAutoMode } = require("../database/database.jsx");

router.get("/", (req, res) => {
  getAutoMode((err, result) => {
    if (err) {
      console.error("Error fetching auto mode state from MySQL:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(result);
    }
  });
});

module.exports = router;
