const express = require("express");
const router = express.Router();

const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  removeProduct,
  lowStock,
  outOfStock,
} = require("../controllers/productController");

const { protect, admin } = require("../middleware/auth");
const { productUpload } = require("../middleware/upload");

// Admin stock routes
// Specific routes must be placed before "/:id"
router.get("/low-stock", protect, admin, lowStock);
router.get("/out-of-stock", protect, admin, outOfStock);

// Product routes
router.get("/", listProducts);

router.post(
  "/",
  protect,
  admin,
  productUpload.fields([
    {
      name: "images",
      maxCount: 5,
    },
    {
      name: "colorImages_0",
      maxCount: 5,
    },
    {
      name: "colorImages_1",
      maxCount: 5,
    },
    {
      name: "colorImages_2",
      maxCount: 5,
    },
    {
      name: "colorImages_3",
      maxCount: 5,
    },
    {
      name: "colorImages_4",
      maxCount: 5,
    },
  ]),
  createProduct
);

router.get("/:id", getProduct);

router.put(
  "/:id",
  protect,
  admin,
  productUpload.fields([
    {
      name: "images",
      maxCount: 5,
    },
    {
      name: "colorImages_0",
      maxCount: 5,
    },
    {
      name: "colorImages_1",
      maxCount: 5,
    },
    {
      name: "colorImages_2",
      maxCount: 5,
    },
    {
      name: "colorImages_3",
      maxCount: 5,
    },
    {
      name: "colorImages_4",
      maxCount: 5,
    },
  ]),
  updateProduct
);

router.delete("/:id", protect, admin, removeProduct);

module.exports = router;