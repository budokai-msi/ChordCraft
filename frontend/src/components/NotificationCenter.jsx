import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { notificationService } from '../services/notificationService';

const NotificationIcon = ({ type }) => {
  const iconProps = { className: "w-5 h-5" };
  
  switch (type) {
    case 'success':
      return <CheckCircle {...iconProps} className="w-5 h-5 text-green-400" />;
    case 'error':
      return <AlertCircle {...iconProps} className="w-5 h-5 text-red-400" />;
    case 'warning':
      return <AlertTriangle {...iconProps} className="w-5 h-5 text-yellow-400" />;
    case 'info':
    default:
      return <Info {...iconProps} className="w-5 h-5 text-blue-400" />;
  }
};

const NotificationItem = ({ notification, onRemove, onAction }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const handleAction = (action) => {
    if (action.action) {
      action.action();
    }
    onAction(notification.id, action);
  };

  const getNotificationStyles = () => {
    const baseStyles = "transform transition-all duration-300 ease-in-out";
    const visibilityStyles = isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0";
    const leavingStyles = isLeaving ? "translate-x-full opacity-0 scale-95" : "";
    
    return `${baseStyles} ${visibilityStyles} ${leavingStyles}`;
  };

  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return "bg-green-500/10 border-green-500/20 text-green-100";
      case 'error':
        return "bg-red-500/10 border-red-500/20 text-red-100";
      case 'warning':
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-100";
      case 'info':
      default:
        return "bg-blue-500/10 border-blue-500/20 text-blue-100";
    }
  };

  return (
    <Card className={`${getNotificationStyles()} ${getTypeStyles()} border backdrop-blur-sm`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <NotificationIcon type={notification.type} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-5">{notification.message}</p>
            {notification.details && (
              <p className="text-xs opacity-75 mt-1">{notification.details}</p>
            )}
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex space-x-2 mt-3">
                {notification.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(action)}
                    className="text-xs h-6 px-2"
                  >
                    {action.icon && <action.icon className="w-3 h-3 mr-1" />}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-slate-400 hover:text-white h-6 w-6 p-0 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Subscribe to notification changes
    const unsubscribe = notificationService.subscribe((notification, action, id) => {
      if (action === 'remove') {
        setNotifications(prev => prev.filter(n => n.id !== id));
      } else if (action === 'clear') {
        setNotifications([]);
      } else if (notification) {
        setNotifications(prev => [...prev, notification]);
      }
    });

    // Load existing notifications
    setNotifications(notificationService.getNotifications());

    return unsubscribe;
  }, []);

  const handleRemove = (id) => {
    notificationService.remove(id);
  };

  const handleAction = () => {
    // Action handling is done in the notification service
    // This is just for any additional UI updates if needed
  };

  const handleClearAll = () => {
    notificationService.clear();
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-300">Notifications</h3>
        {notifications.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-slate-400 hover:text-white h-6 px-2 text-xs"
          >
            Clear All
          </Button>
        )}
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={handleRemove}
            onAction={handleAction}
          />
        ))}
      </div>
    </div>
  );
}

export default NotificationCenter;
