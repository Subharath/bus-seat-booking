# 🧪 API Testing Guide

This guide provides multiple ways to test the Bus Seat Booking API endpoints.

---

## 📋 Prerequisites

1. **Start the server:**
   ```bash
   cd backend
   npm run dev
   # or
   npm start
   ```

2. **Ensure database is seeded:**
   ```bash
   npx prisma db seed
   ```

---

## 🚀 Method 1: Automated Test Script

Run the automated test script:

```bash
cd backend
node test-api.js
```

This will test all endpoints automatically and provide a summary.

**Note:** You may need to install axios if not already installed:
```bash
npm install axios
```

---

## 🔧 Method 2: Using cURL

### **1. Health Check**
```bash
curl http://localhost:5000/
```

### **2. Register User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "TestPass123",
    "phone": "+94771234567"
  }'
```

**Save the `accessToken` and `refreshToken` from the response!**

### **3. Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "TestPass123"
  }'
```

### **4. Get Current User**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **5. Get All Routes**
```bash
curl http://localhost:5000/api/user/routes
```

### **6. Get Schedules for a Route**
```bash
# Replace ROUTE_ID with actual route ID from step 5
curl http://localhost:5000/api/user/routes/1/schedules
```

### **7. Get Available Seats**
```bash
# Replace SCHEDULE_ID with actual schedule ID from step 6
curl http://localhost:5000/api/user/schedules/1/seats
```

### **8. Book a Seat**
```bash
curl -X POST http://localhost:5000/api/user/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "seatId": 1,
    "scheduleId": 1,
    "passengerName": "John Doe",
    "phoneNumber": "+94771234567"
  }'
```

### **9. Cancel Booking**
```bash
# Replace BOOKING_ID with actual booking ID
curl -X PATCH http://localhost:5000/api/user/bookings/1/cancel \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **10. Get All Buses (Admin)**
```bash
# You need an admin token for this
curl http://localhost:5000/api/admin/buses \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

### **11. Create Bus (Admin)**
```bash
curl -X POST http://localhost:5000/api/admin/buses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -d '{
    "busNumber": "NB-5001",
    "make": "Ashok Leyland",
    "model": "Viking",
    "totalSeats": 60,
    "seatLayout": {
      "layout": "2x2",
      "rows": 15,
      "columns": 4
    }
  }'
```

---

## 📮 Method 3: Using Postman

### **Setup:**

1. **Create a new Collection:** "Bus Seat Booking API"

2. **Set Collection Variables:**
   - `base_url`: `http://localhost:5000/api`
   - `access_token`: (will be set automatically)
   - `refresh_token`: (will be set automatically)

3. **Create Environment:**
   - Create a new environment
   - Add variables: `base_url`, `access_token`, `refresh_token`

### **Request Examples:**

#### **Register User**
- **Method:** POST
- **URL:** `{{base_url}}/auth/register`
- **Body (raw JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "TestPass123",
    "phone": "+94771234567"
  }
  ```
- **Tests Tab (to save token):**
  ```javascript
  if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.accessToken);
    pm.environment.set("refresh_token", jsonData.refreshToken);
  }
  ```

#### **Get Current User**
- **Method:** GET
- **URL:** `{{base_url}}/auth/me`
- **Headers:**
  - `Authorization`: `Bearer {{access_token}}`

#### **Book Seat**
- **Method:** POST
- **URL:** `{{base_url}}/user/bookings`
- **Headers:**
  - `Authorization`: `Bearer {{access_token}}`
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
  ```json
  {
    "seatId": 1,
    "scheduleId": 1,
    "passengerName": "John Doe",
    "phoneNumber": "+94771234567"
  }
  ```

---

## 🧪 Method 4: Using REST Client (VS Code Extension)

Create a file `backend/api-tests.http`:

```http
### Variables
@baseUrl = http://localhost:5000/api
@token = YOUR_ACCESS_TOKEN_HERE

### Health Check
GET http://localhost:5000/

### Register User
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "TestPass123",
  "phone": "+94771234567"
}

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "TestPass123"
}

### Get Current User
GET {{baseUrl}}/auth/me
Authorization: Bearer {{token}}

### Get All Routes
GET {{baseUrl}}/user/routes

### Get Schedules for Route
GET {{baseUrl}}/user/routes/1/schedules

### Get Available Seats
GET {{baseUrl}}/user/schedules/1/seats

### Book Seat
POST {{baseUrl}}/user/bookings
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "seatId": 1,
  "scheduleId": 1,
  "passengerName": "John Doe",
  "phoneNumber": "+94771234567"
}

### Cancel Booking
PATCH {{baseUrl}}/user/bookings/1/cancel
Authorization: Bearer {{token}}

### Get All Buses (Admin)
GET {{baseUrl}}/admin/buses
Authorization: Bearer {{token}}

### Create Bus (Admin)
POST {{baseUrl}}/admin/buses
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "busNumber": "NB-5001",
  "make": "Ashok Leyland",
  "model": "Viking",
  "totalSeats": 60,
  "seatLayout": {
    "layout": "2x2",
    "rows": 15,
    "columns": 4
  }
}
```

---

## ✅ Expected Responses

### **Successful Registration:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Successful Booking:**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": 1,
    "bookingId": "550e8400-e29b-41d4-a716-446655440000",
    "passengerName": "John Doe",
    "phoneNumber": "+94771234567",
    "seat": {
      "seatNo": "A1"
    },
    "schedule": {
      "date": "2026-01-15T00:00:00.000Z",
      "time": "08:00 AM",
      "route": {
        "from": "Colombo",
        "to": "Kandy"
      },
      "bus": {
        "busNumber": "NB-1001",
        "make": "Ashok Leyland",
        "model": "Viking"
      }
    },
    "status": "CONFIRMED"
  }
}
```

---

## 🔍 Testing Checklist

- [ ] Health check endpoint works
- [ ] User registration works
- [ ] User login works
- [ ] Get current user (protected) works
- [ ] Get routes (public) works
- [ ] Get schedules (public) works
- [ ] Get available seats (public) works
- [ ] Book seat (protected) works
- [ ] Cancel booking (protected) works
- [ ] Get buses (admin) works
- [ ] Create bus (admin) works
- [ ] JWT token validation works
- [ ] Role-based access control works

---

## 🐛 Troubleshooting

### **401 Unauthorized**
- Check if token is included in Authorization header
- Verify token hasn't expired (15 minutes)
- Use refresh token to get new access token

### **403 Forbidden**
- Check if user has correct role (ADMIN for admin routes)
- Verify token contains correct role

### **404 Not Found**
- Check if route/schedule/seat IDs exist
- Verify database is seeded

### **500 Internal Server Error**
- Check server logs
- Verify database connection
- Check Prisma client is generated

---

## 📝 Notes

- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Admin routes require ADMIN role
- Booking routes require authentication
- Public routes (viewing) don't require authentication

---

**Happy Testing! 🚀**
