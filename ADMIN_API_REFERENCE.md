# Admin System - API Quick Reference

## Authentication Endpoints

### Admin Registration
```
POST /api/auth/admin/register
Content-Type: application/json

{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "securePassword123",
  "phone": "9876543210"  // optional
}

Response: 201 Created
{
  "message": "Admin registered successfully",
  "admin": {
    "id": 1,
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "ADMIN",
    "phone": "9876543210",
    "createdAt": "2026-01-12T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Admin Login
```
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "message": "Admin login successful",
  "admin": {
    "id": 1,
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## User Booking Endpoints

### Request Booking Cancellation
```
POST /api/user/bookings/:bookingId/cancel-request
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "reason": "Personal emergency"  // optional
}

Response: 200 OK
{
  "message": "Cancellation request submitted successfully. Awaiting admin approval.",
  "booking": {
    "id": 1,
    "bookingId": "uuid-string",
    "status": "CONFIRMED",
    "cancellationStatus": "PENDING",
    "cancellationRequestedAt": "2026-01-12T10:05:00Z",
    "cancellationReason": "Personal emergency",
    "user": { ... },
    "seat": { ... },
    "schedule": { ... }
  }
}
```

---

## Admin Cancellation Management Endpoints

### Get All Pending Cancellation Requests
```
GET /api/admin/cancellations/pending
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "message": "Pending cancellations retrieved successfully",
  "count": 5,
  "cancellations": [
    {
      "id": 1,
      "bookingId": "uuid-string",
      "status": "CONFIRMED",
      "cancellationStatus": "PENDING",
      "cancellationRequestedAt": "2026-01-12T10:05:00Z",
      "cancellationReason": "Personal emergency",
      "user": {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "9876543210"
      },
      "seat": {
        "seatNo": "A1"
      },
      "schedule": {
        "route": {
          "from": "Mumbai",
          "to": "Delhi"
        },
        "bus": {
          "busNumber": "BUS001"
        }
      }
    }
    // ... more requests
  ]
}
```

### Get All Cancellations (with optional filter)
```
GET /api/admin/cancellations?status=PENDING
GET /api/admin/cancellations?status=APPROVED
GET /api/admin/cancellations?status=REJECTED
GET /api/admin/cancellations  // all statuses

Authorization: Bearer {accessToken}

Response: 200 OK
{
  "message": "Cancellations retrieved successfully",
  "count": 10,
  "cancellations": [ ... ]
}
```

### Approve Cancellation Request
```
POST /api/admin/cancellations/:bookingId/approve
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "adminNotes": "Approved - valid reason"  // optional
}

Response: 200 OK
{
  "message": "Cancellation request approved successfully",
  "booking": {
    "id": 1,
    "status": "CANCELLED",  // Updated to CANCELLED
    "cancellationStatus": "APPROVED",
    "cancellationApprovedAt": "2026-01-12T11:00:00Z",
    "adminNotes": "Approved - valid reason",
    "user": { ... },
    "seat": { ... },
    "schedule": { ... }
  }
}
```

### Reject Cancellation Request
```
POST /api/admin/cancellations/:bookingId/reject
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "reason": "Cancellation not allowed within 24 hours"  // optional
}

Response: 200 OK
{
  "message": "Cancellation request rejected successfully",
  "booking": {
    "id": 1,
    "status": "CONFIRMED",  // Stays CONFIRMED
    "cancellationStatus": "REJECTED",
    "adminNotes": "Cancellation not allowed within 24 hours",
    "user": { ... },
    "seat": { ... },
    "schedule": { ... }
  }
}
```

---

## Status Codes Reference

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PATCH, DELETE) |
| 201 | Created (POST) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/expired token) |
| 403 | Forbidden (not admin, not owner) |
| 404 | Not Found (booking, cancellation, etc.) |
| 409 | Conflict (duplicate request, already cancelled) |
| 500 | Internal Server Error |

---

## Cancellation Status Flow

```
User Booking State:
┌─────────────────┐
│   CONFIRMED     │
└────────┬────────┘
         │ User requests cancellation
         ▼
┌─────────────────────┐
│ PENDING APPROVAL    │ ◄── cancellationStatus: PENDING
│ (Booking unchanged) │
└────────┬────────────┘
         │
    ┌────┴───────┐
    │             │
    ▼             ▼
┌─────────┐  ┌──────────┐
│APPROVED │  │ REJECTED │
│(Cancelled)│ │(Stays OK)│
└─────────┘  └──────────┘
```

---

## Important Notes

### For Users:
1. Once cancellation is requested, the booking shows "PENDING" status
2. User cannot modify or re-request cancellation while PENDING
3. Admin will review and approve/reject within 24 hours (typically)
4. Seat will become available once cancellation is APPROVED
5. Can provide optional reason for transparency

### For Admins:
1. All PENDING cancellations appear in admin dashboard
2. Must review user's reason and decide appropriately
3. Can add notes to explain decision to user
4. Approval releases the seat for other users
5. Rejection keeps booking active
6. All actions are logged with timestamps

### API Rules:
- All admin endpoints require valid JWT token with ADMIN role
- User cancellation request endpoint requires valid user JWT
- Tokens expire in 15 minutes (access) and 7 days (refresh)
- Refresh token endpoint available at `POST /api/auth/refresh`

---

## Example Frontend Usage

```javascript
// Request cancellation
import { bookingAPI } from './services/api'

const handleRequestCancellation = async (bookingId) => {
  try {
    const response = await bookingAPI.requestCancellation(bookingId, {
      reason: "Personal emergency"
    })
    console.log("Request submitted:", response.data)
  } catch (error) {
    console.error("Error:", error.response?.data?.message)
  }
}

// Admin approve cancellation
import { adminAPI } from './services/api'

const handleApprove = async (bookingId) => {
  try {
    const response = await adminAPI.cancellations.approve(bookingId, {
      adminNotes: "Approved - valid reason"
    })
    console.log("Approved:", response.data)
  } catch (error) {
    console.error("Error:", error.response?.data?.message)
  }
}

// Admin reject cancellation
const handleReject = async (bookingId) => {
  try {
    const response = await adminAPI.cancellations.reject(bookingId, {
      reason: "Cancellation within 24 hours not allowed"
    })
    console.log("Rejected:", response.data)
  } catch (error) {
    console.error("Error:", error.response?.data?.message)
  }
}
```
