import {ClientRoute} from '@packages/constant';

// Configuration for the web app URLs
// Update these URLs to point to your actual web app

// Base URLs for each environment
const BASE_URLS = {
  development: 'http://localhost:3000',
  production: 'https://your-app.com',
};

// Build full URLs using route constants
const buildUrls = (baseUrl: string) => ({
  home: `${baseUrl}${ClientRoute.Home}`,
  login: `${baseUrl}${ClientRoute.Login}`,
  profile: `${baseUrl}${ClientRoute.Profile}`,
});

export const WEB_APP_URLS = {
  // For development, use your local development server
  development: buildUrls(BASE_URLS.development),
  // For production, use your deployed web app URL
  production: buildUrls(BASE_URLS.production),
};

// Determine which environment to use
const __DEV__ = process.env.NODE_ENV === 'development';
export const CURRENT_URLS = __DEV__
  ? WEB_APP_URLS.development
  : WEB_APP_URLS.production;

