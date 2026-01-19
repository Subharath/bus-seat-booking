# 🔧 RAILWAY DEPLOYMENT TROUBLESHOOTING

## ❌ ERROR: "Railpack could not determine how to build the app"

### Problem
```
⚠ Script start.sh not found
✖ Railpack could not determine how to build the app.
```

### Root Cause
Railway is trying to build from the **root directory** which contains both `backend/` and `frontend/` folders, so it doesn't know which one to build.

### Solution: Set Root Directory

#### If Service Already Exists:
1. Go to Railway dashboard
2. Click on the failing service
3. Click **"Settings"** tab (left sidebar)
4. Scroll to **"Service Settings"**
5. Find **"Root Directory"** field
6. Enter: `backend` (for backend) or `frontend` (for frontend)
7. Click **"Save"**
8. Service will automatically redeploy ✅

#### Visual Guide:
```
Settings Tab
└── Service Settings
    └── Root Directory: [backend] or [frontend]
        └── Click "Save"
```

---

## ✅ CORRECT PROJECT STRUCTURE

Your Railway project should have **3 services**:

```
My Railway Project (Dashboard)
│
├── 🗄️ PostgreSQL
│   └── Provides DATABASE_URL automatically
│
├── ⚙️ Backend Service
│   ├── Source: GitHub (your-repo)
│   ├── Root Directory: backend ← IMPORTANT
│   ├── Start Command: npm start
│   └── Environment Variables:
│       ├── DATABASE_URL (from PostgreSQL)
│       ├── JWT_SECRET
│       ├── JWT_REFRESH_SECRET
│       ├── JWT_EXPIRES_IN
│       ├── JWT_REFRESH_EXPIRES_IN
│       ├── NODE_ENV=production
│       └── FRONTEND_URL
│
└── 🎨 Frontend Service
    ├── Source: GitHub (same repo)
    ├── Root Directory: frontend ← IMPORTANT
    ├── Start Command: npm run preview
    └── Environment Variables:
        └── VITE_API_URL
```

---

## 🔄 HOW TO CREATE SERVICES CORRECTLY

### Step 1: Create PostgreSQL
1. Click **"+ New"**
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Done! ✅

### Step 2: Create Backend Service
1. Click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose repository: `bus-seat-booking`
4. **IMMEDIATELY** go to Settings → Root Directory → `backend`
5. Add environment variables
6. Let it deploy

### Step 3: Create Frontend Service
1. Click **"+ New"** (in same project)
2. Select **"GitHub Repo"**
3. Choose **SAME** repository: `bus-seat-booking`
4. **IMMEDIATELY** go to Settings → Root Directory → `frontend`
5. Add environment variables
6. Let it deploy

---

## 🚨 COMMON MISTAKES

### ❌ Mistake 1: Not Setting Root Directory
**Problem:** Railway sees root folder with backend/ and frontend/
**Solution:** Settings → Root Directory → `backend` or `frontend`

### ❌ Mistake 2: Creating One Service for Both
**Problem:** Trying to deploy backend and frontend as one service
**Solution:** Create TWO separate services with different root directories

### ❌ Mistake 3: Wrong Root Directory Path
**Problem:** Using `./backend` or `/backend` or `backend/`
**Solution:** Use exactly: `backend` (no slashes, no dots)

### ❌ Mistake 4: Deploying Before Setting Root Directory
**Problem:** Service fails, then you set root directory
**Solution:** That's okay! Just save the root directory and it will redeploy

---

## 🔍 HOW TO CHECK IF IT'S WORKING

### Backend Service:
1. Check Logs → Should see "Server running on port XXXX"
2. Visit generated URL → Should show "Bus Seat Booking API running 🚍"
3. Check Variables tab → DATABASE_URL should be present

### Frontend Service:
1. Check Logs → Should see "preview server running"
2. Visit generated URL → Should load your React app
3. Check browser console → No API errors

---

## 📊 DEPLOYMENT LOGS - WHAT TO EXPECT

### Successful Backend Deployment:
```
✓ Building...
✓ Installing dependencies
✓ Running npm install
✓ Generating Prisma Client
✓ Build completed
✓ Starting server
✓ Server running on port 3000
```

### Successful Frontend Deployment:
```
✓ Building...
✓ Installing dependencies  
✓ Running npm run build
✓ Build completed
✓ Starting preview server
✓ Server running on port 4173
```

### Failed Deployment (No Root Directory):
```
✖ Railpack could not determine how to build the app
⚠ Script start.sh not found
```
**Fix:** Set Root Directory!

---

## 🛠️ OTHER COMMON ISSUES

### Issue: Database Connection Error
**Error:** `Can't reach database server`

**Solutions:**
1. Check DATABASE_URL in backend Variables
2. Make sure PostgreSQL service is running (green)
3. Verify DATABASE_URL format:
   ```
   postgresql://postgres:PASSWORD@HOST:PORT/railway
   ```

### Issue: CORS Error in Frontend
**Error:** `Access-Control-Allow-Origin`

**Solutions:**
1. Check backend FRONTEND_URL variable
2. Should match your frontend Railway URL exactly
3. Redeploy backend after updating

### Issue: Frontend Shows "Failed to Fetch"
**Error:** Network error when calling API

**Solutions:**
1. Check frontend VITE_API_URL variable
2. Should be: `https://your-backend.railway.app/api`
3. Don't forget `/api` at the end!
4. Redeploy frontend after updating

### Issue: Build Succeeds but App Crashes
**Check these:**
1. PORT is not hardcoded (use `process.env.PORT`)
2. All environment variables are set
3. Database migrations ran (check logs)
4. No missing dependencies in package.json

---

## 📞 NEED MORE HELP?

### Quick Checks:
- [ ] Root Directory set for both services?
- [ ] All environment variables added?
- [ ] PostgreSQL service running?
- [ ] Backend URL generated?
- [ ] Frontend URL generated?

### Railway Resources:
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

### Your Documentation:
- Complete Guide: [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)
- Quick Reference: [DEPLOYMENT_QUICK_REF.md](DEPLOYMENT_QUICK_REF.md)

---

## ✅ FINAL CHECKLIST

After fixing:
- [ ] Backend service has Root Directory = `backend`
- [ ] Frontend service has Root Directory = `frontend`
- [ ] Both services deployed successfully (green checkmark)
- [ ] Backend URL shows API message
- [ ] Frontend URL loads your app
- [ ] Can login/register
- [ ] Database connected

---

**Last Updated:** January 18, 2026
**Common Issue:** Root Directory not set
**Quick Fix:** Settings → Root Directory → `backend` or `frontend`
