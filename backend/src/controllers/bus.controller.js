const prisma = require("../prisma");

// CREATE BUS
exports.createBus = async (req, res) => {
  try {
    const { busNumber, make, model, seatLayout, totalSeats } = req.body;

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
