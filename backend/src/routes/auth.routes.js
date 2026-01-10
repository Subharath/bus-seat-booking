const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authenticate = require("../middleware/auth");
const {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
} = require("../middleware/validators");

// Public routes
router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);
router.post("/refresh", refreshTokenValidation, authController.refreshToken);

// Protected routes
router.get("/me", authenticate, authController.getMe);

module.exports = router;
