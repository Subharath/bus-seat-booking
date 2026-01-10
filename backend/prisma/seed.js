const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Clear existing data (optional - comment out if you want to keep existing data)
  await prisma.booking.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.route.deleteMany();

  // Example Seat Layout 1: Standard 2x2 Layout (15 rows, 4 columns = 60 seats)
  const standardSeatLayout = {
    layout: "2x2",
    rows: 15,
    columns: 4,
    seats: [],
    specialSeats: {
      driver: null,
      emergency: ["A1", "A2"],
    },
  };

  // Generate seats for standard layout
  const standardSeats = [];
  for (let row = 1; row <= 15; row++) {
    const rowLetter = String.fromCharCode(64 + row); // A, B, C, ...
    standardSeats.push(
      { seatNo: `${rowLetter}1`, type: "window" },
      { seatNo: `${rowLetter}2`, type: "aisle" },
      { seatNo: `${rowLetter}3`, type: "aisle" },
      { seatNo: `${rowLetter}4`, type: "window" }
    );
  }
  standardSeatLayout.seats = standardSeats;

  // Bus 1: Standard AC Bus (2x2 layout)
  const bus1 = await prisma.bus.create({
    data: {
      busNumber: "NB-1001",
      make: "Ashok Leyland",
      model: "Viking",
      seatLayout: standardSeatLayout,
      totalSeats: 60,
      seats: {
        create: standardSeats.map((s) => ({ seatNo: s.seatNo })),
      },
    },
  });

  // Example Seat Layout 2: Luxury 2x1 Layout (20 rows, 2 columns = 40 seats)
  const luxurySeatLayout = {
    layout: "2x1",
    rows: 20,
    columns: 2,
    seats: [],
    specialSeats: {
      driver: null,
      emergency: ["A1", "A2"],
    },
  };

  const luxurySeats = [];
  for (let row = 1; row <= 20; row++) {
    const rowLetter = String.fromCharCode(64 + row);
    luxurySeats.push(
      { seatNo: `${rowLetter}1`, type: "window" },
      { seatNo: `${rowLetter}2`, type: "window" }
    );
  }
  luxurySeatLayout.seats = luxurySeats;

  // Bus 2: Luxury AC Bus (2x1 layout)
  const bus2 = await prisma.bus.create({
    data: {
      busNumber: "NB-2001",
      make: "Volvo",
      model: "B7R",
      seatLayout: luxurySeatLayout,
      totalSeats: 40,
      seats: {
        create: luxurySeats.map((s) => ({ seatNo: s.seatNo })),
      },
    },
  });

  // Example Seat Layout 3: High Capacity 3x2 Layout (12 rows, 6 columns = 72 seats)
  const highCapacityLayout = {
    layout: "3x2",
    rows: 12,
    columns: 6,
    seats: [],
    specialSeats: {
      driver: null,
      emergency: ["A1", "A2", "A3"],
    },
  };

  const highCapacitySeats = [];
  for (let row = 1; row <= 12; row++) {
    const rowLetter = String.fromCharCode(64 + row);
    highCapacitySeats.push(
      { seatNo: `${rowLetter}1`, type: "window" },
      { seatNo: `${rowLetter}2`, type: "aisle" },
      { seatNo: `${rowLetter}3`, type: "aisle" },
      { seatNo: `${rowLetter}4`, type: "aisle" },
      { seatNo: `${rowLetter}5`, type: "aisle" },
      { seatNo: `${rowLetter}6`, type: "window" }
    );
  }
  highCapacityLayout.seats = highCapacitySeats;

  // Bus 3: High Capacity Bus (3x2 layout)
  const bus3 = await prisma.bus.create({
    data: {
      busNumber: "NB-3001",
      make: "Tata",
      model: "Leyland",
      seatLayout: highCapacityLayout,
      totalSeats: 72,
      seats: {
        create: highCapacitySeats.map((s) => ({ seatNo: s.seatNo })),
      },
    },
  });

  // Create Routes
  const route1 = await prisma.route.create({
    data: {
      from: "Colombo",
      to: "Kandy",
    },
  });

  const route2 = await prisma.route.create({
    data: {
      from: "Colombo",
      to: "Galle",
    },
  });

  const route3 = await prisma.route.create({
    data: {
      from: "Kandy",
      to: "Nuwara Eliya",
    },
  });

  // Create Schedules
  await prisma.schedule.create({
    data: {
      date: new Date("2026-01-15"),
      time: "08:00 AM",
      busId: bus1.id,
      routeId: route1.id,
    },
  });

  await prisma.schedule.create({
    data: {
      date: new Date("2026-01-15"),
      time: "10:00 AM",
      busId: bus2.id,
      routeId: route1.id,
    },
  });

  await prisma.schedule.create({
    data: {
      date: new Date("2026-01-15"),
      time: "02:00 PM",
      busId: bus3.id,
      routeId: route2.id,
    },
  });

  await prisma.schedule.create({
    data: {
      date: new Date("2026-01-16"),
      time: "09:00 AM",
      busId: bus1.id,
      routeId: route3.id,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log(`   - Created ${await prisma.bus.count()} buses`);
  console.log(`   - Created ${await prisma.seat.count()} seats`);
  console.log(`   - Created ${await prisma.route.count()} routes`);
  console.log(`   - Created ${await prisma.schedule.count()} schedules`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
