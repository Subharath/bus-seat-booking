# Admin System - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     BUS SEAT BOOKING SYSTEM                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐          ┌──────────────────────────┐
│    USER INTERFACE        │          │    ADMIN INTERFACE       │
│  (React Frontend)        │          │  (React Frontend)        │
├──────────────────────────┤          ├──────────────────────────┤
│ ✓ Home Page              │          │ ✓ Admin Register Page    │
│ ✓ Login/Register         │          │ ✓ Admin Login Page       │
│ ✓ Dashboard              │          │ ✓ Admin Dashboard        │
│ ✓ Route Selection        │          │ ✓ Bookings Management    │
│ ✓ Seat Selection         │          │ ✓ Cancellation Requests  │
│ ✓ Request Cancellation   │          │ ✓ Route Management       │
│ ✓ View Bookings          │          │ ✓ Schedule Management    │
└──────────────┬───────────┘          └──────────────┬───────────┘
               │                                     │
               │    HTTP Requests with JWT           │
               │    (Bearer Token Auth)              │
               │                                     │
               └──────────────────┬──────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  Express.js Backend API    │
                    │  (Node.js Server)          │
                    ├────────────────────────────┤
                    │ ✓ Auth Routes              │
                    │   - register (user)        │
                    │   - login (user)           │
                    │   - admin/register (new)   │
                    │   - admin/login            │
                    │                            │
                    │ ✓ User Routes              │
                    │   - routes (GET)           │
                    │   - schedules (GET)        │
                    │   - seats (GET)            │
                    │   - bookings (POST)        │
                    │   - cancel-request (POST)  │
                    │                            │
                    │ ✓ Admin Routes             │
                    │   - buses (CRUD)           │
                    │   - routes (CRUD)          │
                    │   - schedules (CRUD)       │
                    │   - bookings (GET/DELETE)  │
                    │   - cancellations (GET)    │
                    │   - approve (POST)         │
                    │   - reject (POST)          │
                    │                            │
                    │ ✓ Middleware               │
                    │   - JWT Auth Check         │
                    │   - Admin Role Verify      │
                    │   - Input Validation       │
                    └────────────────┬───────────┘
                                     │
                    ┌────────────────▼──────────────┐
                    │  PostgreSQL Database          │
                    │  (Prisma ORM)                 │
                    ├───────────────────────────────┤
                    │ Tables:                       │
                    │ ✓ User (id, name, email...)  │
                    │ ✓ Bus (id, busNumber, ...)   │
                    │ ✓ Route (id, from, to)       │
                    │ ✓ Schedule (date, time...)   │
                    │ ✓ Seat (id, seatNo, ...)     │
                    │ ✓ Booking (status, cancel... │
                    │           Status, reason...)  │
                    └───────────────────────────────┘
```

---

## Cancellation Request Flow Diagram

```
USER CANCELLATION REQUEST FLOW
================================

┌──────────────────────┐
│  User Dashboard      │
│  Views Bookings      │
└──────────────┬───────┘
               │
               │ Sees "Request Cancel" button
               ▼
      ┌────────────────────┐
      │ User Clicks Button │
      └────────────┬───────┘
                   │
                   ▼
      ┌────────────────────────────┐
      │ Inline Form Opens          │
      │ - Optional Reason Field    │
      │ - Confirm/Cancel Buttons   │
      └────────────┬───────────────┘
                   │
                   │ User enters reason (optional)
                   │ User clicks "Confirm Request"
                   │
                   ▼
      ┌──────────────────────────────────────────┐
      │ POST /user/bookings/:id/cancel-request   │
      │ Payload: { reason: "Emergency..." }      │
      │ Headers: Authorization: Bearer {token}   │
      └────────────┬─────────────────────────────┘
                   │
                   ▼ Backend Processing
      ┌──────────────────────────────────────────┐
      │ 1. Validate user owns booking            │
      │ 2. Check booking not already cancelled   │
      │ 3. Check no pending request exists       │
      │ 4. Update Booking table:                 │
      │    - cancellationStatus = 'PENDING'      │
      │    - cancellationRequestedAt = NOW()     │
      │    - cancellationReason = reason         │
      │ 5. Return updated booking                │
      └────────────┬─────────────────────────────┘
                   │
                   ▼
      ┌──────────────────────────────────────────┐
      │ Dashboard Updates                        │
      │ - Shows "Cancel: PENDING" badge          │
      │ - Button disabled/changed to waiting     │
      │ - Message: "Awaiting Admin Approval"     │
      └──────────────────────────────────────────┘


ADMIN APPROVAL/REJECTION FLOW
==============================

┌──────────────────────┐
│ Admin Dashboard      │
│ Bookings Page        │
└──────────────┬───────┘
               │
               │ Clicks "Cancellation Requests" tab
               ▼
      ┌────────────────────────────────┐
      │ Shows All PENDING Requests     │
      │ - Passenger name               │
      │ - Contact info                 │
      │ - Route/Seat details           │
      │ - User's reason                │
      │ - Request timestamp            │
      └────────────┬───────────────────┘
                   │
                   │ Admin sees a request
                   │ Clicks "Review & Respond"
                   │
                   ▼
      ┌───────────────────────────────────┐
      │ Inline Form Appears               │
      │ - Admin Notes Field (optional)    │
      │ - Approve Button                  │
      │ - Reject Button                   │
      │ - Cancel Button                   │
      └───────────┬───────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    APPROVE            REJECT
         │                 │
         ▼                 ▼
    ┌────────┐        ┌────────┐
    │ Path A │        │ Path B │
    └───┬────┘        └───┬────┘
        │                 │
        │                 │
        ▼                 ▼
POST /admin/          POST /admin/
cancellations/        cancellations/
:id/approve           :id/reject
{adminNotes}          {reason}
        │                 │
        ▼                 ▼
   Update Booking:    Update Booking:
   - status='        - status='
     CANCELLED'        CONFIRMED'
   - cancellation   - cancellation
     Status=         Status='
     'APPROVED'      REJECTED'
   - cancellation   - adminNotes=
     ApprovedAt=      reason
     NOW()
        │                 │
        ▼                 ▼
    SEAT RELEASED     BOOKING ACTIVE
    & AVAILABLE       NO CHANGE
    FOR BOOKING
        │                 │
        └────────┬────────┘
                 │
                 ▼
    User Dashboard Updates:
    - Status changes to APPROVED/REJECTED
    - Notification about decision
    - Admin notes visible (if any)
```

---

## Database Schema Diagram

```
USER TABLE
──────────
id (PK)
name
email (UNIQUE)
password
phone
role (USER/ADMIN)
createdAt


BUS TABLE
─────────
id (PK)
busNumber (UNIQUE)
make
model
seatLayout
totalSeats

    ↓ 1:N
    
SEAT TABLE
──────────
id (PK)
seatNo
busId (FK)

    ↓ 1:N (with Schedule)

ROUTE TABLE
───────────
id (PK)
from
to

    ↓ 1:N

SCHEDULE TABLE
──────────────
id (PK)
date
time
busId (FK)
routeId (FK)

    ↓ 1:N (M:N through Booking)

BOOKING TABLE (UPDATED)
───────────────────────
id (PK)
bookingId (UUID, UNIQUE)
userId (FK)
seatId (FK)
scheduleId (FK)
passengerName
phoneNumber
status (CONFIRMED/CANCELLED)
cancellationStatus (PENDING/APPROVED/REJECTED) ★ NEW
cancellationRequestedAt ★ NEW
cancellationApprovedAt ★ NEW
cancellationReason ★ NEW
adminNotes ★ NEW
createdAt
updatedAt ★ NEW

★ = New fields added in revision
```

---

## API Endpoint Hierarchy

```
/api/
│
├── auth/
│   ├── POST register (user)
│   ├── POST login (user)
│   ├── POST admin/register ★ NEW
│   ├── POST admin/login
│   ├── POST refresh
│   └── GET me (protected)
│
├── user/
│   ├── GET routes
│   ├── GET routes/:routeId/schedules
│   ├── GET schedules/:scheduleId/seats
│   ├── POST bookings (protected)
│   ├── POST bookings/:id/cancel-request (protected) ★ NEW
│   └── PATCH bookings/:id/cancel (protected, admin only)
│
└── admin/
    ├── /buses
    │   ├── GET (admin only)
    │   ├── POST (admin only)
    │   ├── PUT/:id (admin only)
    │   └── DELETE/:id (admin only)
    │
    ├── /routes
    │   ├── GET (admin only)
    │   ├── POST (admin only)
    │   ├── PUT/:id (admin only)
    │   └── DELETE/:id (admin only)
    │
    ├── /schedules
    │   ├── GET (admin only)
    │   ├── POST (admin only)
    │   ├── PUT/:id (admin only)
    │   └── DELETE/:id (admin only)
    │
    ├── /bookings
    │   ├── GET (admin only)
    │   ├── GET/:id (admin only)
    │   └── DELETE/:id (admin only)
    │
    ├── /cancellations ★ NEW
    │   ├── GET /pending (admin only)
    │   ├── GET (with optional ?status filter)
    │   ├── POST /:id/approve (admin only)
    │   └── POST /:id/reject (admin only)
    │
    └── /dashboard
        └── GET /stats (admin only)

★ = New endpoints added in revision
```

---

## State Management Flow

```
USER AUTHENTICATION
───────────────────

      ┌─────────────────────────────────────┐
      │ AuthContext (React Context API)     │
      ├─────────────────────────────────────┤
      │ State:                              │
      │ - user: { id, name, email, role... }│
      │ - isAuthenticated: boolean          │
      │ - loading: boolean                  │
      │ - error: string                     │
      │                                     │
      │ Functions:                          │
      │ - login()                           │
      │ - register()                        │
      │ - logout()                          │
      │ - refresh tokens                    │
      └──────────────────────┬──────────────┘
                             │
                    ┌────────▼────────┐
                    │  localStorage   │
                    ├─────────────────┤
                    │ accessToken     │
                    │ refreshToken    │
                    │ adminUser (opt) │
                    └─────────────────┘


BOOKING STATE
─────────────

Dashboard Component:
├── bookings: []
├── loading: boolean
├── error: string
├── selectedBooking: id (for form focus)
└── cancellationReason: string


Admin Bookings Component:
├── bookings: []
├── cancellations: []
├── activeTab: 'bookings' | 'cancellations'
├── loading: boolean
├── error: string
├── selectedBooking: id (for form focus)
└── adminNotes: string
```

---

## Error Handling Flow

```
ERROR SCENARIOS
───────────────

┌─────────────────────────────────────────┐
│ User tries to cancel another user's     │
│ booking                                 │
├─────────────────────────────────────────┤
│ 1. Frontend sends request               │
│ 2. Backend checks: booking.userId ===   │
│    req.user.userId                      │
│ 3. If false: Return 403 Forbidden       │
│ 4. Response: "You can only cancel your  │
│    own bookings"                        │
│ 5. Frontend shows error message         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ User tries to request cancellation      │
│ twice                                   │
├─────────────────────────────────────────┤
│ 1. First request creates PENDING        │
│ 2. Second request checks:               │
│    cancellationStatus === 'PENDING'     │
│ 3. If true: Return 400 Bad Request      │
│ 4. Response: "Cancellation request      │
│    already pending approval"            │
│ 5. Frontend prevents duplicate request  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Admin tries to access user routes       │
├─────────────────────────────────────────┤
│ 1. Request to /admin/buses              │
│ 2. adminOnly middleware checks role     │
│ 3. If role !== 'ADMIN': Return 403      │
│ 4. Response: "Admin access required"    │
│ 5. Frontend redirects to login          │
└─────────────────────────────────────────┘
```

---

## Component Dependency Tree

```
App
│
├── AuthProvider (Context)
│
├── Routes (React Router)
│   │
│   ├── Public Routes
│   │   ├── AdminLogin
│   │   ├── AdminRegister ★ NEW
│   │   ├── UserLogin
│   │   └── UserRegister
│   │
│   ├── User Protected Routes
│   │   ├── Dashboard
│   │   │   └── BookingCard (cancel request) ★ UPDATED
│   │   ├── Routes
│   │   ├── ScheduleSelection
│   │   └── SeatSelection
│   │
│   └── Admin Protected Routes
│       ├── AdminDashboard
│       ├── AdminBuses
│       ├── AdminRoutes
│       ├── AdminSchedules
│       └── AdminBookings ★ UPDATED
│           ├── AllBookingsTab
│           └── CancellationRequestsTab
│               ├── RequestCard
│               └── ApprovalForm

★ = New or significantly updated
```

---

## Authentication Flow

```
LOGIN PROCESS
─────────────

User enters credentials
        │
        ▼
POST /auth/admin/login or /auth/login
        │
        ▼
Backend validates:
- Email exists
- Password matches
- (Admin: role === 'ADMIN')
        │
        ▼
Generate JWT tokens:
- accessToken (15 min expiry)
- refreshToken (7 day expiry)
        │
        ▼
Return tokens + user data
        │
        ▼
Frontend stores in localStorage:
- accessToken
- refreshToken
- adminUser (admin only)
        │
        ▼
Redirect to dashboard
        │
        ▼
API interceptor adds token to all requests:
Authorization: Bearer {accessToken}


TOKEN REFRESH
─────────────

accessToken expires
        │
        ▼
API interceptor detects 401
        │
        ▼
Automatically calls:
POST /auth/refresh
{refreshToken}
        │
        ▼
Backend validates refresh token
        │
        ▼
Returns new accessToken
        │
        ▼
Retries original request
        │
        ▼
User stays logged in
```

---

## File Structure

```
bus-seat-booking/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js ★ UPDATED
│   │   │   ├── booking.controller.js ★ UPDATED
│   │   │   ├── admin.controller.js ★ UPDATED
│   │   │   └── ...
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js ★ UPDATED
│   │   │   ├── user.routes.js ★ UPDATED
│   │   │   ├── admin.routes.js ★ UPDATED
│   │   │   └── ...
│   │   │
│   │   └── middleware/
│   │       ├── auth.js
│   │       ├── adminOnly.js
│   │       └── validators.js
│   │
│   └── prisma/
│       └── schema.prisma ★ UPDATED
│
├── frontend/
│   └── src/
│       ├── App.jsx ★ UPDATED
│       │
│       ├── pages/
│       │   ├── AdminLogin.jsx ★ UPDATED
│       │   ├── AdminRegister.jsx ★ NEW
│       │   ├── AdminBookings.jsx ★ UPDATED
│       │   ├── Dashboard.jsx ★ UPDATED
│       │   └── ...
│       │
│       ├── services/
│       │   └── api.js ★ UPDATED
│       │
│       └── contexts/
│           └── AuthContext.jsx
│
├── ADMIN_SYSTEM_REVISION.md ★ NEW
├── ADMIN_API_REFERENCE.md ★ NEW
├── ADMIN_SYSTEM_REVISION_SETUP.md ★ NEW
└── REVISION_SUMMARY.md ★ NEW

★ = New or updated
```

---

**Legend:**
- ★ = New in revision
- ✓ = Completed
- PK = Primary Key
- FK = Foreign Key
- M:N = Many to Many relationship
- 1:N = One to Many relationship

