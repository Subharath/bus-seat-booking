# 🚀 RAILWAY DEPLOYMENT GUIDE - COMPLETE A-Z INSTRUCTIONS

This guide will walk you through deploying your Bus Seat Booking application to Railway.app with PostgreSQL database.

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Setup Railway Account](#setup-railway-account)
3. [Push Code to GitHub](#push-code-to-github)
4. [Deploy Database on Railway](#deploy-database-on-railway)
5. [Deploy Backend on Railway](#deploy-backend-on-railway)
6. [Deploy Frontend on Railway](#deploy-frontend-on-railway)
7. [Configure Environment Variables](#configure-environment-variables)
8. [Run Database Migrations](#run-database-migrations)
9. [Test Your Deployment](#test-your-deployment)
10. [Continuous Deployment Setup](#continuous-deployment-setup)
11. [Troubleshooting](#troubleshooting)

---

## 1. PREREQUISITES ✅

Before you start, make sure you have:
- [ ] GitHub account (free)
- [ ] Git installed and configured
- [ ] Your code ready to commit
- [ ] All changes tested locally

---

## 2. SETUP RAILWAY ACCOUNT 🎫

### Step 2.1: Create Railway Account
1. Go to https://railway.app
2. Click **"Start a New Project"** or **"Login"**
3. Sign up using your **GitHub account** (recommended for easy deployments)
4. Verify your email if prompted
5. You'll get **$5 free credit monthly** (no credit card required)

### Step 2.2: Install Railway CLI (Optional but Helpful)
```powershell
# Install Railway CLI using npm
npm install -g @railway/cli

# Login to Railway
railway login
```

---

## 3. PUSH CODE TO GITHUB 📤

### Step 3.1: Initialize Git (if not already done)
```powershell
# Navigate to your project root
cd "D:\My Projects\bus-seat-booking"

# Check git status
git status
```

### Step 3.2: Commit All Changes
```powershell
# Add all files
git add .

# Commit with a message
git commit -m "Prepare for Railway deployment with production configs"

# Push to GitHub
git push origin main
```

### Step 3.3: Verify on GitHub
- Go to your GitHub repository
- Make sure all files are uploaded
- Check that `.env` files are NOT uploaded (they should be in `.gitignore`)

---

## 4. DEPLOY DATABASE ON RAILWAY 🗄️

### Step 4.1: Create New Project
1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy PostgreSQL"**
4. Railway will create a PostgreSQL database instantly

### Step 4.2: Get Database Credentials
1. Click on the **PostgreSQL** service
2. Go to **"Variables"** tab
3. You'll see:
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`
   - `DATABASE_URL` (This is what you need!)

4. **Copy the `DATABASE_URL`** - it looks like:
   ```
   postgresql://postgres:PASSWORD@HOST:PORT/railway
   ```

### Step 4.3: Note Down Database URL
Keep this URL safe - you'll need it for the backend deployment.

---

## 5. DEPLOY BACKEND ON RAILWAY 🔧

### Step 5.1: Add Backend Service to Project
1. In your Railway project, click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose your repository: `bus-seat-booking`
4. Railway will detect it's a Node.js project

### Step 5.2: Configure Backend Root Directory ⚠️ CRITICAL STEP
1. Click on the new service (it might be deploying and failing - that's okay)
2. Go to **"Settings"** tab
3. Scroll down to **"Service Settings"** section
4. Find **"Root Directory"** field
5. **Type exactly:** `backend` (no slashes, no spaces)
6. Click **"Save"** or **"Update"**
7. The service will automatically redeploy with the correct directory

**Why this is needed:** Railway needs to know which folder contains your app since you have both backend and frontend in one repository.

### Step 5.3: Add Environment Variables
1. Go to **"Variables"** tab
2. Click **"+ New Variable"**
3. Add the following variables ONE BY ONE:

```env
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:PORT/railway
(Use the one you copied from Step 4.2)

JWT_SECRET=bus-booking-super-secret-key-production-2026-change-this-to-random-string
JWT_REFRESH_SECRET=bus-booking-refresh-secret-key-production-2026-change-this-also
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

NODE_ENV=production

FRONTEND_URL=
(Leave this empty for now, we'll add it after frontend deployment)
```

### Step 5.4: Deploy Backend
1. Go to **"Deployments"** tab
2. Railway will automatically start deploying
3. Wait for the build to complete (2-5 minutes)
4. Once deployed, you'll see a green checkmark ✅

### Step 5.5: Generate Public URL for Backend
1. Go to **"Settings"** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"**
4. Railway will give you a URL like: `https://your-backend-production.up.railway.app`
5. **Copy this URL** - you'll need it for frontend

### Step 5.6: Test Backend API
1. Open the backend URL in browser: `https://your-backend.railway.app`
2. You should see: **"Bus Seat Booking API running 🚍"**

---

## 6. DEPLOY FRONTEND ON RAILWAY 🎨

### Step 6.1: Add Frontend Service
1. In same Railway project, click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose the same repository: `bus-seat-booking`
4. Railway creates another service

### Step 6.2: Configure Frontend Root Directory ⚠️ CRITICAL STEP
1. Click on the frontend service (it might be deploying and failing - that's okay)
2. Go to **"Settings"** tab
3. Scroll down to **"Service Settings"** section
4. Find **"Root Directory"** field
5. **Type exactly:** `frontend` (no slashes, no spaces)
6. Click **"Save"** or **"Update"**
7. The service will automatically redeploy with the correct directory

**Why this is needed:** This tells Railway to build from the frontend folder instead of the root.

### Step 6.3: Add Frontend Environment Variables
1. Go to **"Variables"** tab
2. Add this variable:

```env
VITE_API_URL=https://your-backend-production.up.railway.app/api
(Use the backend URL you got in Step 5.5, add /api at the end)
```

### Step 6.4: Configure Build Settings
1. Go to **"Settings"** tab
2. Under **"Build"**, verify:
   - Build Command: `npm run build` (auto-detected)
   - Start Command: `npm run preview` (from railway.json)

### Step 6.5: Deploy Frontend
1. Go to **"Deployments"** tab
2. Wait for build to complete (2-5 minutes)
3. Look for green checkmark ✅

### Step 6.6: Generate Public URL for Frontend
1. Go to **"Settings"** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"**
4. Railway gives you: `https://your-frontend-production.up.railway.app`
5. **This is your live app URL!** 🎉

---

## 7. CONFIGURE ENVIRONMENT VARIABLES 🔐

### Step 7.1: Update Backend FRONTEND_URL
1. Go to **Backend service** in Railway
2. Go to **"Variables"** tab
3. Find `FRONTEND_URL` variable
4. Set it to your frontend URL from Step 6.6:
   ```
   https://your-frontend-production.up.railway.app
   ```
5. Click **"Deploy"** to restart backend with new variable

### Step 7.2: Verify CORS Configuration
Backend will now allow requests from your frontend URL.

---

## 8. RUN DATABASE MIGRATIONS 📊

### Step 8.1: Access Backend Logs
1. Go to **Backend service**
2. Click on **"Deployments"** tab
3. Click on the latest deployment
4. Check the logs

### Step 8.2: Run Migrations via Railway CLI (Method 1)
```powershell
# Link to your Railway project
railway link

# Select your backend service
railway service

# Run migrations
railway run npm run deploy
```

### Step 8.3: Run Migrations via Web Terminal (Method 2)
1. In Railway backend service, go to **"Settings"**
2. Scroll to **"Service"**
3. Look for terminal/shell option (if available)
4. Or, trigger migration on next deployment

### Step 8.4: Automatic Migration on Deploy
The `postinstall` script in package.json should run migrations automatically:
```json
"postinstall": "npx prisma generate"
```

And you can manually trigger:
1. Go to backend service
2. Go to **"Deployments"**
3. Click **"..."** menu
4. Select **"Redeploy"**

---

## 9. TEST YOUR DEPLOYMENT 🧪

### Step 9.1: Test Backend API
Open in browser or Postman:
```
https://your-backend.railway.app/
```
Should show: "Bus Seat Booking API running 🚍"

Test an endpoint:
```
GET https://your-backend.railway.app/api/user/routes
```

### Step 9.2: Test Frontend Application
1. Open: `https://your-frontend.railway.app`
2. Try to register a new account
3. Try to login
4. Test booking flow
5. Test admin panel

### Step 9.3: Check Database
1. Go to **PostgreSQL service** in Railway
2. Click **"Data"** tab
3. You should see your tables (User, Bus, Route, etc.)

---

## 10. CONTINUOUS DEPLOYMENT SETUP 🔄

### Step 10.1: Automatic Deployments
Railway automatically deploys when you push to GitHub!

```powershell
# Make a change in your code
# Example: Update README.md

git add .
git commit -m "Update application"
git push origin main

# Railway will automatically:
# 1. Detect the push
# 2. Build your code
# 3. Deploy to production
# (Takes 2-5 minutes)
```

### Step 10.2: Configure Deployment Branch
1. Go to each service (backend/frontend)
2. Go to **"Settings"** > **"Source"**
3. Under **"Branch"**, select `main`
4. Enable **"Automatic Deploys"**

### Step 10.3: Set Up Development Branch (Optional)
For safer deployments:

```powershell
# Create dev branch
git checkout -b dev
git push origin dev

# Work on dev branch
# When ready, merge to main:
git checkout main
git merge dev
git push origin main
```

---

## 11. TROUBLESHOOTING 🔧

### Issue 1: Database Connection Failed
**Error:** `Can't reach database server`

**Solution:**
1. Check DATABASE_URL is correct in backend variables
2. Make sure PostgreSQL service is running
3. Verify no typos in connection string

### Issue 2: Frontend Can't Connect to Backend
**Error:** `Network Error` or `CORS Error`

**Solution:**
1. Verify `VITE_API_URL` in frontend variables
2. Check `FRONTEND_URL` in backend variables
3. Make sure both URLs are correct
4. Redeploy both services

### Issue 3: Build Failed
**Error:** `Build failed with exit code 1`

**Solution:**
1. Check logs in Railway deployment
2. Make sure all dependencies are in `package.json`
3. Verify build commands are correct
4. Check for syntax errors in code

### Issue 4: Migrations Not Running
**Error:** `Table doesn't exist`

**Solution:**
```powershell
# Use Railway CLI
railway link
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

### Issue 5: App Crashes After Deploy
**Error:** `Application Error`

**Solution:**
1. Check logs in Railway
2. Verify all environment variables are set
3. Check PORT is not hardcoded (use process.env.PORT)
4. Look for missing dependencies

### Issue 6: Out of Railway Credits
**Solution:**
1. Railway gives $5/month free
2. Monitor usage in dashboard
3. Optimize by:
   - Reducing always-on services
   - Using sleep mode for dev environments
4. Or upgrade to Railway Pro ($5/month)

---

## 🎯 FINAL CHECKLIST

Before sharing with your supervisor:

- [ ] Backend is deployed and running
- [ ] Frontend is deployed and running
- [ ] Database is connected and migrations ran
- [ ] Can register new users
- [ ] Can login (both user and admin)
- [ ] Can view bus routes
- [ ] Can book seats
- [ ] Admin panel works
- [ ] URLs are public and accessible
- [ ] HTTPS enabled (automatic on Railway)

---

## 📱 SHARE WITH SUPERVISOR

Send your supervisor:

**Frontend URL:** `https://your-frontend.railway.app`
**Backend URL:** `https://your-backend.railway.app`

Example message:
```
Dear Supervisor,

I've deployed the Bus Seat Booking application:

🌐 Application: https://your-frontend.railway.app
🔧 Backend API: https://your-backend.railway.app

Test Accounts:
- Admin: admin@test.com / admin123
- User: user@test.com / user123

The application supports:
✅ User registration and login
✅ Bus route browsing
✅ Seat booking with real-time availability
✅ Admin dashboard for managing buses, routes, and schedules
✅ Booking management and cancellations

Tech Stack: React + Vite, Node.js + Express, PostgreSQL, Prisma ORM
Hosting: Railway.app with continuous deployment from GitHub

I can make changes and they'll automatically deploy when I push to GitHub.

Best regards
```

---

## 🚀 MAKING CHANGES AFTER DEPLOYMENT

### Quick Update Process:
```powershell
# 1. Make your changes locally
# Edit files...

# 2. Test locally
cd backend
npm run dev

cd ../frontend
npm run dev

# 3. Commit and push
git add .
git commit -m "Description of changes"
git push origin main

# 4. Railway automatically deploys (wait 2-5 min)
# 5. Test live site
```

---

## 💡 PRO TIPS

1. **Monitor Logs:** Always check Railway logs when debugging
2. **Environment Variables:** Never commit `.env` files to GitHub
3. **Database Backups:** Railway Pro includes automatic backups
4. **Custom Domain:** Can add your own domain in Railway settings
5. **Scaling:** Railway can handle decent traffic on free tier
6. **Cost Management:** Monitor usage to stay within free tier

---

## 📚 USEFUL COMMANDS

```powershell
# Railway CLI Commands
railway login                    # Login to Railway
railway link                     # Link to project
railway status                   # Check deployment status
railway logs                     # View logs
railway run <command>           # Run command in Railway environment
railway open                     # Open project in browser

# Database Commands
railway run npx prisma migrate deploy    # Run migrations
railway run npx prisma db seed          # Seed database
railway run npx prisma studio           # Open Prisma Studio

# Git Commands
git status                       # Check changes
git add .                        # Stage all changes
git commit -m "message"         # Commit changes
git push origin main            # Deploy to production
```

---

## 🆘 NEED HELP?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Prisma Docs: https://www.prisma.io/docs

---

**Deployment Date:** January 2026
**Estimated Setup Time:** 30-45 minutes
**Monthly Cost:** $0 (Free tier)

Good luck with your deployment! 🚀
