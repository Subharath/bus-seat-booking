const prisma = require("../prisma");
const { validationResult } = require("express-validator");

exports.createSchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { busId, routeId, date, time } = req.body;

    // Verify bus and route exist
    const bus = await prisma.bus.findUnique({ where: { id: Number(busId) } });
    const route = await prisma.route.findUnique({ where: { id: Number(routeId) } });

    if (!bus || !route) {
      return res.status(404).json({
        message: "Bus or Route not found",
      });
    }

    // Verify bus has seats
    if (!bus.seatLayout || !bus.totalSeats) {
      return res.status(400).json({
        message: "Bus must have seat configuration before creating schedules",
      });
    }

    const schedule = await prisma.schedule.create({
      data: {
        busId: Number(busId),
        routeId: Number(routeId),
        date: new Date(date),
        time,
      },
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
              },
            },
            seat: true,
          },
        },
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
              },
            },
            seat: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    res.json(schedules);
  } catch (error) {
    console.error("Get schedules error:", error);
    res.status(500).json({
      message: "Error fetching schedules",
      error: error.message,
    });
  }
};

exports.getSchedulesByRoute = async (req, res) => {
  try {
    const { routeId } = req.params;

    const schedules = await prisma.schedule.findMany({
      where: { routeId: Number(routeId) },
      include: {
        bus: { include: { seats: true } },
        route: true,
      },
      orderBy: { date: "asc" },
    });

    res.json(schedules);
  } catch (error) {
    console.error("Get schedules by route error:", error);
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

    res.json(schedule);
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
    const { date, time, busId, routeId } = req.body;

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
      },
      include: {
        bus: { include: { seats: true } },
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
