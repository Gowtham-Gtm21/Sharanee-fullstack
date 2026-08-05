const Review = require("../models/Review");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const Order = require("../models/Order");
// Recomputes a product's ratingsAverage / ratingsCount from its reviews
const syncProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: Math.round(average * 10) / 10,
    ratingsCount: count,
  });
};

// @route  POST /api/reviews   body: { user, product, rating, review }
const addReview = asyncHandler(async (req, res) => {
  const { user, product, rating, review } = req.body;

  if (!user || !product || !rating) {
    return res.status(400).json({
      message: "user, product and rating are required",
    });
  }

  // Check if customer has a delivered order for this product
  const deliveredOrder = await Order.findOne({
    user,
    orderStatus: "Delivered",
    "items.product": product,
  });

  if (!deliveredOrder) {
    return res.status(403).json({
      message: "You can review this product only after it has been delivered.",
    });
  }

  // Prevent duplicate review
  const existingReview = await Review.findOne({
    user,
    product,
  });

  if (existingReview) {
    return res.status(400).json({
      message: "You have already reviewed this product.",
    });
  }

  const doc = await Review.create({
    user,
    product,
    rating,
    review,
  });

  await syncProductRating(product);
  await doc.populate("user", "fullName");

  res.status(201).json({
    review: doc,
  });
});



// @route  GET /api/reviews/:productId
const reviewsForProduct = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "fullName")
    .sort({ createdAt: -1 });
  res.json({ reviews });
});

// @route  PUT /api/reviews/:id
const updateReview = asyncHandler(async (req, res) => {
  const { rating, review } = req.body;
  const doc = await Review.findByIdAndUpdate(
    req.params.id,
    { rating, review },
    { new: true, runValidators: true }
  );
  if (!doc) return res.status(404).json({ message: "Review not found" });
  await syncProductRating(doc.product);
  res.json({ review: doc });
});

// @route  DELETE /api/reviews/:id
const removeReview = asyncHandler(async (req, res) => {
  const doc = await Review.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Review not found" });
  await syncProductRating(doc.product);
  res.json({ message: "Review removed" });
});


const canReview = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    user: req.user._id,
    orderStatus: "Delivered",
    "items.product": req.params.productId,
  });

  res.json({
    canReview: !!order,
  });
});



// @route GET /api/reviews
// Admin - Get all reviews
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate("user", "fullName email")
    .populate("product", "productName images")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: reviews.length,
    reviews,
  });
});

// @route PUT /api/reviews/:id/status
// Admin - Approve / Hide review
const updateReviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  review.status = status;
  await review.save();

  res.json({
    success: true,
    message: "Review status updated",
    review,
  });
});

module.exports = {
  addReview,
  reviewsForProduct,
  updateReview,
  removeReview,
  canReview,
  getAllReviews,
  updateReviewStatus,
};