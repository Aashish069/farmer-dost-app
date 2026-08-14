const express = require("express");
const router = express.Router();
const { placeOrder, myOrders } = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

router.post("/", protect, placeOrder);
router.get("/mine", protect, myOrders);

module.exports = router;
