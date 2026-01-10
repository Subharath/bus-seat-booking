# 🚀 Quick Start Guide

## Start Testing the API

### **1. Start the Server**

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:5000`

---

### **2. Run Automated Tests**

```bash
# In a new terminal
cd backend
node test-api.js
```

This will automatically test all endpoints and show you the results.

---

### **3. Manual Testing with cURL**

#### **Quick Test - Register & Book:**

```bash
# 1. Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123"}'

# 2. Copy the accessToken from response, then:
curl -X GET http://localhost:5000/api/user/routes

# 3. Get schedules (replace 1 with actual route ID)
curl http://localhost:5000/api/user/routes/1/schedules

# 4. Get available seats (replace 1 with actual schedule ID)
curl http://localhost:5000/api/user/schedules/1/seats

# 5. Book a seat (replace TOKEN, seatId, scheduleId)
curl -X POST http://localhost:5000/api/user/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"seatId":1,"scheduleId":1,"passengerName":"Test User"}'
```

---

### **4. Test with Postman**

1. Import the collection from `API_TESTING_GUIDE.md`
2. Set environment variables
3. Run requests

---

## 📋 Available Endpoints

### **Public Endpoints:**
- `GET /` - Health check
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/user/routes` - Get all routes
- `GET /api/user/routes/:id/schedules` - Get schedules
- `GET /api/user/schedules/:id/seats` - Get available seats

### **Protected Endpoints (Require Token):**
- `GET /api/auth/me` - Get current user
- `POST /api/user/bookings` - Book a seat
- `PATCH /api/user/bookings/:id/cancel` - Cancel booking

### **Admin Endpoints (Require Admin Token):**
- `GET /api/admin/buses` - Get all buses
- `POST /api/admin/buses` - Create bus
- `DELETE /api/admin/buses/:id` - Delete bus
- `GET /api/admin/routes` - Get all routes
- `POST /api/admin/routes` - Create route
- `GET /api/admin/schedules` - Get all schedules
- `POST /api/admin/schedules` - Create schedule

---

## 🔑 Getting an Admin Token

To test admin endpoints, you need to create an admin user:

1. Register a user normally
2. Update the user's role in the database:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```
3. Login again to get admin token

---

## ✅ Expected Results

After running `node test-api.js`, you should see:

```
✅ PASS - Health Check
✅ PASS - User Registration
✅ PASS - User Login
✅ PASS - Get All Routes
✅ PASS - Get Schedules by Route
✅ PASS - Get Available Seats
✅ PASS - Get Current User
✅ PASS - Book Seat
⏭️  SKIP - Get All Buses (Admin) [No admin token]
⏭️  SKIP - Create Bus (Admin) [No admin token]
```

---

## 🐛 Troubleshooting

**Server not starting?**
- Check if port 5000 is available
- Verify `.env` file exists with `DATABASE_URL`

**Tests failing?**
- Make sure server is running
- Verify database is seeded: `npx prisma db seed`
- Check database connection

**401 Unauthorized?**
- Token expired (15 minutes)
- Missing Authorization header
- Invalid token

---

**Ready to test! 🎯**
