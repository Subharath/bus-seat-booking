const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const authenticate = require("../middleware/auth");

// Public routes (viewing routes, schedules, seats)
router.get("/routes", bookingController.getRoutes);
router.get("/routes/:routeId/schedules", bookingController.getSchedulesByRoute);
router.get("/schedules/:scheduleId/seats", bookingController.getAvailableSeats);

// Protected routes (booking operations require authentication)
router.post("/bookings", authenticate, bookingController.bookSeat);
router.post("/bookings/:bookingId/cancel-request", authenticate, bookingController.requestCancellation);
module.exports = router;