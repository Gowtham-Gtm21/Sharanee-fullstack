const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const Notification = require("../models/Notification");
const Discount = require("../models/Discount");
const Category = require("../models/Category");
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
    const searchTerm = search.trim();

    filter.$or = [
      { productName: { $regex: searchTerm, $options: "i" } },
      { fabric: { $regex: searchTerm, $options: "i" } },
      { occasion: { $regex: searchTerm, $options: "i" } },
      { pattern: { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (category) {


    const categoryDoc = await Category.findOne({
      categoryName: category,
    });

    if (categoryDoc) {
      filter.category = categoryDoc._id;
    }
  }

  if (fabric) {
    filter.fabric = fabric;
  }

  if (color) {
    filter["colorVariants.colorName"] = color;
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

  const today = new Date();

  const discounts = await Discount.find({
    active: true,
    startDate: { $lte: today },
    endDate: { $gte: today },
  });

  const updatedProducts = products.map((product) => {

    let finalPrice = product.price;

    let appliedDiscount = null;

    const discount = discounts.find((d) => {

      if (
        d.applyTo === "Product" &&
        d.product &&
        d.product.toString() === product._id.toString()
      ) {
        return true;
      }

      if (
        d.applyTo === "Category" &&
        d.category &&
        product.category &&
        d.category.toString() === product.category._id.toString()
      ) {
        return true;
      }

      return false;
    });

    if (discount) {

      if (discount.discountType === "Percentage") {

        finalPrice =
          product.price -
          (product.price * discount.discountValue) / 100;

      } else {

        finalPrice =
          product.price - discount.discountValue;

      }

      if (finalPrice < 0) finalPrice = 0;

      appliedDiscount = {
        offerName: discount.offerName,
        discountType: discount.discountType,
        discountValue: discount.discountValue,
      };
    }

    return {
      ...product.toObject(),
      originalPrice: product.price,
      finalPrice,
      discount: appliedDiscount,
    };
  });

  res.json({
    products: updatedProducts,
    count: updatedProducts.length,
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

  if (body.colorVariants) {
    body.colorVariants = JSON.parse(body.colorVariants);
  }

  if (req.files?.images) {
    body.images = filesToPaths(req.files.images);
  }
  if (body.colorVariants) {
    body.colorVariants.forEach((variant, index) => {
      const files = req.files?.[`colorImages_${index}`] || [];

      variant.images = files.map((file) => file.path);
    });
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


  console.log("PRODUCT FILES:", req.files);

  if (body.colorVariants) {
    body.colorVariants = JSON.parse(body.colorVariants);
  }

  if (body.colorVariants) {
    body.colorVariants.forEach((variant, index) => {
      const files = req.files?.[`colorImages_${index}`] || [];

      if (files.length > 0) {
        variant.images = files.map((file) => file.path);
      } else {
        variant.images =
          product.colorVariants?.[index]?.images || [];
      }
    });
  }

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

  const newImages = req.files?.images
    ? filesToPaths(req.files.images)
    : [];
  const removedImages = product.images.filter(
    (image) => !keptImages.includes(image)
  );

  body.images = [...keptImages, ...newImages];

  Object.assign(product, body);
  await product.save();

  // Low Stock Notification
  if (product.stock <= 5 && product.stock > 0) {
    await Notification.create({
      title: "⚠ Low Stock",
      message: `${product.productName} has only ${product.stock} items left.`,
    });
  }

  // Out of Stock Notification
  if (product.stock === 0) {
    await Notification.create({
      title: "❌ Out of Stock",
      message: `${product.productName} is now out of stock.`,
    });
  }

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