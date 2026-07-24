const asyncHandler = require("../utils/asyncHandler");
const Setting = require("../models/Setting");

exports.getSettings = asyncHandler(async (req, res) => {

  let settings = await Setting.findOne();

  if (!settings) {
    settings = await Setting.create({});
  }

  res.json({ success: true, settings });

});

exports.updateSettings = asyncHandler(async (req, res) => {

  let settings = await Setting.findOne();

  if (!settings) {
    settings = new Setting(req.body);
  }
  else {
    Object.assign(settings, req.body);
  }

  await settings.save();

  res.json({
    success: true,
    message: "Settings Updated",
    settings
  });

});