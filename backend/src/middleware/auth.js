const { verifyAccessToken } = require("../utils/jwt");

/**
 * JWT Authentication Middleware
 * Verifies the access token and attaches user info to req.user
 */
const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access token is required",
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

module.exports = authenticate;
