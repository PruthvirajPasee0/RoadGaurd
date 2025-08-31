import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiBell, FiCheckCircle, FiAlertCircle, FiInfo, FiClock } from 'react-icons/fi';
import '../styles/Notifications.css';
import { getNotifications, markNotificationRead } from '../services/api';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const rows = await getNotifications({ status: filter });
      // Normalize to component's expected keys
      const normalized = rows.map(r => ({
        id: r.id,
        title: r.title,
        message: r.body,
        isRead: !!r.is_read,
        timestamp: r.created_at,
        type: 'info',
      }));
      setNotifications(normalized);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      // Notify other parts of the app (e.g., header badge) to refresh
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="notif-icon success" />;
      case 'warning':
        return <FiAlertCircle className="notif-icon warning" />;
      case 'info':
        return <FiInfo className="notif-icon info" />;
      default:
        return <FiBell className="notif-icon default" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <p>Stay updated with your service requests and alerts</p>
      </div>

      <div className="notifications-controls">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button
            className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read
          </button>
        </div>

        {notifications.filter(n => !n.isRead).length > 0 && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              notifications.forEach(n => {
                if (!n.isRead) handleMarkAsRead(n.id);
              });
            }}
          >
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <FiBell className="empty-icon" />
          <h3>No notifications</h3>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <div className="notification-meta">
                  <FiClock />
                  <span>{formatTime(notification.timestamp)}</span>
                </div>
              </div>
              {!notification.isRead && (
                <div className="unread-indicator"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
