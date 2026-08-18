/**
 * Global error handler middleware.
 * Translates known error types into clean JSON responses.
 * Never exposes raw MongoDB internals to the client.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format.' });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res
      .status(409)
      .json({ success: false, message: `A record with that ${field} already exists.` });
  }

  // Application-level errors (thrown with a statusCode)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code || undefined,
    });
  }

  // Fallback — 500
  return res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred. Please try again.',
  });
};

module.exports = errorHandler;
