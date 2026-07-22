const express = require("express");
const router = express.Router();
const {
  dashboard,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  listOrders,
  updateOrderStatus,
  analytics,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/auth");

router.use(protect, admin);

router.get("/dashboard", dashboard);
router.get("/users", listUsers);
router.get("/users/:id", getUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/orders", listOrders);
router.put("/orders/:id", updateOrderStatus);
router.get("/analytics", analytics);

module.exports = router;
