const prisma = require("../prisma");

exports.createRoute = async (req, res) => {
  const { from, to } = req.body;

  const route = await prisma.route.create({
    data: { from, to },
  });

  res.status(201).json(route);
};

exports.getRoutes = async (req, res) => {
  const routes = await prisma.route.findMany();
  res.json(routes);
};
