# 🔐 JWT Role-Based Access Control - Complete Explanation

## 📚 Table of Contents
1. [What is JWT?](#what-is-jwt)
2. [How JWT Works in This System](#how-jwt-works-in-this-system)
3. [Token Structure](#token-structure)
4. [Role-Based Access Control Flow](#role-based-access-control-flow)
5. [Step-by-Step Process](#step-by-step-process)
6. [Code Walkthrough](#code-walkthrough)
7. [Visual Flow Diagram](#visual-flow-diagram)

---

## 🎯 What is JWT?

**JWT (JSON Web Token)** is a compact, URL-safe token format that securely transmits information between parties. It consists of three parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJVU0VSIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Structure:**
```
[HEADER].[PAYLOAD].[SIGNATURE]
```

1. **Header**: Algorithm and token type
2. **Payload**: User data (userId, email, role)
3. **Signature**: Ensures token hasn't been tampered with

---

## 🔄 How JWT Works in This System

### **Two Types of Tokens:**

1. **Access Token** (Short-lived: 15 minutes)
   - Used for API requests
   - Contains: `userId`, `email`, `role`
   - Expires quickly for security

2. **Refresh Token** (Long-lived: 7 days)
   - Used to get new access tokens
   - Stored securely on client
   - Used when access token expires

---

## 📦 Token Structure

### **What Gets Encoded in the Token:**

When a user logs in or registers, we create a **payload** with user information:

```javascript
// From auth.controller.js (lines 53-57, 111-115)
const tokenPayload = {
  userId: user.id,        // User's ID from database
  email: user.email,       // User's email
  role: user.role          // "USER" or "ADMIN" - THIS IS KEY FOR ROLE-BASED ACCESS!
};
```

### **Example Token Payload:**

**For a Regular User:**
```json
{
  "userId": 1,
  "email": "john@example.com",
  "role": "USER"
}
```

**For an Admin:**
```json
{
  "userId": 2,
  "email": "admin@example.com",
  "role": "ADMIN"
}
```

---

## 🎭 Role-Based Access Control Flow

### **Three Levels of Access:**

1. **Public Routes** - No authentication needed
   - View routes, schedules, available seats

2. **Protected Routes** - Authentication required (any logged-in user)
   - Create bookings, cancel own bookings

3. **Admin Routes** - Authentication + Admin role required
   - Manage buses, routes, schedules

---

## 📋 Step-by-Step Process

### **Step 1: User Registration/Login**

```javascript
// User sends credentials
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**What Happens:**
1. Server verifies email and password
2. Server creates token payload with user's role:
   ```javascript
   {
     userId: 1,
     email: "john@example.com",
     role: "USER"  // ← Role is embedded here!
   }
   ```
3. Server generates two tokens:
   - Access token (15 min expiry)
   - Refresh token (7 days expiry)
4. Server sends both tokens to client

**Response:**
```json
{
  "user": { "id": 1, "name": "John", "role": "USER" },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **Step 2: Client Stores Tokens**

Frontend stores tokens (usually in localStorage or httpOnly cookies):

```javascript
localStorage.setItem('accessToken', response.data.accessToken);
localStorage.setItem('refreshToken', response.data.refreshToken);
```

---

### **Step 3: Making Protected API Requests**

When user wants to book a seat:

```javascript
// Frontend sends request with token in header
POST /api/user/bookings
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
Body: {
  "seatId": 5,
  "scheduleId": 10
}
```

---

### **Step 4: Authentication Middleware Verifies Token**

**File: `backend/src/middleware/auth.js`**

```javascript
const authenticate = (req, res, next) => {
  // 1. Extract token from header
  const authHeader = req.headers.authorization;
  // "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  
  // 2. Remove "Bearer " prefix
  const token = authHeader.substring(7);
  
  // 3. Verify token signature and expiry
  const decoded = verifyAccessToken(token);
  // Returns: { userId: 1, email: "john@example.com", role: "USER" }
  
  // 4. Attach user info to request object
  req.user = decoded;  // ← Now available in all route handlers!
  
  next(); // Continue to next middleware/route handler
};
```

**What `verifyAccessToken` does:**
```javascript
// From backend/src/utils/jwt.js (lines 35-41)
const verifyAccessToken = (token) => {
  try {
    // Verifies:
    // 1. Token signature (not tampered with)
    // 2. Token expiry (not expired)
    // 3. Secret key matches
    return jwt.verify(token, JWT_SECRET);
    // Returns decoded payload: { userId, email, role }
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};
```

---

### **Step 5: Route Handler Uses User Info**

**File: `backend/src/controllers/booking.controller.js`**

```javascript
exports.bookSeat = async (req, res) => {
  // req.user was set by authenticate middleware!
  const userId = req.user.userId;  // ← No need to send userId in body!
  const { seatId, scheduleId } = req.body;
  
  // Create booking with authenticated user's ID
  const booking = await prisma.booking.create({
    data: {
      userId: userId,  // From JWT token, not from request body
      seatId,
      scheduleId,
    },
  });
  
  res.json({ booking });
};
```

---

### **Step 6: Admin Routes - Role Check**

**For Admin Routes (e.g., Create Bus):**

**File: `backend/src/routes/admin.bus.routes.js`**
```javascript
router.post("/", ...adminOnly, busController.createBus);
//          ↑
//    Spreads array: [authenticate, adminOnly]
```

**What `adminOnly` does:**

**File: `backend/src/middleware/adminOnly.js`**

```javascript
const adminOnly = (req, res, next) => {
  // req.user was already set by authenticate middleware
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  // Check the role from JWT token!
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access only" });
    // 403 = Forbidden (authenticated but not authorized)
  }
  
  next(); // User is admin, allow access
};
```

**Flow:**
1. `authenticate` middleware runs first → sets `req.user = { userId, email, role }`
2. `adminOnly` middleware runs second → checks `req.user.role === "ADMIN"`
3. If both pass → route handler executes
4. If role is "USER" → returns 403 Forbidden

---

## 🔍 Code Walkthrough

### **1. Token Generation (Login/Register)**

**File: `backend/src/controllers/auth.controller.js`**

```javascript
// After successful login (lines 110-118)
const tokenPayload = {
  userId: user.id,      // 1
  email: user.email,    // "john@example.com"
  role: user.role,      // "USER" or "ADMIN" ← CRITICAL!
};

const accessToken = generateAccessToken(tokenPayload);
// ↑ Creates JWT with role embedded inside
```

**File: `backend/src/utils/jwt.js`**

```javascript
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "15m"  // Token expires in 15 minutes
  });
  // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
};
```

---

### **2. Token Verification (Every Protected Request)**

**File: `backend/src/middleware/auth.js`**

```javascript
const authenticate = (req, res, next) => {
  // Step 1: Get token from Authorization header
  const authHeader = req.headers.authorization;
  // Example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access token is required" });
  }
  
  // Step 2: Extract just the token part
  const token = authHeader.substring(7); // Remove "Bearer "
  
  // Step 3: Verify and decode token
  const decoded = verifyAccessToken(token);
  // Returns: { userId: 1, email: "john@example.com", role: "USER" }
  
  // Step 4: Attach to request for use in route handlers
  req.user = decoded;
  
  next(); // Continue to next middleware
};
```

---

### **3. Role-Based Authorization**

**File: `backend/src/middleware/adminOnly.js`**

```javascript
// This middleware runs AFTER authenticate middleware
const adminOnly = (req, res, next) => {
  // req.user already exists (set by authenticate middleware)
  
  // Check if role is ADMIN
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access only" });
  }
  
  next(); // User is admin, proceed
};
```

**Usage in Routes:**

```javascript
// File: backend/src/routes/admin.bus.routes.js
const adminOnly = require("../middleware/adminOnly");
// adminOnly is actually: [authenticate, adminOnly]

router.post("/", ...adminOnly, busController.createBus);
// Spreads the array, so it becomes:
// router.post("/", authenticate, adminOnly, busController.createBus);
```

**Execution Order:**
1. Request comes in → `POST /api/admin/buses`
2. `authenticate` runs → Verifies token, sets `req.user`
3. `adminOnly` runs → Checks `req.user.role === "ADMIN"`
4. If admin → `createBus` controller runs
5. If not admin → Returns 403 Forbidden

---

### **4. Using User Info in Controllers**

**File: `backend/src/controllers/booking.controller.js`**

```javascript
exports.bookSeat = async (req, res) => {
  // req.user was set by authenticate middleware
  const userId = req.user.userId;  // From JWT token!
  const { seatId, scheduleId } = req.body;
  
  // No need to trust userId from request body
  // It comes from verified JWT token!
  
  const booking = await prisma.booking.create({
    data: {
      userId: userId,  // Secure - from verified token
      seatId,
      scheduleId,
    },
  });
};
```

---

## 🎨 Visual Flow Diagram

```
┌─────────────┐
│   CLIENT    │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. POST /api/auth/login
       │    { email, password }
       │
       ▼
┌─────────────────────┐
│   AUTH CONTROLLER   │
│                     │
│ 1. Verify password  │
│ 2. Get user from DB │
│ 3. Create payload:  │
│    {                │
│      userId: 1,     │
│      email: "...",  │
│      role: "USER"   │ ← Role embedded here!
│    }                │
│ 4. Generate tokens  │
└──────┬──────────────┘
       │
       │ 2. Return tokens
       │    { accessToken, refreshToken }
       │
       ▼
┌─────────────┐
│   CLIENT    │
│ Stores tokens│
└──────┬──────┘
       │
       │ 3. POST /api/user/bookings
       │    Headers: Authorization: Bearer <token>
       │
       ▼
┌─────────────────────┐
│ AUTHENTICATE        │
│ MIDDLEWARE          │
│                     │
│ 1. Extract token    │
│ 2. Verify signature │
│ 3. Decode payload:  │
│    {                │
│      userId: 1,     │
│      role: "USER"   │ ← Role extracted here!
│    }                │
│ 4. Set req.user     │
└──────┬──────────────┘
       │
       │ 4. req.user = { userId, role }
       │
       ▼
┌─────────────────────┐
│  BOOKING CONTROLLER │
│                     │
│ Uses req.user.userId│
│ (from verified JWT)  │
└─────────────────────┘

═══════════════════════════════════════════════════════

For ADMIN Routes:

┌─────────────┐
│   CLIENT    │
│  (Admin)    │
└──────┬──────┘
       │
       │ POST /api/admin/buses
       │ Authorization: Bearer <admin_token>
       │
       ▼
┌─────────────────────┐
│ AUTHENTICATE        │
│ MIDDLEWARE          │
│                     │
│ Sets req.user = {   │
│   userId: 2,        │
│   role: "ADMIN"     │ ← Admin role!
│ }                   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   ADMIN ONLY        │
│   MIDDLEWARE        │
│                     │
│ Check:              │
│ req.user.role ===   │
│ "ADMIN" ?           │
│                     │
│ ✅ Yes → Continue   │
│ ❌ No → 403 Error   │
└──────┬──────────────┘
       │
       │ (If admin)
       ▼
┌─────────────────────┐
│  BUS CONTROLLER     │
│  (createBus)         │
└─────────────────────┘
```

---

## 🔑 Key Points

### **1. Role is Embedded in Token**
- When user logs in, their role ("USER" or "ADMIN") is included in the JWT payload
- This role is **signed** with the secret key, so it can't be tampered with
- Every request includes this role in the token

### **2. No Database Lookup Needed**
- Once token is verified, we have the role immediately
- No need to query database for user role on every request
- Fast and efficient!

### **3. Middleware Chain**
```javascript
// Admin route
router.post("/", ...adminOnly, controller);
// Expands to:
router.post("/", authenticate, adminOnly, controller);

// Execution order:
// 1. authenticate → Verifies token, sets req.user
// 2. adminOnly → Checks req.user.role === "ADMIN"
// 3. controller → Executes if both pass
```

### **4. Security Layers**

1. **Token Signature**: Prevents tampering
2. **Token Expiry**: Access tokens expire in 15 minutes
3. **Secret Key**: Only server can create valid tokens
4. **Role Check**: Even with valid token, role must match

---

## 🧪 Example Scenarios

### **Scenario 1: Regular User Tries to Access Admin Route**

```
Request: POST /api/admin/buses
Headers: Authorization: Bearer <user_token>

Flow:
1. authenticate middleware → ✅ Token valid
   req.user = { userId: 1, role: "USER" }

2. adminOnly middleware → ❌ role !== "ADMIN"
   Returns: 403 Forbidden

Result: Access denied
```

### **Scenario 2: Admin Accesses Admin Route**

```
Request: POST /api/admin/buses
Headers: Authorization: Bearer <admin_token>

Flow:
1. authenticate middleware → ✅ Token valid
   req.user = { userId: 2, role: "ADMIN" }

2. adminOnly middleware → ✅ role === "ADMIN"
   Continues...

3. createBus controller → ✅ Executes

Result: Bus created successfully
```

### **Scenario 3: User Books a Seat**

```
Request: POST /api/user/bookings
Headers: Authorization: Bearer <user_token>
Body: { seatId: 5, scheduleId: 10 }

Flow:
1. authenticate middleware → ✅ Token valid
   req.user = { userId: 1, role: "USER" }

2. bookSeat controller → ✅ Uses req.user.userId
   Creates booking with userId from token

Result: Booking created
```

---

## 📝 Summary

**JWT Role-Based Access Control works by:**

1. ✅ **Embedding role in token** when user logs in
2. ✅ **Verifying token** on every protected request
3. ✅ **Extracting role** from verified token
4. ✅ **Checking role** before allowing access to admin routes
5. ✅ **Using userId from token** (not from request body) for security

**Benefits:**
- 🚀 Fast (no database lookup for role)
- 🔒 Secure (role can't be tampered with)
- 📦 Stateless (server doesn't need to store sessions)
- 🎯 Flexible (easy to add more roles)

---

**Files Involved:**
- `backend/src/utils/jwt.js` - Token generation/verification
- `backend/src/middleware/auth.js` - Authentication middleware
- `backend/src/middleware/adminOnly.js` - Role-based authorization
- `backend/src/controllers/auth.controller.js` - Login/register (creates tokens)
- `backend/src/routes/admin.bus.routes.js` - Example of protected admin route

---

**Questions?** The role is stored in the JWT token payload and checked by middleware before allowing access to protected routes!
