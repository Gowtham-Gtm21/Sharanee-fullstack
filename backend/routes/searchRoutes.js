const express = require("express");
const router = express.Router();

const { search } = require("../controllers/searchController");
const { protect, admin } = require("../middleware/auth");

router.get("/", protect, admin, search);

module.exports = router;