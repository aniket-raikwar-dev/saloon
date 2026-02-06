# ⚡ Quick Deployment Checklist

## 🎯 Fastest Way to Deploy (5 Steps)

### 1️⃣ Prepare Backend
```bash
cd backend
# Make sure .env has all variables
# Update CORS in index.js with your frontend URL
```

### 2️⃣ Deploy Backend to Railway
1. Go to https://railway.app
2. New Project → GitHub → Select `backend` folder
3. Add environment variables from `.env`
4. Deploy → Copy URL: `https://your-api.railway.app`

### 3️⃣ Prepare Frontend
```bash
cd frontend
# Create .env.production:
echo "VITE_API_URL=https://your-api.railway.app/api" > .env.production
```

### 4️⃣ Deploy Frontend to Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
```
OR use Vercel dashboard → Import GitHub → Select `frontend`

### 5️⃣ Update Backend CORS
Add your Vercel URL to `backend/index.js` allowedOrigins array

---

## 📋 Pre-Deployment Checklist

### Backend:
- [ ] MongoDB Atlas IP whitelist: `0.0.0.0/0` (allow all)
- [ ] All `.env` variables set in Railway
- [ ] CORS updated with frontend URL
- [ ] Test API endpoints locally

### Frontend:
- [ ] `.env.production` created with backend URL
- [ ] Build works: `npm run build`
- [ ] PWA icons generated (if using PWA)
- [ ] Test preview: `npm run preview`

---

## 🔗 After Deployment

**Backend URL**: `https://your-api.railway.app`  
**Frontend URL**: `https://your-app.vercel.app`

**Test**:
- [ ] Frontend loads
- [ ] Login works
- [ ] API calls succeed
- [ ] File uploads work

---

## 🆘 Common Issues

**CORS Error?**
→ Add frontend URL to backend CORS allowedOrigins

**API 404?**
→ Check `VITE_API_URL` in frontend `.env.production`

**MongoDB Connection Failed?**
→ Check MongoDB Atlas Network Access → Add `0.0.0.0/0`

**Build Fails?**
→ Check Node version, clear `node_modules`, reinstall

---

## 📚 Full Guide

See `DEPLOYMENT_GUIDE.md` for detailed instructions.
