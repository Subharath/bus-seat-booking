const express = require("express");
const router = express.Router();
const adminOnly = require("../middleware/adminOnly");
const routeController = require("../controllers/route.controller");

router.post("/", ...adminOnly, routeController.createRoute);
router.get("/", ...adminOnly, routeController.getRoutes);

module.exports = router;
