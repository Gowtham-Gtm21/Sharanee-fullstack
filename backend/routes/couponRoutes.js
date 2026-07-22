const express = require("express");
const router = express.Router();
const {
  createCoupon,
  listCoupons,
  applyCoupon,
  updateCoupon,
  removeCoupon,
} = require("../controllers/couponController");
const { protect, admin } = require("../middleware/auth");

router.post("/", protect, admin, createCoupon);
router.get("/", protect, admin, listCoupons);
router.post("/apply", protect, applyCoupon);
router.put("/:id", protect, admin, updateCoupon);
router.delete("/:id", protect, admin, removeCoupon);

module.exports = router;
