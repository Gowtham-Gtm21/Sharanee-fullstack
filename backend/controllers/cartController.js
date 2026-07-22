const Cart = require("../models/Cart");
const asyncHandler = require("../utils/asyncHandler");

// @route  POST /api/cart   body: { user, product, quantity }
const addToCart = asyncHandler(async (req, res) => {
  const { user, product, quantity = 1 } = req.body;
  if (!user || !product) {
    return res.status(400).json({ message: "user and product are required" });
  }

  let item = await Cart.findOne({ user, product });
  if (item) {
    item.quantity += Number(quantity) || 1;
    await item.save();
  } else {
    item = await Cart.create({ user, product, quantity });
  }

  await item.populate("product");
  res.status(201).json({ item });
});

// @route  GET /api/cart/:userId
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.find({ user: req.params.userId }).populate("product");
  res.json({ cart });
});

// @route  PUT /api/cart/:id   body: { quantity }
const updateQty = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "quantity must be at least 1" });
  }
  const item = await Cart.findByIdAndUpdate(req.params.id, { quantity }, { new: true }).populate("product");
  if (!item) return res.status(404).json({ message: "Cart item not found" });
  res.json({ item });
});

// @route  DELETE /api/cart/:id
const removeFromCart = asyncHandler(async (req, res) => {
  const item = await Cart.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Cart item not found" });
  res.json({ message: "Removed from cart" });
});

module.exports = { addToCart, getCart, updateQty, removeFromCart };
