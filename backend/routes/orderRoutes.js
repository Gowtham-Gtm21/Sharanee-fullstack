const express = require("express");
const router = express.Router();
const {
  placeOrder,
  myOrders,
  getOrder,
  cancelOrder,
  getTracking,
  updateTracking,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/auth");

router.post("/", protect, placeOrder);
router.get("/user/:userId", protect, myOrders);
router.get("/tracking/:id", protect, getTracking);
router.put("/tracking/:id", protect, admin, updateTracking);
router.put("/cancel/:id", protect, cancelOrder);
router.get("/:id", protect, getOrder);

module.exports = router;
