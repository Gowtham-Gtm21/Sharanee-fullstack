const express = require("express");

const {
  placeOrder,
  myOrders,
  getOrder,
  cancelOrder,
  getTracking,
  updateTracking,
} = require("../controllers/orderController");

const { protect, admin } = require("../middleware/auth");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Customer Order Routes
|--------------------------------------------------------------------------
*/

// Place a new order
// POST /api/orders
router.post("/", protect, placeOrder);

// Get logged-in customer's orders
// GET /api/orders/user/:userId
router.get("/user/:userId", protect, myOrders);

// Get tracking details for a specific order
// GET /api/orders/tracking/:id
router.get("/tracking/:id", protect, getTracking);

// Cancel a specific order
// PUT /api/orders/cancel/:id
router.put("/cancel/:id", protect, cancelOrder);

/*
|--------------------------------------------------------------------------
| Admin Order Routes
|--------------------------------------------------------------------------
*/

// Update order status, tracking ID, courier name, payment status,
// delivery date and tracking history
// PUT /api/orders/tracking/:id
router.put("/tracking/:id", protect, admin, updateTracking);

/*
|--------------------------------------------------------------------------
| Common Order Routes
|--------------------------------------------------------------------------
*/

// Get complete details of a specific order
// Keep this dynamic route at the bottom to avoid route conflicts.
// GET /api/orders/:id
router.get("/:id", protect, getOrder);

module.exports = router;