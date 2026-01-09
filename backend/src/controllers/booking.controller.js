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
  const { userId, seatId, scheduleId } = req.body;

  try {
    // 1. Check schedule exists
    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(scheduleId) },
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // 2. Check seat exists
    const seat = await prisma.seat.findUnique({
      where: { id: Number(seatId) },
    });

    if (!seat) {
      return res.status(404).json({ message: "Seat not found" });
    }

    // 3. Ensure seat belongs to the bus used in this schedule
    if (seat.busId !== schedule.busId) {
      return res.status(400).json({
        message: "Seat does not belong to this schedule's bus",
      });
    }

    // 4. Check if seat already booked for this schedule
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

    // 5. Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: Number(userId),
        seatId: Number(seatId),
        scheduleId: Number(scheduleId),
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};



// CANCEL BOOKING
exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id: Number(bookingId) },
  });

  if (!booking) {
    return res.status(404).json({
      message: "Booking not found",
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
};
