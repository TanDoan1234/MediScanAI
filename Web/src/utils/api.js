// API configuration
const getApiUrl = () => {
  // In production (Vercel), use relative path
  if (import.meta.env.PROD) {
    return '/api';
  }
  // In development, use localhost
  return 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();

