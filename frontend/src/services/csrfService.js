import { loggerService } from './loggerService';
import { auditService } from './auditService';

class CSRFService {
  constructor() {
    this.csrfToken = null;
    this.tokenExpiry = 60 * 60 * 1000; // 1 hour in milliseconds
    this.tokenRotationInterval = 30 * 60 * 1000; // 30 minutes
    this.initializeCSRF();
  }

  initializeCSRF() {
    this.generateCSRFToken();
    this.setupTokenRotation();
    this.setupTokenValidation();
    
    loggerService.info('CSRF service initialized');
  }

  generateCSRFToken() {
    try {
      // Generate a cryptographically secure CSRF token
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      this.csrfToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      
      // Store in sessionStorage for persistence
      sessionStorage.setItem('chordcraft-csrf-token', this.csrfToken);
      sessionStorage.setItem('chordcraft-csrf-token-expiry', (Date.now() + this.tokenExpiry).toString());
      
      // Log token generation
      auditService.logSecurityEvent('csrf_token_generated', null, {
        token_length: this.csrfToken.length,
        expiry: new Date(Date.now() + this.tokenExpiry).toISOString()
      });
      
      loggerService.debug('CSRF token generated');
      return this.csrfToken;
    } catch (error) {
      loggerService.error('Error generating CSRF token:', error);
      return null;
    }
  }

  setupTokenRotation() {
    // Rotate CSRF token periodically for security
    setInterval(() => {
      this.rotateCSRFToken();
    }, this.tokenRotationInterval);
  }

  setupTokenValidation() {
    this.validateToken = this.validateToken.bind(this);
    this.getToken = this.getToken.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  getToken() {
    // Check if token exists and is not expired
    if (this.csrfToken && this.isTokenValid()) {
      return this.csrfToken;
    }
    
    // Generate new token if expired or missing
    return this.generateCSRFToken();
  }

  isTokenValid() {
    if (!this.csrfToken) return false;
    
    const expiry = sessionStorage.getItem('chordcraft-csrf-token-expiry');
    if (!expiry) return false;
    
    const now = Date.now();
    const tokenExpiry = parseInt(expiry, 10);
    
    return now < tokenExpiry;
  }

  validateToken(token) {
    if (!token) {
      loggerService.warn('CSRF token validation failed: No token provided');
      return false;
    }
    
    if (!this.csrfToken) {
      loggerService.warn('CSRF token validation failed: No stored token');
      return false;
    }
    
    if (!this.isTokenValid()) {
      loggerService.warn('CSRF token validation failed: Token expired');
      return false;
    }
    
    const isValid = token === this.csrfToken;
    
    if (!isValid) {
      loggerService.warn('CSRF token validation failed: Token mismatch');
      
      // Log security event
      auditService.logSecurityEvent('csrf_token_validation_failed', null, {
        provided_token: token.substring(0, 8) + '...',
        expected_token: this.csrfToken.substring(0, 8) + '...',
        reason: 'token_mismatch'
      });
    }
    
    return isValid;
  }

  rotateCSRFToken() {
    try {
      const oldToken = this.csrfToken;
      this.generateCSRFToken();
      
      // Log token rotation
      auditService.logSecurityEvent('csrf_token_rotated', null, {
        old_token: oldToken ? oldToken.substring(0, 8) + '...' : 'none',
        new_token: this.csrfToken ? this.csrfToken.substring(0, 8) + '...' : 'none'
      });
      
      loggerService.debug('CSRF token rotated');
    } catch (error) {
      loggerService.error('Error rotating CSRF token:', error);
    }
  }

  refreshToken() {
    try {
      const oldToken = this.csrfToken;
      this.generateCSRFToken();
      
      // Log token refresh
      auditService.logSecurityEvent('csrf_token_refreshed', null, {
        old_token: oldToken ? oldToken.substring(0, 8) + '...' : 'none',
        new_token: this.csrfToken ? this.csrfToken.substring(0, 8) + '...' : 'none'
      });
      
      loggerService.debug('CSRF token refreshed');
      return this.csrfToken;
    } catch (error) {
      loggerService.error('Error refreshing CSRF token:', error);
      return null;
    }
  }

  // Add CSRF token to request headers
  addCSRFTokenToHeaders(headers = {}) {
    const token = this.getToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
    return headers;
  }

  // Add CSRF token to form data
  addCSRFTokenToFormData(formData) {
    const token = this.getToken();
    if (token) {
      formData.append('_csrf_token', token);
    }
    return formData;
  }

  // Add CSRF token to URL parameters
  addCSRFTokenToURL(url) {
    const token = this.getToken();
    if (token) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}_csrf_token=${encodeURIComponent(token)}`;
    }
    return url;
  }

  // Validate CSRF token from request
  validateRequest(request) {
    const token = request.headers?.['X-CSRF-Token'] || 
                  request.headers?.['x-csrf-token'] ||
                  request.body?._csrf_token ||
                  request.query?._csrf_token;
    
    return this.validateToken(token);
  }

  // Get CSRF token info
  getTokenInfo() {
    return {
      hasToken: !!this.csrfToken,
      isValid: this.isTokenValid(),
      expiry: sessionStorage.getItem('chordcraft-csrf-token-expiry'),
      tokenPreview: this.csrfToken ? this.csrfToken.substring(0, 8) + '...' : 'none'
    };
  }

  // Clear CSRF token
  clearToken() {
    this.csrfToken = null;
    sessionStorage.removeItem('chordcraft-csrf-token');
    sessionStorage.removeItem('chordcraft-csrf-token-expiry');
    
    loggerService.debug('CSRF token cleared');
  }

  // Export CSRF service status
  exportCSRFStatus() {
    const status = {
      exportDate: new Date().toISOString(),
      tokenInfo: this.getTokenInfo(),
      serviceStatus: {
        initialized: true,
        tokenExpiry: this.tokenExpiry,
        rotationInterval: this.tokenRotationInterval
      }
    };
    
    const blob = new Blob([JSON.stringify(status, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chordcraft-csrf-status-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
export const csrfService = new CSRFService();

// Export for use in other modules
export default csrfService;