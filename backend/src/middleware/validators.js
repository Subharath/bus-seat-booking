const { body } = require("express-validator");

// Validation rules for user registration

exports.registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),
];

//Validation rules for user login

exports.loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// Validation rules for refresh token

exports.refreshTokenValidation = [
  body("refreshToken")
    .notEmpty()
    .withMessage("Refresh token is required"),
];

// ==================== ADMIN VALIDATORS ====================

// Bus validators
exports.busValidation = [
  body("busNumber")
    .trim()
    .notEmpty()
    .withMessage("Bus number is required")
    .matches(/^[A-Z0-9]{2}-\d{4}$/)
    .withMessage("Bus number must be in format: XX-XXXX (e.g., AB-1234 or 12-5678)"),
  body("make")
    .trim()
    .notEmpty()
    .withMessage("Make is required"),
  body("model")
    .trim()
    .notEmpty()
    .withMessage("Model is required"),
  body("totalSeats")
    .notEmpty()
    .withMessage("Total seats is required")
    .isInt({ min: 2, max: 999 })
    .withMessage("Total seats must be a number between 2 and 999"),
];

// Route validators
exports.routeValidation = [
  body("from")
    .trim()
    .notEmpty()
    .withMessage("From location is required"),
  body("to")
    .trim()
    .notEmpty()
    .withMessage("To location is required"),
];

// Schedule validators
exports.scheduleValidation = [
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Invalid date format"),
  body("time")
    .notEmpty()
    .withMessage("Time is required")
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Time must be in HH:MM format"),
  body("busId")
    .notEmpty()
    .isInt()
    .withMessage("Valid bus ID is required"),
  body("routeId")
    .notEmpty()
    .isInt()
    .withMessage("Valid route ID is required"),
  body("ticketPrice")
    .notEmpty()
    .withMessage("Ticket price is required")
    .isInt({ min: 1 })
    .withMessage("Ticket price must be a positive number"),
];
