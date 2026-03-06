# Vercel Backend Deployment Guide

## ✅ What I've Done For You

1. ✅ Created `backend/api/index.js` - Vercel serverless entry point
2. ✅ Created `backend/vercel.json` - Routing and build configuration
3. ✅ Fixed Prisma client to use shared singleton (prevents connection leaks)
4. ✅ Added `postinstall` script to auto-generate Prisma client on deploy
5. ✅ Committed and pushed to `test` branch

---

## 🚀 Step-by-Step Vercel Deployment

### Step 1: Set Up Production Database

**Option A: Neon (Recommended - Free tier)**
1. Go to https://neon.tech
2. Sign up/login
3. Create new project → choose region closest to you
4. Create database: `bus_booking`
5. Copy **Connection String** (looks like: `postgresql://user:pass@ep-xxx.neon.tech/bus_booking?sslmode=require`)

**Option B: Supabase**
1. Go to https://supabase.com
2. Create project
3. Database → Connection String → copy the **Connection Pooling** URL (important!)

**Option C: Railway Postgres Only**
- If you can create a standalone Postgres database on Railway without linking GitHub, use that

**Save this connection string - you'll need it twice.**

---

### Step 2: Deploy Backend to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with GitHub
3. Click **"Add New..."** → **"Project"**
4. **Import your repository**: `bus-seat-booking`
5. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: `backend` ⚠️ Important!
   - **Build Command**: Leave as default
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

6. **Environment Variables** - Click "Add" for each:

```
DATABASE_URL
postgresql://your-connection-string-here

JWT_SECRET
your-super-secret-random-string-here

FRONTEND_URL
http://localhost:5173

BACKEND_URL
leave-empty-for-now

PAYHERE_MERCHANT_ID
your-payhere-merchant-id

PAYHERE_MERCHANT_SECRET
your-payhere-merchant-secret

PAYHERE_SANDBOX_URL
https://sandbox.payhere.lk/pay/checkout
```

7. **Select Branch**: Choose `test` branch (important!)
8. Click **"Deploy"**

Wait for deployment to complete (~2-3 minutes).

---

### Step 3: Get Your Backend URL

1. After deployment succeeds, Vercel shows your URL:
   - Example: `https://bus-seat-booking-backend.vercel.app`
2. Click on the URL to test - you should see:
   ```
   Bus Seat Booking API running 🚍
   ```

---

### Step 4: Update BACKEND_URL Environment Variable

1. In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Find `BACKEND_URL` 
3. Click **Edit** → paste your Vercel URL:
   ```
   https://bus-seat-booking-backend.vercel.app
   ```
4. Click **Save**
5. Go to **Deployments** tab → click ⋯ on latest deployment → **Redeploy**

---

### Step 5: Run Database Migrations

On your local machine:

1. Create a temporary `.env` file in `backend/` folder:
   ```bash
   cd backend
   ```

2. Add your production database URL:
   ```env
   DATABASE_URL="postgresql://your-production-connection-string"
   ```

3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. ✅ You should see: "All migrations have been successfully applied"

5. **Delete the `.env` file** or keep only local DATABASE_URL

---

### Step 6: Test Your Backend

**Test health endpoint:**
```
https://your-backend.vercel.app/
```
Should show: `Bus Seat Booking API running 🚍`

**Test PayHere notify endpoint:**
```
curl -X POST https://your-backend.vercel.app/api/payment/notify
```
Should show: `Invalid merchant` (expected - means endpoint is reachable)

---

### Step 7: Update Frontend Configuration

In your local `frontend/.env` file:

```env
VITE_API_URL=https://your-backend.vercel.app/api
```

Restart your frontend:
```bash
cd frontend
npm run dev
```

---

### Step 8: Configure PayHere

Your backend automatically sends the correct `notify_url` from `BACKEND_URL`, so:

**PayHere will receive:**
```
notify_url: https://your-backend.vercel.app/api/payment/notify
```

No manual configuration needed in PayHere dashboard if using API integration.

---

## 🧪 Testing Payment Flow

1. Start your local frontend (`npm run dev` in frontend folder)
2. Make sure `VITE_API_URL` points to Vercel backend
3. Create a booking
4. Initiate payment
5. Complete payment in PayHere sandbox
6. Check Vercel logs to see if PayHere callback hit `/api/payment/notify`

**To view logs:**
- Vercel Dashboard → Your Project → Deployments → Latest → View Function Logs

---

## 🔧 Troubleshooting

### Database Connection Issues
**Error:** `Can't reach database server`
- ✅ Make sure you're using the **connection pooling URL** (not direct connection)
- ✅ Check if DATABASE_URL in Vercel matches your production DB
- ✅ For Neon: connection string should have `?sslmode=require`
- ✅ For Supabase: use **Connection Pooling** URL (port 6543), not direct (port 5432)

### CORS Errors
**Error:** `blocked by CORS policy`
- ✅ Check `FRONTEND_URL` is exactly your frontend domain (no trailing slash)
- ✅ If testing locally: `FRONTEND_URL=http://localhost:5173`
- ✅ Redeploy after changing environment variables

### PayHere Callback Not Working
**Issue:** Payment completes but status doesn't update
- ✅ Check Vercel function logs for errors
- ✅ Verify `BACKEND_URL` is set correctly
- ✅ Verify `PAYHERE_MERCHANT_SECRET` matches PayHere dashboard
- ✅ Check PayHere sandbox allows your Vercel domain

### Build/Deploy Fails
**Error:** `Prisma Client could not be generated`
- ✅ Verify `postinstall` script exists in `package.json`
- ✅ Check if `prisma` is in `dependencies` (not devDependencies)

---

## 🎯 Your notify_url

Once deployed, PayHere will call:
```
https://your-backend.vercel.app/api/payment/notify
```

This endpoint is:
- ✅ Public (no authentication required)
- ✅ Accepts `application/x-www-form-urlencoded` (PayHere format)
- ✅ Verifies PayHere signature
- ✅ Updates booking payment status

---

## 📝 Environment Variables Summary

Copy this template to Vercel (fill in your values):

```env
# Database
DATABASE_URL=postgresql://user:pass@host/database?sslmode=require

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=https://your-backend.vercel.app

# PayHere
PAYHERE_MERCHANT_ID=your-merchant-id
PAYHERE_MERCHANT_SECRET=your-merchant-secret
PAYHERE_SANDBOX_URL=https://sandbox.payhere.lk/pay/checkout
```

---

## 🚨 Important Notes

1. **Branch Strategy**:
   - Keep working on `dev` branch locally
   - Merge to `test` when ready to deploy: `git merge dev`
   - Push to trigger redeployment: `git push origin test`

2. **Production vs Testing**:
   - Vercel Production Branch: Set to `test` in project settings
   - All pushes to `test` auto-deploy
   - Other branches create preview deployments

3. **Database Migrations**:
   - Never run `prisma migrate dev` against production DB
   - Always use `prisma migrate deploy` for production
   - Run migrations before testing new features

4. **Costs**:
   - Vercel: Free tier (sufficient for testing)
   - Neon/Supabase: Free tier (sufficient for small apps)

---

## ✅ Quick Verification Checklist

Before going live:
- [ ] Backend deploys successfully on Vercel
- [ ] `DATABASE_URL` points to production database
- [ ] Migrations applied with `npx prisma migrate deploy`
- [ ] Backend health endpoint returns 200
- [ ] `BACKEND_URL` is set and redeployed
- [ ] Frontend `VITE_API_URL` points to Vercel backend
- [ ] Can create bookings through frontend
- [ ] PayHere payment initiation works
- [ ] PayHere callback logs appear in Vercel logs
- [ ] Payment status updates after completing payment

---

Need help? Check:
- Vercel Docs: https://vercel.com/docs
- Prisma + Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- Neon Docs: https://neon.tech/docs/introduction
