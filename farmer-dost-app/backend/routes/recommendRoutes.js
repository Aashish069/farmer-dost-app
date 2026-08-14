const express = require("express");
const router = express.Router();
const { recommend } = require("../controllers/recommendController");
const { protect } = require("../middleware/auth");

router.post("/", protect, recommend);

module.exports = router;
