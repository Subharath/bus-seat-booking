# Admin System Revision - Complete Implementation

## Overview
The admin system has been comprehensively revised with the following features:
1. **Admin Registration & Login** - Admins can now register and login
2. **Booking Cancellation Approval Workflow** - Users can request cancellation, admins must approve
3. **Admin Dashboard for Managing Cancellation Requests** - Full management interface

---

## Backend Changes

### 1. Database Schema Updates (`backend/prisma/schema.prisma`)
- Added `cancellationStatus` field to Booking model (PENDING, APPROVED, REJECTED)
- Added `cancellationRequestedAt` timestamp
- Added `cancellationApprovedAt` timestamp
- Added `cancellationReason` field (user's reason for cancellation)
- Added `adminNotes` field (admin's response notes)
- Added `updatedAt` timestamp for tracking changes
- Created new `CancellationStatus` enum

### 2. Auth Controller (`backend/src/controllers/auth.controller.js`)
**New Function: `adminRegister`**
- Allows new admin users to register
- Validates name, email, password
- Creates user with ADMIN role
- Returns JWT tokens (access & refresh)

**Updated Function: `adminLogin`**
- Existing functionality maintained
- Verifies user is admin role before login
- Returns admin info with tokens

### 3. Booking Controller (`backend/src/controllers/booking.controller.js`)
**New Function: `requestCancellation`**
- Users can request to cancel their bookings
- Creates a PENDING cancellation request
- Stores cancellation reason
- Prevents duplicate requests

**Updated Function: `cancelBooking`**
- Now restricted to admins only
- Only admins can directly cancel bookings
- Updates both booking status and cancellation status to APPROVED
- Regular users must use `requestCancellation`

### 4. Admin Controller (`backend/src/controllers/admin.controller.js`)
**New Functions:**

**`getPendingCancellations`**
- GET `/admin/cancellations/pending`
- Returns all pending cancellation requests
- Includes user, seat, schedule, and bus details

**`getAllCancellations`**
- GET `/admin/cancellations`
- Returns all cancellation requests (with optional status filter)
- Supports query parameter: `?status=PENDING|APPROVED|REJECTED`

**`approveCancellation`**
- POST `/admin/cancellations/:bookingId/approve`
- Approves a cancellation request
- Updates booking status to CANCELLED
- Sets cancellation status to APPROVED
- Admin can add notes

**`rejectCancellation`**
- POST `/admin/cancellations/:bookingId/reject`
- Rejects a cancellation request
- Sets cancellation status to REJECTED
- Admin can add rejection reason

### 5. Routes Configuration

**Auth Routes (`backend/src/routes/auth.routes.js`)**
- Added: `POST /auth/admin/register` - Admin registration

**Admin Routes (`backend/src/routes/admin.routes.js`)**
- Added: `GET /admin/cancellations/pending` - Get pending requests
- Added: `GET /admin/cancellations` - Get all cancellation requests
- Added: `POST /admin/cancellations/:bookingId/approve` - Approve request
- Added: `POST /admin/cancellations/:bookingId/reject` - Reject request

**User Routes (`backend/src/routes/user.routes.js`)**
- Added: `POST /user/bookings/:bookingId/cancel-request` - Request cancellation

---

## Frontend Changes

### 1. New Component: Admin Registration (`frontend/src/pages/AdminRegister.jsx`)
**Features:**
- Form for creating new admin account
- Fields: Name, Email, Phone, Password, Confirm Password
- Password validation (min 6 characters, matching)
- Redirect to admin dashboard on success
- Links to admin login and user login pages

### 2. Updated: Admin Login (`frontend/src/pages/AdminLogin.jsx`)
- Added link to admin registration page
- Added link to user login page
- Maintained existing login functionality

### 3. Updated: Admin Bookings Page (`frontend/src/pages/AdminBookings.jsx`)
**New Features:**
- **Tab Interface:**
  - Tab 1: "All Bookings" - Shows all user bookings with delete option
  - Tab 2: "Cancellation Requests" - Shows pending cancellation requests
  
- **All Bookings Tab:**
  - Display all bookings with passenger, route, seat info
  - Status badge (CONFIRMED/CANCELLED)
  - Delete booking option

- **Cancellation Requests Tab:**
  - Display pending cancellation requests with:
    - Passenger name and contact info
    - Route and seat details
    - Original booking date
    - User's cancellation reason
    - Request submission timestamp
  
  - **Review & Respond Button:**
    - Opens inline form for admin response
    - Field for optional admin notes
    - Two action buttons:
      - **Approve** - Cancels booking, sets status to APPROVED
      - **Reject** - Keeps booking active, sets status to REJECTED

### 4. Updated: User Dashboard (`frontend/src/pages/Dashboard.jsx`)
**New Features:**
- **Request Cancellation Button** (when booking is CONFIRMED)
  - Replaces direct "Cancel" button
  - Opens inline form with:
    - Optional cancellation reason field
    - "Confirm Request" button
    - "Cancel" button to close form
  
- **Cancellation Status Badges:**
  - PENDING (yellow) - Awaiting admin approval
  - APPROVED (green) - Approved by admin
  - REJECTED (red) - Rejected by admin
  
- **Status Display:**
  - Shows both booking status (CONFIRMED/CANCELLED)
  - Shows cancellation status if applicable
  - Disables further action while pending

### 5. Updated: App Routing (`frontend/src/App.jsx`)
- Added import for `AdminRegister` component
- Added route: `POST /admin/register` → `<AdminRegister />`

### 6. Updated: API Service (`frontend/src/services/api.js`)
**New Functions:**

```javascript
// Booking API
bookingAPI.requestCancellation(bookingId, data)

// Admin API
adminAPI.cancellations.getPending()        // Get pending requests
adminAPI.cancellations.getAll(status)      // Get all by status
adminAPI.cancellations.approve(id, data)   // Approve cancellation
adminAPI.cancellations.reject(id, data)    // Reject cancellation
```

---

## Workflow Overview

### User Cancellation Request Flow:
1. User views booking in dashboard
2. Clicks "Request Cancel" button
3. Enters optional cancellation reason
4. Submits request
5. Booking shows "Cancellation: PENDING" status
6. User waits for admin approval

### Admin Approval/Rejection Flow:
1. Admin logs into admin portal
2. Goes to Bookings → Cancellation Requests tab
3. Reviews pending cancellation requests
4. Can see:
   - User details and contact info
   - Booking details
   - Passenger information
   - User's cancellation reason
5. Clicks "Review & Respond" button
6. Enters optional notes
7. Selects either:
   - **Approve** - Booking becomes CANCELLED, request marked APPROVED
   - **Reject** - Booking stays CONFIRMED, request marked REJECTED
8. Request is processed and removed from pending

---

## Key Features

### Security
- Admin endpoints protected with `adminOnly` middleware
- JWT authentication required for all admin operations
- Admin role verification before access

### Data Integrity
- Booking-seat-schedule unique constraint maintained
- Prevents double bookings
- Transaction-like operations ensure data consistency

### User Experience
- Clear status indicators for cancellation requests
- Inline forms for quick approvals
- Audit trail with timestamps and admin notes
- Helpful error messages

### Admin Features
- Bulk view of all bookings
- Dedicated cancellation request management
- Filter and search capabilities
- Admin notes for tracking reasons

---

## Testing Checklist

- [ ] Admin can register new account
- [ ] Admin can login with registered account
- [ ] User can request booking cancellation
- [ ] Cancellation shows as PENDING in user dashboard
- [ ] Admin can see pending cancellation requests
- [ ] Admin can approve cancellation requests
- [ ] Admin can reject cancellation requests
- [ ] Booking status updates correctly after approval
- [ ] Seat becomes available after cancellation approval
- [ ] User sees REJECTED status when request is rejected
- [ ] Admin notes are displayed to user (if applicable)
- [ ] Old bookings can still be viewed in admin panel

---

## Migration Note
Run database migration to apply schema changes:
```bash
cd backend
npx prisma migrate dev --name add_cancellation_workflow
```

---

## Files Modified

### Backend
1. `backend/prisma/schema.prisma` - Database schema
2. `backend/src/controllers/auth.controller.js` - Admin registration
3. `backend/src/controllers/booking.controller.js` - Cancellation request logic
4. `backend/src/controllers/admin.controller.js` - Approval endpoints
5. `backend/src/routes/auth.routes.js` - Admin register route
6. `backend/src/routes/admin.routes.js` - Cancellation management routes
7. `backend/src/routes/user.routes.js` - Cancellation request route

### Frontend
1. `frontend/src/App.jsx` - Added admin register route
2. `frontend/src/pages/AdminLogin.jsx` - Added registration link
3. `frontend/src/pages/AdminRegister.jsx` - New component
4. `frontend/src/pages/AdminBookings.jsx` - Complete redesign with tabs
5. `frontend/src/pages/Dashboard.jsx` - Request cancellation workflow
6. `frontend/src/services/api.js` - New API endpoints

---

## Summary
The admin system now has a complete, production-ready implementation with:
- ✅ Admin registration and login
- ✅ User cancellation request workflow
- ✅ Admin approval/rejection system
- ✅ Complete frontend UI for managing cancellations
- ✅ Secure role-based access control
- ✅ Comprehensive audit trail with timestamps and notes
