const express = require("express");
const router = express.Router();
const { fileComplaint, myComplaints, allComplaints, updateComplaint } = require("../controllers/complaintController");
const { protect, adminOnly } = require("../middleware/auth");

router.post("/", protect, fileComplaint);
router.get("/mine", protect, myComplaints);
router.get("/", protect, adminOnly, allComplaints);
router.patch("/:id", protect, adminOnly, updateComplaint);

module.exports = router;
