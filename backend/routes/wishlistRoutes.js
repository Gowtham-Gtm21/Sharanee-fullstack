const express = require("express");
const router = express.Router();
const { addToWishlist, getWishlist, removeFromWishlist } = require("../controllers/wishlistController");
const { protect } = require("../middleware/auth");

router.post("/", protect, addToWishlist);
router.get("/:userId", protect, getWishlist);
router.delete("/:id", protect, removeFromWishlist);

module.exports = router;
