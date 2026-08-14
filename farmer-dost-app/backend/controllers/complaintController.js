const Complaint = require("../models/Complaint");
const Product = require("../models/Product");

exports.fileComplaint = async (req, res, next) => {
  try {
    const { productId, productNameIfUnknown, qrCodeScanned, issueType, description } = req.body;
    if (!issueType || !description) {
      return res.status(400).json({ message: "issueType and description are required" });
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      product: productId || undefined,
      productNameIfUnknown,
      qrCodeScanned,
      issueType,
      description,
    });

    res.status(201).json({ complaint });
  } catch (err) {
    next(err);
  }
};

exports.myComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id }).populate("product").sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (err) {
    next(err);
  }
};

// Admin: view all complaints
exports.allComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find().populate("product user").sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (err) {
    next(err);
  }
};

// Admin: update complaint status, and optionally flag the product as fake
exports.updateComplaint = async (req, res, next) => {
  try {
    const { status, adminNote, flagProductAsFake } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (status) complaint.status = status;
    if (adminNote) complaint.adminNote = adminNote;
    await complaint.save();

    if (flagProductAsFake && complaint.product) {
      await Product.findByIdAndUpdate(complaint.product, { isVerifiedGenuine: false });
    }

    res.json({ complaint });
  } catch (err) {
    next(err);
  }
};
