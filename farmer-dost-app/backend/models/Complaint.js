const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productNameIfUnknown: { type: String },
    qrCodeScanned: { type: String },
    issueType: {
      type: String,
      enum: ["fake_product", "expired_product", "wrong_labeling", "poor_quality", "other"],
      required: true,
    },
    description: { type: String, required: true },
    status: { type: String, enum: ["open", "in_review", "resolved", "rejected"], default: "open" },
    adminNote: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
