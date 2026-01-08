const cors = require("cors");
const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bus Seat Booking API running 🚍");
});

module.exports = app;