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

// Payment routes
app.post("/api/payment/initiate", async (req, res) => {
  try {
    const {
      amount,
      currency,
      order_id,
      customer_name,
      customer_email,
      customer_phone,
    } = req.body;

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!amount || !currency || !order_id) {
      return res.status(400).send("Missing required fields");
    }

    // Generate a unique transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2)}`;

    // Create a payment object
    const payment = {
      amount,
      currency,
      order_id,
      customer_name,
      customer_email,
      customer_phone,
      transaction_id: transactionId,
    };

    // Debug log - keep non-sensitive only
    console.log("=== PayHere Payment Debug ===");
    console.log("Merchant ID:", merchantId);
    console.log("Order ID:", order_id);
    console.log("Amount:", amount);
    console.log("Currency:", currency);
    // console.log("Secret:", merchantSecret); // REMOVE

    // Create a signature
    const signature = crypto.createHash("md5")
      .update(JSON.stringify(payment))
      .digest("hex");

    // Send the payment request to PayHere
    const response = await axios.post(
      `https://payhere.com/api/v1/transaction`,
      {
        amount,
        currency,
        order_id,
        customer_name,
        customer_email,
        customer_phone,
        transaction_id: transactionId,
        signature,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      data: {
        transaction_id: transactionId,
        payment_url: response.data.payment_url,
      },
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).send("Payment initiation failed");
  }
});

app.post("/api/payment/notify", async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    } = req.body;

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    if (merchant_id !== merchantId) {
      return res.status(400).send("Invalid merchant");
    }

    // ...existing checksum verification + status updates...
  } catch (error) {
    // ...existing code...
  }
});