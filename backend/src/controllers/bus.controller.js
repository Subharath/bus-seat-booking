const prisma = require("../prisma");

// CREATE BUS
exports.createBus = async (req, res) => {
  try {
    const { busNumber } = req.body;

    const bus = await prisma.bus.create({
      data: { busNumber },
    });

    res.status(201).json(bus);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET ALL BUSES
exports.getBuses = async (req, res) => {
  const buses = await prisma.bus.findMany({
    include: { seats: true },
  });
  res.json(buses);
};

// DELETE BUS
exports.deleteBus = async (req, res) => {
  const { id } = req.params;

  await prisma.bus.delete({
    where: { id: Number(id) },
  });

  res.json({ message: "Bus deleted" });
};
