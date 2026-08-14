const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

exports.register = async (req, res, next) => {
  try {
    const { name, phone, password, email, preferredLanguage, location, farmDetails } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ message: "name, phone and password are required" });
    }
    const existing = await User.findOne({ phone });
    if (existing) return res.status(409).json({ message: "Phone number already registered" });

    const user = await User.create({ name, phone, password, email, preferredLanguage, location, farmDetails });
    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role, preferredLanguage: user.preferredLanguage },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: "phone and password are required" });

    const user = await User.findOne({ phone });
    if (!user) return res.status(401).json({ message: "Invalid phone or password" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid phone or password" });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role, preferredLanguage: user.preferredLanguage },
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};
