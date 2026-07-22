const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    alternateMobile: { type: String, default: "" },
    houseNo: { type: String, required: true },
    area: { type: String, required: true },
    landmark: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    addressType: { type: String, enum: ["Home", "Work", "Other"], default: "Home" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
