const Setting = require("../models/Setting");
const asyncHandler = require("../utils/asyncHandler");

// Settings is a singleton document — create it on first access.
const getOrCreateSettings = async () => {
  let settings = await Setting.findOne();
  if (!settings) settings = await Setting.create({});
  return settings;
};

// @route  GET /api/settings
const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json({ settings });
});

// @route  PUT /api/settings  (admin)
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  Object.assign(settings, req.body);
  await settings.save();
  res.json({ settings });
});

module.exports = { getSettings, updateSettings };
