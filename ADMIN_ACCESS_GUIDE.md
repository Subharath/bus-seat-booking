# How to Access Admin Portal 🔐

## Step-by-Step Guide

### **Option 1: Direct Admin Portal Link**
1. Open the application at `http://localhost:3000`
2. On the **Home page**, scroll down or look at the bottom of the hero section
3. Click the **"Admin Portal"** link
4. You'll be taken directly to the Admin Login page

---

### **Option 2: From User Login Page**
1. Go to the **User Login** page (`/login`)
2. You'll see a message at the bottom: **"Are you an admin? Admin Portal →"**
3. Click the **"Admin Portal"** link
4. You'll be taken to the Admin Login page

---

### **Option 3: From User Registration Page**
1. Go to the **User Registration** page (`/register`)
2. You'll see a message at the bottom: **"Are you an admin? Admin Portal →"**
3. Click the **"Admin Portal"** link
4. You'll be taken to the Admin Registration page

---

## Navigation Flow

```
Home Page
├── "Book Now" → Routes Selection
├── "Sign Up" → User Registration
│   └── (Link to Admin Portal)
│       ├── /admin/register → Create Admin Account
│       └── Can switch to /admin/login
└── "Admin Portal" → Admin Login

User Login (/login)
├── "Sign in" → User Dashboard
└── "Admin Portal" → Admin Portal

User Registration (/register)
├── "Create account" → User Dashboard
└── "Admin Portal" → Admin Registration

Admin Login (/admin/login)
├── "Login as Admin" → Admin Dashboard
└── "Create Account" or "User Login"

Admin Registration (/admin/register)
├── "Register as Admin" → Admin Dashboard
└── "Admin Login" or "User Login"
```

---

## Admin Account Setup

### **First Time Setup:**
1. **Visit Admin Registration**: Go to `/admin/register`
2. **Fill in Details**:
   - Full Name (e.g., "Admin User")
   - Email (e.g., "admin@busbooking.com")
   - Password (min 6 chars, must contain uppercase, lowercase, and numbers)
   - Confirm Password
   - Phone Number (optional)
3. **Create Account**: Click "Register as Admin"
4. **Auto-Login**: You'll be automatically logged in and redirected to Admin Dashboard

### **Existing Admin Account:**
1. **Visit Admin Login**: Go to `/admin/login`
2. **Enter Credentials**:
   - Email address
   - Password
3. **Login**: Click "Login as Admin"
4. **Access Dashboard**: You'll see the Admin Dashboard with all management options

---

## Admin Dashboard Features

Once logged in, admins can:

### 📋 **Manage Buses** (`/admin/buses`)
- View all buses
- Add new buses
- Edit bus details
- Delete buses

### 🛣️ **Manage Routes** (`/admin/routes`)
- View all routes
- Add new routes (from → to locations)
- Edit routes
- Delete routes

### ⏰ **Manage Schedules** (`/admin/schedules`)
- View all schedules
- Add new schedules with dates and times
- Link schedules to buses and routes
- Edit schedule details
- Delete schedules

### 📖 **View All Bookings** (`/admin/bookings`)
- See all customer bookings
- View booking details
- Cancel bookings directly

### ❌ **Manage Cancellation Requests** (`/admin/bookings`)
- View pending cancellation requests from customers
- Review cancellation reasons
- **Approve** cancellations (seat becomes available)
- **Reject** cancellations with reason
- View approval/rejection history

---

## Quick Links

| Action | URL | Steps |
|--------|-----|-------|
| **Create Admin Account** | `/admin/register` | Register → Verify email → Login → Dashboard |
| **Login as Admin** | `/admin/login` | Enter credentials → Login → Dashboard |
| **View Dashboard** | `/admin/dashboard` | (Auto-redirect after login) |
| **From Home Page** | `/` | Scroll down → Click "Admin Portal" link |
| **From User Login** | `/login` | Scroll down → Click "Admin Portal" link |
| **From User Register** | `/register` | Scroll down → Click "Admin Portal" link |

---

## Troubleshooting

### ❓ **Can't find Admin Portal link**
- Make sure you're on the Home page (`/`), User Login (`/login`), or User Registration (`/register`)
- Look for text saying "Are you an admin?" or "Admin Portal"
- Direct access: Type `/admin/login` in the address bar

### ❓ **Admin account creation failed**
- Check if password meets requirements (6+ chars, uppercase, lowercase, number)
- Ensure email is not already registered
- Check console for error messages

### ❓ **Can't login as admin**
- Verify email and password are correct
- Check that the account was created with ADMIN role
- Try creating a new admin account if needed

### ❓ **Dashboard not loading**
- Ensure you're logged in as an admin (check localStorage for accessToken)
- Try refreshing the page
- Clear browser cache and login again

---

## Security Notes

✅ **Token-based Authentication**
- Admin credentials are verified via JWT tokens
- Tokens are stored securely in localStorage
- Automatic token refresh every 15 minutes

✅ **Role-Based Access Control**
- Only admin accounts can access `/admin/*` routes
- User accounts cannot access admin features
- Non-authenticated users are redirected to login

✅ **Protected Routes**
- All admin features require valid admin session
- Invalid tokens are automatically rejected
- Expired tokens trigger re-authentication

---

## Testing Admin Features

### Test Scenario 1: Basic Admin Operations
1. Create admin account at `/admin/register`
2. Login at `/admin/login`
3. Navigate to Buses management
4. Add a new bus
5. Verify bus appears in the list

### Test Scenario 2: Route & Schedule Management
1. Create routes (e.g., "Colombo → Kandy")
2. Create schedules linked to routes and buses
3. Verify schedules appear when users browse routes

### Test Scenario 3: Cancellation Workflow
1. **As User**: Book a seat, then request cancellation with reason
2. **As Admin**: 
   - View pending cancellation requests
   - Approve some, reject others
   - Add admin notes when rejecting
3. **Verify**: Check booking status updates correctly

---

## Environment

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Portal**: http://localhost:3000/admin/login

All features are fully functional and ready for testing!
