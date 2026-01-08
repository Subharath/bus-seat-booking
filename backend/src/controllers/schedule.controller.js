const prisma = require("../prisma");

exports.createSchedule = async (req, res) => {
  const { busId, routeId, date, time } = req.body;

  const schedule = await prisma.schedule.create({
    data: {
      busId,
      routeId,
      date: new Date(date),
      time,
    },
  });

  res.status(201).json(schedule);
};

exports.getSchedules = async (req, res) => {
  const schedules = await prisma.schedule.findMany({
    include: {
      bus: true,
      route: true,
    },
  });

  res.json(schedules);
};
