const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const bus = await prisma.bus.create({
    data: {
      busNumber: "NB-1001",
      seats: {
        create: [
          { seatNo: "A1" },
          { seatNo: "A2" },
          { seatNo: "A3" },
        ],
      },
    },
  });

  const route = await prisma.route.create({
    data: {
      from: "Colombo",
      to: "Kandy",
    },
  });

  await prisma.schedule.create({
    data: {
      date: new Date("2026-01-10"),
      time: "08:00 AM",
      busId: bus.id,
      routeId: route.id,
    },
  });

  console.log("Seed completed 🌱");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
