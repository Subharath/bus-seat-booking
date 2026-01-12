const authenticate = require("./auth");

/**
 * Admin Only Middleware
 * Requires authentication AND admin role
 * Combines both authentication and authorization checks
 */
const adminOnly = (req, res, next) => {
  // First check: Authentication
  // Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access token is required",
    });
  }

  // Extract and verify token
  try {
    const { verifyAccessToken } = require("../utils/jwt");
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const decoded = verifyAccessToken(token);
    req.user = decoded;
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  // Second check: Authorization (Admin role)
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};

module.exports = adminOnly;
