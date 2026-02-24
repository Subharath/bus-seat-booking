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

/**
 * @swagger
 * /api/admin/buses:
 *   post:
 *     summary: Create a new bus
 *     tags: [Admin - Buses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - busNumber
 *               - capacity
 *             properties:
 *               busNumber:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bus created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post("/buses", adminOnly, busValidation, adminController.createBus);

/**
 * @swagger
 * /api/admin/buses:
 *   get:
 *     summary: Get all buses
 *     tags: [Admin - Buses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all buses
 */
router.get("/buses", adminOnly, adminController.getBuses);

/**
 * @swagger
 * /api/admin/buses/{id}:
 *   get:
 *     summary: Get bus by ID
 *     tags: [Admin - Buses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bus details
 */
router.get("/buses/:id", adminOnly, adminController.getBusById);

/**
 * @swagger
 * /api/admin/buses/{id}:
 *   put:
 *     summary: Update bus
 *     tags: [Admin - Buses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Bus updated
 */
router.put("/buses/:id", adminOnly, busValidation, adminController.updateBus);

/**
 * @swagger
 * /api/admin/buses/{id}:
 *   delete:
 *     summary: Delete bus
 *     tags: [Admin - Buses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bus deleted
 */
router.delete("/buses/:id", adminOnly, adminController.deleteBus);

// ==================== ROUTES ====================

/**
 * @swagger
 * /api/admin/routes:
 *   post:
 *     summary: Create a new route
 *     tags: [Admin - Routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origin
 *               - destination
 *               - distance
 *             properties:
 *               origin:
 *                 type: string
 *               destination:
 *                 type: string
 *               distance:
 *                 type: number
 *     responses:
 *       201:
 *         description: Route created successfully
 */
router.post("/routes", adminOnly, routeValidation, adminController.createRoute);

/**
 * @swagger
 * /api/admin/routes:
 *   get:
 *     summary: Get all routes
 *     tags: [Admin - Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all routes
 */
router.get("/routes", adminOnly, adminController.getRoutes);

/**
 * @swagger
 * /api/admin/routes/{id}:
 *   get:
 *     summary: Get route by ID
 *     tags: [Admin - Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Route details
 */
router.get("/routes/:id", adminOnly, adminController.getRouteById);

/**
 * @swagger
 * /api/admin/routes/{id}:
 *   put:
 *     summary: Update route
 *     tags: [Admin - Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Route updated
 */
router.put("/routes/:id", adminOnly, routeValidation, adminController.updateRoute);

/**
 * @swagger
 * /api/admin/routes/{id}:
 *   delete:
 *     summary: Delete route
 *     tags: [Admin - Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Route deleted
 */
router.delete("/routes/:id", adminOnly, adminController.deleteRoute);

// ==================== SCHEDULES ====================

/**
 * @swagger
 * /api/admin/schedules:
 *   post:
 *     summary: Create a new schedule
 *     tags: [Admin - Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Schedule created successfully
 */
router.post(
  "/schedules",
  adminOnly,
  scheduleValidation,
  adminController.createSchedule
);

/**
 * @swagger
 * /api/admin/schedules:
 *   get:
 *     summary: Get all schedules
 *     tags: [Admin - Schedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all schedules
 */
router.get("/schedules", adminOnly, adminController.getSchedules);

/**
 * @swagger
 * /api/admin/schedules/{id}:
 *   get:
 *     summary: Get schedule by ID
 *     tags: [Admin - Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Schedule details
 */
router.get("/schedules/:id", adminOnly, adminController.getScheduleById);

/**
 * @swagger
 * /api/admin/schedules/{id}:
 *   put:
 *     summary: Update schedule
 *     tags: [Admin - Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Schedule updated
 */
router.put(
  "/schedules/:id",
  adminOnly,
  scheduleValidation,
  adminController.updateSchedule
);

/**
 * @swagger
 * /api/admin/schedules/{id}:
 *   delete:
 *     summary: Delete schedule
 *     tags: [Admin - Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Schedule deleted
 */
router.delete("/schedules/:id", adminOnly, adminController.deleteSchedule);

// ==================== BOOKINGS ====================

/**
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Admin - Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings
 */
router.get("/bookings", adminOnly, adminController.getAllBookings);

/**
 * @swagger
 * /api/admin/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Admin - Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking details
 */
router.get("/bookings/:id", adminOnly, adminController.getBookingById);

/**
 * @swagger
 * /api/admin/bookings/{id}:
 *   delete:
 *     summary: Delete booking
 *     tags: [Admin - Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking deleted
 */
router.delete("/bookings/:id", adminOnly, adminController.deleteBooking);

// ==================== BOOKING CANCELLATIONS ====================

/**
 * @swagger
 * /api/admin/cancellations/pending:
 *   get:
 *     summary: Get pending cancellation requests
 *     tags: [Admin - Cancellations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending cancellations
 */
router.get("/cancellations/pending", adminOnly, adminController.getPendingCancellations);

/**
 * @swagger
 * /api/admin/cancellations:
 *   get:
 *     summary: Get all cancellations
 *     tags: [Admin - Cancellations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all cancellations
 */
router.get("/cancellations", adminOnly, adminController.getAllCancellations);

/**
 * @swagger
 * /api/admin/cancellations/{bookingId}/approve:
 *   post:
 *     summary: Approve a cancellation request
 *     tags: [Admin - Cancellations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cancellation approved
 */
router.post("/cancellations/:bookingId/approve", adminOnly, adminController.approveCancellation);

/**
 * @swagger
 * /api/admin/cancellations/{bookingId}/reject:
 *   post:
 *     summary: Reject a cancellation request
 *     tags: [Admin - Cancellations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cancellation rejected
 */
router.post("/cancellations/:bookingId/reject", adminOnly, adminController.rejectCancellation);

// ==================== DASHBOARD ====================

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin - Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
router.get(
  "/dashboard/stats",
  adminOnly,
  adminController.getDashboardStats
);

module.exports = router;