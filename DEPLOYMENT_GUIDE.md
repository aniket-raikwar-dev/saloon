# 🚀 Full-Stack Deployment Guide

## Overview

This guide covers deploying:
- **Backend**: Express.js API (Node.js)
- **Frontend**: React + Vite (Static files)
- **Database**: MongoDB Atlas (Cloud)

## Deployment Options

### Option 1: Separate Hosting (Recommended)
- **Backend**: Railway / Render / Heroku
- **Frontend**: Vercel / Netlify
- **Database**: MongoDB Atlas (already configured)

### Option 2: Full-Stack Platform
- **Backend + Frontend**: Railway / Render
- **Database**: MongoDB Atlas

---

## 🎯 Option 1: Separate Hosting (Best Performance)

### Part A: Deploy Backend (Express API)

#### Using Railway (Recommended - Easy & Free)

1. **Sign up**: https://railway.app (use GitHub)

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `Saloon` repository
   - Select the `backend` folder

3. **Configure Environment Variables**:
   - Go to your project → Variables
   - Add all variables from `backend/.env`:
     ```
     NODE_ENV=production
     PORT=5000
     MONGODB_URI=your_mongodb_atlas_uri
     JWT_SECRET=your_jwt_secret
     JWT_REFRESH_SECRET=your_refresh_secret
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     ```

4. **Set Build Command** (if needed):
   - Railway auto-detects Node.js projects
   - No build command needed for Express

5. **Deploy**:
   - Railway automatically deploys on push
   - Get your backend URL: `https://your-app.railway.app`

#### Using Render (Alternative)

1. **Sign up**: https://render.com

2. **Create Web Service**:
   - New → Web Service
   - Connect GitHub repo
   - Select `backend` folder

3. **Settings**:
   - **Build Command**: (leave empty or `npm install`)
   - **Start Command**: `node index.js`
   - **Environment**: Node

4. **Environment Variables**:
   - Add all variables from `.env` file

5. **Deploy**:
   - Get URL: `https://your-app.onrender.com`

---

### Part B: Deploy Frontend (React)

#### Using Vercel (Recommended - Best for React)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```

4. **Configure**:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Set Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `VITE_API_URL=https://your-backend-url.railway.app/api`

6. **Redeploy**:
   ```bash
   vercel --prod
   ```

**OR Use Vercel Dashboard**:
1. Go to https://vercel.com
2. Import GitHub repository
3. Select `frontend` folder
4. Configure build settings
5. Add environment variable: `VITE_API_URL`

#### Using Netlify (Alternative)

1. **Sign up**: https://netlify.com

2. **Deploy**:
   - Drag & drop `frontend/dist` folder
   - OR connect GitHub repo → select `frontend` folder

3. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `frontend`

4. **Environment Variables**:
   - Site settings → Environment variables
   - Add: `VITE_API_URL=https://your-backend-url`

---

## 🎯 Option 2: Full-Stack on Railway/Render

### Deploy Everything on Railway

1. **Backend Service**:
   - Deploy `backend` folder (as above)

2. **Frontend Service**:
   - New Service → Static Site
   - Connect `frontend` folder
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add environment variable: `VITE_API_URL`

---

## 📋 Pre-Deployment Checklist

### Backend Checklist:

- [ ] Update CORS in `backend/index.js`:
  ```javascript
  const allowedOrigins = [
    'http://localhost:3000',
    'https://your-frontend-domain.vercel.app',
    'https://your-frontend-domain.netlify.app'
  ]
  ```

- [ ] Update MongoDB Atlas:
  - Network Access → Add IP: `0.0.0.0/0` (allow all)
  - Or add specific deployment IPs

- [ ] Verify `.env` variables are set in hosting platform

- [ ] Test API endpoints work

### Frontend Checklist:

- [ ] Update API URL:
  - Create `.env.production`:
    ```
    VITE_API_URL=https://your-backend-url.railway.app/api
    ```

- [ ] Build locally to test:
  ```bash
  cd frontend
  npm run build
  npm run preview
  ```

- [ ] Generate PWA icons (if using PWA)

- [ ] Test all features work

---

## 🔧 Step-by-Step: Complete Deployment

### Step 1: Prepare Backend

```bash
cd backend

# Make sure .env has production values
# Update CORS origins in index.js
```

**Update `backend/index.js` CORS:**
```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://your-frontend.vercel.app',
  // Add your frontend URLs
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
```

### Step 2: Deploy Backend to Railway

1. Push code to GitHub
2. Go to Railway.app
3. New Project → GitHub repo → Select `backend` folder
4. Add environment variables
5. Deploy → Get URL: `https://your-api.railway.app`

### Step 3: Update Frontend API URL

Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-api.railway.app/api
```

### Step 4: Deploy Frontend to Vercel

```bash
cd frontend
vercel --prod
```

Or use Vercel dashboard:
1. Import GitHub repo
2. Select `frontend` folder
3. Add environment variable: `VITE_API_URL`
4. Deploy

### Step 5: Update Backend CORS

Add your Vercel URL to backend CORS allowed origins.

### Step 6: Test Everything

- [ ] Frontend loads
- [ ] API calls work
- [ ] Authentication works
- [ ] File uploads work
- [ ] PWA installs (if configured)

---

## 🌐 Domain Setup (Optional)

### Custom Domain on Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Follow DNS instructions

### Custom Domain on Railway:

1. Go to Railway Dashboard → Your Service → Settings → Domains
2. Add custom domain
3. Configure DNS

---

## 🔒 Security Checklist

- [ ] Use HTTPS (automatic on Vercel/Netlify/Railway)
- [ ] Set strong JWT secrets
- [ ] MongoDB Atlas IP whitelist configured
- [ ] CORS properly configured
- [ ] Environment variables not in code
- [ ] Rate limiting enabled (if needed)

---

## 📊 Monitoring & Logs

### Railway:
- Dashboard → Logs (real-time)
- Metrics → CPU, Memory usage

### Vercel:
- Dashboard → Analytics
- Functions → Logs

### Render:
- Dashboard → Logs
- Metrics → Resource usage

---

## 🐛 Troubleshooting

### Backend Issues:

**❌ CORS Errors:**
- ✅ Check CORS origins include frontend URL
- ✅ Verify credentials: true in CORS config

**❌ MongoDB Connection Failed:**
- ✅ Check MongoDB Atlas IP whitelist
- ✅ Verify MONGODB_URI is correct
- ✅ Check network access settings

**❌ Port Issues:**
- ✅ Railway/Render auto-assigns PORT
- ✅ Use `process.env.PORT || 5000`

### Frontend Issues:

**❌ API Calls Failing:**
- ✅ Check VITE_API_URL environment variable
- ✅ Verify backend URL is correct
- ✅ Check CORS configuration

**❌ Build Fails:**
- ✅ Check Node version compatibility
- ✅ Clear node_modules and reinstall
- ✅ Check for TypeScript/ESLint errors

---

## 💰 Cost Estimates

### Free Tier Options:

- **Railway**: $5/month free credit (usually enough)
- **Render**: Free tier available (with limitations)
- **Vercel**: Free tier (generous)
- **Netlify**: Free tier (generous)
- **MongoDB Atlas**: Free tier (512MB)

### Paid Options:

- **Railway**: Pay-as-you-go after free credit
- **Render**: $7/month for always-on
- **Vercel**: Pro plan for advanced features
- **MongoDB Atlas**: $9/month for better performance

---

## 🚀 Quick Deploy Commands

### Railway (CLI):
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Vercel (CLI):
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 📝 Environment Variables Reference

### Backend (.env):
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env.production):
```
VITE_API_URL=https://your-backend.railway.app/api
```

---

## ✅ Post-Deployment

1. **Test all features**:
   - Login/Register
   - Booking creation
   - Profile updates
   - File uploads

2. **Monitor**:
   - Check logs for errors
   - Monitor API response times
   - Check database connections

3. **Update Documentation**:
   - Update README with live URLs
   - Document API endpoints

4. **Set up monitoring** (optional):
   - Uptime monitoring (UptimeRobot)
   - Error tracking (Sentry)

---

## 🎉 You're Live!

Your app should now be accessible at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-api.railway.app/api`

Share your app URL and start using it! 🚀
