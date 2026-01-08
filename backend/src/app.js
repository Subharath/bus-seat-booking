const cors = require("cors");
const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());

// Admin routes
app.use("/admin/buses", require("./routes/admin.bus.routes"));
app.use("/admin/routes", require("./routes/admin.route.routes"));
app.use("/admin/schedules", require("./routes/admin.schedule.routes"));

app.get("/", (req, res) => {
  res.send("Bus Seat Booking API running 🚍");
});

module.exports = app;