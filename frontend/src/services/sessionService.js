import { loggerService } from './loggerService';
import { auditService } from './auditService';
import { securityService } from './securityService';

class SessionService {
  constructor() {
    this.sessionTimeout = 60 * 60 * 1000; // 1 hour in milliseconds
    this.warningTime = 5 * 60 * 1000; // 5 minutes before timeout
    this.maxInactiveTime = 30 * 60 * 1000; // 30 minutes of inactivity
    this.sessionData = new Map();
    this.sessionWarnings = new Map();
    
    this.initializeSessionManagement();
  }

  initializeSessionManagement() {
    this.setupSessionMonitoring();
    this.setupSessionValidation();
    this.setupSessionCleanup();
    this.setupSessionSecurity();
    
    loggerService.info('Session service initialized');
  }

  setupSessionMonitoring() {
    // Monitor user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.updateLastActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Check session status every minute
    setInterval(() => {
      this.checkSessionStatus();
    }, 60000);

    // Check for warnings every 30 seconds
    setInterval(() => {
      this.checkSessionWarnings();
    }, 30000);
  }

  setupSessionValidation() {
    this.validateSession = this.validateSession.bind(this);
    this.refreshSession = this.refreshSession.bind(this);
    this.invalidateSession = this.invalidateSession.bind(this);
  }

  setupSessionCleanup() {
    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  setupSessionSecurity() {
    this.detectSessionHijacking = this.detectSessionHijacking.bind(this);
    this.rotateSessionId = this.rotateSessionId.bind(this);
    this.validateSessionIntegrity = this.validateSessionIntegrity.bind(this);
  }

  createSession(userId, sessionData = {}) {
    try {
      const sessionId = this.generateSessionId();
      const now = Date.now();
      
      const session = {
        id: sessionId,
        user_id: userId,
        created_at: now,
        last_activity: now,
        last_ip: sessionData.ip_address || 'unknown',
        last_user_agent: sessionData.user_agent || navigator.userAgent,
        data: sessionData,
        is_active: true,
        security_token: this.generateSecurityToken()
      };
      
      this.sessionData.set(sessionId, session);
      
      // Store in sessionStorage for persistence
      sessionStorage.setItem('chordcraft-session-id', sessionId);
      sessionStorage.setItem('chordcraft-session-data', JSON.stringify(session));
      
      // Log session creation
      auditService.logAuthentication('session_created', userId, {
        session_id: sessionId,
        ip_address: session.last_ip,
        user_agent: session.last_user_agent
      });
      
      loggerService.info(`Session created for user ${userId}: ${sessionId}`);
      return sessionId;
    } catch (error) {
      loggerService.error('Error creating session:', error);
      return null;
    }
  }

  getSession(sessionId) {
    if (!sessionId) {
      sessionId = sessionStorage.getItem('chordcraft-session-id');
    }
    
    if (!sessionId) return null;
    
    const session = this.sessionData.get(sessionId);
    
    if (!session) {
      // Try to restore from sessionStorage
      const storedSession = sessionStorage.getItem('chordcraft-session-data');
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          if (parsedSession.id === sessionId) {
            this.sessionData.set(sessionId, parsedSession);
            return parsedSession;
          }
        } catch (error) {
          loggerService.error('Error parsing stored session:', error);
        }
      }
      return null;
    }
    
    return session;
  }

  updateLastActivity() {
    const sessionId = sessionStorage.getItem('chordcraft-session-id');
    if (!sessionId) return;
    
    const session = this.sessionData.get(sessionId);
    if (session) {
      session.last_activity = Date.now();
      this.sessionData.set(sessionId, session);
      
      // Update sessionStorage
      sessionStorage.setItem('chordcraft-session-data', JSON.stringify(session));
    }
  }

  checkSessionStatus() {
    const sessionId = sessionStorage.getItem('chordcraft-session-id');
    if (!sessionId) return;
    
    const session = this.getSession(sessionId);
    if (!session) return;
    
    const now = Date.now();
    const timeSinceActivity = now - session.last_activity;
    
    // Check for session timeout
    if (timeSinceActivity > this.sessionTimeout) {
      this.handleSessionTimeout(session);
      return;
    }
    
    // Check for warning time
    if (timeSinceActivity > (this.sessionTimeout - this.warningTime)) {
      this.showSessionWarning(session);
    }
  }

  checkSessionWarnings() {
    const now = Date.now();
    
    for (const [sessionId, warningTime] of this.sessionWarnings.entries()) {
      if (now - warningTime > this.warningTime) {
        // Warning expired, remove it
        this.sessionWarnings.delete(sessionId);
      }
    }
  }

  handleSessionTimeout(session) {
    loggerService.warn(`Session timeout for user ${session.user_id}: ${session.id}`);
    
    // Log session timeout
    auditService.logAuthentication('session_timeout', session.user_id, {
      session_id: session.id,
      last_activity: new Date(session.last_activity).toISOString()
    });
    
    // Invalidate session
    this.invalidateSession(session.id);
    
    // Show timeout notification
    this.showSessionTimeoutNotification();
    
    // Redirect to login after a delay
    setTimeout(() => {
      window.location.href = '/login';
    }, 3000);
  }

  showSessionWarning(session) {
    const sessionId = session.id;
    
    // Only show warning once per session
    if (this.sessionWarnings.has(sessionId)) return;
    
    this.sessionWarnings.set(sessionId, Date.now());
    
    const timeLeft = Math.ceil((this.sessionTimeout - (Date.now() - session.last_activity)) / 1000 / 60);
    
    if (window.notificationService) {
      window.notificationService.show('warning', 
        `Your session will expire in ${timeLeft} minutes. Click to extend.`, 
        { 
          duration: 0, // Don't auto-dismiss
          action: {
            label: 'Extend Session',
            handler: () => this.extendSession(sessionId)
          }
        }
      );
    } else {
      if (confirm(`Your session will expire in ${timeLeft} minutes. Click OK to extend.`)) {
        this.extendSession(sessionId);
      }
    }
  }

  showSessionTimeoutNotification() {
    if (window.notificationService) {
      window.notificationService.show('error', 
        'Your session has expired due to inactivity. Please log in again.', 
        { duration: 10000 }
      );
    } else {
      alert('Your session has expired due to inactivity. Please log in again.');
    }
  }

  extendSession(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) return false;
    
    session.last_activity = Date.now();
    this.sessionData.set(sessionId, session);
    
    // Update sessionStorage
    sessionStorage.setItem('chordcraft-session-data', JSON.stringify(session));
    
    // Remove warning
    this.sessionWarnings.delete(sessionId);
    
    // Log session extension
    auditService.logAuthentication('session_extended', session.user_id, {
      session_id: sessionId
    });
    
    loggerService.info(`Session extended for user ${session.user_id}: ${sessionId}`);
    return true;
  }

  validateSession(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) return false;
    
    // Check if session is active
    if (!session.is_active) return false;
    
    // Check session timeout
    const now = Date.now();
    const timeSinceActivity = now - session.last_activity;
    
    if (timeSinceActivity > this.sessionTimeout) {
      this.invalidateSession(sessionId);
      return false;
    }
    
    // Check for session hijacking
    if (this.detectSessionHijacking(session)) {
      this.invalidateSession(sessionId);
      return false;
    }
    
    // Validate session integrity
    if (!this.validateSessionIntegrity(session)) {
      this.invalidateSession(sessionId);
      return false;
    }
    
    return true;
  }

  refreshSession(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) return false;
    
    // Update last activity
    session.last_activity = Date.now();
    
    // Rotate session ID for security
    const newSessionId = this.rotateSessionId(sessionId);
    
    // Update session data
    this.sessionData.set(newSessionId, session);
    this.sessionData.delete(sessionId);
    
    // Update sessionStorage
    sessionStorage.setItem('chordcraft-session-id', newSessionId);
    sessionStorage.setItem('chordcraft-session-data', JSON.stringify(session));
    
    // Log session refresh
    auditService.logAuthentication('session_refreshed', session.user_id, {
      old_session_id: sessionId,
      new_session_id: newSessionId
    });
    
    loggerService.info(`Session refreshed for user ${session.user_id}: ${sessionId} -> ${newSessionId}`);
    return newSessionId;
  }

  invalidateSession(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) return false;
    
    // Mark session as inactive
    session.is_active = false;
    session.invalidated_at = Date.now();
    
    // Remove from active sessions
    this.sessionData.delete(sessionId);
    
    // Clear sessionStorage
    sessionStorage.removeItem('chordcraft-session-id');
    sessionStorage.removeItem('chordcraft-session-data');
    
    // Log session invalidation
    auditService.logAuthentication('session_invalidated', session.user_id, {
      session_id: sessionId,
      reason: 'manual_invalidation'
    });
    
    loggerService.info(`Session invalidated for user ${session.user_id}: ${sessionId}`);
    return true;
  }

  detectSessionHijacking(session) {
    const currentIP = this.getCurrentIP();
    const currentUserAgent = navigator.userAgent;
    
    // Check IP address change
    if (session.last_ip && session.last_ip !== currentIP) {
      loggerService.warn(`Potential session hijacking detected: IP changed from ${session.last_ip} to ${currentIP}`);
      
      // Log security event
      auditService.logSecurityEvent('potential_session_hijacking', session.user_id, {
        session_id: session.id,
        old_ip: session.last_ip,
        new_ip: currentIP,
        reason: 'ip_address_change'
      });
      
      return true;
    }
    
    // Check user agent change
    if (session.last_user_agent && session.last_user_agent !== currentUserAgent) {
      loggerService.warn(`Potential session hijacking detected: User agent changed`);
      
      // Log security event
      auditService.logSecurityEvent('potential_session_hijacking', session.user_id, {
        session_id: session.id,
        old_user_agent: session.last_user_agent,
        new_user_agent: currentUserAgent,
        reason: 'user_agent_change'
      });
      
      return true;
    }
    
    return false;
  }

  rotateSessionId(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) return sessionId;
    
    const newSessionId = this.generateSessionId();
    session.id = newSessionId;
    session.security_token = this.generateSecurityToken();
    
    return newSessionId;
  }

  validateSessionIntegrity(session) {
    // Check if security token is valid
    if (!session.security_token) return false;
    
    // Check if session data is consistent
    if (!session.user_id || !session.created_at) return false;
    
    // Check if session is not too old (max 24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - session.created_at > maxAge) return false;
    
    return true;
  }

  cleanupExpiredSessions() {
    const now = Date.now();
    const expiredSessions = [];
    
    for (const [sessionId, session] of this.sessionData.entries()) {
      const timeSinceActivity = now - session.last_activity;
      
      if (timeSinceActivity > this.sessionTimeout || !session.is_active) {
        expiredSessions.push(sessionId);
      }
    }
    
    expiredSessions.forEach(sessionId => {
      this.sessionData.delete(sessionId);
    });
    
    if (expiredSessions.length > 0) {
      loggerService.info(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  generateSessionId() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  generateSecurityToken() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  getCurrentIP() {
    // This would typically be set by the server or obtained from an API
    return sessionStorage.getItem('chordcraft-client-ip') || 'unknown';
  }

  setCurrentIP(ip) {
    sessionStorage.setItem('chordcraft-client-ip', ip);
  }

  // Get session statistics
  getSessionStats() {
    const now = Date.now();
    const activeSessions = Array.from(this.sessionData.values()).filter(session => session.is_active);
    const expiredSessions = Array.from(this.sessionData.values()).filter(session => 
      !session.is_active || (now - session.last_activity) > this.sessionTimeout
    );
    
    return {
      totalSessions: this.sessionData.size,
      activeSessions: activeSessions.length,
      expiredSessions: expiredSessions.length,
      sessionTimeout: this.sessionTimeout,
      warningTime: this.warningTime
    };
  }

  // Export session data
  exportSessionData() {
    const data = {
      exportDate: new Date().toISOString(),
      stats: this.getSessionStats(),
      sessions: Array.from(this.sessionData.values())
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chordcraft-sessions-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
export const sessionService = new SessionService();

// Export for use in other modules
export default sessionService;