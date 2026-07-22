const Order = require("../models/Order");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");

// Adjusts a product's stock by `delta` and keeps stockStatus in sync
// (findByIdAndUpdate skips the pre-save hook, so we do it manually here).
const adjustStock = async (productId, delta) => {
  const product = await Product.findById(productId);
  if (!product) return;
  product.stock = Math.max(0, product.stock + delta);
  await product.save();
};

// @route  POST /api/orders   body: { user, items, shippingAddress, totalAmount, paymentMethod }
const placeOrder = asyncHandler(async (req, res) => {
  const { user, items, shippingAddress, totalAmount, paymentMethod } = req.body;

  if (!user || !items?.length || !shippingAddress || !totalAmount) {
    return res.status(400).json({ message: "user, items, shippingAddress and totalAmount are required" });
  }

  const order = await Order.create({
    user,
    items,
    shippingAddress,
    totalAmount,
    paymentMethod,
    trackingHistory: [{ status: "Placed", note: "Order placed successfully" }],
  });

  // Decrement stock for each purchased item
  await Promise.all(items.map((i) => adjustStock(i.product, -i.quantity)));

  await order.populate("items.product shippingAddress");
  res.status(201).json({ order });
});

// @route  GET /api/orders/user/:userId
const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.params.userId })
    .populate("items.product shippingAddress")
    .sort({ createdAt: -1 });
  res.json({ orders });
});

// @route  GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product shippingAddress user");
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json({ order });
});

// @route  PUT /api/orders/cancel/:id
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (["Delivered", "Shipped", "Out for Delivery", "Cancelled"].includes(order.orderStatus)) {
    return res.status(400).json({ message: `Order cannot be cancelled once it is ${order.orderStatus}` });
  }

  order.orderStatus = "Cancelled";
  order.trackingHistory.push({ status: "Cancelled", note: "Cancelled by customer" });
  await order.save();

  // Restock cancelled items
  await Promise.all(order.items.map((i) => adjustStock(i.product, i.quantity)));

  res.json({ order });
});

// @route  GET /api/orders/tracking/:id
const getTracking = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).select(
    "orderStatus trackingId courierName trackingHistory"
  );
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json({ tracking: order });
});

// @route  PUT /api/orders/tracking/:id  (admin)  body: { status, note, trackingId, courierName }
const updateTracking = asyncHandler(async (req, res) => {
  const { status, note, trackingId, courierName } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (status) {
    order.orderStatus = status;
    order.trackingHistory.push({ status, note: note || "" });
  }
  if (trackingId !== undefined) order.trackingId = trackingId;
  if (courierName !== undefined) order.courierName = courierName;

  await order.save();
  res.json({ order });
});

module.exports = { placeOrder, myOrders, getOrder, cancelOrder, getTracking, updateTracking };
