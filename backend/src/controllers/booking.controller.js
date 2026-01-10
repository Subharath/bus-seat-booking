const prisma = require("../prisma");

// VIEW ALL ROUTES
exports.getRoutes = async (req, res) => {
  const routes = await prisma.route.findMany();
  res.json(routes);
};

// VIEW SCHEDULES FOR A ROUTE
exports.getSchedulesByRoute = async (req, res) => {
  const { routeId } = req.params;

  const schedules = await prisma.schedule.findMany({
    where: { routeId: Number(routeId) },
    include: {
      bus: { include: { seats: true } },
      route: true,
    },
  });

  res.json(schedules);
};

// GET AVAILABLE SEATS FOR A SCHEDULE
exports.getAvailableSeats = async (req, res) => {
  const { scheduleId } = req.params;

  const bookedSeats = await prisma.booking.findMany({
    where: {
      scheduleId: Number(scheduleId),
      status: "CONFIRMED",
    },
    select: { seatId: true },
  });

  const bookedSeatIds = bookedSeats.map(b => b.seatId);

  const seats = await prisma.seat.findMany({
    where: {
      bus: {
        schedules: {
          some: { id: Number(scheduleId) },
        },
      },
      id: { notIn: bookedSeatIds },
    },
  });

  res.json(seats);
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



// CANCEL BOOKING
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

    // Check if user owns the booking or is an admin
    if (booking.userId !== userId && userRole !== "ADMIN") {
      return res.status(403).json({
        message: "You can only cancel your own bookings",
      });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        message: "Booking already cancelled",
      });
    }

    await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: { status: "CANCELLED" },
    });

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
