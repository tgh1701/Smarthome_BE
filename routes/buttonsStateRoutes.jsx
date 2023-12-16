const router = require("express").Router();
const { getButtonsState } = require("../database/database.jsx");

router.get("/", (req, res) => {
  getButtonsState((err, result) => {
    if (err) {
      console.error("Error fetching buttons state from MySQL:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(result);
    }
  });
});

module.exports = router;
