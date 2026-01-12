const prisma = require("../prisma");
const scheduleController = require("./schedule.controller");

// VIEW ALL ROUTES
exports.getRoutes = async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      include: {
        schedules: {
          include: {
            bus: { include: { seats: true } },
            bookings: {
              where: {
                status: 'CONFIRMED'
              }
            },
          },
        },
      },
    });
    res.json(routes);
  } catch (error) {
    console.error("Get routes error:", error);
    res.status(500).json({ message: "Error fetching routes" });
  }
};

// VIEW SCHEDULES FOR A ROUTE
exports.getSchedulesByRoute = async (req, res) => {
  const { routeId } = req.params;

  try {
    const schedules = await prisma.schedule.findMany({
      where: { routeId: Number(routeId) },
      include: {
        bus: { include: { seats: true } },
        route: true,
        bookings: {
          where: {
            status: 'CONFIRMED'
          }
        },
      },
      orderBy: { date: "asc" },
    });

    res.json(schedules);
  } catch (error) {
    console.error("Get schedules error:", error);
    res.status(500).json({ message: "Error fetching schedules" });
  }
};

// GET AVAILABLE SEATS FOR A SCHEDULE
exports.getAvailableSeats = async (req, res) => {
  const { scheduleId } = req.params;

  try {
    // Get the schedule with bus info
    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(scheduleId) },
      include: { bus: { include: { seats: true } } },
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    if (!schedule.bus) {
      return res.status(404).json({ message: "Bus not found for this schedule" });
    }

    // Get all seats for this bus
    const allBusSeats = await prisma.seat.findMany({
      where: { busId: schedule.bus.id },
    });

    if (allBusSeats.length === 0) {
      return res.status(400).json({ message: "No seats found for this bus. Please ensure seats are created." });
    }

    // Get booked seats for this schedule
    const bookedSeats = await prisma.booking.findMany({
      where: {
        scheduleId: Number(scheduleId),
        status: "CONFIRMED",
      },
      select: { seatId: true },
    });

    const bookedSeatIds = bookedSeats.map((b) => b.seatId);

    // Get available seats
    const availableSeats = allBusSeats.filter((seat) => !bookedSeatIds.includes(seat.id));

    res.json(availableSeats);
  } catch (err) {
    console.error("Error fetching available seats:", err);
    res.status(500).json({ message: "Error fetching available seats", error: err.message });
  }
};

// BOOK A SEAT
exports.bookSeat = async (req, res) => {
  // Get userId from authenticated user (JWT token)
  const userId = req.user.userId;
  const { seatId, scheduleId, passengerName, phoneNumber } = req.body;

  try {
    // 1. Get user info for fallback passenger name
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, phone: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Check schedule exists
    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(scheduleId) },
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // 3. Check seat exists
    const seat = await prisma.seat.findUnique({
      where: { id: Number(seatId) },
    });

    if (!seat) {
      return res.status(404).json({ message: "Seat not found" });
    }

    // 4. Ensure seat belongs to the bus used in this schedule
    if (seat.busId !== schedule.busId) {
      return res.status(400).json({
        message: "Seat does not belong to this schedule's bus",
      });
    }

    // 5. Check if seat already booked for this schedule
    const existingBooking = await prisma.booking.findFirst({
      where: {
        seatId: Number(seatId),
        scheduleId: Number(scheduleId),
        status: "CONFIRMED",
      },
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "Seat already booked",
      });
    }

    // 6. Create booking with passenger details
    const booking = await prisma.booking.create({
      data: {
        userId: Number(userId),
        seatId: Number(seatId),
        scheduleId: Number(scheduleId),
        passengerName: passengerName || user.name, // Use provided name or user's name
        phoneNumber: phoneNumber || user.phone || null, // Use provided phone or user's phone
      },
      include: {
        seat: {
          select: {
            seatNo: true,
          },
        },
        schedule: {
          include: {
            route: true,
            bus: {
              select: {
                id: true,
                busNumber: true,
                make: true,
                model: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking: {
        id: booking.id,
        bookingId: booking.bookingId, // Unique booking ID for user reference
        passengerName: booking.passengerName,
        phoneNumber: booking.phoneNumber,
        seat: booking.seat,
        schedule: booking.schedule,
        status: booking.status,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};



// REQUEST BOOKING CANCELLATION (User requests cancellation)
exports.requestCancellation = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.userId;
  const { reason } = req.body;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        seat: {
          select: { seatNo: true },
        },
        schedule: {
          include: {
            route: true,
            bus: {
              select: { busNumber: true },
            },
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Check if user owns the booking
    if (booking.userId !== userId) {
      return res.status(403).json({
        message: "You can only request cancellation for your own bookings",
      });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        message: "This booking is already cancelled",
      });
    }

    if (booking.cancellationStatus === "PENDING") {
      return res.status(400).json({
        message: "Cancellation request already pending approval",
      });
    }

    // Create cancellation request
    const updatedBooking = await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: {
        cancellationStatus: "PENDING",
        cancellationRequestedAt: new Date(),
        cancellationReason: reason || null,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        seat: {
          select: { seatNo: true },
        },
        schedule: {
          include: {
            route: true,
            bus: {
              select: { busNumber: true },
            },
          },
        },
      },
    });

    res.status(200).json({
      message: "Cancellation request submitted successfully. Awaiting admin approval.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// CANCEL BOOKING (Admin cancellation or old direct cancellation)
exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Only admin can directly cancel
    if (userRole !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can directly cancel bookings. Please request cancellation instead.",
      });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        message: "Booking already cancelled",
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: { 
        status: "CANCELLED",
        cancellationStatus: "APPROVED",
        cancellationApprovedAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        seat: {
          select: { seatNo: true },
        },
        schedule: {
          include: {
            route: true,
            bus: {
              select: { busNumber: true },
            },
          },
        },
      },
    });

    res.json({ 
      message: "Booking cancelled successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
