# 🚀 Frontend Deployment Guide

## ✅ Backend Already Deployed!

Your backend is live at: **https://saloon-production-8535.up.railway.app/**

## 🎯 Deploy Frontend to Vercel (Recommended)

### Step 1: Prepare Frontend

The frontend is already configured with your backend URL:
- ✅ `.env` updated with Railway backend URL
- ✅ `.env.production` created for production builds

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **New Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the `frontend` folder
4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. **Environment Variables**:
   - Add: `VITE_API_URL` = `https://saloon-production-8535.up.railway.app/api`
6. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Get your frontend URL: `https://your-app.vercel.app`

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Navigate to frontend folder
cd frontend

# Deploy
vercel --prod
```

### Step 3: Update Backend CORS

After deploying frontend, add your Vercel URL to Railway:

1. **Go to Railway Dashboard**: https://railway.app
2. **Select your backend project**
3. **Go to Variables tab**
4. **Add Environment Variable**:
   - Name: `FRONTEND_URL_PROD`
   - Value: `https://your-app.vercel.app` (your actual Vercel URL)
5. **Redeploy** backend (or it will auto-redeploy)

**OR** Update `backend/index.js` directly and push to GitHub:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  'https://your-app.vercel.app', // Add your Vercel URL here
  process.env.FRONTEND_URL_PROD
].filter(Boolean);
```

---

## 🎯 Alternative: Deploy to Netlify

### Step 1: Deploy Frontend

1. **Go to Netlify**: https://netlify.com
2. **Sign up/Login** with GitHub
3. **Add New Site** → **Import from Git**
4. **Select Repository** and configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. **Environment Variables**:
   - Site settings → Environment variables
   - Add: `VITE_API_URL` = `https://saloon-production-8535.up.railway.app/api`
6. **Deploy**

### Step 2: Update Backend CORS

Add your Netlify URL to Railway environment variables:
- `FRONTEND_URL_PROD` = `https://your-app.netlify.app`

---

## 🧪 Test Your Deployment

### 1. Test Frontend
- ✅ Visit your frontend URL
- ✅ Check if it loads correctly
- ✅ Open browser console (F12) → Check for errors

### 2. Test API Connection
- ✅ Try to login/register
- ✅ Check Network tab → API calls should go to Railway backend
- ✅ Verify responses are successful

### 3. Test CORS
If you see CORS errors:
- ✅ Add frontend URL to Railway environment variables
- ✅ Redeploy backend
- ✅ Clear browser cache and try again

---

## 🔧 Troubleshooting

### ❌ CORS Error

**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution**:
1. Add your frontend URL to Railway environment variables:
   - `FRONTEND_URL_PROD` = `https://your-frontend-url.vercel.app`
2. Redeploy backend
3. Clear browser cache

### ❌ API 404 Error

**Error**: `Failed to fetch` or `404 Not Found`

**Solution**:
1. Check `VITE_API_URL` in Vercel/Netlify environment variables
2. Make sure it includes `/api` at the end:
   - ✅ Correct: `https://saloon-production-8535.up.railway.app/api`
   - ❌ Wrong: `https://saloon-production-8535.up.railway.app/`

### ❌ Build Fails

**Error**: Build fails on Vercel/Netlify

**Solution**:
1. Check build logs in Vercel/Netlify dashboard
2. Common issues:
   - Node version mismatch → Set Node version in settings
   - Missing dependencies → Check `package.json`
   - Environment variables → Make sure `VITE_API_URL` is set

---

## 📋 Quick Checklist

- [ ] Frontend deployed to Vercel/Netlify
- [ ] `VITE_API_URL` environment variable set
- [ ] Frontend URL added to Railway `FRONTEND_URL_PROD`
- [ ] Backend redeployed (if CORS updated)
- [ ] Tested login/register
- [ ] Tested API calls
- [ ] No CORS errors in console

---

## 🎉 You're Live!

Once deployed, your app will be accessible at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://saloon-production-8535.up.railway.app`

Share your frontend URL and start using your app! 🚀

---

## 🔄 Updating After Deployment

### Update Frontend:
1. Make changes to code
2. Push to GitHub
3. Vercel/Netlify auto-deploys

### Update Backend:
1. Make changes to code
2. Push to GitHub
3. Railway auto-deploys

### Update Environment Variables:
- **Frontend**: Vercel/Netlify Dashboard → Settings → Environment Variables
- **Backend**: Railway Dashboard → Variables tab
