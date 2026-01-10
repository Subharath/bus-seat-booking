const prisma = require("../prisma");

// CREATE BUS
exports.createBus = async (req, res) => {
  try {
    const { busNumber, make, model, seatLayout, totalSeats } = req.body;

    const bus = await prisma.bus.create({
      data: {
        busNumber,
        make: make || null,
        model: model || null,
        seatLayout: seatLayout || null,
        totalSeats: totalSeats || null,
      },
    });

    res.status(201).json(bus);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET ALL BUSES
exports.getBuses = async (req, res) => {
  try {
    const buses = await prisma.bus.findMany({
      include: { seats: true },
      orderBy: { id: "desc" },
    });
    res.json(buses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE BUS
exports.deleteBus = async (req, res) => {
  const { id } = req.params;

  await prisma.bus.delete({
    where: { id: Number(id) },
  });

  res.json({ message: "Bus deleted" });
};
