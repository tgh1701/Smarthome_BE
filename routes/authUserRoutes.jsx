const router = require("express").Router();
const bcrypt = require("bcrypt");
const {
  insertUserData,
  findUserByUsername,
} = require("../database/database.jsx");

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { username, email, password: hashedPassword };
    insertUserData(userData, (error, result) => {
      if (error) {
        return res.status(400).json({ error });
      } else {
        return res.status(201).json({ message: result });
      }
    });
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    findUserByUsername(username, async (err, user) => {
      if (err) {
        console.error("Error finding user:", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else if (!user) {
        res.status(401).json({ error: "Wrong username or password" });
      } else {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          console.log("User logged in successfully");
          res.status(200).json({ message: "User logged in successfully" });
        } else {
          res.status(401).json({ error: "Wrong username or password" });
        }
      }
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
