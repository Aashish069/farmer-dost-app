/**
 * Seed script: populates the database with a demo admin user and a few
 * sample products (with generated QR codes) so the app is testable
 * immediately after setup.
 *
 * Run with: npm run seed
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Product = require("../models/Product");
const { generateVerificationCode } = require("./qrHelper");

async function seed() {
  await connectDB();

  const existingAdmin = await User.findOne({ phone: "9999999999" });
  if (!existingAdmin) {
    await User.create({
      name: "Admin",
      phone: "9999999999",
      email: "admin@farmerdost.app",
      password: "admin123",
      role: "admin",
    });
    console.log("Created demo admin -> phone: 9999999999, password: admin123");
  }

  const existingFarmer = await User.findOne({ phone: "9876543210" });
  if (!existingFarmer) {
    await User.create({
      name: "Ramesh Kumar",
      phone: "9876543210",
      email: "ramesh@example.com",
      password: "farmer123",
      role: "farmer",
      location: { state: "Uttar Pradesh", district: "Bareilly", lat: 28.367, lon: 79.43 },
      farmDetails: { landSizeAcres: 5, soilType: "alluvial", crops: ["wheat", "sugarcane"] },
    });
    console.log("Created demo farmer -> phone: 9876543210, password: farmer123");
  }

  const sampleProducts = [
    {
      name: "Urea Gold 46%",
      category: "fertilizer",
      manufacturer: "IFFCO",
      manufactureDate: new Date("2025-01-10"),
      expiryDate: new Date("2027-01-10"),
      price: 350,
      stock: 200,
      description: "High-nitrogen urea for cereal crops.",
      suitableCrops: ["wheat", "rice", "maize"],
      isVerifiedGenuine: true,
    },
    {
      name: "DAP Premium",
      category: "fertilizer",
      manufacturer: "Coromandel",
      manufactureDate: new Date("2025-03-01"),
      expiryDate: new Date("2027-03-01"),
      price: 1450,
      stock: 150,
      description: "Diammonium phosphate for root development.",
      suitableCrops: ["wheat", "potato", "cotton"],
      isVerifiedGenuine: true,
    },
    {
      name: "Suspicious Fertilizer X",
      category: "fertilizer",
      manufacturer: "Unknown Traders",
      manufactureDate: new Date("2023-01-01"),
      expiryDate: new Date("2024-01-01"),
      price: 200,
      stock: 5,
      description: "Reported counterfeit product used for demo of fake detection.",
      suitableCrops: [],
      isVerifiedGenuine: false,
    },
  ];

  for (const p of sampleProducts) {
    const existing = await Product.findOne({ name: p.name, manufacturer: p.manufacturer });
    if (existing) continue;
    const batchNumber = `BATCH-${Math.floor(Math.random() * 100000)}`;
    const qrCode = generateVerificationCode(batchNumber);
    await Product.create({ ...p, batchNumber, qrCode });
    console.log(`Created product "${p.name}" with QR code: ${qrCode}`);
  }

  console.log("Seeding complete.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
