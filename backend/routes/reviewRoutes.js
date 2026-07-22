const express = require("express");
const router = express.Router();
const { addReview, reviewsForProduct, updateReview, removeReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

router.post("/", protect, addReview);
router.get("/:productId", reviewsForProduct);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, removeReview);

module.exports = router;
