const cors = require("cors");
const express = require("express");
require("dotenv").config();

const app = express();

// CORS configuration - Allow multiple origins for development and production
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5173", // Vite default
];

// In production, Railway/Vercel frontend URLs will be in FRONTEND_URL
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
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
app.use("/api/admin", require("./routes/admin.routes"));

// User routes (public booking routes, protected user routes)
app.use("/api/user", require("./routes/user.routes"));

module.exports = app;