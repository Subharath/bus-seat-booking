const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const authenticate = require("../middleware/auth");

/**
 * @swagger
 * /api/user/routes:
 *   get:
 *     summary: Get all available routes
 *     tags: [Routes]
 *     responses:
 *       200:
 *         description: List of all routes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   origin:
 *                     type: string
 *                   destination:
 *                     type: string
 *                   distance:
 *                     type: number
 */
router.get("/routes", bookingController.getRoutes);

/**
 * @swagger
 * /api/user/routes/{routeId}/schedules:
 *   get:
 *     summary: Get schedules for a specific route
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Route ID
 *     responses:
 *       200:
 *         description: List of schedules for the route
 */
router.get("/routes/:routeId/schedules", bookingController.getSchedulesByRoute);

/**
 * @swagger
 * /api/user/schedules/{scheduleId}/seats:
 *   get:
 *     summary: Get available seats for a schedule
 *     tags: [Seats]
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Schedule ID
 *     responses:
 *       200:
 *         description: List of available seats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schedule:
 *                   type: object
 *                 seats:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/schedules/:scheduleId/seats", bookingController.getAvailableSeats);

/**
 * @swagger
 * /api/user/bookings:
 *   post:
 *     summary: Book a seat
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scheduleId
 *               - seatNumbers
 *             properties:
 *               scheduleId:
 *                 type: integer
 *               seatNumbers:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Booking successful
 *       400:
 *         description: Invalid request or seats unavailable
 *       401:
 *         description: Unauthorized
 */
router.post("/bookings", authenticate, bookingController.bookSeat);

/**
 * @swagger
 * /api/user/bookings/{bookingId}/cancel-request:
 *   post:
 *     summary: Request cancellation for a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Cancellation request submitted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.post("/bookings/:bookingId/cancel-request", authenticate, bookingController.requestCancellation);

module.exports = router;