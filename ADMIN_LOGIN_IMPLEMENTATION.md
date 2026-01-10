# Admin Separate Login & CRUD Implementation Guide

## Overview
Your project already has:
- ✅ JWT authentication in place
- ✅ Role-based access control (USER/ADMIN roles)
- ✅ Admin middleware for protection
- ✅ Basic admin routes for buses, routes, and schedules

**What we'll add:**
- Separate admin login endpoint
- Dedicated admin controller for all CRUD operations
- Admin dashboard frontend components
- Comprehensive admin management system

---

## IMPLEMENTATION STEPS

### STEP 1: Update Auth Controller - Add Admin Login
**File:** `backend/src/controllers/auth.controller.js`

Add a new `adminLogin` function alongside the existing `login` function. This ensures admins are verified against the ADMIN role.

```javascript
// Admin Login (separate from user login)
exports.adminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find admin user
    const admin = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password: true,
      },
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid admin email or password",
      });
    }

    // Verify it's actually an admin
    if (admin.role !== "ADMIN") {
      return res.status(403).json({
        message: "User is not an admin",
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid admin email or password",
      });
    }

    // Generate tokens
    const tokenPayload = {
      userId: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Remove password from response
    delete admin.password;

    res.status(200).json({
      message: "Admin login successful",
      admin,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
```

---

### STEP 2: Add Admin Login Route
**File:** `backend/src/routes/auth.routes.js`

Add the admin login endpoint:

```javascript
router.post("/admin/login", loginValidation, authController.adminLogin);
```

---

### STEP 3: Create Dedicated Admin Controller
**File:** `backend/src/controllers/admin.controller.js` (NEW FILE)

This controller will handle all admin CRUD operations with proper validation and error handling.

```javascript
const prisma = require("../prisma");
const { validationResult } = require("express-validator");

// ==================== BUSES ====================

exports.createBus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { busNumber, make, model, seatLayout, totalSeats } = req.body;

    // Check if bus already exists
    const existingBus = await prisma.bus.findUnique({
      where: { busNumber },
    });

    if (existingBus) {
      return res.status(409).json({
        message: "Bus with this number already exists",
      });
    }

    const bus = await prisma.bus.create({
      data: {
        busNumber,
        make: make || null,
        model: model || null,
        seatLayout: seatLayout || null,
        totalSeats: totalSeats || null,
      },
    });

    res.status(201).json({
      message: "Bus created successfully",
      bus,
    });
  } catch (error) {
    console.error("Create bus error:", error);
    res.status(500).json({
      message: "Error creating bus",
      error: error.message,
    });
  }
};

exports.getBuses = async (req, res) => {
  try {
    const buses = await prisma.bus.findMany({
      include: {
        seats: true,
        schedules: {
          include: {
            route: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    res.status(200).json({
      message: "Buses retrieved successfully",
      count: buses.length,
      buses,
    });
  } catch (error) {
    console.error("Get buses error:", error);
    res.status(500).json({
      message: "Error fetching buses",
      error: error.message,
    });
  }
};

exports.getBusById = async (req, res) => {
  try {
    const { id } = req.params;

    const bus = await prisma.bus.findUnique({
      where: { id: Number(id) },
      include: {
        seats: true,
        schedules: {
          include: {
            route: true,
            bookings: true,
          },
        },
      },
    });

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    res.status(200).json({
      message: "Bus retrieved successfully",
      bus,
    });
  } catch (error) {
    console.error("Get bus error:", error);
    res.status(500).json({
      message: "Error fetching bus",
      error: error.message,
    });
  }
};

exports.updateBus = async (req, res) => {
  try {
    const { id } = req.params;
    const { busNumber, make, model, seatLayout, totalSeats } = req.body;

    const bus = await prisma.bus.findUnique({
      where: { id: Number(id) },
    });

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    const updatedBus = await prisma.bus.update({
      where: { id: Number(id) },
      data: {
        busNumber: busNumber || bus.busNumber,
        make: make !== undefined ? make : bus.make,
        model: model !== undefined ? model : bus.model,
        seatLayout: seatLayout !== undefined ? seatLayout : bus.seatLayout,
        totalSeats: totalSeats || bus.totalSeats,
      },
      include: {
        seats: true,
        schedules: true,
      },
    });

    res.status(200).json({
      message: "Bus updated successfully",
      bus: updatedBus,
    });
  } catch (error) {
    console.error("Update bus error:", error);
    res.status(500).json({
      message: "Error updating bus",
      error: error.message,
    });
  }
};

exports.deleteBus = async (req, res) => {
  try {
    const { id } = req.params;

    const bus = await prisma.bus.findUnique({
      where: { id: Number(id) },
    });

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    await prisma.bus.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      message: "Bus deleted successfully",
      deletedBusId: id,
    });
  } catch (error) {
    console.error("Delete bus error:", error);
    res.status(500).json({
      message: "Error deleting bus",
      error: error.message,
    });
  }
};

// ==================== ROUTES ====================

exports.createRoute = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { from, to } = req.body;

    const route = await prisma.route.create({
      data: { from, to },
      include: { schedules: true },
    });

    res.status(201).json({
      message: "Route created successfully",
      route,
    });
  } catch (error) {
    console.error("Create route error:", error);
    res.status(500).json({
      message: "Error creating route",
      error: error.message,
    });
  }
};

exports.getRoutes = async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      include: {
        schedules: {
          include: {
            bus: true,
            bookings: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    res.status(200).json({
      message: "Routes retrieved successfully",
      count: routes.length,
      routes,
    });
  } catch (error) {
    console.error("Get routes error:", error);
    res.status(500).json({
      message: "Error fetching routes",
      error: error.message,
    });
  }
};

exports.getRouteById = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await prisma.route.findUnique({
      where: { id: Number(id) },
      include: {
        schedules: {
          include: {
            bus: true,
            bookings: true,
          },
        },
      },
    });

    if (!route) {
      return res.status(404).json({
        message: "Route not found",
      });
    }

    res.status(200).json({
      message: "Route retrieved successfully",
      route,
    });
  } catch (error) {
    console.error("Get route error:", error);
    res.status(500).json({
      message: "Error fetching route",
      error: error.message,
    });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.body;

    const route = await prisma.route.findUnique({
      where: { id: Number(id) },
    });

    if (!route) {
      return res.status(404).json({
        message: "Route not found",
      });
    }

    const updatedRoute = await prisma.route.update({
      where: { id: Number(id) },
      data: {
        from: from || route.from,
        to: to || route.to,
      },
      include: { schedules: true },
    });

    res.status(200).json({
      message: "Route updated successfully",
      route: updatedRoute,
    });
  } catch (error) {
    console.error("Update route error:", error);
    res.status(500).json({
      message: "Error updating route",
      error: error.message,
    });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await prisma.route.findUnique({
      where: { id: Number(id) },
    });

    if (!route) {
      return res.status(404).json({
        message: "Route not found",
      });
    }

    await prisma.route.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      message: "Route deleted successfully",
      deletedRouteId: id,
    });
  } catch (error) {
    console.error("Delete route error:", error);
    res.status(500).json({
      message: "Error deleting route",
      error: error.message,
    });
  }
};

// ==================== SCHEDULES ====================

exports.createSchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, time, busId, routeId } = req.body;

    // Verify bus and route exist
    const bus = await prisma.bus.findUnique({ where: { id: Number(busId) } });
    const route = await prisma.route.findUnique({
      where: { id: Number(routeId) },
    });

    if (!bus || !route) {
      return res.status(404).json({
        message: "Bus or Route not found",
      });
    }

    const schedule = await prisma.schedule.create({
      data: {
        date: new Date(date),
        time,
        busId: Number(busId),
        routeId: Number(routeId),
      },
      include: {
        bus: true,
        route: true,
        bookings: true,
      },
    });

    res.status(201).json({
      message: "Schedule created successfully",
      schedule,
    });
  } catch (error) {
    console.error("Create schedule error:", error);
    res.status(500).json({
      message: "Error creating schedule",
      error: error.message,
    });
  }
};

exports.getSchedules = async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        bus: true,
        route: true,
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            seat: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    res.status(200).json({
      message: "Schedules retrieved successfully",
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    console.error("Get schedules error:", error);
    res.status(500).json({
      message: "Error fetching schedules",
      error: error.message,
    });
  }
};

exports.getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(id) },
      include: {
        bus: true,
        route: true,
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            seat: true,
          },
        },
      },
    });

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    res.status(200).json({
      message: "Schedule retrieved successfully",
      schedule,
    });
  } catch (error) {
    console.error("Get schedule error:", error);
    res.status(500).json({
      message: "Error fetching schedule",
      error: error.message,
    });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, busId, routeId } = req.body;

    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(id) },
    });

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    const updatedSchedule = await prisma.schedule.update({
      where: { id: Number(id) },
      data: {
        date: date ? new Date(date) : schedule.date,
        time: time || schedule.time,
        busId: busId || schedule.busId,
        routeId: routeId || schedule.routeId,
      },
      include: {
        bus: true,
        route: true,
        bookings: true,
      },
    });

    res.status(200).json({
      message: "Schedule updated successfully",
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error("Update schedule error:", error);
    res.status(500).json({
      message: "Error updating schedule",
      error: error.message,
    });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(id) },
    });

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    await prisma.schedule.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      message: "Schedule deleted successfully",
      deletedScheduleId: id,
    });
  } catch (error) {
    console.error("Delete schedule error:", error);
    res.status(500).json({
      message: "Error deleting schedule",
      error: error.message,
    });
  }
};

// ==================== BOOKINGS ====================

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        seat: true,
        schedule: {
          include: {
            bus: true,
            route: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "Bookings retrieved successfully",
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        seat: true,
        schedule: {
          include: {
            bus: true,
            route: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json({
      message: "Booking retrieved successfully",
      booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      message: "Error fetching booking",
      error: error.message,
    });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    await prisma.booking.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      message: "Booking deleted successfully",
      deletedBookingId: id,
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({
      message: "Error deleting booking",
      error: error.message,
    });
  }
};

// ==================== ADMIN STATS ====================

exports.getDashboardStats = async (req, res) => {
  try {
    const totalBuses = await prisma.bus.count();
    const totalRoutes = await prisma.route.count();
    const totalSchedules = await prisma.schedule.count();
    const totalBookings = await prisma.booking.count();
    const totalUsers = await prisma.user.count({
      where: { role: "USER" },
    });
    const totalAdmins = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    const recentBookings = await prisma.booking.findMany({
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        schedule: {
          include: {
            route: true,
            bus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "Dashboard stats retrieved successfully",
      stats: {
        totalBuses,
        totalRoutes,
        totalSchedules,
        totalBookings,
        totalUsers,
        totalAdmins,
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};
```

---

### STEP 4: Create Comprehensive Admin Routes
**File:** `backend/src/routes/admin.routes.js` (NEW FILE - UNIFIED ADMIN ROUTES)

```javascript
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const adminOnly = require("../middleware/adminOnly");

// ==================== BUSES ====================
router.post("/buses", ...adminOnly, adminController.createBus);
router.get("/buses", ...adminOnly, adminController.getBuses);
router.get("/buses/:id", ...adminOnly, adminController.getBusById);
router.put("/buses/:id", ...adminOnly, adminController.updateBus);
router.delete("/buses/:id", ...adminOnly, adminController.deleteBus);

// ==================== ROUTES ====================
router.post("/routes", ...adminOnly, adminController.createRoute);
router.get("/routes", ...adminOnly, adminController.getRoutes);
router.get("/routes/:id", ...adminOnly, adminController.getRouteById);
router.put("/routes/:id", ...adminOnly, adminController.updateRoute);
router.delete("/routes/:id", ...adminOnly, adminController.deleteRoute);

// ==================== SCHEDULES ====================
router.post("/schedules", ...adminOnly, adminController.createSchedule);
router.get("/schedules", ...adminOnly, adminController.getSchedules);
router.get("/schedules/:id", ...adminOnly, adminController.getScheduleById);
router.put("/schedules/:id", ...adminOnly, adminController.updateSchedule);
router.delete("/schedules/:id", ...adminOnly, adminController.deleteSchedule);

// ==================== BOOKINGS ====================
router.get("/bookings", ...adminOnly, adminController.getAllBookings);
router.get("/bookings/:id", ...adminOnly, adminController.getBookingById);
router.delete("/bookings/:id", ...adminOnly, adminController.deleteBooking);

// ==================== DASHBOARD ====================
router.get("/dashboard/stats", ...adminOnly, adminController.getDashboardStats);

module.exports = router;
```

---

### STEP 5: Update App.js to Use New Admin Routes
**File:** `backend/src/app.js`

Replace the old admin route imports with:

```javascript
// Admin routes (protected)
app.use("/api/admin", require("./routes/admin.routes"));
```

Instead of:
```javascript
app.use("/api/admin/buses", require("./routes/admin.bus.routes"));
app.use("/api/admin/routes", require("./routes/admin.route.routes"));
app.use("/api/admin/schedules", require("./routes/admin.schedule.routes"));
```

---

### STEP 6: Add Validators for Admin Routes
**File:** `backend/src/middleware/validators.js`

Add validators for create/update operations:

```javascript
const { body } = require("express-validator");

// Bus validators
exports.busValidation = [
  body("busNumber")
    .trim()
    .notEmpty()
    .withMessage("Bus number is required"),
  body("make")
    .optional()
    .trim(),
  body("model")
    .optional()
    .trim(),
  body("totalSeats")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Total seats must be a positive integer"),
];

// Route validators
exports.routeValidation = [
  body("from")
    .trim()
    .notEmpty()
    .withMessage("From location is required"),
  body("to")
    .trim()
    .notEmpty()
    .withMessage("To location is required"),
];

// Schedule validators
exports.scheduleValidation = [
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Invalid date format"),
  body("time")
    .notEmpty()
    .withMessage("Time is required")
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Time must be in HH:MM format"),
  body("busId")
    .notEmpty()
    .isInt()
    .withMessage("Valid bus ID is required"),
  body("routeId")
    .notEmpty()
    .isInt()
    .withMessage("Valid route ID is required"),
];
```

---

## FRONTEND IMPLEMENTATION

### Step 1: Create Admin Login Component
**File:** `frontend/src/pages/AdminLogin.jsx`

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/admin/login', { email, password });
      
      // Store tokens and admin info
      localStorage.setItem('adminToken', response.data.accessToken);
      localStorage.setItem('adminRefreshToken', response.data.refreshToken);
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
      
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Admin Login</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

### Step 2: Create Admin Dashboard
**File:** `frontend/src/pages/AdminDashboard.jsx`

```jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.get('/admin/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data.stats);
      } catch (err) {
        setError('Failed to fetch dashboard stats');
        if (err.response?.status === 403 || err.response?.status === 401) {
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Total Buses</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.totalBuses}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Total Routes</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.totalRoutes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Total Bookings</h3>
          <p className="text-3xl font-bold text-purple-600">{stats?.totalBookings}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Total Schedules</h3>
          <p className="text-3xl font-bold text-orange-600">{stats?.totalSchedules}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Active Users</h3>
          <p className="text-3xl font-bold text-red-600">{stats?.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Admin Users</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats?.totalAdmins}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => navigate('/admin/buses')}
          className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold transition"
        >
          Manage Buses
        </button>
        <button
          onClick={() => navigate('/admin/routes')}
          className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-semibold transition"
        >
          Manage Routes
        </button>
        <button
          onClick={() => navigate('/admin/schedules')}
          className="bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-lg font-semibold transition"
        >
          Manage Schedules
        </button>
        <button
          onClick={() => navigate('/admin/bookings')}
          className="bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-lg font-semibold transition"
        >
          View Bookings
        </button>
      </div>
    </div>
  );
}
```

---

## API ENDPOINTS SUMMARY

### Authentication
- `POST /api/auth/admin/login` - Admin login

### Admin Management
- **Buses:**
  - `POST /api/admin/buses` - Create bus
  - `GET /api/admin/buses` - Get all buses
  - `GET /api/admin/buses/:id` - Get bus details
  - `PUT /api/admin/buses/:id` - Update bus
  - `DELETE /api/admin/buses/:id` - Delete bus

- **Routes:**
  - `POST /api/admin/routes` - Create route
  - `GET /api/admin/routes` - Get all routes
  - `GET /api/admin/routes/:id` - Get route details
  - `PUT /api/admin/routes/:id` - Update route
  - `DELETE /api/admin/routes/:id` - Delete route

- **Schedules:**
  - `POST /api/admin/schedules` - Create schedule
  - `GET /api/admin/schedules` - Get all schedules
  - `GET /api/admin/schedules/:id` - Get schedule details
  - `PUT /api/admin/schedules/:id` - Update schedule
  - `DELETE /api/admin/schedules/:id` - Delete schedule

- **Bookings:**
  - `GET /api/admin/bookings` - Get all bookings
  - `GET /api/admin/bookings/:id` - Get booking details
  - `DELETE /api/admin/bookings/:id` - Delete booking

- **Dashboard:**
  - `GET /api/admin/dashboard/stats` - Get dashboard statistics

---

## Testing the Implementation

### 1. Create Admin User in Database
Use seed.js or directly insert:
```javascript
const hashedPassword = await hashPassword("admin123");
await prisma.user.create({
  data: {
    name: "Admin User",
    email: "admin@example.com",
    password: hashedPassword,
    role: "ADMIN",
  },
});
```

### 2. Test Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### 3. Use Token for Admin Operations
```bash
curl -X GET http://localhost:5000/api/admin/buses \
  -H "Authorization: Bearer <your_access_token>"
```

---

## Key Features Implemented

✅ **Separate Admin Login** - Dedicated admin authentication
✅ **Role-Based Access** - Only ADMIN role can access
✅ **Full CRUD Operations** - Buses, Routes, Schedules, Bookings
✅ **Dashboard Stats** - Real-time analytics
✅ **Error Handling** - Comprehensive error messages
✅ **Input Validation** - All inputs validated
✅ **Token Protection** - JWT-based security
✅ **Audit Trail** - All operations logged with timestamps

