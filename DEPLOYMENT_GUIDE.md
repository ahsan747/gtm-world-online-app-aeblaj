
# GTM Store - iOS & Android Deployment Guide

## 📱 Pre-Deployment Checklist

### 1. App Configuration

Update `app.json` with your app details:

```json
{
  "expo": {
    "name": "GTM Store",
    "slug": "gtmstore",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "gtmstore",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.gtmstore.app",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.gtmstore.app",
      "versionCode": 1
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### 2. Required Assets

Create these image assets:

- **App Icon** (1024x1024px)
  - Location: `assets/images/icon.png`
  - Should be your GTM Store logo
  - No transparency, square format

- **Splash Screen** (1242x2436px)
  - Location: `assets/images/splash.png`
  - Shown while app loads
  - Can include logo and branding

- **Adaptive Icon** (Android, 1024x1024px)
  - Location: `assets/images/adaptive-icon.png`
  - Foreground layer for Android adaptive icons

- **Favicon** (48x48px)
  - Location: `assets/images/favicon.png`
  - For web version

### 3. Environment Setup

Make sure you have:
- Node.js 18+ installed
- Expo CLI installed: `npm install -g expo-cli`
- EAS CLI installed: `npm install -g eas-cli`
- Expo account created at https://expo.dev

## 🍎 iOS Deployment

### Step 1: Apple Developer Account
1. Sign up at https://developer.apple.com ($99/year)
2. Create an App ID for your app
3. Create provisioning profiles

### Step 2: Configure EAS Build

```bash
# Login to Expo
eas login

# Configure EAS
eas build:configure
```

Update `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "bundleIdentifier": "com.gtmstore.app"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-id",
        "appleTeamId": "your-team-id"
      }
    }
  }
}
```

### Step 3: Build for iOS

```bash
# Build for iOS (production)
eas build --platform ios --profile production

# This will:
# 1. Upload your code to Expo servers
# 2. Build the iOS app
# 3. Generate an .ipa file
# 4. Provide a download link
```

### Step 4: Submit to App Store

```bash
# Submit to App Store
eas submit --platform ios --profile production

# Or manually:
# 1. Download the .ipa file
# 2. Open Xcode
# 3. Go to Window > Organizer
# 4. Upload to App Store Connect
```

### Step 5: App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Create a new app
3. Fill in app information:
   - App name: GTM Store
   - Primary language: English
   - Bundle ID: com.gtmstore.app
   - SKU: gtmstore-001
4. Add screenshots (required sizes):
   - 6.5" iPhone: 1242 x 2688 pixels
   - 5.5" iPhone: 1242 x 2208 pixels
   - iPad Pro: 2048 x 2732 pixels
5. Write app description
6. Add privacy policy URL
7. Set pricing (Free or Paid)
8. Submit for review

## 🤖 Android Deployment

### Step 1: Google Play Console
1. Sign up at https://play.google.com/console ($25 one-time fee)
2. Create a new app

### Step 2: Generate Keystore

```bash
# Generate Android keystore
eas credentials

# Follow prompts to create keystore
# Save the credentials securely!
```

### Step 3: Build for Android

```bash
# Build for Android (production)
eas build --platform android --profile production

# This will generate an .aab file (Android App Bundle)
```

### Step 4: Submit to Google Play

```bash
# Submit to Google Play
eas submit --platform android --profile production

# Or manually:
# 1. Download the .aab file
# 2. Go to Google Play Console
# 3. Create a new release
# 4. Upload the .aab file
```

### Step 5: Google Play Console Setup

1. Go to https://play.google.com/console
2. Select your app
3. Fill in store listing:
   - App name: GTM Store
   - Short description (80 chars)
   - Full description (4000 chars)
   - App icon (512 x 512 px)
   - Feature graphic (1024 x 500 px)
   - Screenshots (at least 2):
     - Phone: 320-3840 px wide
     - 7" Tablet: 320-3840 px wide
     - 10" Tablet: 320-3840 px wide
4. Set content rating
5. Add privacy policy URL
6. Set pricing & distribution
7. Submit for review

## 🌐 Web Deployment

### Option 1: Netlify (Recommended)

```bash
# Build for web
npm run build:web

# Deploy to Netlify
# 1. Sign up at https://netlify.com
# 2. Connect your GitHub repo
# 3. Set build command: npm run build:web
# 4. Set publish directory: dist
# 5. Deploy!
```

### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts
```

### Option 3: Custom Server

```bash
# Build for web
npm run build:web

# Upload dist/ folder to your server
# Configure nginx or Apache to serve the files
```

## 📝 App Store Requirements

### iOS App Store

**Required Information:**
- App name
- Subtitle (30 characters)
- Description (4000 characters)
- Keywords (100 characters)
- Support URL
- Marketing URL (optional)
- Privacy Policy URL
- Screenshots (multiple sizes)
- App icon (1024x1024px)
- App preview video (optional)

**Categories:**
- Primary: Shopping
- Secondary: Lifestyle

**Age Rating:**
- 4+ (No objectionable content)

**Privacy:**
- Data collection disclosure
- Privacy policy URL required

### Google Play Store

**Required Information:**
- App name (50 characters)
- Short description (80 characters)
- Full description (4000 characters)
- App icon (512x512px)
- Feature graphic (1024x500px)
- Screenshots (2-8 images)
- Privacy policy URL
- Content rating questionnaire

**Categories:**
- Application: Shopping
- Tags: cosmetics, beauty, online shopping

**Age Rating:**
- Everyone

## 🔐 Security Checklist

Before deploying:

- [ ] Remove all console.log statements (or use production logging)
- [ ] Verify all API keys are in environment variables
- [ ] Enable Supabase production mode
- [ ] Set up proper error monitoring
- [ ] Configure rate limiting
- [ ] Enable HTTPS only
- [ ] Add security headers
- [ ] Implement proper authentication
- [ ] Test all payment flows
- [ ] Verify email verification works
- [ ] Test deep linking
- [ ] Check for memory leaks
- [ ] Optimize images and assets
- [ ] Enable code obfuscation
- [ ] Set up crash reporting

## 📊 Post-Deployment

### Monitoring

Set up monitoring tools:
- **Sentry** - Error tracking
- **Google Analytics** - User analytics
- **Firebase Analytics** - Mobile analytics
- **Supabase Dashboard** - Database monitoring

### Updates

To release updates:

```bash
# iOS
eas build --platform ios --profile production
eas submit --platform ios

# Android
eas build --platform android --profile production
eas submit --platform android
```

### Over-The-Air (OTA) Updates

For minor updates without app store review:

```bash
# Publish OTA update
eas update --branch production --message "Bug fixes and improvements"
```

## 🎯 Marketing Checklist

- [ ] Create app website
- [ ] Set up social media accounts
- [ ] Prepare press kit
- [ ] Write blog post announcement
- [ ] Create demo video
- [ ] Reach out to tech bloggers
- [ ] Submit to app review sites
- [ ] Create promotional materials
- [ ] Set up email marketing
- [ ] Plan launch campaign

## 💰 Monetization (Optional)

If you want to add payments:

1. **In-App Purchases**
   - Set up in App Store Connect / Google Play Console
   - Implement with expo-in-app-purchases

2. **Subscriptions**
   - Configure subscription products
   - Implement subscription logic

3. **Ads**
   - Integrate AdMob or other ad networks
   - Follow platform guidelines

## 📞 Support

### Resources
- Expo Documentation: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- App Store Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Policies: https://play.google.com/about/developer-content-policy/

### Common Issues

**Build Failed:**
- Check eas.json configuration
- Verify all dependencies are compatible
- Check Expo SDK version compatibility

**App Rejected:**
- Review rejection reason carefully
- Fix issues and resubmit
- Common reasons: privacy policy, content, crashes

**OTA Update Not Working:**
- Check update channel configuration
- Verify app is using correct runtime version
- Check for JavaScript errors

---

**Good luck with your deployment! 🚀**

Your app is now ready to be deployed to iOS, Android, and web platforms!
