# Quick Start Guide

Get the mobile app running in 5 minutes! ⚡

## Prerequisites Check

```bash
# Check Node.js version (should be >= 18)
node --version

# Check if Watchman is installed (macOS)
watchman --version

# Check if you're in the right directory
pwd  # Should end with /js-monorepo/apps/client-mobile
```

## Step 1: Install Dependencies (2 min)

```bash
# Install Node dependencies
npm install

# For iOS only - Install CocoaPods dependencies
cd ios && pod install && cd ..
```

## Step 2: Configure URLs (1 min)

Edit `src/constants/urls.ts`:

**For iOS Simulator or Android Physical Device:**

```typescript
development: {
  home: 'http://localhost:3000',
  // ...
}
```

**For Android Emulator:**

```typescript
development: {
  home: 'http://10.0.2.2:3000',  // Special Android emulator address
  // ...
}
```

## Step 3: Start Your Web App (1 min)

In a new terminal:

```bash
# Navigate to web app
cd ../client-web

# Start the development server
npm run dev
```

Verify it's running at http://localhost:3000

## Step 4: Run Mobile App (1 min)

Back in the client-mobile directory:

### iOS

```bash
npm run ios
```

### Android

```bash
# Make sure Android emulator is running or device is connected
npm run android
```

## 🎉 Done!

You should now see your web app running inside a mobile app!

## Common Issues

### "Unable to resolve module"

```bash
# Clear cache and restart
npm start -- --reset-cache
```

### iOS build fails

```bash
cd ios && pod install && cd ..
npm run ios
```

### Android can't connect to localhost

- Use `10.0.2.2:3000` instead of `localhost:3000` in urls.ts

### Metro bundler port conflict

```bash
# Kill process on port 8081
npx react-native start --port 8082
```

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Customize the theme in `src/constants/theme.ts`
- Add more screens in `src/screens/`
- Configure your app icon and splash screen

## Need Help?

Check the [Troubleshooting section](./README.md#-troubleshooting) in the README.
