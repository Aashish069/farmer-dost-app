const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ["fertilizer", "pesticide", "seed", "tool", "other"], default: "fertilizer" },
    manufacturer: { type: String, required: true },
    batchNumber: { type: String, required: true, unique: true },
    manufactureDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    qrCode: { type: String, unique: true }, // unique verification code encoded in the QR
    price: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    description: { type: String },
    suitableCrops: [String],
    imageUrl: { type: String },
    isVerifiedGenuine: { type: Boolean, default: true }, // set false if reported fake
  },
  { timestamps: true }
);

productSchema.virtual("isExpired").get(function () {
  return this.expiryDate && this.expiryDate.getTime() < Date.now();
});

productSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
