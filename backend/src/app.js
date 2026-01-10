const cors = require("cors");
const express = require("express");
require("dotenv").config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Bus Seat Booking API running 🚍");
});

// Authentication routes
app.use("/api/auth", require("./routes/auth.routes"));

// Admin routes (protected)
app.use("/api/admin/buses", require("./routes/admin.bus.routes"));
app.use("/api/admin/routes", require("./routes/admin.route.routes"));
app.use("/api/admin/schedules", require("./routes/admin.schedule.routes"));

// User routes (public booking routes, protected user routes)
app.use("/api/user", require("./routes/user.routes"));

module.exports = app;