const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "Sharanee" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    address: { type: String, default: "" },
    freeShippingThreshold: { type: Number, default: 999 },
    shippingFee: { type: Number, default: 50 },
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
