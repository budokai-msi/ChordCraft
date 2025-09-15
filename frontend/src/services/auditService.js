import { supabase } from '../supabaseClient';

class AuditService {
  constructor() {
    this.auditLevels = {
      DEBUG: 'debug',
      INFO: 'info',
      WARN: 'warn',
      ERROR: 'error',
      CRITICAL: 'critical'
    };
    
    this.auditCategories = {
      AUTHENTICATION: 'authentication',
      AUTHORIZATION: 'authorization',
      DATA_ACCESS: 'data_access',
      DATA_MODIFICATION: 'data_modification',
      DATA_DELETION: 'data_deletion',
      SYSTEM_EVENT: 'system_event',
      SECURITY_EVENT: 'security_event',
      USER_ACTION: 'user_action',
      API_CALL: 'api_call',
      ERROR: 'error'
    };
    
    this.auditBuffer = [];
    this.bufferSize = 100;
    this.flushInterval = 30000; // 30 seconds
    
    this.initializeAudit();
  }

  initializeAudit() {
    this.setupAuditLogging();
    this.setupAuditFlushing();
    this.setupAuditRetention();
    
    console.log('Audit service initialized');
  }

  setupAuditLogging() {
    this.audit = {
      log: this.logAuditEvent.bind(this),
      logAuthentication: this.logAuthentication.bind(this),
      logDataAccess: this.logDataAccess.bind(this),
      logDataModification: this.logDataModification.bind(this),
      logDataDeletion: this.logDataDeletion.bind(this),
      logSecurityEvent: this.logSecurityEvent.bind(this),
      logUserAction: this.logUserAction.bind(this),
      logAPICall: this.logAPICall.bind(this),
      logError: this.logError.bind(this)
    };
  }

  async logAuditEvent(level, category, message, details = {}) {
    try {
      const auditEvent = {
        level,
        category,
        message,
        details,
        timestamp: new Date().toISOString(),
        user_id: details.user_id || null,
        session_id: details.session_id || null,
        ip_address: details.ip_address || await this.getClientIP(),
        user_agent: details.user_agent || navigator.userAgent,
        url: details.url || window.location.href,
        request_id: details.request_id || this.generateRequestId()
      };
      
      // Add to buffer
      this.auditBuffer.push(auditEvent);
      
      // Flush if buffer is full
      if (this.auditBuffer.length >= this.bufferSize) {
        await this.flushAuditBuffer();
      }
      
      // Also log to console for development
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log(`[AUDIT ${level.toUpperCase()}] ${category}: ${message}`, details);
      }
      
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  async logAuthentication(action, userId, details = {}) {
    await this.logAuditEvent(
      this.auditLevels.INFO,
      this.auditCategories.AUTHENTICATION,
      `User ${action}`,
      {
        ...details,
        user_id: userId,
        action
      }
    );
  }

  async logDataAccess(dataType, dataId, userId, details = {}) {
    await this.logAuditEvent(
      this.auditLevels.INFO,
      this.auditCategories.DATA_ACCESS,
      `Data accessed: ${dataType}`,
      {
        ...details,
        user_id: userId,
        data_type: dataType,
        data_id: dataId
      }
    );
  }

  async logDataModification(dataType, dataId, userId, changes, details = {}) {
    await this.logAuditEvent(
      this.auditLevels.INFO,
      this.auditCategories.DATA_MODIFICATION,
      `Data modified: ${dataType}`,
      {
        ...details,
        user_id: userId,
        data_type: dataType,
        data_id: dataId,
        changes
      }
    );
  }

  async logDataDeletion(dataType, dataId, userId, details = {}) {
    await this.logAuditEvent(
      this.auditLevels.WARN,
      this.auditCategories.DATA_DELETION,
      `Data deleted: ${dataType}`,
      {
        ...details,
        user_id: userId,
        data_type: dataType,
        data_id: dataId
      }
    );
  }

  async logSecurityEvent(eventType, userId, details = {}) {
    await this.logAuditEvent(
      this.auditLevels.WARN,
      this.auditCategories.SECURITY_EVENT,
      `Security event: ${eventType}`,
      {
        ...details,
        user_id: userId,
        event_type: eventType
      }
    );
  }

  async logUserAction(action, userId, details = {}) {
    await this.logAuditEvent(
      this.auditLevels.INFO,
      this.auditCategories.USER_ACTION,
      `User action: ${action}`,
      {
        ...details,
        user_id: userId,
        action
      }
    );
  }

  async logAPICall(method, endpoint, userId, statusCode, details = {}) {
    const level = statusCode >= 400 ? this.auditLevels.ERROR : this.auditLevels.INFO;
    
    await this.logAuditEvent(
      level,
      this.auditCategories.API_CALL,
      `API call: ${method} ${endpoint}`,
      {
        ...details,
        user_id: userId,
        method,
        endpoint,
        status_code: statusCode
      }
    );
  }

  async logError(error, context, userId, details = {}) {
    await this.logAuditEvent(
      this.auditLevels.ERROR,
      this.auditCategories.ERROR,
      `Error: ${error.message}`,
      {
        ...details,
        user_id: userId,
        error_message: error.message,
        error_stack: error.stack,
        context
      }
    );
  }

  setupAuditFlushing() {
    // Flush audit buffer periodically
    setInterval(async () => {
      if (this.auditBuffer.length > 0) {
        await this.flushAuditBuffer();
      }
    }, this.flushInterval);
    
    // Flush on page unload
    window.addEventListener('beforeunload', async () => {
      if (this.auditBuffer.length > 0) {
        await this.flushAuditBuffer();
      }
    });
  }

  async flushAuditBuffer() {
    if (this.auditBuffer.length === 0) return;
    
    try {
      const eventsToFlush = [...this.auditBuffer];
      this.auditBuffer = [];
      
      const { error } = await supabase
        .from('audit_logs')
        .insert(eventsToFlush);
        
      if (error) {
        console.error('Error flushing audit buffer:', error);
        // Re-add events to buffer if flush failed
        this.auditBuffer.unshift(...eventsToFlush);
      } else {
        console.debug(`Flushed ${eventsToFlush.length} audit events`);
      }
    } catch (error) {
      console.error('Error flushing audit buffer:', error);
    }
  }

  setupAuditRetention() {
    // Set up audit log retention (keep for 1 year)
    const retentionDays = 365;
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - retentionDays);
    
    // Check for old audit logs daily
    setInterval(async () => {
      await this.cleanupOldAuditLogs(retentionDate);
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  async cleanupOldAuditLogs(cutoffDate) {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString());
        
      if (error) {
        console.error('Error cleaning up old audit logs:', error);
      } else {
        console.log('Old audit logs cleaned up');
      }
    } catch (error) {
      console.error('Error cleaning up old audit logs:', error);
    }
  }

  async getAuditLogs(filters = {}) {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });
      
      // Apply filters
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.level) {
        query = query.eq('level', filters.level);
      }
      
      if (filters.start_date) {
        query = query.gte('timestamp', filters.start_date);
      }
      
      if (filters.end_date) {
        query = query.lte('timestamp', filters.end_date);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data: logs, error } = await query;
      
      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }
      
      return logs || [];
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return [];
    }
  }

  async getAuditSummary(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });
        
      if (error) {
        console.error('Error fetching audit summary:', error);
        return null;
      }
      
      const summary = {
        total_events: logs.length,
        events_by_category: {},
        events_by_level: {},
        recent_events: logs.slice(0, 10),
        date_range: {
          start: startDate.toISOString(),
          end: new Date().toISOString()
        }
      };
      
      // Count events by category and level
      logs.forEach(log => {
        summary.events_by_category[log.category] = (summary.events_by_category[log.category] || 0) + 1;
        summary.events_by_level[log.level] = (summary.events_by_level[log.level] || 0) + 1;
      });
      
      return summary;
    } catch (error) {
      console.error('Error getting audit summary:', error);
      return null;
    }
  }

  async exportAuditLogs(filters = {}) {
    try {
      const logs = await this.getAuditLogs(filters);
      
      const exportData = {
        export_date: new Date().toISOString(),
        filters,
        total_records: logs.length,
        logs
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chordcraft-audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      console.log('Audit logs exported successfully');
      return true;
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      return false;
    }
  }

  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting client IP:', error);
      return 'unknown';
    }
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get audit service status
  getAuditStatus() {
    return {
      bufferSize: this.auditBuffer.length,
      maxBufferSize: this.bufferSize,
      flushInterval: this.flushInterval,
      auditLevels: this.auditLevels,
      auditCategories: this.auditCategories
    };
  }
}

// Create singleton instance
export const auditService = new AuditService();

// Export for use in other modules
export default auditService;