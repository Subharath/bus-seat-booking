const authenticate = require("./auth");

/**
 * Admin Only Middleware
 * Requires authentication AND admin role
 * Must be used after authenticate middleware
 */
const adminOnly = (req, res, next) => {
  // Check if user is authenticated (should be set by authenticate middleware)
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Check if user is admin
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};

// Export a combined middleware that does both auth and admin check
module.exports = [authenticate, adminOnly];
