const fs = require("fs");
const path = require("path");
const Category = require("../models/Category");
const asyncHandler = require("../utils/asyncHandler");

// Helper to delete an uploaded image file
const deleteImageFile = (image) => {
  if (!image || image.startsWith("http")) return;

  const filePath = path.join(__dirname, "..", image);

  fs.unlink(filePath, (error) => {
    if (error && error.code !== "ENOENT") {
      console.error(`Image delete error: ${filePath}`, error.message);
    }
  });
};

// @route  GET /api/categories
const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ categoryName: 1 });
  res.json({ categories });
});

// @route  POST /api/categories  (admin)
// @content-type multipart/form-data
const createCategory = asyncHandler(async (req, res) => {
  const { categoryName, description } = req.body;

  if (!categoryName) {
    return res.status(400).json({ message: "categoryName is required" });
  }

  const categoryImages = req.files
    ? req.files.map(file => file.path)
    : [];

  const category = await Category.create({
    categoryName,
    categoryImages,
    description,
  });

  res.status(201).json({ category });
});

// @route  PUT /api/categories/:id  (admin)
// @content-type multipart/form-data
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const { categoryName, description } = req.body;

  if (categoryName !== undefined) category.categoryName = categoryName;
  if (description !== undefined) category.description = description;

  const existingImages = req.body.existingImages
    ? JSON.parse(req.body.existingImages)
    : [];

  const uploadedImages = req.files
    ? req.files.map(file => file.path)
    : [];

  category.categoryImages = [
    ...existingImages,
    ...uploadedImages,
  ];

  await category.save();

  res.json({ category });
});

// @route  DELETE /api/categories/:id  (admin)
const removeCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  const images = category.categoryImages || [];

  await category.deleteOne();

  images.forEach(deleteImageFile);

  res.json({ message: "Category deleted successfully" });
});

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  removeCategory,
};