const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["farmer", "admin"], default: "farmer" },
    preferredLanguage: { type: String, enum: ["en", "hi"], default: "en" },
    location: {
      state: String,
      district: String,
      lat: Number,
      lon: Number,
    },
    farmDetails: {
      landSizeAcres: Number,
      soilType: {
        type: String,
        enum: ["alluvial", "black", "red", "laterite", "sandy", "clay", "loamy", "unknown"],
        default: "unknown",
      },
      crops: [String],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
