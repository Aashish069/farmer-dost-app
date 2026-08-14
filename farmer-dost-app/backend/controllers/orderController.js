const Order = require("../models/Order");
const Product = require("../models/Product");

exports.placeOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress } = req.body; // items: [{ productId, quantity }]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items array is required" });
    }

    let total = 0;
    const orderItems = [];
    for (const { productId, quantity } of items) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: `Product ${productId} not found` });
      if (product.stock < quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      orderItems.push({ product: product._id, quantity, priceAtPurchase: product.price });
      total += product.price * quantity;
      product.stock -= quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount: total,
      deliveryAddress,
    });

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
};

exports.myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("items.product").sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};
