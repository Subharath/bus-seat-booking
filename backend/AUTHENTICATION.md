# 🔐 Authentication System Documentation

## Overview

The JWT (JSON Web Token) authentication system has been fully implemented with role-based access control. This document explains how to use the authentication endpoints and integrate them into your frontend.

---

## 📋 API Endpoints

### Base URL
All authentication endpoints are prefixed with `/api/auth`

---

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Register a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+94771234567" // Optional
}
```

**Validation Rules:**
- `name`: Required, 2-100 characters
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- `phone`: Optional, valid phone number format

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+94771234567",
    "role": "USER",
    "createdAt": "2026-01-09T19:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: Validation errors
- `409`: Email already exists
- `500`: Internal server error

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and receive tokens

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+94771234567",
    "role": "USER",
    "createdAt": "2026-01-09T19:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: Validation errors
- `401`: Invalid email or password
- `500`: Internal server error

---

### 3. Refresh Access Token

**Endpoint:** `POST /api/auth/refresh`

**Description:** Get a new access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: Refresh token is required
- `401`: Invalid or expired refresh token

---

### 4. Get Current User

**Endpoint:** `GET /api/auth/me`

**Description:** Get authenticated user's profile and bookings

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+94771234567",
    "role": "USER",
    "createdAt": "2026-01-09T19:30:00.000Z",
    "bookings": [
      {
        "id": 1,
        "status": "CONFIRMED",
        "createdAt": "2026-01-09T20:00:00.000Z",
        "seat": {
          "seatNo": "A1"
        },
        "schedule": {
          "date": "2026-01-10T00:00:00.000Z",
          "time": "08:00 AM",
          "route": {
            "from": "Colombo",
            "to": "Kandy"
          }
        }
      }
    ]
  }
}
```

**Error Responses:**
- `401`: Missing or invalid token
- `404`: User not found
- `500`: Internal server error

---

## 🔒 Protected Routes

### User Routes (Require Authentication)
- `POST /api/user/bookings` - Create booking
- `PATCH /api/user/bookings/:id/cancel` - Cancel booking

### Admin Routes (Require Authentication + Admin Role)
- `POST /api/admin/buses` - Create bus
- `GET /api/admin/buses` - List buses
- `DELETE /api/admin/buses/:id` - Delete bus
- `POST /api/admin/routes` - Create route
- `GET /api/admin/routes` - List routes
- `POST /api/admin/schedules` - Create schedule
- `GET /api/admin/schedules` - List schedules

### Public Routes (No Authentication Required)
- `GET /api/user/routes` - List routes
- `GET /api/user/routes/:id/schedules` - Get schedules
- `GET /api/user/schedules/:id/seats` - Get available seats

---

## 🎯 Frontend Integration Guide

### 1. Store Tokens

After successful login/registration, store tokens securely:

```javascript
// Using localStorage (simple, but not most secure)
localStorage.setItem('accessToken', response.data.accessToken);
localStorage.setItem('refreshToken', response.data.refreshToken);

// Better: Use httpOnly cookies (requires backend cookie setup)
```

### 2. Add Token to Requests

Include the access token in the Authorization header:

```javascript
// Using Axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Handle Token Expiration

Implement automatic token refresh:

```javascript
// Axios response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/auth/refresh', {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### 4. React Example

```jsx
// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', {
      email,
      password,
    });
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (userData) => {
    const response = await axios.post('/api/auth/register', userData);
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` file. Use `.env.example` as template.

2. **JWT Secrets**: Use strong, random secrets (minimum 32 characters) in production:
   ```bash
   # Generate random secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **HTTPS**: Always use HTTPS in production to protect tokens in transit.

4. **Token Storage**: 
   - For web apps: Consider httpOnly cookies instead of localStorage
   - For mobile apps: Use secure storage

5. **Token Expiration**: 
   - Access tokens: Short-lived (15 minutes default)
   - Refresh tokens: Longer-lived (7 days default)

6. **Password Requirements**: Enforce strong passwords (already implemented)

---

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "phone": "+94771234567"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 📝 Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/seat_booking"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

---

## ✅ Implementation Status

- ✅ User Registration
- ✅ User Login
- ✅ JWT Token Generation (Access + Refresh)
- ✅ Token Refresh Mechanism
- ✅ Protected Routes Middleware
- ✅ Role-Based Access Control (Admin/User)
- ✅ Password Hashing (bcrypt)
- ✅ Input Validation
- ✅ Get Current User Endpoint
- ✅ User Phone Field (Optional)

---

## 🚀 Next Steps

1. Test all endpoints using Postman or cURL
2. Integrate with frontend
3. Add password reset functionality (optional)
4. Add email verification (optional)
5. Implement rate limiting (optional)

---

**Questions?** Check the code in:
- `backend/src/controllers/auth.controller.js`
- `backend/src/middleware/auth.js`
- `backend/src/middleware/adminOnly.js`
- `backend/src/utils/jwt.js`
- `backend/src/utils/bcrypt.js`
