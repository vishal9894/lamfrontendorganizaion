import { toast } from 'react-toastify';

/**
 * Handle authentication errors and redirect to login
 * @param {Object} error - The error object from API response
 * @param {string} customMessage - Optional custom message to show
 */
export const handleAuthError = (error, customMessage = null) => {
  const message = customMessage || error?.response?.data?.message || error?.message || '';
  
  // Check for authentication errors
  if (error?.response?.status === 401) {
    const errorMessage = error?.response?.data?.message || error.message || '';
    
    // Check if it's an "Invalid token" error or other auth errors
    if (errorMessage.toLowerCase().includes('invalid token') || 
        errorMessage.toLowerCase().includes('token expired') ||
        errorMessage.toLowerCase().includes('unauthorized') ||
        errorMessage.toLowerCase().includes('not authenticated') ||
        errorMessage.toLowerCase().includes('jwt expired') ||
        errorMessage.toLowerCase().includes('authentication failed')) {
      
      // Clear the invalid token
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      
      // Show a brief message to the user
      toast.error("Session expired. Please login again.", {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: true,
      });
      
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      
      return true; // Indicates this was an auth error
    }
  }
  
  return false; // Not an auth error
};

/**
 * Check if current user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  return !!token;
};

/**
 * Logout user and clear auth data
 * @param {string} redirectUrl - URL to redirect to after logout (default: '/login')
 */
export const logout = (redirectUrl = '/login') => {
  // Clear all auth-related data
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  
  // Show logout message
  toast.info("Logged out successfully", {
    position: 'top-right',
    autoClose: 1500,
    hideProgressBar: true,
  });
  
  // Redirect to login page
  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 500);
};

/**
 * Get current authentication token
 * @returns {string|null} The auth token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

/**
 * Set authentication token
 * @param {string} token - The token to store
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("authToken", token);
  }
};
