const mongoose = require("mongoose");

const FABRIC_OPTIONS = [
  "Cotton",
  "Silk",
  "Kanchipuram Silk",
  "Soft Silk",
  "Art Silk",
  "Linen",
  "Georgette",
  "Chiffon",
  "Rayon",
  "Satin",
  "Poly Cotton",
];

const OCCASION_OPTIONS = [
  "Daily Wear",
  "Casual",
  "Office Wear",
  "Party Wear",
  "Wedding",
  "Festival",
  "Traditional",
];

const SIZE_OPTIONS = [
  "Free Size",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "4XL",
  "5XL",
];

const PATTERN_OPTIONS = [
  "Plain",
  "Printed",
  "Floral",
  "Striped",
  "Checked",
  "Embroidered",
  "Woven",
  "Jacquard",
];

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    discountPrice: {
      type: Number,
      default: 0,
    },

    stock: {
      type: Number,
      default: 0,
    },

    stockStatus: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },

    images: [
      {
        type: String,
      },
    ],

    fabric: {
      type: String,
      enum: {
        values: FABRIC_OPTIONS,
        message: "{VALUE} is not a valid fabric",
      },
      default: "Cotton",
    },

    color: {
      type: String,
      default: "",
    },

    occasion: {
      type: String,
      enum: {
        values: OCCASION_OPTIONS,
        message: "{VALUE} is not a valid occasion",
      },
      default: "Daily Wear",
    },

    pattern: {
      type: String,
      enum: {
        values: PATTERN_OPTIONS,
        message: "{VALUE} is not a valid pattern",
      },
      default: "Plain",
    },

    brand: {
      type: String,
      default: "Sharanee",
    },

    size: [
      {
        type: String,
        enum: {
          values: SIZE_OPTIONS,
          message: "{VALUE} is not a valid size",
        },
      },
    ],

    featured: {
      type: Boolean,
      default: false,
    },

    ratingsAverage: {
      type: Number,
      default: 0,
    },

    ratingsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Keep stockStatus in sync with stock count whenever it is saved.
productSchema.pre("save", function (next) {
  if (this.stock <= 0) {
    this.stockStatus = "Out of Stock";
  } else if (this.stock <= 5) {
    this.stockStatus = "Low Stock";
  } else {
    this.stockStatus = "In Stock";
  }

  next();
});

productSchema.index({
  productName: "text",
  description: "text",
  fabric: "text",
  color: "text",
  occasion: "text",
  pattern: "text",
});

module.exports = mongoose.model("Product", productSchema);