const prisma = require("../prisma");
const { validationResult } = require("express-validator");

// ==================== BUSES ====================

exports.createBus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { busNumber, make, model, seatLayout, totalSeats } = req.body;

    // Check if bus already exists
    const existingBus = await prisma.bus.findUnique({
      where: { busNumber },
    });

    if (existingBus) {
      return res.status(409).json({
        message: "Bus with this number already exists",
      });
    }

    // Generate seat layout if not provided
    let finalSeatLayout = seatLayout;
    
    if (!finalSeatLayout && totalSeats) {
      // Auto-generate layout: group remainder with last row (e.g., 14x4 + 1x5 for 61 seats)
      let fullRows = Math.floor(totalSeats / 4);
      let lastRowSeats = totalSeats % 4;
      
      // If there's a remainder, take it from a full row and add to last row
      if (lastRowSeats > 0) {
        fullRows = fullRows - 1;
        lastRowSeats = lastRowSeats + 4;
      } else {
        lastRowSeats = 4;
      }
      
      const totalRows = lastRowSeats > 0 ? fullRows + 1 : fullRows;
      const seats = [];
      let seatCount = 0;

      // Create full rows of 4 seats
      for (let row = 1; row <= fullRows; row++) {
        const rowLetter = String.fromCharCode(64 + row);
        for (let col = 1; col <= 4; col++) {
          seats.push({
            seatNo: `${rowLetter}${col}`,
            type: col === 1 || col === 4 ? "window" : "aisle",
          });
          seatCount++;
        }
      }

      // Create final row with grouped seats
      if (lastRowSeats > 0) {
        const finalRowLetter = String.fromCharCode(64 + totalRows);
        for (let col = 1; col <= lastRowSeats; col++) {
          seats.push({
            seatNo: `${finalRowLetter}${col}`,
            type: col === 1 || col === lastRowSeats ? "window" : "aisle",
          });
          seatCount++;
        }
      }

      finalSeatLayout = {
        layout: "2x2",
        rows: totalRows,
        columns: 4,
        seats: seats,
        specialSeats: {
          driver: null,
          emergency: ["A1", "A2"],
        },
      };
    }

    // Generate individual seat records from layout
    const seatCreateData = [];
    if (finalSeatLayout?.seats && Array.isArray(finalSeatLayout.seats)) {
      finalSeatLayout.seats.forEach((seat) => {
        seatCreateData.push({
          seatNo: seat.seatNo,
        });
      });
    }

    // Create bus with seats
    const bus = await prisma.bus.create({
      data: {
        busNumber,
        make: make || null,
        model: model || null,
        seatLayout: finalSeatLayout || null,
        totalSeats: totalSeats || seatCreateData.length || null,
        seats: seatCreateData.length > 0 ? {
          create: seatCreateData,
        } : undefined,
      },
      include: { seats: true },
    });

    res.status(201).json({
      message: "Bus created successfully",
      bus,
    });
  } catch (error) {
    console.error("Create bus error:", error);
    res.status(500).json({
      message: "Error creating bus",
      error: error.message,
    });
  }
};

exports.getBuses = async (req, res) => {
  try {
    const buses = await prisma.bus.findMany({
      include: {
        seats: true,
        schedules: {
          include: {
            route: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    res.status(200).json({
      message: "Buses retrieved successfully",
      count: buses.length,
      buses,
    });
  } catch (error) {
    console.error("Get buses error:", error);
    res.status(500).json({
      message: "Error fetching buses",
      error: error.message,
    });
  }
};

exports.getBusById = async (req, res) => {
  try {
    const { id } = req.params;

    const bus = await prisma.bus.findUnique({
      where: { id: Number(id) },
      include: {
        seats: true,
        schedules: {
          include: {
            route: true,
            bookings: true,
          },
        },
      },
    });

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    res.status(200).json({
      message: "Bus retrieved successfully",
      bus,
    });
  } catch (error) {
    console.error("Get bus error:", error);
    res.status(500).json({
      message: "Error fetching bus",
      error: error.message,
    });
  }
};

exports.updateBus = async (req, res) => {
  try {
    const { id } = req.params;
    const { busNumber, make, model, seatLayout, totalSeats } = req.body;

    const bus = await prisma.bus.findUnique({
      where: { id: Number(id) },
    });

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    const updatedBus = await prisma.bus.update({
      where: { id: Number(id) },
      data: {
        busNumber: busNumber || bus.busNumber,
        make: make !== undefined ? make : bus.make,
        model: model !== undefined ? model : bus.model,
        seatLayout: seatLayout !== undefined ? seatLayout : bus.seatLayout,
        totalSeats: totalSeats || bus.totalSeats,
      },
      include: {
        seats: true,
        schedules: true,
      },
    });

    res.status(200).json({
      message: "Bus updated successfully",
      bus: updatedBus,
    });
  } catch (error) {
    console.error("Update bus error:", error);
    res.status(500).json({
      message: "Error updating bus",
      error: error.message,
    });
  }
};

exports.deleteBus = async (req, res) => {
  try {
    const { id } = req.params;

    const bus = await prisma.bus.findUnique({
      where: { id: Number(id) },
    });

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    await prisma.bus.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      message: "Bus deleted successfully",
      deletedBusId: id,
    });
  } catch (error) {
    console.error("Delete bus error:", error);
    res.status(500).json({
      message: "Error deleting bus",
      error: error.message,
    });
  }
};

// ==================== ROUTES ====================

exports.createRoute = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { from, to } = req.body;

    const route = await prisma.route.create({
      data: { from, to },
      include: { schedules: true },
    });

    res.status(201).json({
      message: "Route created successfully",
      route,
    });
  } catch (error) {
    console.error("Create route error:", error);
    res.status(500).json({
      message: "Error creating route",
      error: error.message,
    });
  }
};

exports.getRoutes = async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      include: {
        schedules: {
          include: {
            bus: { include: { seats: true } },
            bookings: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    res.status(200).json({
      message: "Routes retrieved successfully",
      count: routes.length,
      routes,
    });
  } catch (error) {
    console.error("Get routes error:", error);
    res.status(500).json({
      message: "Error fetching routes",
      error: error.message,
    });
  }
};

exports.getRouteById = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await prisma.route.findUnique({
      where: { id: Number(id) },
      include: {
        schedules: {
          include: {
            bus: true,
            bookings: true,
          },
        },
      },
    });

    if (!route) {
      return res.status(404).json({
        message: "Route not found",
      });
    }

    res.status(200).json({
      message: "Route retrieved successfully",
      route,
    });
  } catch (error) {
    console.error("Get route error:", error);
    res.status(500).json({
      message: "Error fetching route",
      error: error.message,
    });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.body;

    const route = await prisma.route.findUnique({
      where: { id: Number(id) },
    });

    if (!route) {
      return res.status(404).json({
        message: "Route not found",
      });
    }

    const updatedRoute = await prisma.route.update({
      where: { id: Number(id) },
      data: {
        from: from || route.from,
        to: to || route.to,
      },
      include: { schedules: true },
    });

    res.status(200).json({
      message: "Route updated successfully",
      route: updatedRoute,
    });
  } catch (error) {
    console.error("Update route error:", error);
    res.status(500).json({
      message: "Error updating route",
      error: error.message,
    });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await prisma.route.findUnique({
      where: { id: Number(id) },
    });

    if (!route) {
      return res.status(404).json({
        message: "Route not found",
      });
    }

    await prisma.route.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      message: "Route deleted successfully",
      deletedRouteId: id,
    });
  } catch (error) {
    console.error("Delete route error:", error);
    res.status(500).json({
      message: "Error deleting route",
      error: error.message,
    });
  }
};

// ==================== SCHEDULES ====================

exports.createSchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, time, busId, routeId, ticketPrice } = req.body;

    // Verify bus and route exist
    const bus = await prisma.bus.findUnique({ where: { id: Number(busId) } });
    const route = await prisma.route.findUnique({
      where: { id: Number(routeId) },
    });

    if (!bus || !route) {
      return res.status(404).json({
        message: "Bus or Route not found",
      });
    }

    const schedule = await prisma.schedule.create({
      data: {
        date: new Date(date),
        time,
        busId: Number(busId),
        routeId: Number(routeId),
        ticketPrice: Number(ticketPrice),
      },
      include: {
        bus: true,
        route: true,
        bookings: true,
      },
    });

    res.status(201).json({
      message: "Schedule created successfully",
      schedule,
    });
  } catch (error) {
    console.error("Create schedule error:", error);
    res.status(500).json({
      message: "Error creating schedule",
      error: error.message,
    });
  }
};

exports.getSchedules = async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        bus: { include: { seats: true } },
        route: true,
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            seat: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    res.status(200).json({
      message: "Schedules retrieved successfully",
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    console.error("Get schedules error:", error);
    res.status(500).json({
      message: "Error fetching schedules",
      error: error.message,
    });
  }
};

exports.getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(id) },
      include: {
        bus: { include: { seats: true } },
        route: true,
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            seat: true,
          },
        },
      },
    });

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    res.status(200).json({
      message: "Schedule retrieved successfully",
      schedule,
    });
  } catch (error) {
    console.error("Get schedule error:", error);
    res.status(500).json({
      message: "Error fetching schedule",
      error: error.message,
    });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, busId, routeId, ticketPrice } = req.body;

    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(id) },
    });

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    const updatedSchedule = await prisma.schedule.update({
      where: { id: Number(id) },
      data: {
        date: date ? new Date(date) : schedule.date,
        time: time || schedule.time,
        busId: busId || schedule.busId,
        routeId: routeId || schedule.routeId,
        ticketPrice: ticketPrice ? Number(ticketPrice) : schedule.ticketPrice,
      },
      include: {
        bus: true,
        route: true,
        bookings: true,
      },
    });

    res.status(200).json({
      message: "Schedule updated successfully",
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error("Update schedule error:", error);
    res.status(500).json({
      message: "Error updating schedule",
      error: error.message,
    });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(id) },
    });

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    await prisma.schedule.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      message: "Schedule deleted successfully",
      deletedScheduleId: id,
    });
  } catch (error) {
    console.error("Delete schedule error:", error);
    res.status(500).json({
      message: "Error deleting schedule",
      error: error.message,
    });
  }
};

// ==================== BOOKINGS ====================

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        seat: true,
        schedule: {
          include: {
            bus: true,
            route: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "Bookings retrieved successfully",
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        seat: true,
        schedule: {
          include: {
            bus: true,
            route: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json({
      message: "Booking retrieved successfully",
      booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      message: "Error fetching booking",
      error: error.message,
    });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    await prisma.booking.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      message: "Booking deleted successfully",
      deletedBookingId: id,
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({
      message: "Error deleting booking",
      error: error.message,
    });
  }
};

// ==================== ADMIN STATS ====================

exports.getDashboardStats = async (req, res) => {
  try {
    const totalBuses = await prisma.bus.count();
    const totalRoutes = await prisma.route.count();
    const totalSchedules = await prisma.schedule.count();
    const totalBookings = await prisma.booking.count();
    const totalUsers = await prisma.user.count({
      where: { role: "USER" },
    });
    const totalAdmins = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    const recentBookings = await prisma.booking.findMany({
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        schedule: {
          include: {
            route: true,
            bus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "Dashboard stats retrieved successfully",
      stats: {
        totalBuses,
        totalRoutes,
        totalSchedules,
        totalBookings,
        totalUsers,
        totalAdmins,
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};
// ==================== BOOKING CANCELLATIONS ====================

// Get all pending cancellation requests
exports.getPendingCancellations = async (req, res) => {
  try {
    const cancellations = await prisma.booking.findMany({
      where: {
        cancellationStatus: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
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
                busNumber: true,
              },
            },
          },
        },
      },
      orderBy: {
        cancellationRequestedAt: "desc",
      },
    });

    res.status(200).json({
      message: "Pending cancellations retrieved successfully",
      count: cancellations.length,
      cancellations,
    });
  } catch (error) {
    console.error("Get pending cancellations error:", error);
    res.status(500).json({
      message: "Error fetching pending cancellations",
      error: error.message,
    });
  }
};

// Get all cancellations (pending, approved, rejected)
exports.getAllCancellations = async (req, res) => {
  try {
    const { status } = req.query;
    
    const where = status 
      ? { cancellationStatus: status }
      : { NOT: { cancellationStatus: null } };

    const cancellations = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
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
                busNumber: true,
              },
            },
          },
        },
      },
      orderBy: {
        cancellationRequestedAt: "desc",
      },
    });

    res.status(200).json({
      message: "Cancellations retrieved successfully",
      count: cancellations.length,
      cancellations,
    });
  } catch (error) {
    console.error("Get cancellations error:", error);
    res.status(500).json({
      message: "Error fetching cancellations",
      error: error.message,
    });
  }
};

// Approve cancellation request
exports.approveCancellation = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { adminNotes } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
                busNumber: true,
              },
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

    if (booking.cancellationStatus !== "PENDING") {
      return res.status(400).json({
        message: "This booking cancellation is not pending",
      });
    }

    // Update booking status to cancelled and mark cancellation as approved
    const updatedBooking = await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: {
        status: "CANCELLED",
        cancellationStatus: "APPROVED",
        cancellationApprovedAt: new Date(),
        adminNotes: adminNotes || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
                busNumber: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      message: "Cancellation request approved successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Approve cancellation error:", error);
    res.status(500).json({
      message: "Error approving cancellation",
      error: error.message,
    });
  }
};

// Reject cancellation request
exports.rejectCancellation = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
                busNumber: true,
              },
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

    if (booking.cancellationStatus !== "PENDING") {
      return res.status(400).json({
        message: "This booking cancellation is not pending",
      });
    }

    // Update booking to reject cancellation request
    const updatedBooking = await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: {
        cancellationStatus: "REJECTED",
        adminNotes: reason || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
                busNumber: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      message: "Cancellation request rejected successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Reject cancellation error:", error);
    res.status(500).json({
      message: "Error rejecting cancellation",
      error: error.message,
    });
  }
};