import { loggerService } from './loggerService';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.maxNotifications = 5;
    this.defaultDuration = 5000;
    this.notificationTypes = {
      SUCCESS: 'success',
      ERROR: 'error',
      WARNING: 'warning',
      INFO: 'info'
    };
    
    this.initializeNotificationService();
  }

  initializeNotificationService() {
    this.setupNotificationContainer();
    this.setupNotificationQueue();
    this.setupNotificationCleanup();
    
    loggerService.info('Notification service initialized');
  }

  setupNotificationContainer() {
    // Create notification container if it doesn't exist
    let container = document.getElementById('notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.className = 'fixed top-4 right-4 z-50 space-y-2';
      document.body.appendChild(container);
    }
    
    this.container = container;
  }

  setupNotificationQueue() {
    this.queue = [];
    this.isProcessing = false;
  }

  setupNotificationCleanup() {
    // Clean up expired notifications every 30 seconds
    setInterval(() => {
      this.cleanupExpiredNotifications();
    }, 30000);
  }

  show(type, message, options = {}) {
    try {
      const notification = {
        id: this.generateNotificationId(),
        type,
        message,
        duration: options.duration || this.defaultDuration,
        persistent: options.persistent || false,
        action: options.action || null,
        timestamp: Date.now(),
        element: null
      };
      
      // Add to queue
      this.queue.push(notification);
      
      // Process queue if not already processing
      if (!this.isProcessing) {
        this.processQueue();
      }
      
      // Log notification
      loggerService.debug(`Notification shown: ${type} - ${message}`);
      
      return notification.id;
    } catch (error) {
      loggerService.error('Error showing notification:', error);
      return null;
    }
  }

  showSuccess(message, options = {}) {
    return this.show(this.notificationTypes.SUCCESS, message, options);
  }

  showError(message, options = {}) {
    return this.show(this.notificationTypes.ERROR, message, { ...options, duration: 10000 });
  }

  showWarning(message, options = {}) {
    return this.show(this.notificationTypes.WARNING, message, options);
  }

  showInfo(message, options = {}) {
    return this.show(this.notificationTypes.INFO, message, options);
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const notification = this.queue.shift();
      await this.displayNotification(notification);
      
      // Small delay between notifications
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isProcessing = false;
  }

  async displayNotification(notification) {
    try {
      const element = this.createNotificationElement(notification);
      notification.element = element;
      
      // Add to container
      this.container.appendChild(element);
      
      // Trigger animation
      requestAnimationFrame(() => {
        element.classList.add('notification-enter');
      });
      
      // Set up auto-dismiss
      if (!notification.persistent && notification.duration > 0) {
        setTimeout(() => {
          this.dismiss(notification.id);
        }, notification.duration);
      }
      
      // Store notification
      this.notifications.push(notification);
      
      // Limit number of notifications
      if (this.notifications.length > this.maxNotifications) {
        const oldest = this.notifications.shift();
        this.dismiss(oldest.id);
      }
      
    } catch (error) {
      loggerService.error('Error displaying notification:', error);
    }
  }

  createNotificationElement(notification) {
    const element = document.createElement('div');
    element.className = `notification notification-${notification.type} notification-enter`;
    element.setAttribute('data-notification-id', notification.id);
    
    const icon = this.getNotificationIcon(notification.type);
    const actionButton = notification.action ? this.createActionButton(notification.action) : '';
    
    element.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">${icon}</div>
        <div class="notification-message">${notification.message}</div>
        ${actionButton}
        <button class="notification-close" onclick="window.notificationService.dismiss('${notification.id}')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    return element;
  }

  getNotificationIcon(type) {
    const icons = {
      [this.notificationTypes.SUCCESS]: `
        <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `,
      [this.notificationTypes.ERROR]: `
        <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `,
      [this.notificationTypes.WARNING]: `
        <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      `,
      [this.notificationTypes.INFO]: `
        <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      `
    };
    
    return icons[type] || icons[this.notificationTypes.INFO];
  }

  createActionButton(action) {
    return `
      <button class="notification-action" onclick="${action.handler}">
        ${action.label}
      </button>
    `;
  }

  dismiss(notificationId) {
    try {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (!notification) return;
      
      const element = notification.element;
      if (element) {
        element.classList.add('notification-exit');
        
        // Remove element after animation
        setTimeout(() => {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        }, 300);
      }
      
      // Remove from notifications array
      const index = this.notifications.findIndex(n => n.id === notificationId);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
      
      loggerService.debug(`Notification dismissed: ${notificationId}`);
    } catch (error) {
      loggerService.error('Error dismissing notification:', error);
    }
  }

  dismissAll() {
    this.notifications.forEach(notification => {
      this.dismiss(notification.id);
    });
  }

  cleanupExpiredNotifications() {
    const now = Date.now();
    const expired = this.notifications.filter(notification => 
      !notification.persistent && 
      (now - notification.timestamp) > notification.duration
    );
    
    expired.forEach(notification => {
      this.dismiss(notification.id);
    });
  }

  generateNotificationId() {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get notification statistics
  getNotificationStats() {
    return {
      totalNotifications: this.notifications.length,
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      maxNotifications: this.maxNotifications
    };
  }

  // Export notification data
  exportNotificationData() {
    const data = {
      exportDate: new Date().toISOString(),
      stats: this.getNotificationStats(),
      notifications: this.notifications.map(n => ({
        id: n.id,
        type: n.type,
        message: n.message,
        timestamp: n.timestamp
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chordcraft-notifications-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Make it globally available
window.notificationService = notificationService;

// Export for use in other modules
export default notificationService;