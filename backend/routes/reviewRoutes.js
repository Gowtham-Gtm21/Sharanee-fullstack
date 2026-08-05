const express = require("express");
const router = express.Router();

const {
    addReview,
    reviewsForProduct,
    updateReview,
    removeReview,
    canReview,
    getAllReviews,
    updateReviewStatus,
} = require("../controllers/reviewController");

const { protect, admin } = require("../middleware/auth");

// ---------- Admin ----------
router.get("/", protect, admin, getAllReviews);
router.put("/:id/status", protect, admin, updateReviewStatus);

// ---------- Customer ----------
router.post("/", protect, addReview);
router.get("/can-review/:productId", protect, canReview);
router.get("/:productId", reviewsForProduct);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, removeReview);

module.exports = router;