import CryptoJS from 'crypto-js';
import DOMPurify from 'dompurify';

// Security configuration constants
export const SECURITY_CONFIG = {
  // Token security
  TOKEN_REFRESH_INTERVAL: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  // Rate limiting
  RATE_LIMITS: {
    login: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 min
    api: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 requests per 15 min
    upload: { windowMs: 60 * 1000, max: 10 }, // 10 uploads per minute
  },
  
  // Content Security Policy
  CSP_HEADER: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.khansirlearning.com http://localhost:3000; frame-ancestors 'none';",
  
  // CORS configuration
  CORS_OPTIONS: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400, // 24 hours
  },
};

// Enhanced token management
export class TokenManager {
  static setSecureToken(token, refreshToken) {
    // Set httpOnly cookie for main token
    document.cookie = `authToken=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SECURITY_CONFIG.SESSION_TIMEOUT / 1000}`;
    
    // Store refresh token in memory (not localStorage)
    if (refreshToken) {
      window.__REFRESH_TOKEN__ = refreshToken;
    }
  }

  static getSecureToken() {
    // Get from httpOnly cookie via server or use memory fallback
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1];
  }

  static async refreshAccessToken() {
    try {
      const refreshToken = window.__REFRESH_TOKEN__;
      if (!refreshToken) throw new Error('No refresh token available');
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.getCSRFToken(),
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      const data = await response.json();
      if (data.token) {
        this.setSecureToken(data.token, data.refreshToken);
        return data.token;
      }
      throw new Error('Token refresh failed');
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  static clearTokens() {
    document.cookie = 'authToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';
    delete window.__REFRESH_TOKEN__;
    localStorage.removeItem('user');
  }

  static getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content || '';
  }
}

// Input sanitization
export class InputSanitizer {
  static sanitizeHTML(input) {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target'],
    });
  }

  static sanitizeString(input) {
    if (typeof input !== 'string') return '';
    return input
      .replace(/[<>]/g, '') // Remove potential HTML
      .replace(/javascript:/gi, '') // Remove JS protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password) {
    // Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
}

// Security audit logger
export class SecurityLogger {
  static logSecurityEvent(event, userId, ip, userAgent, additionalData = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      userId: userId || 'anonymous',
      ip: ip || 'unknown',
      userAgent,
      ...additionalData,
    };

    // Send to security monitoring service
    this.sendToSecurityService(logEntry);
    
    // Store in local audit log for debugging
    const auditLogs = JSON.parse(localStorage.getItem('securityAuditLogs') || '[]');
    auditLogs.push(logEntry);
    
    // Keep only last 1000 entries
    if (auditLogs.length > 1000) {
      auditLogs.splice(0, auditLogs.length - 1000);
    }
    
    localStorage.setItem('securityAuditLogs', JSON.stringify(auditLogs));
  }

  static sendToSecurityService(logEntry) {
    // In production, send to external security service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/security/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': TokenManager.getCSRFToken(),
        },
        body: JSON.stringify(logEntry),
      }).catch(console.error);
    }
  }

  static detectSuspiciousActivity(userId, ip) {
    const recentLogs = JSON.parse(localStorage.getItem('securityAuditLogs') || '[]')
      .filter(log => {
        const logTime = new Date(log.timestamp);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return logTime > fiveMinutesAgo && (log.userId === userId || log.ip === ip);
      });

    // Check for multiple failed logins
    const failedLogins = recentLogs.filter(log => log.event === 'login_failed').length;
    if (failedLogins >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      this.logSecurityEvent('account_locked', userId, ip, navigator.userAgent, { reason: 'too_many_failed_attempts' });
      return true;
    }

    return false;
  }
}

// Data encryption utilities
export class DataEncryption {
  static encryptSensitiveData(data, key = process.env.VITE_ENCRYPTION_KEY) {
    if (!key) throw new Error('Encryption key not provided');
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  }

  static decryptSensitiveData(encryptedData, key = process.env.VITE_ENCRYPTION_KEY) {
    if (!key) throw new Error('Encryption key not provided');
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }

  static hashPassword(password) {
    return CryptoJS.SHA256(password + process.env.VITE_PASSWORD_SALT).toString();
  }
}

// Two-Factor Authentication
export class TwoFactorAuth {
  static generateTOTPSecret() {
    // Generate a secret for TOTP
    const secret = CryptoJS.lib.WordArray.random(20).toString();
    return secret;
  }

  static verifyTOTP(token, secret) {
    // Verify TOTP token (would use library like 'otplib' in real implementation)
    // This is a simplified version
    return token.length === 6 && /^\d+$/.test(token);
  }

  static generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }
}

export default {
  SECURITY_CONFIG,
  TokenManager,
  InputSanitizer,
  SecurityLogger,
  DataEncryption,
  TwoFactorAuth,
};
