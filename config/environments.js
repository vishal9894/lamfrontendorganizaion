// Environment configuration helper
export const getApiUrl = () => {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV;
  
  // For local development, use localhost:3000
  if (isDevelopment) {
    return 'http://localhost:3000';
  }
  
  // For production, use the environment variable or fallback to live URL
  return import.meta.env.VITE_BACKEND_API || 'https://api.khansirlearning.com';
};

export const getEnvironment = () => {
  return import.meta.env.NODE_ENV || 'development';
};
