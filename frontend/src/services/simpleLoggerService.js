class SimpleLoggerService {
  constructor() {
    this.logLevels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      CRITICAL: 4
    };
    
    this.currentLevel = this.logLevels.INFO;
  }

  shouldLog(level) {
    return level >= this.currentLevel;
  }

  debug(message, data = null) {
    if (!this.shouldLog(this.logLevels.DEBUG)) return;
    console.debug(`[DEBUG] ${message}`, data);
  }

  info(message, data = null) {
    if (!this.shouldLog(this.logLevels.INFO)) return;
    console.info(`[INFO] ${message}`, data);
  }

  warn(message, data = null) {
    if (!this.shouldLog(this.logLevels.WARN)) return;
    console.warn(`[WARN] ${message}`, data);
  }

  error(message, data = null) {
    if (!this.shouldLog(this.logLevels.ERROR)) return;
    console.error(`[ERROR] ${message}`, data);
  }

  critical(message, data = null) {
    if (!this.shouldLog(this.logLevels.CRITICAL)) return;
    console.error(`[CRITICAL] ${message}`, data);
  }
}

// Create singleton instance
export const simpleLoggerService = new SimpleLoggerService();

// Export for use in other modules
export default simpleLoggerService;
