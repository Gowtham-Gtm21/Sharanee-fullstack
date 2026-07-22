const express = require("express");
const router = express.Router();

const {
  listCategories,
  createCategory,
  updateCategory,
  removeCategory,
} = require("../controllers/categoryController");

const { protect, admin } = require("../middleware/auth");
const { categoryUpload } = require("../middleware/upload");

router.get("/", listCategories);

router.post(
  "/",
  protect,
  admin,
  categoryUpload.single("categoryImage"),
  createCategory
);

router.put(
  "/:id",
  protect,
  admin,
  categoryUpload.single("categoryImage"),
  updateCategory
);

router.delete("/:id", protect, admin, removeCategory);

module.exports = router;
