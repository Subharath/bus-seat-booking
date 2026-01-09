const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");

router.get("/routes", bookingController.getRoutes);
router.get("/routes/:routeId/schedules", bookingController.getSchedulesByRoute);
router.get("/schedules/:scheduleId/seats", bookingController.getAvailableSeats);

router.post("/bookings", bookingController.bookSeat);

router.patch("/bookings/:bookingId/cancel", bookingController.cancelBooking);



module.exports = router;
