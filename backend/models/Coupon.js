const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["Percentage", "Flat"], default: "Percentage" },
    discountValue: { type: Number, required: true },
    minimumOrderAmount: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
