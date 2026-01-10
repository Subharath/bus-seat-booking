const express = require("express");
const router = express.Router();
const adminOnly = require("../middleware/adminOnly");
const busController = require("../controllers/bus.controller");

router.post("/", ...adminOnly, busController.createBus);
router.get("/", ...adminOnly, busController.getBuses);
router.delete("/:id", ...adminOnly, busController.deleteBus);

module.exports = router;
