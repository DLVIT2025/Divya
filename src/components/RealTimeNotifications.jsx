import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import './RealTimeNotifications.css';

export default function RealTimeNotifications({ socket }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket) return;

    socket.on('notification', (notification) => {
      const id = Date.now();
      const newNotif = {
        id,
        type: notification.type || 'info',
        title: notification.title || 'Notification',
        message: notification.message,
        read: false,
        timestamp: new Date()
      };

      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Auto remove after 5 seconds for non-critical notifications
      if (notification.type === 'info' || notification.type === 'success') {
        setTimeout(() => removeNotification(id), 5000);
      }
    });

    return () => {
      socket.off('notification');
    };
  }, [socket]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} />;
      case 'error':
        return <AlertCircle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className="notifications-container">
      <div className="notification-stack">
        {notifications.slice(0, 3).map(notif => (
          <div 
            key={notif.id} 
            className={`notification-item ${notif.type} ${notif.read ? 'read' : 'unread'}`}
            onClick={() => markAsRead(notif.id)}
          >
            <div className="notification-icon">
              {getIcon(notif.type)}
            </div>
            <div className="notification-content">
              <h4>{notif.title}</h4>
              <p>{notif.message}</p>
              <span className="notification-time">
                {new Date(notif.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <button 
              className="notification-close"
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notif.id);
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {unreadCount > 0 && (
        <div className="notification-badge">
          {unreadCount}
        </div>
      )}
    </div>
  );
}
