# 📱 Fix Mobile Browser API Issues

## Common Causes & Solutions

### 1. CORS Issues (Most Common)

**Problem**: Mobile browsers handle CORS differently than desktop browsers.

**Solution**: I've updated the CORS configuration to:
- ✅ Allow requests with no origin (mobile apps)
- ✅ Match by hostname (handles different origin formats)
- ✅ Better logging for debugging

**After deploying**, check Railway logs to see if CORS is blocking requests.

### 2. Frontend URL Not in CORS Whitelist

**Problem**: Your frontend URL isn't in the allowed origins list.

**Solution**: Add your frontend URL to Railway environment variables:

1. **Railway Dashboard** → Your Backend Project → Variables
2. **Add/Update**:
   - `FRONTEND_URL_PROD` = `https://your-frontend-url.vercel.app`
3. **Redeploy** backend

**OR** update `backend/index.js` directly:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-frontend-url.vercel.app', // Add your actual frontend URL
  process.env.FRONTEND_URL_PROD
].filter(Boolean);
```

### 3. HTTPS/HTTP Mismatch

**Problem**: Frontend on HTTPS, backend on HTTP (or vice versa).

**Solution**: 
- ✅ Both should use HTTPS in production
- ✅ Railway provides HTTPS automatically
- ✅ Vercel/Netlify provide HTTPS automatically

### 4. Cookie Issues on Mobile

**Problem**: Cookies not being sent/received on mobile browsers.

**Solution**: Already fixed in `authController.js`:
- ✅ `sameSite: 'none'` for cross-origin
- ✅ `secure: true` for HTTPS
- ✅ `credentials: true` in CORS

**If still not working**, check:
- Mobile browser settings (cookies enabled?)
- Private/Incognito mode (cookies might be blocked)

### 5. Service Worker Intercepting Requests

**Problem**: PWA service worker might be caching or blocking API calls.

**Solution**: Check service worker configuration in `vite.config.js`:
- API calls use `NetworkFirst` strategy (already configured)
- Service worker shouldn't cache API responses incorrectly

**To test**: 
- Disable service worker temporarily
- Or clear browser cache on mobile

### 6. Network Timeout on Mobile

**Problem**: Mobile networks are slower, requests timeout.

**Solution**: Already configured:
- ✅ `networkTimeoutSeconds: 10` in workbox config
- ✅ API uses `NetworkFirst` strategy

### 7. API URL Configuration

**Problem**: Frontend using wrong API URL on mobile.

**Check**:
1. Open mobile browser DevTools (if possible)
2. Check `VITE_API_URL` environment variable
3. Verify it's set correctly in Vercel/Netlify

**Test**:
```javascript
// In browser console (mobile):
console.log(import.meta.env.VITE_API_URL)
```

Should show: `https://saloon-production-8535.up.railway.app/api`

---

## 🔍 Debugging Steps

### Step 1: Check Mobile Browser Console

**On Android Chrome**:
1. Connect phone to computer via USB
2. Enable USB debugging
3. Open Chrome → `chrome://inspect`
4. Inspect your mobile browser
5. Check Console for errors

**On iOS Safari**:
1. iPhone → Settings → Safari → Advanced → Web Inspector (ON)
2. Mac Safari → Develop → [Your iPhone] → [Your Site]
3. Check Console for errors

### Step 2: Check Network Tab

In mobile browser DevTools:
1. **Network tab**
2. **Try to register/login**
3. **Check the API request**:
   - Status code?
   - Response?
   - CORS headers?
   - Request headers?

### Step 3: Check Railway Logs

1. **Railway Dashboard** → Your Backend → Logs
2. **Look for**:
   - CORS errors
   - Blocked origins
   - Request logs

### Step 4: Test API Directly from Mobile

**On mobile browser**, open console and run:
```javascript
fetch('https://saloon-production-8535.up.railway.app/api/services', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

This will show you the exact error.

---

## 🚀 Quick Fixes

### Fix 1: Add Frontend URL to CORS

**In Railway Environment Variables**:
```
FRONTEND_URL_PROD=https://your-actual-frontend-url.vercel.app
```

**Then redeploy backend**.

### Fix 2: Update CORS to Allow All (Temporary)

**For testing only** - Update `backend/index.js`:
```javascript
// TEMPORARY - For testing only
if (process.env.NODE_ENV === 'production') {
  // Allow all origins temporarily to test
  return callback(null, true);
}
```

**⚠️ Remove this after testing!**

### Fix 3: Check Frontend Environment Variable

**In Vercel/Netlify**:
1. Go to Environment Variables
2. Verify `VITE_API_URL` is set correctly
3. Should be: `https://saloon-production-8535.up.railway.app/api`
4. **Redeploy frontend** if changed

---

## 📋 Checklist

- [ ] Frontend URL added to Railway `FRONTEND_URL_PROD`
- [ ] Backend redeployed after CORS changes
- [ ] Frontend `VITE_API_URL` is correct
- [ ] Both frontend and backend use HTTPS
- [ ] Mobile browser cookies enabled
- [ ] Checked mobile browser console for errors
- [ ] Checked Railway logs for CORS errors
- [ ] Tested API directly from mobile browser

---

## 🧪 Test Commands

### Test from Mobile Browser Console:

```javascript
// Test 1: Simple GET request
fetch('https://saloon-production-8535.up.railway.app/api/services')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)

// Test 2: Registration
fetch('https://saloon-production-8535.up.railway.app/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

---

## 🔧 Most Likely Fix

**The most common issue**: Your frontend URL isn't in the CORS whitelist.

**Do this**:
1. Get your frontend URL (from Vercel/Netlify)
2. Add it to Railway: `FRONTEND_URL_PROD` = `https://your-frontend-url`
3. Redeploy backend
4. Test on mobile

The updated CORS configuration I just added should help, but you **must add your frontend URL** to the allowed origins!

---

## 📞 Still Not Working?

**Provide**:
1. Mobile browser console errors
2. Network tab screenshot
3. Railway logs showing CORS errors
4. Your frontend URL

This will help identify the exact issue!
