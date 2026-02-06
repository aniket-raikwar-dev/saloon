# PWA Quick Start Guide

## What is PWA?

**Progressive Web App (PWA)** = Web app that works like a native mobile app!

### Key Benefits:
- 📱 **Install on phone** - Add to home screen like a real app
- ⚡ **Fast** - Cached content loads instantly
- 🔌 **Works offline** - Previously visited pages work without internet
- 🎨 **App-like** - Fullscreen, no browser UI
- 🔔 **Notifications** - Can send push notifications (future feature)

## Quick Setup (3 Steps)

### Step 1: Generate Icons

1. Open `public/generate-icons.html` in your browser
2. Click "Download All Icons"
3. Icons will be saved to your Downloads folder
4. Move them to `frontend/public/` folder:
   - `pwa-192x192.png`
   - `pwa-512x512.png`
   - `apple-touch-icon.png`

### Step 2: Build the App

```bash
cd frontend
npm run build
```

This creates a production-ready build in the `dist` folder.

### Step 3: Test Locally

```bash
npm run preview
```

Then open `http://localhost:4173` in your browser.

## Install on Android Phone

### Method 1: Using Chrome Browser

1. **Open Chrome** on your Android phone
2. **Navigate** to your app URL:
   - If testing locally: `http://your-computer-ip:4173`
   - If deployed: Your deployed URL
3. **Install Prompt**:
   - Chrome will show "Add to Home screen" banner
   - OR tap **⋮ menu** → **"Add to Home screen"**
4. **Confirm** and tap "Add"
5. **Done!** App icon appears on home screen

### Method 2: Manual Install

1. Open Chrome → Navigate to your app
2. Tap **⋮ menu** (top right)
3. Tap **"Add to Home screen"** or **"Install app"**
4. Customize name (optional)
5. Tap **"Add"** or **"Install"**

## Using the Installed App

- **Launch**: Tap the home screen icon
- **Fullscreen**: Opens without browser UI
- **Offline**: Previously visited pages work offline
- **Updates**: Automatically updates when new version is available
- **Uninstall**: Long press icon → Uninstall

## Deployment

### For Production:

1. **Deploy to HTTPS** (required for PWA):
   - Vercel: `vercel --prod`
   - Netlify: Connect GitHub repo
   - Any hosting with HTTPS

2. **Test Installation**:
   - Visit your deployed URL on Android
   - Install the app
   - Test offline functionality

## Troubleshooting

**❌ Install prompt not showing?**
- ✅ Use HTTPS (or localhost)
- ✅ Check browser console for errors
- ✅ Clear cache and try again

**❌ Icons not showing?**
- ✅ Verify icon files are in `public/` folder
- ✅ Rebuild: `npm run build`
- ✅ Check `dist/manifest.webmanifest`

**❌ Offline not working?**
- ✅ Open DevTools → Application → Service Workers
- ✅ Check if service worker is registered
- ✅ Clear cache and reinstall

## Files Created

- ✅ `vite.config.js` - PWA plugin configuration
- ✅ `index.html` - PWA meta tags added
- ✅ `public/generate-icons.html` - Icon generator tool
- ✅ `public/icon-template.svg` - Icon template
- ✅ `public/PWA_SETUP.md` - Detailed guide

## Next Steps

1. ✅ Generate and add icons
2. ✅ Build production version
3. ✅ Deploy to HTTPS server
4. ✅ Test on Android device
5. 🎉 Enjoy your PWA!

## Need Help?

Check `public/PWA_SETUP.md` for detailed documentation.
