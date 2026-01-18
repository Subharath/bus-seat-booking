# 🚀 QUICK DEPLOYMENT REFERENCE

## Railway URLs Structure
```
Backend:  https://your-backend-production-xxxxx.up.railway.app
Frontend: https://your-frontend-production-xxxxx.up.railway.app
Database: Internal Railway PostgreSQL (connected via DATABASE_URL)
```

## Environment Variables Needed

### Backend (.env in Railway Dashboard)
```env
DATABASE_URL=postgresql://...  (from Railway PostgreSQL plugin)
JWT_SECRET=your-strong-secret-key
JWT_REFRESH_SECRET=your-strong-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://your-frontend.railway.app
```

### Frontend (.env in Railway Dashboard)
```env
VITE_API_URL=https://your-backend.railway.app/api
```

## Deployment Workflow

### Initial Deploy (One-time)
1. Create Railway account → https://railway.app
2. Create new project
3. Add PostgreSQL database
4. Deploy backend from GitHub (root: `backend`)
5. Deploy frontend from GitHub (root: `frontend`)
6. Add environment variables to both
7. Generate domains for both services
8. Update FRONTEND_URL and VITE_API_URL
9. Redeploy both services

### Making Changes (Every time)
```bash
# 1. Make changes locally
# 2. Test locally
npm run dev

# 3. Commit and push
git add .
git commit -m "Your changes"
git push origin main

# Railway auto-deploys in 2-5 minutes ✅
```

## Railway CLI Quick Commands
```bash
npm install -g @railway/cli
railway login
railway link
railway status
railway logs
railway run npx prisma migrate deploy
```

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| CORS Error | Update FRONTEND_URL in backend vars |
| Can't connect to API | Check VITE_API_URL in frontend vars |
| Database error | Verify DATABASE_URL from PostgreSQL service |
| Build fails | Check logs, verify package.json scripts |
| Migrations not running | Run `railway run npx prisma migrate deploy` |

## Cost Breakdown
- Railway Free: $5 credit/month
- Backend: ~$2-3/month
- Frontend: ~$1-2/month  
- Database: Included
- **Total: FREE** (within $5 credit)

## Project Structure on Railway
```
My Railway Project
├── PostgreSQL (database)
├── backend (Node.js service)
│   ├── Root: backend/
│   ├── Start: npm start
│   └── Build: npm run build
└── frontend (Vite service)
    ├── Root: frontend/
    ├── Start: npm run preview
    └── Build: npm run build
```

## Test Checklist
- [ ] Backend URL shows "Bus Seat Booking API running 🚍"
- [ ] Frontend loads without errors
- [ ] Can register new user
- [ ] Can login
- [ ] Can view routes
- [ ] Can select seats
- [ ] Can make booking
- [ ] Admin panel accessible

## Important Files Changed
✅ backend/.env - Added production variables
✅ backend/package.json - Added deploy scripts
✅ backend/src/app.js - Updated CORS
✅ backend/railway.json - Railway config
✅ frontend/.env - Added API URL
✅ frontend/railway.json - Railway config

## Support
- Railway Docs: https://docs.railway.app
- Prisma Docs: https://prisma.io/docs
- Your deployment guide: RAILWAY_DEPLOYMENT.md
