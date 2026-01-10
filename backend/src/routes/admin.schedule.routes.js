const express = require("express");
const router = express.Router();
const adminOnly = require("../middleware/adminOnly");
const scheduleController = require("../controllers/schedule.controller");

router.post("/", ...adminOnly, scheduleController.createSchedule);
router.get("/", ...adminOnly, scheduleController.getSchedules);

module.exports = router;
