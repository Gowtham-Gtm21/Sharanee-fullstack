// Catches 404s for unknown routes
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// Central error handler. Any `next(err)` or thrown error inside an
// async route (wrapped by asyncHandler) ends up here.
const errorHandler = (err, req, res, next) => {
  let status = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Server error";

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    status = 404;
    message = "Resource not found";
  }
  // Mongoose duplicate key
  if (err.code === 11000) {
    status = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for field: ${field}`;
  }
  // Mongoose validation error
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  res.status(status).json({
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
