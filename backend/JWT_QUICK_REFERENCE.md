# 🔐 JWT Role-Based Access Control - Quick Reference

## ✅ Packages Installed

Your `package.json` includes all required packages:

```json
{
  "dependencies": {
    "bcryptjs": "^3.0.3",           // ✅ Password hashing
    "jsonwebtoken": "^9.0.3",        // ✅ JWT token generation/verification
    "express-validator": "^7.3.1"    // ✅ Input validation
  }
}
```

**All packages are installed and ready to use!** ✅

---

## 🎯 How JWT Role-Based Access Works (Simple Explanation)

### **The Flow:**

```
1. USER LOGS IN
   ↓
   Server creates token with: { userId, email, role: "USER" }
   ↓
   Client receives: accessToken + refreshToken
   ↓

2. USER MAKES REQUEST
   ↓
   Client sends: Authorization: Bearer <accessToken>
   ↓
   Server verifies token → Extracts: { userId, role: "USER" }
   ↓
   Server checks role:
   - If route needs "ADMIN" but role is "USER" → 403 Forbidden
   - If role matches → Allow access
```

---

## 📋 Key Files

| File | Purpose |
|------|---------|
| `src/utils/jwt.js` | Generate & verify tokens |
| `src/utils/bcrypt.js` | Hash & compare passwords |
| `src/middleware/auth.js` | Verify token, set `req.user` |
| `src/middleware/adminOnly.js` | Check if `req.user.role === "ADMIN"` |
| `src/controllers/auth.controller.js` | Login/Register (creates tokens) |

---

## 🔑 Token Payload Structure

When user logs in, token contains:

```javascript
{
  userId: 1,                    // User ID from database
  email: "john@example.com",   // User email
  role: "USER"                  // ← THIS IS THE KEY!
}
```

For admin:
```javascript
{
  userId: 2,
  email: "admin@example.com",
  role: "ADMIN"                 // ← Admin role!
}
```

---

## 🛡️ How Routes Are Protected

### **1. Public Route (No Auth)**
```javascript
router.get("/routes", controller.getRoutes);
// Anyone can access
```

### **2. Protected Route (Auth Required)**
```javascript
router.post("/bookings", authenticate, controller.bookSeat);
// Requires valid JWT token
// Uses: req.user.userId (from token)
```

### **3. Admin Route (Auth + Admin Role)**
```javascript
router.post("/", ...adminOnly, controller.createBus);
// Requires:
// 1. Valid JWT token (authenticate)
// 2. Role === "ADMIN" (adminOnly)
```

---

## 🔍 How Role Check Works

**File: `src/middleware/adminOnly.js`**

```javascript
const adminOnly = (req, res, next) => {
  // req.user was set by authenticate middleware
  // It contains: { userId, email, role }
  
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access only" });
  }
  
  next(); // User is admin, allow access
};
```

**The role comes from the JWT token!** When the token is verified, the role is extracted and checked.

---

## 📊 Request Flow Example

### **Admin Creating a Bus:**

```
1. Request:
   POST /api/admin/buses
   Headers: Authorization: Bearer <admin_token>

2. authenticate middleware:
   ✅ Verifies token
   ✅ Sets req.user = { userId: 2, role: "ADMIN" }

3. adminOnly middleware:
   ✅ Checks req.user.role === "ADMIN"
   ✅ Allows access

4. createBus controller:
   ✅ Executes successfully
```

### **Regular User Trying Admin Route:**

```
1. Request:
   POST /api/admin/buses
   Headers: Authorization: Bearer <user_token>

2. authenticate middleware:
   ✅ Verifies token
   ✅ Sets req.user = { userId: 1, role: "USER" }

3. adminOnly middleware:
   ❌ req.user.role !== "ADMIN"
   ❌ Returns 403 Forbidden

4. Controller never runs
```

---

## 🎯 Key Points

1. **Role is in the token** - When user logs in, role is embedded in JWT
2. **Token is verified** - Every request verifies token signature
3. **Role is checked** - Middleware checks `req.user.role` before allowing access
4. **No database lookup** - Role comes from token, not database query
5. **Secure** - Token is signed, can't be tampered with

---

## 🧪 Test It

### **1. Register/Login to get token:**
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### **2. Use token in requests:**
```bash
GET /api/auth/me
Headers: Authorization: Bearer <your_token>
```

### **3. Try admin route (will fail if not admin):**
```bash
POST /api/admin/buses
Headers: Authorization: Bearer <your_token>
```

---

## 📚 Full Documentation

For detailed explanation, see:
- `JWT_ROLE_BASED_ACCESS_EXPLAINED.md` - Complete walkthrough
- `AUTHENTICATION.md` - API documentation

---

**Summary:** Role is stored in JWT token → Token verified on each request → Role checked by middleware → Access granted/denied based on role! 🎯
