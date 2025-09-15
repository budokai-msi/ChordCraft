import { auditService } from './auditService';

class LoggerService {
  constructor() {
    this.logLevels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      CRITICAL: 4
    };
    
    this.currentLevel = this.logLevels.INFO;
    this.logBuffer = [];
    this.maxBufferSize = 1000;
    this.flushInterval = 30000; // 30 seconds
    
    this.initializeLogger();
  }

  initializeLogger() {
    this.setupLogFlushing();
    this.setupLogRetention();
    this.setupLogFormatting();
    
    this.info('Logger service initialized');
  }

  setupLogFlushing() {
    // Flush logs periodically
    setInterval(() => {
      this.flushLogs();
    }, this.flushInterval);
    
    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushLogs();
    });
  }

  setupLogRetention() {
    // Clean up old logs daily
    setInterval(() => {
      this.cleanupOldLogs();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  setupLogFormatting() {
    this.formatLog = this.formatLog.bind(this);
    this.shouldLog = this.shouldLog.bind(this);
  }

  shouldLog(level) {
    return level >= this.currentLevel;
  }

  formatLog(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const levelName = Object.keys(this.logLevels).find(key => this.logLevels[key] === level);
    
    const logEntry = {
      timestamp,
      level: levelName,
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    return logEntry;
  }

  debug(message, data = null) {
    if (!this.shouldLog(this.logLevels.DEBUG)) return;
    
    const logEntry = this.formatLog(this.logLevels.DEBUG, message, data);
    this.addToBuffer(logEntry);
    
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }

  info(message, data = null) {
    if (!this.shouldLog(this.logLevels.INFO)) return;
    
    const logEntry = this.formatLog(this.logLevels.INFO, message, data);
    this.addToBuffer(logEntry);
    
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`, data);
    }
  }

  warn(message, data = null) {
    if (!this.shouldLog(this.logLevels.WARN)) return;
    
    const logEntry = this.formatLog(this.logLevels.WARN, message, data);
    this.addToBuffer(logEntry);
    
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, data);
    }
  }

  error(message, data = null) {
    if (!this.shouldLog(this.logLevels.ERROR)) return;
    
    const logEntry = this.formatLog(this.logLevels.ERROR, message, data);
    this.addToBuffer(logEntry);
    
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, data);
    }
    
    // Log to audit service for errors
    auditService.logError(new Error(message), 'logger_service', data);
  }

  critical(message, data = null) {
    if (!this.shouldLog(this.logLevels.CRITICAL)) return;
    
    const logEntry = this.formatLog(this.logLevels.CRITICAL, message, data);
    this.addToBuffer(logEntry);
    
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error(`[CRITICAL] ${message}`, data);
    }
    
    // Log to audit service for critical errors
    auditService.logError(new Error(message), 'logger_service_critical', data);
  }

  addToBuffer(logEntry) {
    this.logBuffer.push(logEntry);
    
    // Flush if buffer is full
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flushLogs();
    }
  }

  async flushLogs() {
    if (this.logBuffer.length === 0) return;
    
    try {
      const logsToFlush = [...this.logBuffer];
      this.logBuffer = [];
      
      // Store in localStorage for persistence
      const storedLogs = JSON.parse(localStorage.getItem('chordcraft-logs') || '[]');
      storedLogs.push(...logsToFlush);
      
      // Keep only last 1000 logs
      if (storedLogs.length > 1000) {
        storedLogs.splice(0, storedLogs.length - 1000);
      }
      
      localStorage.setItem('chordcraft-logs', JSON.stringify(storedLogs));
      
      // Also send to audit service for important logs
      logsToFlush.forEach(log => {
        if (log.level === 'ERROR' || log.level === 'CRITICAL') {
          auditService.logError(new Error(log.message), 'logger_service', log.data);
        }
      });
      
    } catch (error) {
      console.error('Error flushing logs:', error);
    }
  }

  cleanupOldLogs() {
    try {
      const storedLogs = JSON.parse(localStorage.getItem('chordcraft-logs') || '[]');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep logs for 7 days
      
      const filteredLogs = storedLogs.filter(log => 
        new Date(log.timestamp) > cutoffDate
      );
      
      localStorage.setItem('chordcraft-logs', JSON.stringify(filteredLogs));
      
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
    }
  }

  setLogLevel(level) {
    if (typeof level === 'string') {
      level = this.logLevels[level.toUpperCase()];
    }
    
    if (level !== undefined) {
      this.currentLevel = level;
      this.info(`Log level changed to ${Object.keys(this.logLevels).find(key => this.logLevels[key] === level)}`);
    }
  }

  getLogLevel() {
    return Object.keys(this.logLevels).find(key => this.logLevels[key] === this.currentLevel);
  }

  getLogs(level = null, limit = 100) {
    try {
      const storedLogs = JSON.parse(localStorage.getItem('chordcraft-logs') || '[]');
      
      let filteredLogs = storedLogs;
      
      if (level) {
        filteredLogs = storedLogs.filter(log => log.level === level.toUpperCase());
      }
      
      return filteredLogs.slice(-limit);
    } catch (error) {
      console.error('Error getting logs:', error);
      return [];
    }
  }

  clearLogs() {
    this.logBuffer = [];
    localStorage.removeItem('chordcraft-logs');
    this.info('Logs cleared');
  }

  exportLogs(level = null, limit = 1000) {
    try {
      const logs = this.getLogs(level, limit);
      
      const exportData = {
        exportDate: new Date().toISOString(),
        logLevel: level || 'all',
        totalLogs: logs.length,
        logs
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chordcraft-logs-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      this.info('Logs exported successfully');
      return true;
    } catch (error) {
      this.error('Error exporting logs:', error);
      return false;
    }
  }

  // Get logger statistics
  getLoggerStats() {
    return {
      currentLevel: this.getLogLevel(),
      bufferSize: this.logBuffer.length,
      maxBufferSize: this.maxBufferSize,
      flushInterval: this.flushInterval,
      totalStoredLogs: JSON.parse(localStorage.getItem('chordcraft-logs') || '[]').length
    };
  }
}

// Create singleton instance
export const loggerService = new LoggerService();

// Make it globally available
window.loggerService = loggerService;

// Export for use in other modules
export default loggerService;