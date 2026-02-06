# 🔧 Backend Troubleshooting Guide

## 500 Internal Server Error on Registration

### Common Causes & Solutions

### 1. Check Railway Logs

**Most Important**: Check your Railway deployment logs to see the actual error:

1. Go to Railway Dashboard
2. Select your backend project
3. Click on "Deployments" tab
4. Click on the latest deployment
5. View "Logs" to see the actual error message

This will tell you exactly what's failing.

### 2. Environment Variables

Make sure all required environment variables are set in Railway:

**Required Variables:**
- ✅ `NODE_ENV=production`
- ✅ `MONGODB_URI` - Your MongoDB Atlas connection string
- ✅ `JWT_SECRET` - A strong random string (min 32 characters)
- ✅ `JWT_REFRESH_SECRET` - Another strong random string
- ✅ `CLOUDINARY_CLOUD_NAME`
- ✅ `CLOUDINARY_API_KEY`
- ✅ `CLOUDINARY_API_SECRET`

**To Check:**
1. Railway Dashboard → Your Project → Variables tab
2. Verify all variables are set
3. Make sure there are no typos

### 3. MongoDB Connection

**Check MongoDB Atlas:**
1. Go to MongoDB Atlas Dashboard
2. **Network Access** → Make sure `0.0.0.0/0` is allowed (or add Railway's IP)
3. **Database Access** → Verify your database user has read/write permissions
4. **Clusters** → Make sure cluster is running

**Test Connection:**
```bash
# In Railway logs, you should see:
# ✅ MongoDB Connected: ...
```

### 4. Cookie Settings

The cookie configuration has been updated to work with cross-origin requests:
- `sameSite: 'none'` in production (requires HTTPS)
- `secure: true` in production

**If cookies still don't work:**
- Make sure frontend is using HTTPS
- Check browser console for cookie warnings
- Try disabling cookies temporarily to test if that's the issue

### 5. CORS Configuration

Make sure your frontend URL is in the allowed origins:

**In Railway Environment Variables:**
- Add: `FRONTEND_URL_PROD` = `https://your-frontend-url.vercel.app`

**Or update `backend/index.js`:**
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-frontend.vercel.app', // Add your frontend URL
  process.env.FRONTEND_URL_PROD
].filter(Boolean);
```

### 6. Database Schema Issues

**Check if collections exist:**
- MongoDB Atlas → Browse Collections
- Verify `users` collection exists (or will be created)

**Common Schema Errors:**
- Phone number format validation
- Email format validation
- Required fields missing

### 7. Test the API Directly

**Using curl or Postman:**

```bash
# Test registration endpoint
curl -X POST https://saloon-production-8535.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

This will show you the exact error response.

### 8. Check Error Response

**In Browser DevTools:**
1. Open Network tab
2. Find the `/api/auth/register` request
3. Click on it
4. Check "Response" tab for error details

**Common Error Messages:**
- `"Validation failed"` → Check request body format
- `"Email already registered"` → User exists
- `"Something went wrong!"` → Check Railway logs for details
- `"MongoDB connection failed"` → Check MongoDB Atlas settings

### 9. Verify Request Format

**Correct Request Format:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890" // optional
}
```

**Common Mistakes:**
- Missing required fields
- Wrong field names
- Invalid email format
- Password too short (< 6 characters)

### 10. Check User Model Validation

The User model has these validations:
- Name: 2-50 characters
- Email: Valid email format
- Password: Minimum 6 characters
- Phone: Optional, 10-15 digits if provided

### Quick Fixes

**If error persists, try:**

1. **Redeploy Backend:**
   - Railway Dashboard → Deployments → Redeploy

2. **Clear MongoDB:**
   - If testing, delete test users from MongoDB Atlas

3. **Check Node Version:**
   - Railway should auto-detect, but verify it's Node 18+

4. **Verify Build:**
   - Check Railway build logs for any build errors

### Getting Help

**To get specific help, provide:**
1. Error message from Railway logs
2. Request body you're sending
3. Response body you're receiving
4. Browser console errors (if any)

### Test Endpoints

**Health Check:**
```
GET https://saloon-production-8535.up.railway.app/health
```

**Should return:**
```json
{
  "success": true,
  "status": "OK",
  "timestamp": "...",
  "uptime": ...
}
```

If health check fails, the server isn't running properly.
