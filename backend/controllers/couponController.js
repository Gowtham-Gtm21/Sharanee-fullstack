const Coupon = require("../models/Coupon");
const asyncHandler = require("../utils/asyncHandler");

// @route  POST /api/coupons  (admin)
const createCoupon = asyncHandler(async (req, res) => {

  const today = new Date();

  const start = new Date(req.body.startDate);

  const expiry = new Date(req.body.expiryDate);

  let status = "Scheduled";

  if (today >= start && today <= expiry) {
    status = "Active";
  }

  if (today > expiry) {
    status = "Expired";
  }

  const coupon = await Coupon.create({
    ...req.body,
    status,
    remainingCount: req.body.maxUses,
  });

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

  const today = new Date();

  if (today < coupon.startDate) {

    coupon.status = "Scheduled";

  }
  else if (today > coupon.expiryDate) {

    coupon.status = "Expired";

  }
  else {

    coupon.status = "Active";

  }

  await coupon.save();


  if (coupon.status === "Scheduled") {
    return res.status(400).json({
      message: "Coupon is not active yet.",
    });
  }

  if (coupon.status === "Expired") {
    return res.status(400).json({
      message: "Coupon has expired.",
    });
  }

  if (coupon.usedCount >= coupon.maxUses) {

    coupon.status = "Expired";

    await coupon.save();

    return res.status(400).json({
      message: "Coupon usage limit reached.",
    });
  }

  if (totalAmount < coupon.minimumOrderAmount) {
    return res.status(400).json({
      message: `Minimum order amount for this coupon is Rs. ${coupon.minimumOrderAmount}`,
    });
  }

  let discount = 0;

  if (coupon.discountType === "Percentage") {

    discount = Math.round(
      (totalAmount * coupon.discountValue) / 100
    );

  }
  else if (coupon.discountType === "Flat") {

    discount = coupon.discountValue;

  }
  else if (coupon.discountType === "Free Shipping") {

    discount = 0;

  }

  coupon.usedCount += 1;

  coupon.remainingCount = Math.max(
    coupon.maxUses - coupon.usedCount,
    0
  );

  await coupon.save();

  res.json({
    coupon,
    discount: Math.min(discount, totalAmount),
  });

});
// @route  PUT /api/coupons/:id  (admin)
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({ message: "Coupon not found" });
  }

  Object.assign(coupon, req.body);
  const today = new Date();

  if (today < coupon.startDate) {

    coupon.status = "Scheduled";

  }
  else if (today > coupon.expiryDate) {

    coupon.status = "Expired";

  }
  else {

    coupon.status = "Active";

  }

  coupon.remainingCount =
    coupon.maxUses - coupon.usedCount;

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
