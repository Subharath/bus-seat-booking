const prisma = require("../prisma");

exports.createRoute = async (req, res) => {
  try {
    const { from, to } = req.body;

    const route = await prisma.route.create({
      data: { from, to },
      include: {
        schedules: {
          include: {
            bus: { include: { seats: true } },
          },
        },
      },
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

    res.json(routes);
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
            bus: { include: { seats: true } },
            bookings: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!route) {
      return res.status(404).json({
        message: "Route not found",
      });
    }

    res.json(route);
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
