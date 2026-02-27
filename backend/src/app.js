const cors = require("cors");
const express = require("express");
require("dotenv").config();

const app = express();

// CORS configuration - Allow multiple localhost ports for development
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5173", // Vite default
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false })); // PayHere notify_url sends x-www-form-urlencoded

// Health check
app.get("/", (req, res) => {
  res.send("Bus Seat Booking API running 🚍");
});

// Authentication routes
app.use("/api/auth", require("./routes/auth.routes"));

// Admin routes (protected)
app.use("/api/admin", require("./routes/admin.routes"));

// User routes (public booking routes, protected user routes)
app.use("/api/user", require("./routes/user.routes"));

// Payment routes
app.use("/api/payment", require("./routes/payment.routes"));

module.exports = app;