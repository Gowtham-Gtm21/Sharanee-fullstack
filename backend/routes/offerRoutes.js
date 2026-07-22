const express = require("express");
const router = express.Router();
const {
  activeOffers,
  allOffers,
  createOffer,
  updateOffer,
  removeOffer,
} = require("../controllers/offerController");
const { protect, admin } = require("../middleware/auth");

router.get("/active", activeOffers);
router.get("/", protect, admin, allOffers);
router.post("/", protect, admin, createOffer);
router.put("/:id", protect, admin, updateOffer);
router.delete("/:id", protect, admin, removeOffer);

module.exports = router;
