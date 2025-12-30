// Configuration for the web app URLs
// Update these URLs to point to your actual web app

export const WEB_APP_URLS = {
  // For development, use your local development server
  development: {
    home: 'http://localhost:3000',
    profile: 'http://localhost:3000/profile',
    login: 'http://localhost:3000/login',
  },
  // For production, use your deployed web app URL
  production: {
    home: 'https://your-app.com',
    profile: 'https://your-app.com/profile',
    login: 'https://your-app.com/login',
  },
};

// Determine which environment to use
const __DEV__ = process.env.NODE_ENV === 'development';
export const CURRENT_URLS = __DEV__ 
  ? WEB_APP_URLS.development 
  : WEB_APP_URLS.production;

