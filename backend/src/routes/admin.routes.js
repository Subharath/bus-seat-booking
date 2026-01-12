const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const authenticate = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const {
  busValidation,
  routeValidation,
  scheduleValidation,
} = require("../middleware/validators");

// ==================== BUSES ====================
router.post("/buses", adminOnly, busValidation, adminController.createBus);
router.get("/buses", adminOnly, adminController.getBuses);
router.get("/buses/:id", adminOnly, adminController.getBusById);
router.put("/buses/:id", adminOnly, busValidation, adminController.updateBus);
router.delete("/buses/:id", adminOnly, adminController.deleteBus);

// ==================== ROUTES ====================
router.post("/routes", adminOnly, routeValidation, adminController.createRoute);
router.get("/routes", adminOnly, adminController.getRoutes);
router.get("/routes/:id", adminOnly, adminController.getRouteById);
router.put("/routes/:id", adminOnly, routeValidation, adminController.updateRoute);
router.delete("/routes/:id", adminOnly, adminController.deleteRoute);

// ==================== SCHEDULES ====================
router.post(
  "/schedules",
  adminOnly,
  scheduleValidation,
  adminController.createSchedule
);
router.get("/schedules", adminOnly, adminController.getSchedules);
router.get("/schedules/:id", adminOnly, adminController.getScheduleById);
router.put(
  "/schedules/:id",
  adminOnly,
  scheduleValidation,
  adminController.updateSchedule
);
router.delete("/schedules/:id", adminOnly, adminController.deleteSchedule);

// ==================== BOOKINGS ====================
router.get("/bookings", adminOnly, adminController.getAllBookings);
router.get("/bookings/:id", adminOnly, adminController.getBookingById);
router.delete("/bookings/:id", adminOnly, adminController.deleteBooking);

// ==================== BOOKING CANCELLATIONS ====================
router.get("/cancellations/pending", adminOnly, adminController.getPendingCancellations);
router.get("/cancellations", adminOnly, adminController.getAllCancellations);
router.post("/cancellations/:bookingId/approve", adminOnly, adminController.approveCancellation);
router.post("/cancellations/:bookingId/reject", adminOnly, adminController.rejectCancellation);

// ==================== DASHBOARD ====================
router.get(
  "/dashboard/stats",
  adminOnly,
  adminController.getDashboardStats
);

module.exports = router;