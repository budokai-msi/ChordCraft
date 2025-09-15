import { loggerService } from './loggerService';

class SecurityService {
  constructor() {
    this.csrfToken = null;
    this.sessionId = null;
    this.lastActivity = Date.now();
    this.securityHeaders = new Map();
    this.auditLog = [];
    this.maxAuditLogSize = 1000;
    
    this.initializeSecurity();
  }

  initializeSecurity() {
    this.generateCSRFToken();
    this.generateSessionId();
    this.setupActivityMonitoring();
    this.setupSecurityHeaders();
    this.setupContentSecurityPolicy();
    
    loggerService.info('Security service initialized');
  }

  generateCSRFToken() {
    // Generate a cryptographically secure CSRF token
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.csrfToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    
    // Store in session storage for persistence
    sessionStorage.setItem('chordcraft-csrf-token', this.csrfToken);
    
    loggerService.debug('CSRF token generated');
  }

  generateSessionId() {
    // Generate a unique session ID
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    this.sessionId = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    
    // Store in session storage
    sessionStorage.setItem('chordcraft-session-id', this.sessionId);
    
    loggerService.debug('Session ID generated');
  }

  setupActivityMonitoring() {
    // Monitor user activity for session management
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.lastActivity = Date.now();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Check for session timeout every minute
    setInterval(() => {
      this.checkSessionTimeout();
    }, 60000);

    loggerService.debug('Activity monitoring setup complete');
  }

  checkSessionTimeout() {
    const now = Date.now();
    const timeoutDuration = this.getSessionTimeout() * 60 * 1000; // Convert minutes to milliseconds
    
    if (now - this.lastActivity > timeoutDuration) {
      this.handleSessionTimeout();
    }
  }

  getSessionTimeout() {
    // Get session timeout from settings or default to 60 minutes
    const settings = localStorage.getItem('chordcraft-settings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        return parsed.privacy?.sessionTimeout || 60;
      } catch (error) {
        loggerService.error('Error parsing session timeout settings:', error);
      }
    }
    return 60; // Default 60 minutes
  }

  handleSessionTimeout() {
    loggerService.warn('Session timeout detected, logging out user');
    
    // Clear sensitive data
    this.clearSensitiveData();
    
    // Notify user
    this.showSecurityNotification('Your session has expired due to inactivity. Please log in again.', 'warning');
    
    // Redirect to login
    setTimeout(() => {
      window.location.href = '/login';
    }, 3000);
  }

  setupSecurityHeaders() {
    // Set security headers for API requests
    this.securityHeaders.set('X-Content-Type-Options', 'nosniff');
    this.securityHeaders.set('X-Frame-Options', 'DENY');
    this.securityHeaders.set('X-XSS-Protection', '1; mode=block');
    this.securityHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    this.securityHeaders.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  }

  setupContentSecurityPolicy() {
    // Set up Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.stripe.com https://*.supabase.co",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    // Create meta tag for CSP
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = csp;
    document.head.appendChild(meta);

    loggerService.debug('Content Security Policy configured');
  }

  getSecurityHeaders() {
    const headers = new Map(this.securityHeaders);
    
    // Add CSRF token if available
    if (this.csrfToken) {
      headers.set('X-CSRF-Token', this.csrfToken);
    }
    
    // Add session ID if available
    if (this.sessionId) {
      headers.set('X-Session-ID', this.sessionId);
    }
    
    return headers;
  }

  validateCSRFToken(token) {
    if (!this.csrfToken) {
      this.csrfToken = sessionStorage.getItem('chordcraft-csrf-token');
    }
    
    return token === this.csrfToken;
  }

  validateSession() {
    const storedSessionId = sessionStorage.getItem('chordcraft-session-id');
    return storedSessionId === this.sessionId;
  }

  auditLogEvent(event, details = {}) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      event,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      details
    };

    this.auditLog.push(auditEntry);

    // Keep only the last N entries
    if (this.auditLog.length > this.maxAuditLogSize) {
      this.auditLog = this.auditLog.slice(-this.maxAuditLogSize);
    }

    loggerService.debug('Security audit log entry:', auditEntry);
  }

  detectSuspiciousActivity() {
    // Basic suspicious activity detection
    const now = Date.now();
    const recentEvents = this.auditLog.filter(
      entry => now - new Date(entry.timestamp).getTime() < 60000 // Last minute
    );

    // Check for rapid API calls
    const apiCalls = recentEvents.filter(entry => entry.event === 'api_call');
    if (apiCalls.length > 100) {
      this.handleSuspiciousActivity('Excessive API calls detected');
      return true;
    }

    // Check for multiple failed login attempts
    const failedLogins = recentEvents.filter(entry => entry.event === 'login_failed');
    if (failedLogins.length > 5) {
      this.handleSuspiciousActivity('Multiple failed login attempts');
      return true;
    }

    return false;
  }

  handleSuspiciousActivity(reason) {
    loggerService.warn('Suspicious activity detected:', reason);
    
    this.auditLogEvent('suspicious_activity', { reason });
    
    // Implement rate limiting or temporary lockout
    this.showSecurityNotification('Suspicious activity detected. Your account has been temporarily secured.', 'error');
    
    // Clear sensitive data
    this.clearSensitiveData();
  }

  clearSensitiveData() {
    // Clear sensitive data from memory and storage
    this.csrfToken = null;
    this.sessionId = null;
    
    // Clear from storage
    sessionStorage.removeItem('chordcraft-csrf-token');
    sessionStorage.removeItem('chordcraft-session-id');
    sessionStorage.removeItem('supabase.auth.token');
    
    // Clear any cached API responses
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    loggerService.info('Sensitive data cleared');
  }

  showSecurityNotification(message, type = 'info') {
    // This would integrate with your notification system
    if (window.notificationService) {
      window.notificationService.show(type, message, { duration: 10000 });
    } else {
      // Fallback to alert
      alert(`Security Notice: ${message}`);
    }
  }

  // Rate limiting
  setupRateLimiting() {
    const rateLimits = new Map();
    
    return {
      checkRateLimit: (key, maxRequests, windowMs) => {
        const now = Date.now();
        const windowStart = now - windowMs;
        
        if (!rateLimits.has(key)) {
          rateLimits.set(key, []);
        }
        
        const requests = rateLimits.get(key);
        
        // Remove old requests outside the window
        const validRequests = requests.filter(timestamp => timestamp > windowStart);
        rateLimits.set(key, validRequests);
        
        if (validRequests.length >= maxRequests) {
          this.auditLogEvent('rate_limit_exceeded', { key, maxRequests, windowMs });
          return false;
        }
        
        validRequests.push(now);
        return true;
      }
    };
  }

  // Input sanitization
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // XSS Protection
  escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Secure random string generation
  generateSecureRandom(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Hash sensitive data
  async hashData(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Get security status
  getSecurityStatus() {
    return {
      csrfToken: !!this.csrfToken,
      sessionId: !!this.sessionId,
      lastActivity: this.lastActivity,
      auditLogSize: this.auditLog.length,
      sessionTimeout: this.getSessionTimeout()
    };
  }

  // Export audit log
  exportAuditLog() {
    const auditData = {
      exportDate: new Date().toISOString(),
      sessionId: this.sessionId,
      totalEntries: this.auditLog.length,
      entries: this.auditLog
    };
    
    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chordcraft-audit-log-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
export const securityService = new SecurityService();

// Export for use in other modules
export default securityService;