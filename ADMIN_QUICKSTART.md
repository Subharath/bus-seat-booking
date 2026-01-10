# 🚀 Admin System - Quick Start Guide

## Installation & Setup (5 minutes)

### Step 1: Backend Setup ✅ COMPLETE
All backend files have been created/updated:
- Admin controller with full CRUD operations
- Admin routes with validation
- Auth controller with admin login
- Enhanced validators

### Step 2: Frontend Setup ✅ COMPLETE
All frontend files have been created/updated:
- Admin login page
- Admin dashboard with statistics
- Updated app routing

---

## 🔑 Create First Admin User

### Using Node Script
Create file `backend/scripts/create-admin.js`:

```javascript
const prisma = require("../src/prisma");
const { hashPassword } = require("../src/utils/bcrypt");

const createAdmin = async () => {
  try {
    const hashedPassword = await hashPassword("admin123");
    
    const admin = await prisma.user.create({
      data: {
        name: "System Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    
    console.log("✅ Admin created successfully!");
    console.log(`Email: ${admin.email}`);
    console.log(`Password: admin123`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
};

createAdmin();
```

Run:
```bash
cd backend
node scripts/create-admin.js
```

### Or Using Seed File
Add to `backend/prisma/seed.js`:

```javascript
// Create admin user
const adminPassword = await hashPassword("admin123");
await prisma.user.create({
  data: {
    name: "System Admin",
    email: "admin@example.com",
    password: adminPassword,
    role: "ADMIN",
  },
});
```

Run:
```bash
cd backend
npm run seed
```

---

## 🌐 Access Admin Panel

### 1. Start Backend Server
```bash
cd backend
npm install  # if not already done
npm start
# Server running on http://localhost:5000
```

### 2. Start Frontend Server
```bash
cd frontend
npm install  # if not already done
npm run dev
# Frontend running on http://localhost:3000 (or similar)
```

### 3. Login to Admin Panel
```
URL: http://localhost:3000/admin/login
Email: admin@example.com
Password: admin123
```

### 4. Access Dashboard
After login, you'll be redirected to the admin dashboard at:
```
URL: http://localhost:3000/admin/dashboard
```

---

## 📊 Dashboard Overview

The admin dashboard shows:

| Card | Shows |
|------|-------|
| 🚌 Total Buses | Number of all buses in system |
| 🗺️ Total Routes | Number of available routes |
| ⏰ Total Schedules | Number of scheduled trips |
| 📋 Total Bookings | Total bookings made |
| 👥 Active Users | Regular users (not admin) |
| 🔐 Admin Users | Number of admin accounts |

**Recent Bookings Table:**
- Shows last 10 bookings
- Displays user name, route, bus, and date

**Quick Access Buttons:**
- Manage Buses
- Manage Routes
- Manage Schedules
- View Bookings

---

## 🔧 API Endpoints Quick Reference

### Authentication
```bash
# Admin Login
POST /api/auth/admin/login
Body: { "email": "admin@example.com", "password": "admin123" }
```

### Buses
```bash
# Create Bus
POST /api/admin/buses
Headers: Authorization: Bearer {token}
Body: {
  "busNumber": "BUS001",
  "make": "Volvo",
  "model": "B7R",
  "totalSeats": 50,
  "seatLayout": {}
}

# Get All Buses
GET /api/admin/buses
Headers: Authorization: Bearer {token}

# Get Bus by ID
GET /api/admin/buses/{id}
Headers: Authorization: Bearer {token}

# Update Bus
PUT /api/admin/buses/{id}
Headers: Authorization: Bearer {token}
Body: { "busNumber": "...", ... }

# Delete Bus
DELETE /api/admin/buses/{id}
Headers: Authorization: Bearer {token}
```

### Routes
```bash
# Create Route
POST /api/admin/routes
Body: { "from": "City A", "to": "City B" }

# Get All Routes
GET /api/admin/routes

# Get Route by ID
GET /api/admin/routes/{id}

# Update Route
PUT /api/admin/routes/{id}
Body: { "from": "...", "to": "..." }

# Delete Route
DELETE /api/admin/routes/{id}
```

### Schedules
```bash
# Create Schedule
POST /api/admin/schedules
Body: {
  "date": "2026-02-01",
  "time": "10:30",
  "busId": 1,
  "routeId": 1
}

# Get All Schedules
GET /api/admin/schedules

# Get Schedule by ID
GET /api/admin/schedules/{id}

# Update Schedule
PUT /api/admin/schedules/{id}

# Delete Schedule
DELETE /api/admin/schedules/{id}
```

### Bookings
```bash
# Get All Bookings
GET /api/admin/bookings

# Get Booking by ID
GET /api/admin/bookings/{id}

# Delete Booking
DELETE /api/admin/bookings/{id}
```

### Dashboard
```bash
# Get Dashboard Stats
GET /api/admin/dashboard/stats
```

---

## 🧪 Testing with cURL

### Test Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Expected Response:
```json
{
  "message": "Admin login successful",
  "admin": {
    "id": 1,
    "name": "System Admin",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Test Dashboard Stats
```bash
curl -X GET http://localhost:5000/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create a Bus
```bash
curl -X POST http://localhost:5000/api/admin/buses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "busNumber": "BUS001",
    "make": "Volvo",
    "model": "B7R",
    "totalSeats": 50
  }'
```

---

## 🛡️ Security Notes

1. **Change Default Admin Password**
   - Login and update password after first setup
   - Use strong passwords

2. **Token Management**
   - Tokens stored in localStorage
   - Implement token refresh logic for long sessions
   - Clear tokens on logout

3. **Protected Routes**
   - All admin routes require JWT token
   - Invalid/expired tokens return 401 Unauthorized
   - Non-admin users get 403 Forbidden

4. **Input Validation**
   - All inputs validated on backend
   - Email format, phone number format checked
   - Required fields enforced

---

## 📋 Checklist for First-Time Setup

- [ ] Backend and frontend are running
- [ ] Admin user created in database
- [ ] Can access `/admin/login` page
- [ ] Can login with admin credentials
- [ ] Dashboard loads successfully
- [ ] Can see statistics cards
- [ ] Can view recent bookings
- [ ] Can navigate to management sections
- [ ] Create a test bus
- [ ] Create a test route
- [ ] Create a test schedule

---

## 🆘 Troubleshooting

### Issue: Cannot Login
- Check if admin user exists in database
- Verify email and password are correct
- Check backend server is running
- Check network/CORS settings

### Issue: Dashboard Not Loading
- Check authorization token in localStorage
- Clear localStorage and login again
- Check backend is returning stats
- Check browser console for errors

### Issue: API Returns 403 Forbidden
- Verify user role is ADMIN
- Check JWT token is valid
- Try logging out and back in

### Issue: Validation Errors
- Check input format matches requirements
- Date format should be ISO (YYYY-MM-DD)
- Time format should be HH:MM (24-hour)
- Email format should be valid email

---

## 📞 Support Information

For detailed documentation, see:
- [ADMIN_IMPLEMENTATION_COMPLETE.md](./ADMIN_IMPLEMENTATION_COMPLETE.md) - Full implementation guide
- [ADMIN_LOGIN_IMPLEMENTATION.md](./ADMIN_LOGIN_IMPLEMENTATION.md) - Detailed API reference

---

**🎉 You're all set! Admin system is ready to use.**
