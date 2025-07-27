import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useVibeStore } from '../../store/vibeStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const { FiBell, FiUser, FiLogOut, FiActivity, FiSettings, FiX, FiCheck, FiInfo, FiAlertCircle, FiTrendingUp } = FiIcons;

const Header = () => {
  const navigate = useNavigate();
  const { currentVibe, productivity } = useVibeStore();
  const { user, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: 'New update available',
      time: '2 min ago',
      type: 'info',
      read: false,
      action: 'Update now'
    },
    {
      id: 2,
      message: 'Productivity increased by 5%',
      time: '1 hour ago',
      type: 'success',
      read: false,
      action: 'View analytics'
    },
    {
      id: 3,
      message: 'Weekly report ready',
      time: '2 days ago',
      type: 'info',
      read: true,
      action: 'Download'
    },
    {
      id: 4,
      message: 'Low productivity detected',
      time: '3 days ago',
      type: 'warning',
      read: true,
      action: 'Adjust vibe'
    },
  ]);

  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const notificationsListRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simulate new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 30 seconds
        const newNotification = {
          id: Date.now(),
          message: getRandomNotificationMessage(),
          time: 'Just now',
          type: getRandomNotificationType(),
          read: false,
          action: 'View details'
        };
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep max 10 notifications
        toast.success('New notification received!');
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Add scrollbar visibility control for notifications
  useEffect(() => {
    const handleMouseEnter = () => {
      if (notificationsListRef.current) {
        notificationsListRef.current.classList.remove('hover-show-scrollbar');
        notificationsListRef.current.classList.add('scrollbar-fade-in');
      }
    };

    const handleMouseLeave = () => {
      if (notificationsListRef.current) {
        notificationsListRef.current.classList.add('hover-show-scrollbar');
        notificationsListRef.current.classList.remove('scrollbar-fade-in');
      }
    };

    const notificationsList = notificationsListRef.current;
    if (notificationsList) {
      notificationsList.addEventListener('mouseenter', handleMouseEnter);
      notificationsList.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (notificationsList) {
        notificationsList.removeEventListener('mouseenter', handleMouseEnter);
        notificationsList.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [showNotifications]);

  const getRandomNotificationMessage = () => {
    const messages = [
      'Code quality score improved',
      'New coding streak achieved',
      'Team member shared a project',
      'Reminder: Take a break',
      'Goal milestone reached',
      'New feature available'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getRandomNotificationType = () => {
    const types = ['info', 'success', 'warning'];
    return types[Math.floor(Math.random() * types.length)];
  };

  const getVibeColor = (vibe) => {
    const colors = {
      focused: 'text-vibe-blue',
      creative: 'text-vibe-purple',
      relaxed: 'text-vibe-green',
      energetic: 'text-vibe-orange',
      collaborative: 'text-vibe-pink',
    };
    return colors[vibe] || 'text-gray-400';
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return FiCheck;
      case 'warning': return FiAlertCircle;
      case 'info': default: return FiInfo;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'text-vibe-green';
      case 'warning': return 'text-vibe-orange';
      case 'info': default: return 'text-vibe-blue';
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      read: true
    })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    toast.success('Notification deleted');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
    toast.success('All notifications cleared');
  };

  const handleNotificationAction = (notification) => {
    markAsRead(notification.id);
    switch (notification.action) {
      case 'View analytics':
        navigate('/analytics');
        break;
      case 'Adjust vibe':
        navigate('/');
        break;
      case 'Update now':
        toast.success('Update initiated!');
        break;
      default:
        toast.info('Action completed!');
    }
    setShowNotifications(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.header
      className="bg-dark-surface border-b border-dark-border px-6 py-4"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiActivity} className={`text-lg ${getVibeColor(currentVibe)}`} />
            <span className="text-sm font-medium text-gray-300">
              Current Vibe: <span className="capitalize">{currentVibe}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-vibe-green rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">
              Productivity: {productivity}%
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Enhanced Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              className="p-2 text-gray-400 hover:text-white transition-colors relative"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
            >
              <SafeIcon icon={FiBell} className="text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-vibe-purple rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  className="absolute right-0 mt-2 w-80 bg-dark-surface border border-dark-border rounded-lg shadow-xl z-50 max-h-96 overflow-hidden"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Header */}
                  <div className="p-4 border-b border-dark-border flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">Notifications</h3>
                      <p className="text-xs text-gray-400">
                        {unreadCount} unread notifications
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-vibe-purple hover:text-vibe-blue transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <SafeIcon icon={FiX} className="text-sm" />
                      </button>
                    </div>
                  </div>

                  {/* Notifications List with improved scrolling */}
                  <div
                    ref={notificationsListRef}
                    className="max-h-80 overflow-y-auto hover-show-scrollbar smooth-scroll"
                  >
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          className={`p-4 border-b border-dark-border hover:bg-dark-bg transition-colors cursor-pointer ${
                            !notification.read ? 'bg-vibe-purple/5' : ''
                          }`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <SafeIcon
                              icon={getNotificationIcon(notification.type)}
                              className={`text-lg mt-0.5 ${getNotificationColor(notification.type)}`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <p className={`text-sm ${
                                  !notification.read ? 'text-white font-medium' : 'text-gray-300'
                                }`}>
                                  {notification.message}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="text-gray-500 hover:text-red-400 transition-colors ml-2"
                                >
                                  <SafeIcon icon={FiX} className="text-xs" />
                                </button>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-gray-500">{notification.time}</p>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-vibe-purple rounded-full"></div>
                                )}
                              </div>
                              {notification.action && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationAction(notification);
                                  }}
                                  className="text-xs text-vibe-purple hover:text-vibe-blue transition-colors mt-2"
                                >
                                  {notification.action}
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <SafeIcon icon={FiBell} className="text-4xl text-gray-600 mb-2 mx-auto" />
                        <p className="text-gray-400">No notifications</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-dark-border flex justify-between">
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setShowNotifications(false);
                        }}
                        className="text-sm text-gray-400 hover:text-vibe-purple transition-colors"
                      >
                        Notification settings
                      </button>
                      <button
                        onClick={clearAllNotifications}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              className="flex items-center space-x-2"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
            >
              <div className="w-8 h-8 rounded-full bg-vibe-purple/20 flex items-center justify-center">
                <SafeIcon icon={FiUser} className="text-vibe-purple" />
              </div>
              <span className="text-sm font-medium">{user?.name || 'Developer'}</span>
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  className="absolute right-0 mt-2 w-48 bg-dark-surface border border-dark-border rounded-lg shadow-lg z-50 no-scrollbar"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-3 border-b border-dark-border">
                    <p className="text-xs text-gray-400">{user?.email || 'developer@example.com'}</p>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left p-3 hover:bg-dark-bg flex items-center space-x-2"
                    >
                      <SafeIcon icon={FiSettings} className="text-gray-400" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        toast.success('Logged out successfully');
                      }}
                      className="w-full text-left p-3 hover:bg-dark-bg text-red-400 flex items-center space-x-2"
                    >
                      <SafeIcon icon={FiLogOut} />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;