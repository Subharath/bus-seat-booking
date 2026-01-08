module.exports = (req, res, next) => {
  const isAdmin = true; // TEMP (Day 5 → JWT)

  if (!isAdmin) {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};
