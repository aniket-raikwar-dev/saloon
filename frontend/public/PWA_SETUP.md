# PWA Setup Guide for Glamour Studio

## What is PWA?

**Progressive Web App (PWA)** is a web application that uses modern web technologies to provide a native app-like experience. Benefits:

- ✅ **Installable**: Users can install it on their Android/iOS devices
- ✅ **Offline Support**: Works even without internet (cached content)
- ✅ **Fast Loading**: Cached resources load instantly
- ✅ **App-like Experience**: Fullscreen, no browser UI
- ✅ **Push Notifications**: Can send notifications (requires additional setup)
- ✅ **Home Screen Icon**: Appears on home screen like native apps

## How to Use on Android Mobile

### Step 1: Build the App for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Step 2: Serve the Production Build

You can use any static file server. Options:

**Option A: Using Vite Preview (for testing)**
```bash
npm run preview
```

**Option B: Using a Simple HTTP Server**
```bash
# Install http-server globally
npm install -g http-server

# Serve the dist folder
cd dist
http-server -p 3000
```

**Option C: Deploy to a Hosting Service**
- Deploy to Vercel, Netlify, or any hosting service
- Make sure HTTPS is enabled (required for PWA)

### Step 3: Install on Android Phone

1. **Open Chrome Browser** on your Android phone
2. **Navigate** to your app URL (e.g., `http://your-ip:3000` or your deployed URL)
3. **Look for Install Prompt**:
   - Chrome will show a banner saying "Add to Home screen" or "Install app"
   - OR tap the **3-dot menu** (⋮) → **"Add to Home screen"** or **"Install app"**
4. **Confirm Installation**:
   - Tap "Install" or "Add"
   - The app will be added to your home screen
5. **Launch the App**:
   - Tap the icon on your home screen
   - It will open in fullscreen mode (no browser UI)

### Step 4: Using on Android

- **Launch**: Tap the home screen icon
- **Offline Mode**: Previously visited pages will work offline
- **Updates**: App automatically updates when new version is available
- **Uninstall**: Long press icon → Uninstall (like any Android app)

## Creating App Icons

You need to create these icon files in the `public` folder:

- `pwa-192x192.png` (192x192 pixels)
- `pwa-512x512.png` (512x512 pixels)
- `apple-touch-icon.png` (180x180 pixels for iOS)

### Quick Icon Creation:

1. **Use Online Tools**:
   - https://www.favicon-generator.org/
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator

2. **Design Requirements**:
   - Use your app logo or a pink beauty-themed icon
   - Square format (1:1 aspect ratio)
   - PNG format with transparency
   - High resolution (at least 512x512)

3. **Place Icons**:
   - Put all icon files in the `frontend/public/` folder
   - The build process will automatically include them

## Testing PWA Features

### Check PWA Status:

1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Check **Manifest** section
4. Check **Service Workers** section
5. Use **Lighthouse** tab to audit PWA features

### Test Offline Mode:

1. Open DevTools → **Network** tab
2. Check **Offline** checkbox
3. Refresh the page
4. Cached pages should still work

## Deployment Checklist

- [ ] Create app icons (192x192, 512x512, apple-touch-icon)
- [ ] Build production version (`npm run build`)
- [ ] Deploy to HTTPS-enabled server (required for PWA)
- [ ] Test installation on Android device
- [ ] Test offline functionality
- [ ] Verify manifest.json is accessible

## Troubleshooting

**Install prompt not showing?**
- Make sure you're using HTTPS (or localhost)
- Check if manifest.json is accessible
- Clear browser cache and try again

**Icons not showing?**
- Verify icon files exist in `public` folder
- Check icon paths in manifest.json
- Rebuild the app after adding icons

**Offline not working?**
- Check Service Worker registration in DevTools
- Verify workbox configuration in vite.config.js
- Clear cache and reinstall the app

## Additional Features (Future)

- **Push Notifications**: Requires backend setup and user permission
- **Background Sync**: Sync data when connection is restored
- **Share Target**: Allow sharing content to your app
