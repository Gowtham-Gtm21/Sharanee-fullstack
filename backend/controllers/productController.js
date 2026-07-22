const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");

const SORTS = {
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  // The Shop page's "Sort by" dropdown sends "low"/"high" — keep these as
  // aliases so that filter actually changes the ordering of the products.
  low: { price: 1 },
  high: { price: -1 },
  newest: { createdAt: -1 },
  rating: { ratingsAverage: -1 },
};

/*
  In multipart form-data the size value may arrive in different formats:

  size = M
  size = ["M", "L"]
  size = M,L,XL

  This function normalizes all of them into an array.
*/
const parseSizes = (size) => {
  if (!size) return undefined;

  if (Array.isArray(size)) {
    return [...new Set(size.map((item) => String(item).trim()).filter(Boolean))];
  }

  if (typeof size === "string") {
    const trimmedSize = size.trim();

    if (!trimmedSize) return [];

    // JSON array string: ["M","L"]
    if (trimmedSize.startsWith("[") && trimmedSize.endsWith("]")) {
      try {
        const parsedSize = JSON.parse(trimmedSize);

        if (Array.isArray(parsedSize)) {
          return [
            ...new Set(
              parsedSize
                .map((item) => String(item).trim())
                .filter(Boolean)
            ),
          ];
        }
      } catch (error) {
        // If JSON parsing fails, fall back to comma-separated format
      }
    }

    // Comma-separated string: M,L,XL
    if (trimmedSize.includes(",")) {
      return [
        ...new Set(
          trimmedSize
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        ),
      ];
    }

    return [trimmedSize];
  }

  return [String(size).trim()];
};

// Convert multipart string values into correct data types
const prepareProductBody = (requestBody) => {
  const body = { ...requestBody };

  if (body.size !== undefined) {
    body.size = parseSizes(body.size);
  }

  if (body.price !== undefined && body.price !== "") {
    body.price = Number(body.price);
  }

  if (body.discountPrice !== undefined && body.discountPrice !== "") {
    body.discountPrice = Number(body.discountPrice);
  }

  if (body.stock !== undefined && body.stock !== "") {
    body.stock = Number(body.stock);
  }

  if (body.featured !== undefined) {
    body.featured =
      body.featured === true ||
      body.featured === "true" ||
      body.featured === "1";
  }

  return body;
};

const filesToPaths = (files = []) =>
  files.map((file) => file.path);

// Helper to delete uploaded image files (local only — Cloudinary URLs are skipped)
const deleteImageFiles = (images = []) => {
  images.forEach((image) => {
    if (!image || image.startsWith("http")) return; // hosted on Cloudinary — skip
    const filePath = path.join(__dirname, "..", image);

    fs.unlink(filePath, (error) => {
      if (error && error.code !== "ENOENT") {
        console.error(`Image delete error: ${filePath}`, error.message);
      }
    });
  });
};

// @route  GET /api/products
// query:
// search, category, fabric, color, occasion, pattern,
// size, featured, minPrice, maxPrice, sort
const listProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    fabric,
    color,
    occasion,
    pattern,
    size,
    featured,
    minPrice,
    maxPrice,
    sort,
  } = req.query;

  const filter = {};

  if (search) {
    filter.$text = {
      $search: search.trim(),
    };
  }

  if (category) {
    filter.category = category;
  }

  if (fabric) {
    filter.fabric = fabric;
  }

  if (color) {
    filter.color = color;
  }

  if (occasion) {
    filter.occasion = occasion;
  }

  if (pattern) {
    filter.pattern = pattern;
  }

  if (size) {
    filter.size = size;
  }

  if (featured !== undefined) {
    filter.featured = featured === "true";
  }

  if (minPrice || maxPrice) {
    filter.price = {};

    if (minPrice) {
      const parsedMinPrice = Number(minPrice);

      if (!Number.isNaN(parsedMinPrice)) {
        filter.price.$gte = parsedMinPrice;
      }
    }

    if (maxPrice) {
      const parsedMaxPrice = Number(maxPrice);

      if (!Number.isNaN(parsedMaxPrice)) {
        filter.price.$lte = parsedMaxPrice;
      }
    }

    if (Object.keys(filter.price).length === 0) {
      delete filter.price;
    }
  }

  const products = await Product.find(filter)
    .populate("category", "categoryName")
    .sort(SORTS[sort] || { createdAt: -1 });

  res.json({
    products,
    count: products.length,
  });
});

// @route  GET /api/products/low-stock
// @access Admin
const lowStock = asyncHandler(async (req, res) => {
  const products = await Product.find({
    stockStatus: "Low Stock",
  })
    .populate("category", "categoryName")
    .sort({ stock: 1 });

  res.json({
    products,
    count: products.length,
  });
});

// @route  GET /api/products/out-of-stock
// @access Admin
const outOfStock = asyncHandler(async (req, res) => {
  const products = await Product.find({
    stockStatus: "Out of Stock",
  })
    .populate("category", "categoryName")
    .sort({ updatedAt: -1 });

  res.json({
    products,
    count: products.length,
  });
});

// @route  GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "categoryName"
  );

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  res.json({
    product,
  });
});

// @route  POST /api/products
// @access Admin
// @content-type multipart/form-data
const createProduct = asyncHandler(async (req, res) => {
  const body = prepareProductBody(req.body);

  if (req.files?.length) {
    body.images = filesToPaths(req.files);
  }

  const product = await Product.create(body);

  const populatedProduct = await Product.findById(product._id).populate(
    "category",
    "categoryName"
  );

  res.status(201).json({
    message: "Product created successfully",
    product: populatedProduct,
  });
});

// @route  PUT /api/products/:id
// @access Admin
// @content-type multipart/form-data
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const body = prepareProductBody(req.body);

  // "existingImages" - existing image paths the admin chose to keep in the
  // form (JSON array string). If absent, all current images are retained.
  let keptImages = product.images;

  if (body.existingImages !== undefined) {
    try {
      const parsed = JSON.parse(body.existingImages);
      keptImages = Array.isArray(parsed) ? parsed : product.images;
    } catch (error) {
      keptImages = product.images;
    }
  }

  delete body.existingImages;

  const newImages = req.files?.length ? filesToPaths(req.files) : [];
  const removedImages = product.images.filter(
    (image) => !keptImages.includes(image)
  );

  body.images = [...keptImages, ...newImages];

  Object.assign(product, body);
  await product.save();

  if (removedImages.length) {
    deleteImageFiles(removedImages);
  }

  const updatedProduct = await Product.findById(product._id).populate(
    "category",
    "categoryName"
  );

  res.json({
    message: "Product updated successfully",
    product: updatedProduct,
  });
});

// @route  DELETE /api/products/:id
// @access Admin
const removeProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const productImages = [...product.images];

  await product.deleteOne();

  deleteImageFiles(productImages);

  res.json({
    message: "Product deleted successfully",
  });
});

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  removeProduct,
  lowStock,
  outOfStock,
};