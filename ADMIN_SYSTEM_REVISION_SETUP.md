# Admin System Revision - Setup & Testing Guide

## 🚀 Quick Start

### 1. Database Migration
Run the Prisma migration to update the database schema:

```bash
cd backend
npx prisma migrate dev --name add_cancellation_workflow
```

This will:
- Add cancellation-related fields to the Booking table
- Create the CancellationStatus enum
- Update database indices

### 2. Restart Backend Server
```bash
cd backend
npm start
# or
npm run dev
```

### 3. Restart Frontend
```bash
cd frontend
npm run dev
```

---

## 📋 Feature Overview

### ✅ What's New

#### 1. Admin Registration
- **URL**: `http://localhost:5173/admin/register`
- Admins can self-register instead of requiring manual database insertion
- Creates account with ADMIN role automatically
- Validates password strength (min 6 characters)

#### 2. Admin Login
- **URL**: `http://localhost:5173/admin/login`
- Updated with link to registration page
- Maintains existing secure JWT authentication
- Auto-redirects to admin dashboard

#### 3. Booking Cancellation Workflow
**User Side:**
- Dashboard now shows "Request Cancel" button instead of "Cancel"
- Opens inline form for optional cancellation reason
- Shows cancellation status (PENDING, APPROVED, REJECTED)

**Admin Side:**
- New "Cancellation Requests" tab in bookings page
- Shows all pending cancellation requests
- Reviews button opens approval/rejection form
- Can add admin notes when responding

---

## 🧪 Testing Scenarios

### Scenario 1: Admin Registration & Login
1. Go to `http://localhost:5173/admin/register`
2. Fill in:
   - Name: "John Admin"
   - Email: "admin1@example.com"
   - Phone: "9876543210"
   - Password: "admin123"
   - Confirm: "admin123"
3. Click "Register as Admin"
4. Should redirect to admin dashboard
5. Verify account created in database:
   ```sql
   SELECT * FROM "User" WHERE role = 'ADMIN';
   ```

### Scenario 2: User Requests Cancellation
1. Login as regular user (create account if needed)
2. Book a seat (go through booking flow)
3. Go to user dashboard at `http://localhost:5173/dashboard`
4. Find your booking with status "CONFIRMED"
5. Click "Request Cancel" button
6. Optionally add reason: "Emergency"
7. Click "Confirm Request"
8. Verify:
   - Button changes to "Awaiting Admin Approval"
   - Status shows "Cancel: PENDING"
   - Booking still shows as CONFIRMED

### Scenario 3: Admin Reviews & Approves
1. Login as admin: `http://localhost:5173/admin/login`
2. Use admin account created in Scenario 1
3. Go to Admin Dashboard → Bookings
4. Click "Cancellation Requests" tab
5. See the pending request with:
   - Passenger name
   - Contact info
   - Route details
   - User's cancellation reason
6. Click "Review & Respond" button
7. In the form:
   - Add notes: "Approved - valid emergency"
   - Click "Approve" button
8. Verify:
   - Request removed from pending list
   - Booking status changed to CANCELLED
   - Cancellation status shows APPROVED

### Scenario 4: Admin Rejects Cancellation
1. Follow steps 1-6 from Scenario 3 with a different booking
2. In the review form:
   - Add reason: "Cancellation not allowed within 24 hours"
   - Click "Reject" button
3. Verify:
   - Request removed from pending
   - Booking still shows as CONFIRMED
   - Cancellation status shows REJECTED in user dashboard

### Scenario 5: User Cannot See Old Cancelled Bookings
1. As user, refresh dashboard
2. Previously cancelled bookings should show:
   - Status: CANCELLED
   - No "Request Cancel" button
   - Cancellation status visible

---

## 🔍 Database Inspection

### Check Booking Table Structure
```sql
-- View booking with cancellation details
SELECT 
  id,
  bookingId,
  status,
  cancellationStatus,
  cancellationRequestedAt,
  cancellationApprovedAt,
  cancellationReason,
  adminNotes
FROM "Booking"
WHERE id = 1;
```

### Check All Pending Cancellations
```sql
SELECT 
  b.id,
  b.bookingId,
  u.name,
  u.email,
  b.cancellationStatus,
  b.cancellationRequestedAt,
  b.cancellationReason
FROM "Booking" b
JOIN "User" u ON b.userId = u.id
WHERE b.cancellationStatus = 'PENDING'
ORDER BY b.cancellationRequestedAt DESC;
```

---

## 🛠️ Troubleshooting

### Issue: Admin registration returns "Email already registered"
**Solution**: The email already exists. Use a different email address.

### Issue: Cancellation button not appearing in dashboard
**Solution**: 
- Clear browser cache (Ctrl+Shift+Delete)
- Ensure frontend is restarted
- Check that you're logged in as regular user (not admin)
- Verify booking status is "CONFIRMED"

### Issue: Admin cannot see cancellation requests
**Solution**:
- Verify admin is logged in (check admin token in localStorage)
- Refresh the page
- Check browser console for errors
- Ensure user created cancellation request (not direct cancel)

### Issue: Database migration fails
**Solution**:
```bash
# Reset and try again
cd backend
npx prisma migrate resolve --rolled-back add_cancellation_workflow
npx prisma migrate dev --name add_cancellation_workflow
```

### Issue: API endpoints returning 404
**Solution**:
- Verify backend is running on correct port (default 5000)
- Check that `VITE_API_URL` in frontend is set correctly
- Ensure routes are properly imported in `server.js`

---

## 📊 API Testing with curl

### Test Admin Registration
```bash
curl -X POST http://localhost:5000/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "test@example.com",
    "password": "test123",
    "phone": "9876543210"
  }'
```

### Test Cancellation Request (as user)
```bash
curl -X POST http://localhost:5000/api/user/bookings/1/cancel-request \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Emergency"
  }'
```

### Test Get Pending Cancellations (as admin)
```bash
curl -X GET http://localhost:5000/api/admin/cancellations/pending \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Test Approve Cancellation (as admin)
```bash
curl -X POST http://localhost:5000/api/admin/cancellations/1/approve \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "adminNotes": "Approved"
  }'
```

---

## 🔐 Security Checklist

- [x] Admin endpoints require admin role
- [x] User can only request cancellation for their own bookings
- [x] Passwords hashed before storage
- [x] JWT tokens expire appropriately
- [x] Admin middleware validates role
- [x] Request validation on all endpoints
- [x] Error messages don't leak sensitive info

---

## 📁 Files Modified Summary

### Backend Files (7 files)
1. `schema.prisma` - Database schema
2. `auth.controller.js` - Admin registration
3. `booking.controller.js` - Cancellation request
4. `admin.controller.js` - Approval endpoints
5. `auth.routes.js` - Admin register route
6. `admin.routes.js` - Cancellation routes
7. `user.routes.js` - Cancel request route

### Frontend Files (6 files)
1. `App.jsx` - Added admin register route
2. `AdminLogin.jsx` - Added registration link
3. `AdminRegister.jsx` - New component
4. `AdminBookings.jsx` - Redesigned with tabs
5. `Dashboard.jsx` - Cancellation request UI
6. `api.js` - New API endpoints

---

## 🎯 Next Steps

### Optional Enhancements
1. **Email Notifications**: Send emails when cancellation is approved/rejected
2. **Cancellation Policies**: Add time-based cancellation rules (e.g., no cancellation within 24 hours)
3. **Refund Management**: Track refund status and amounts
4. **Cancellation Analytics**: Dashboard showing cancellation rates
5. **Bulk Operations**: Allow admin to approve/reject multiple requests at once

### Production Deployment
1. Set environment variables in `.env`
2. Enable HTTPS
3. Set secure JWT secrets
4. Configure CORS properly
5. Setup database backups
6. Monitor error logs

---

## 📞 Support

If you encounter issues:
1. Check console logs (browser dev tools)
2. Check backend server logs
3. Verify database connection
4. Check JWT tokens in localStorage
5. Review error messages in API responses

---

## ✨ Features Summary

| Feature | User | Admin | Status |
|---------|------|-------|--------|
| Register Account | ✅ | ✅ | Complete |
| Login | ✅ | ✅ | Complete |
| Book Seats | ✅ | - | Complete |
| Request Cancellation | ✅ | - | **NEW** |
| View Booking Status | ✅ | - | Updated |
| Approve Cancellation | - | ✅ | **NEW** |
| Reject Cancellation | - | ✅ | **NEW** |
| Manage Buses | - | ✅ | Complete |
| Manage Routes | - | ✅ | Complete |
| Manage Schedules | - | ✅ | Complete |

---

## 📝 Documentation Files

- `ADMIN_SYSTEM_REVISION.md` - Comprehensive overview of changes
- `ADMIN_API_REFERENCE.md` - API endpoint reference with examples
- `ADMIN_SYSTEM_REVISION_SETUP.md` - This file (setup & testing)

**Last Updated**: January 12, 2026
**Version**: 2.0.0
