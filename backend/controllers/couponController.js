const Coupon = require("../models/Coupon");
const asyncHandler = require("../utils/asyncHandler");

// @route  POST /api/coupons  (admin)
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ coupon });
});

// @route  GET /api/coupons  (admin)
const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ coupons });
});

// @route  POST /api/coupons/apply   body: { code, totalAmount }
const applyCoupon = asyncHandler(async (req, res) => {
  const { code, totalAmount } = req.body;
  if (!code) return res.status(400).json({ message: "Coupon code is required" });

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
  if (!coupon) return res.status(404).json({ message: "Invalid coupon code" });

  if (coupon.expiryDate < new Date()) {
    return res.status(400).json({ message: "This coupon has expired" });
  }
  if (totalAmount < coupon.minimumOrderAmount) {
    return res.status(400).json({
      message: `Minimum order amount for this coupon is Rs. ${coupon.minimumOrderAmount}`,
    });
  }

  const discount =
    coupon.discountType === "Percentage"
      ? Math.round((totalAmount * coupon.discountValue) / 100)
      : coupon.discountValue;

  res.json({ coupon, discount: Math.min(discount, totalAmount) });
});

// @route  PUT /api/coupons/:id  (admin)
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({ message: "Coupon not found" });
  }

  Object.assign(coupon, req.body);
  await coupon.save();

  res.json({ coupon });
});

// @route  DELETE /api/coupons/:id  (admin)
const removeCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({ message: "Coupon not found" });
  }

  await coupon.deleteOne();

  res.json({ message: "Coupon deleted successfully" });
});

module.exports = {
  createCoupon,
  listCoupons,
  applyCoupon,
  updateCoupon,
  removeCoupon,
};
