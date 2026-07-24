const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const asyncHandler = require("../utils/asyncHandler");
const Notification = require("../models/Notification");
// @route  POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Full name, email and password are required" });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(400).json({ message: "An account with this email already exists" });
  }
  const user = await User.create({ fullName, email, phone, password });

  await Notification.create({
    title: "👤 New Customer",
    message: `${user.fullName} has registered successfully.`,
  });

  res.status(201).json({
    message: "Registration successful",
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });

});

// @route  POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    token: generateToken(user._id),
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

// @route  POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() });

  // Always respond the same way whether or not the account exists,
  // so we don't leak which emails are registered.
  if (!user) {
    return res.json({ message: "If that email exists, a reset link has been sent." });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: "Sharanee — Reset your password",
    html: `<p>Hello ${user.fullName},</p>
           <p>Click the link below to reset your password. This link expires in 30 minutes.</p>
           <p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  res.json({ message: "If that email exists, a reset link has been sent." });
});

// @route  PUT /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    return res.status(400).json({ message: "Reset link is invalid or has expired" });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password reset successful. Please sign in." });
});

// @route  GET /api/auth/profile
const profile = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, forgotPassword, resetPassword, profile };
