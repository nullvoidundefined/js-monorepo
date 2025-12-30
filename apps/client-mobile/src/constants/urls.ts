// Configuration for the web app base URL
// Update these URLs to point to your actual web app

// Determine which environment to use
const __DEV__ = process.env.NODE_ENV === 'development';

// Export the base URL for the current environment
export const WEB_APP_BASE_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://your-app.com';
