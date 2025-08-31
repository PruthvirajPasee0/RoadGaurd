import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMenu, FiX, FiHome, FiMapPin, FiTruck, FiList, FiBell, FiUser, FiLogOut, FiSettings, FiUsers, FiBarChart } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import '../styles/Layout.css';
import { getNotifications } from '../services/api';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnread = async () => {
    if (!user) { setUnreadCount(0); return; }
    try {
      const rows = await getNotifications({ status: 'unread' });
      setUnreadCount(Array.isArray(rows) ? rows.length : 0);
    } catch (_) {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadUnread();
  }, [user]);

  useEffect(() => {
    const handler = () => loadUnread();
    window.addEventListener('notifications-updated', handler);
    return () => window.removeEventListener('notifications-updated', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getUserMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', label: t('navigation.dashboard'), icon: FiHome },
      { path: '/workshops', label: t('navigation.workshops'), icon: FiMapPin },
      { path: '/notifications', label: t('navigation.notifications'), icon: FiBell },
      { path: '/profile', label: t('navigation.profile'), icon: FiUser },
    ];

    if (user?.role === 'user') {
      return [
        ...commonItems.slice(0, 2),
        { path: '/service-request', label: t('navigation.serviceRequest'), icon: FiTruck },
        { path: '/my-requests', label: t('navigation.myRequests'), icon: FiList },
        ...commonItems.slice(2),
      ];
    }

    if (user?.role === 'admin') {
      return [
        ...commonItems.slice(0, 2),
        { path: '/admin/users', label: 'Manage Users', icon: FiUsers },
        { path: '/admin/workshops', label: 'Manage Workshops', icon: FiSettings },
        { path: '/admin/reports', label: 'Reports', icon: FiBarChart },
        ...commonItems.slice(2),
      ];
    }

    if (user?.role === 'worker') {
      return [
        ...commonItems.slice(0, 2),
        { path: '/worker/active-requests', label: 'Active Requests', icon: FiTruck },
        { path: '/worker/completed', label: 'Completed', icon: FiList },
        { path: '/worker/map', label: 'Service Map', icon: FiMapPin },
        ...commonItems.slice(2),
      ];
    }

    return commonItems;
  };

  const menuItems = getUserMenuItems();

  return (
    <div className="layout-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>

          <div className="logo">
            <FiTruck className="logo-icon" />
            <span>{t('common.appName')}</span>
          </div>

          <nav className="header-nav">
            <LanguageSwitcher />
            <Link to="/notifications" className="header-nav-item">
              <FiBell />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </Link>

            <div className="user-menu">
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                <FiLogOut />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="sidebar-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-logout">
            <FiLogOut />
            <span>{t('auth.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
