const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Generate MD5 hash for PayHere payment initiation
function generatePayHereHash(merchantId, orderId, amount, currency, merchantSecret) {
  const hashedSecret = crypto
    .createHash("md5")
    .update(merchantSecret)
    .digest("hex")
    .toUpperCase();

  const hashString = `${merchantId}${orderId}${amount}${currency}${hashedSecret}`;
  return crypto
    .createHash("md5")
    .update(hashString)
    .digest("hex")
    .toUpperCase();
}

// POST /api/payment/initiate/:bookingId
exports.initiatePayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      include: {
        schedule: {
          include: {
            route: true,
          },
        },
        user: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (booking.paymentStatus === "PAID") {
      return res.status(400).json({ message: "This booking is already paid" });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ message: "Cannot pay for a cancelled booking" });
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    
    // Always generate fresh order ID
    const orderId = `BK-${booking.id}-${Date.now()}`;

    // Amount formatted correctly per PayHere docs
    const amount = parseFloat(booking.schedule.ticketPrice)
      .toLocaleString('en-us', { minimumFractionDigits: 2 })
      .replaceAll(',', '');
      
    const currency = "LKR";

    // Debug log - check these values in your terminal
    console.log("=== PayHere Payment Debug ===");
    console.log("Merchant ID:", merchantId);
    console.log("Order ID:", orderId);
    console.log("Amount:", amount);
    console.log("Currency:", currency);
    console.log("Secret:", merchantSecret);

    const hash = generatePayHereHash(merchantId, orderId, amount, currency, merchantSecret);

    console.log("Generated Hash:", hash);
    console.log("=============================");

    // Save orderId to booking
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentOrderId: orderId,
        paymentStatus: "PENDING",
      },
    });

    res.json({
      paymentData: {
        merchant_id: merchantId,
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        notify_url: `${process.env.BACKEND_URL}/api/payment/notify`,
        order_id: orderId,
        items: `Bus Ticket - ${booking.schedule.route.from} to ${booking.schedule.route.to}`,
        currency,
        amount,
        first_name: (booking.passengerName || booking.user.name).split(" ")[0],
        last_name: (booking.passengerName || booking.user.name).split(" ").slice(1).join(" ") || "-",
        email: booking.user.email,
        phone: booking.phoneNumber || booking.user.phone || "0000000000",
        address: "Sri Lanka",
        city: booking.schedule.route.from,
        country: "Sri Lanka",
        hash,
      },
      paymentUrl: process.env.PAYHERE_SANDBOX_URL,
    });
  } catch (error) {
    console.error("Initiate payment error:", error);
    res.status(500).json({ message: "Error initiating payment", error: error.message });
  }
};

// POST /api/payment/notify  (PayHere server-to-server webhook - no auth)
exports.paymentNotify = async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    } = req.body;

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    // Verify PayHere signature
    const hashedSecret = crypto
      .createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase();

    const localSig = crypto
      .createHash("md5")
      .update(
        `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`
      )
      .digest("hex")
      .toUpperCase();

    if (localSig !== md5sig) {
      console.error("❌ PayHere hash mismatch - possible fraud attempt");
      return res.status(400).send("Hash mismatch");
    }

    // Find booking by paymentOrderId
    const booking = await prisma.booking.findFirst({
      where: { paymentOrderId: order_id },
    });

    if (!booking) {
      console.error(`Booking not found for order: ${order_id}`);
      return res.status(404).send("Booking not found");
    }

    // status_code: 2=Success, 0=Pending, -1=Cancelled, -2=Failed, -3=Chargedback
    if (status_code === "2") {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: "PAID" },
      });
      console.log(`✅ Payment PAID for booking ${booking.id}`);
    } else if (status_code === "0") {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: "PENDING" },
      });
      console.log(`⏳ Payment PENDING for booking ${booking.id}`);
    } else {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: "FAILED" },
      });
      console.log(`❌ Payment FAILED for booking ${booking.id} - status: ${status_code}`);
    }

    res.send("OK");
  } catch (error) {
    console.error("Payment notify error:", error);
    res.status(500).send("Error");
  }
};

// GET /api/payment/status/:bookingId
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
    });

    if (!booking || booking.userId !== userId) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      bookingId: booking.id,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.status,
    });
  } catch (error) {
    console.error("Check payment status error:", error);
    res.status(500).json({ message: "Error checking payment status" });
  }
};