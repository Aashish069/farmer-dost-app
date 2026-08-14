const express = require("express");
const router = express.Router();
const { createProduct, listProducts, getProduct, verifyByQRCode } = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", listProducts);
router.get("/verify/:code", verifyByQRCode);
router.get("/:id", getProduct);
router.post("/", protect, adminOnly, createProduct);

module.exports = router;
