import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, AlertTriangle, AlertCircle, Info, Sparkles } from 'lucide-react';
import { notificationApi } from '../api/notificationApi';
import { formatDate } from '../utils/date';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const [list, countRes] = await Promise.all([
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount()
      ]);
      setNotifications(list);
      setUnreadCount(countRes.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BUDGET_EXCEEDED':
        return <AlertCircle size={18} className="text-danger" />;
      case 'BUDGET_WARNING':
        return <AlertTriangle size={18} className="text-warning" />;
      case 'CATEGORY_SPIKE':
        return <Info size={18} className="text-info" />;
      default:
        return <Sparkles size={18} className="text-success" />;
    }
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        type="button"
        className="btn btn-light position-relative p-2 rounded-circle border d-flex align-items-center justify-content-center"
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '40px', height: '40px', color: '#64748B' }}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white"
            style={{ fontSize: '0.65rem', padding: '0.25em 0.5em' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="position-absolute end-0 mt-2 smart-card p-0 shadow-lg border"
          style={{ width: '360px', zIndex: 1050, maxHeight: '480px', overflowY: 'auto' }}
        >
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold text-dark fs-6">Alerts & Notifications</span>
              {unreadCount > 0 && (
                <span className="badge-status badge-exceeded py-0 px-2" style={{ fontSize: '0.7rem' }}>
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-decoration-none d-flex align-items-center gap-1 small text-muted"
                onClick={handleMarkAllAsRead}
                style={{ fontSize: '0.75rem' }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="p-0">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted small">
                No notifications right now. Everything is on track!
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 border-bottom d-flex align-items-start gap-2 transition ${!item.read ? 'bg-white' : 'bg-light'}`}
                  style={{ opacity: item.read ? 0.75 : 1 }}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getNotificationIcon(item.notificationType)}
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex align-items-center justify-content-between">
                      <span className={`small ${!item.read ? 'fw-bold text-dark' : 'fw-medium text-secondary'}`}>
                        {item.title}
                      </span>
                      {!item.read && (
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-0 text-muted"
                          title="Mark as read"
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                        >
                          <CheckCheck size={14} />
                        </button>
                      )}
                    </div>
                    <p className="small text-muted mb-1 mt-1 text-break">
                      {item.message}
                    </p>
                    <span className="text-light text-muted" style={{ fontSize: '0.7rem' }}>
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
