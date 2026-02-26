const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const authenticate = require("../middleware/auth");

// Initiate payment (user must be logged in)
router.post("/initiate/:bookingId", authenticate, paymentController.initiatePayment);

// PayHere server-to-server payment notification (PUBLIC - called by PayHere servers)
router.post("/notify", paymentController.paymentNotify);

// Check payment status (user must be logged in)
router.get("/status/:bookingId", authenticate, paymentController.checkPaymentStatus);

module.exports = router;