// Secure Authentication Utilities
import { TokenManager } from '../security/securityConfig';

// Cookie-based token management
export class SecureAuth {
  // Set secure HTTP-only cookie (requires server-side implementation)
  static setSecureToken(token, options = {}) {
    const defaultOptions = {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000, // 30 minutes
      ...options
    };

    // In production, this should be set by the server
    // For development, we'll use localStorage as fallback
    if (process.env.NODE_ENV === 'production') {
      // Server should set the cookie
      return fetch('/api/auth/set-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, options: defaultOptions }),
        credentials: 'include'
      });
    } else {
      // Development fallback
      localStorage.setItem('authToken', token);
      return Promise.resolve({ success: true });
    }
  }

  // Get token from secure cookie or localStorage fallback
  static async getToken() {
    if (process.env.NODE_ENV === 'production') {
      try {
        const response = await fetch('/api/auth/get-token', {
          credentials: 'include'
        });
        const data = await response.json();
        return data.token;
      } catch (error) {
        console.error('Failed to get secure token:', error);
        return null;
      }
    } else {
      // Development fallback
      return localStorage.getItem('authToken');
    }
  }

  // Clear secure token
  static async clearToken() {
    if (process.env.NODE_ENV === 'production') {
      try {
        await fetch('/api/auth/clear-token', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Failed to clear secure token:', error);
      }
    } else {
      // Development fallback
      localStorage.removeItem('authToken');
    }
  }

  // Refresh token implementation
  static async refreshToken() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        return data.token;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.clearToken();
      throw error;
    }
  }

  // Check if token is valid
  static async isTokenValid() {
    try {
      const token = await this.getToken();
      if (!token) return false;

      // Decode JWT to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  // Auto-refresh token before expiration
  static async setupTokenRefresh() {
    const checkAndRefresh = async () => {
      try {
        const isValid = await this.isTokenValid();
        if (!isValid) {
          await this.refreshToken();
        }
      } catch (error) {
        console.error('Token refresh check failed:', error);
        // Redirect to login if refresh fails
        window.location.href = '/login';
      }
    };

    // Check every 5 minutes
    setInterval(checkAndRefresh, 5 * 60 * 1000);
    
    // Initial check
    checkAndRefresh();
  }
}

// Enhanced login function
export const secureLogin = async (credentials) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    
    // Set secure token
    await SecureAuth.setSecureToken(data.token);
    
    // Store user data securely
    if (data.user) {
      await SecureAuth.setSecureUserData(data.user);
    }

    // Setup token refresh
    SecureAuth.setupTokenRefresh();

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Secure login error:', error);
    return { success: false, error: error.message };
  }
};

// Secure logout function
export const secureLogout = async () => {
  try {
    await SecureAuth.clearToken();
    await SecureAuth.clearUserData();
    
    // Call server logout endpoint
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    // Redirect to login
    window.location.href = '/login';
  } catch (error) {
    console.error('Secure logout error:', error);
    // Force redirect even if server call fails
    window.location.href = '/login';
  }
};

// Store user data securely
export const setSecureUserData = async (userData) => {
  if (process.env.NODE_ENV === 'production') {
    // Use encrypted storage or secure server-side storage
    return fetch('/api/auth/set-user-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include'
    });
  } else {
    // Development fallback
    localStorage.setItem('user', JSON.stringify(userData));
    return Promise.resolve({ success: true });
  }
};

// Get user data securely
export const getSecureUserData = async () => {
  if (process.env.NODE_ENV === 'production') {
    try {
      const response = await fetch('/api/auth/get-user-data', {
        credentials: 'include'
      });
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Failed to get secure user data:', error);
      return null;
    }
  } else {
    // Development fallback
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// Clear user data securely
export const clearUserData = async () => {
  if (process.env.NODE_ENV === 'production') {
    try {
      await fetch('/api/auth/clear-user-data', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Failed to clear secure user data:', error);
    }
  } else {
    // Development fallback
    localStorage.removeItem('user');
  }
};

export default SecureAuth;
