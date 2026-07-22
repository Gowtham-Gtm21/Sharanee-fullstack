const express = require("express");
const router = express.Router();
const { addToCart, getCart, updateQty, removeFromCart } = require("../controllers/cartController");
const { protect } = require("../middleware/auth");

router.post("/", protect, addToCart);
router.get("/:userId", protect, getCart);
router.put("/:id", protect, updateQty);
router.delete("/:id", protect, removeFromCart);

module.exports = router;
