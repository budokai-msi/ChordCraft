import { loggerService } from './loggerService';
import { auditService } from './auditService';

class RateLimitService {
  constructor() {
    this.rateLimits = new Map();
    this.defaultLimits = {
      api: { requests: 100, window: 60000 }, // 100 requests per minute
      auth: { requests: 5, window: 300000 }, // 5 requests per 5 minutes
      upload: { requests: 10, window: 3600000 }, // 10 requests per hour
      download: { requests: 50, window: 3600000 }, // 50 requests per hour
      ai: { requests: 20, window: 3600000 }, // 20 requests per hour
      stripe: { requests: 30, window: 3600000 } // 30 requests per hour
    };
    
    this.cleanupInterval = 300000; // 5 minutes
    this.initializeRateLimiting();
  }

  initializeRateLimiting() {
    this.setupRateLimitCleanup();
    this.setupRateLimitMiddleware();
    
    loggerService.info('Rate limit service initialized');
  }

  setupRateLimitCleanup() {
    // Clean up expired rate limit entries
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.cleanupInterval);
  }

  setupRateLimitMiddleware() {
    this.middleware = {
      checkRateLimit: this.checkRateLimit.bind(this),
      checkAPIRateLimit: this.checkAPIRateLimit.bind(this),
      checkAuthRateLimit: this.checkAuthRateLimit.bind(this),
      checkUploadRateLimit: this.checkUploadRateLimit.bind(this),
      checkDownloadRateLimit: this.checkDownloadRateLimit.bind(this),
      checkAIRateLimit: this.checkAIRateLimit.bind(this),
      checkStripeRateLimit: this.checkStripeRateLimit.bind(this)
    };
  }

  checkRateLimit(key, limitType, userId = null) {
    const limits = this.defaultLimits[limitType] || this.defaultLimits.api;
    const now = Date.now();
    const windowStart = now - limits.window;
    
    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, []);
    }
    
    const requests = this.rateLimits.get(key);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    this.rateLimits.set(key, validRequests);
    
    if (validRequests.length >= limits.requests) {
      // Rate limit exceeded
      this.handleRateLimitExceeded(key, limitType, userId, validRequests.length, limits.requests);
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.min(...validRequests) + limits.window,
        retryAfter: Math.ceil((Math.min(...validRequests) + limits.window - now) / 1000)
      };
    }
    
    // Add current request
    validRequests.push(now);
    this.rateLimits.set(key, validRequests);
    
    return {
      allowed: true,
      remaining: limits.requests - validRequests.length,
      resetTime: now + limits.window,
      retryAfter: 0
    };
  }

  checkAPIRateLimit(userId, endpoint) {
    const key = `api:${userId}:${endpoint}`;
    return this.checkRateLimit(key, 'api', userId);
  }

  checkAuthRateLimit(userId, action) {
    const key = `auth:${userId}:${action}`;
    return this.checkRateLimit(key, 'auth', userId);
  }

  checkUploadRateLimit(userId, fileType) {
    const key = `upload:${userId}:${fileType}`;
    return this.checkRateLimit(key, 'upload', userId);
  }

  checkDownloadRateLimit(userId, fileType) {
    const key = `download:${userId}:${fileType}`;
    return this.checkRateLimit(key, 'download', userId);
  }

  checkAIRateLimit(userId, aiType) {
    const key = `ai:${userId}:${aiType}`;
    return this.checkRateLimit(key, 'ai', userId);
  }

  checkStripeRateLimit(userId, action) {
    const key = `stripe:${userId}:${action}`;
    return this.checkRateLimit(key, 'stripe', userId);
  }

  handleRateLimitExceeded(key, limitType, userId, currentCount, maxCount) {
    loggerService.warn(`Rate limit exceeded for ${key}: ${currentCount}/${maxCount}`);
    
    // Log security event
    auditService.logSecurityEvent('rate_limit_exceeded', userId, {
      key,
      limit_type: limitType,
      current_count: currentCount,
      max_count: maxCount
    });
    
    // Show user notification
    this.showRateLimitNotification(limitType, maxCount);
  }

  showRateLimitNotification(limitType, maxCount) {
    const messages = {
      api: `API rate limit exceeded. Maximum ${maxCount} requests allowed. Please try again later.`,
      auth: `Authentication rate limit exceeded. Maximum ${maxCount} attempts allowed. Please try again later.`,
      upload: `Upload rate limit exceeded. Maximum ${maxCount} uploads allowed. Please try again later.`,
      download: `Download rate limit exceeded. Maximum ${maxCount} downloads allowed. Please try again later.`,
      ai: `AI processing rate limit exceeded. Maximum ${maxCount} requests allowed. Please try again later.`,
      stripe: `Payment rate limit exceeded. Maximum ${maxCount} requests allowed. Please try again later.`
    };
    
    const message = messages[limitType] || `Rate limit exceeded. Maximum ${maxCount} requests allowed.`;
    
    if (window.notificationService) {
      window.notificationService.show('warning', message, { duration: 10000 });
    } else {
      alert(`Rate Limit: ${message}`);
    }
  }

  cleanupExpiredEntries() {
    const now = Date.now();
    const maxAge = Math.max(...Object.values(this.defaultLimits).map(limit => limit.window));
    
    for (const [key, requests] of this.rateLimits.entries()) {
      const validRequests = requests.filter(timestamp => now - timestamp < maxAge);
      
      if (validRequests.length === 0) {
        this.rateLimits.delete(key);
      } else {
        this.rateLimits.set(key, validRequests);
      }
    }
    
    loggerService.debug(`Rate limit cleanup completed. Active keys: ${this.rateLimits.size}`);
  }

  // Get rate limit status for a user
  getRateLimitStatus(userId) {
    const status = {};
    
    for (const [limitType, limits] of Object.entries(this.defaultLimits)) {
      const key = `${limitType}:${userId}:*`;
      const requests = this.rateLimits.get(key) || [];
      const now = Date.now();
      const windowStart = now - limits.window;
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      
      status[limitType] = {
        current: validRequests.length,
        limit: limits.requests,
        remaining: limits.requests - validRequests.length,
        resetTime: validRequests.length > 0 ? Math.min(...validRequests) + limits.window : now + limits.window
      };
    }
    
    return status;
  }

  // Update rate limits
  updateRateLimits(newLimits) {
    this.defaultLimits = { ...this.defaultLimits, ...newLimits };
    loggerService.info('Rate limits updated:', newLimits);
  }

  // Reset rate limits for a user
  resetUserRateLimits(userId) {
    const keysToDelete = [];
    
    for (const key of this.rateLimits.keys()) {
      if (key.includes(`:${userId}:`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.rateLimits.delete(key));
    
    loggerService.info(`Rate limits reset for user ${userId}`);
  }

  // Get rate limit statistics
  getRateLimitStats() {
    const stats = {
      totalKeys: this.rateLimits.size,
      keysByType: {},
      totalRequests: 0
    };
    
    for (const [key, requests] of this.rateLimits.entries()) {
      const [type] = key.split(':');
      stats.keysByType[type] = (stats.keysByType[type] || 0) + 1;
      stats.totalRequests += requests.length;
    }
    
    return stats;
  }

  // Check if a user is rate limited
  isUserRateLimited(userId, limitType) {
    const status = this.getRateLimitStatus(userId);
    return status[limitType]?.remaining <= 0;
  }

  // Get time until rate limit resets
  getTimeUntilReset(userId, limitType) {
    const status = this.getRateLimitStatus(userId);
    const resetTime = status[limitType]?.resetTime;
    
    if (!resetTime) return 0;
    
    const now = Date.now();
    return Math.max(0, resetTime - now);
  }

  // Create a rate limit key
  createRateLimitKey(prefix, userId, suffix = '') {
    return `${prefix}:${userId}:${suffix}`;
  }

  // Check rate limit with custom key
  checkCustomRateLimit(key, requests, window, userId = null) {
    const now = Date.now();
    const windowStart = now - window;
    
    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, []);
    }
    
    const requestTimes = this.rateLimits.get(key);
    const validRequests = requestTimes.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length >= requests) {
      this.handleRateLimitExceeded(key, 'custom', userId, validRequests.length, requests);
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.min(...validRequests) + window,
        retryAfter: Math.ceil((Math.min(...validRequests) + window - now) / 1000)
      };
    }
    
    validRequests.push(now);
    this.rateLimits.set(key, validRequests);
    
    return {
      allowed: true,
      remaining: requests - validRequests.length,
      resetTime: now + window,
      retryAfter: 0
    };
  }

  // Export rate limit data
  exportRateLimitData() {
    const data = {
      exportDate: new Date().toISOString(),
      defaultLimits: this.defaultLimits,
      currentLimits: Object.fromEntries(this.rateLimits),
      stats: this.getRateLimitStats()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chordcraft-rate-limits-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
export const rateLimitService = new RateLimitService();

// Export for use in other modules
export default rateLimitService;