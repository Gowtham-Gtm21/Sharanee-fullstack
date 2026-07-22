const express = require("express");
const router = express.Router();
const { createReturn, myReturns, allReturns, updateReturnStatus } = require("../controllers/returnController");
const { protect, admin } = require("../middleware/auth");

router.post("/", protect, createReturn);
router.get("/", protect, admin, allReturns);
router.get("/:userId", protect, myReturns);
router.put("/:id", protect, admin, updateReturnStatus);

module.exports = router;
