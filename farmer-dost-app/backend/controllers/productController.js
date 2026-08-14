const Product = require("../models/Product");
const { generateVerificationCode, generateQRDataUrl } = require("../utils/qrHelper");

// Admin: create a product and auto-generate its QR verification code
exports.createProduct = async (req, res, next) => {
  try {
    const { batchNumber } = req.body;
    if (!batchNumber) return res.status(400).json({ message: "batchNumber is required" });

    const qrCode = generateVerificationCode(batchNumber);
    const product = await Product.create({ ...req.body, qrCode });
    const qrImage = await generateQRDataUrl(qrCode);

    res.status(201).json({ product, qrImage });
  } catch (err) {
    next(err);
  }
};

// Public/farmer: list products (for the marketplace)
exports.listProducts = async (req, res, next) => {
  try {
    const { category, crop, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (crop) filter.suitableCrops = crop;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ count: products.length, products });
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

// Core QR/barcode verification feature from the PPT
exports.verifyByQRCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const product = await Product.findOne({ qrCode: code });

    if (!product) {
      return res.status(404).json({
        verified: false,
        message: "No product found for this QR code. This may be a counterfeit or unregistered product.",
      });
    }

    const isExpired = product.expiryDate.getTime() < Date.now();

    res.json({
      verified: product.isVerifiedGenuine,
      isExpired,
      product,
      message: !product.isVerifiedGenuine
        ? "Warning: this product has been reported as counterfeit."
        : isExpired
        ? "This product is genuine but has EXPIRED. Do not use."
        : "Product verified as genuine and within expiry.",
    });
  } catch (err) {
    next(err);
  }
};
