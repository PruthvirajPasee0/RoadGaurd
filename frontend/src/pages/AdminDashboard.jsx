import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAdminStats } from '../services/api';
import { FiUsers, FiTruck, FiDollarSign, FiActivity, FiMapPin, FiTrendingUp } from 'react-icons/fi';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const data = await getAdminStats();
      // Map backend shape to UI shape
      const totals = data?.totals || {};
      const byStatus = data?.requestsByStatus || {};
      const recent = data?.recentRequests || [];

      const today = new Date();
      const completedToday = recent.filter(r => {
        const d = new Date(r.createdAt);
        return r.status === 'completed' && d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
      }).length;

      const activeRequests = (byStatus['pending'] || 0) + (byStatus['in-progress'] || 0);

      setStats({
        activeRequests,
        completedToday,
        activeWorkers: 0, // not provided by backend
        totalWorkshops: totals.workshops || 0,
        totalRequests: totals.requests || 0,
        requestsByStatus: byStatus,
        revenue: { today: 0, week: 0, month: 0 }, // placeholder; backend doesn't provide yet
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container admin-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.name}! Here's your system overview.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FiActivity />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.activeRequests || 0}</div>
            <div className="stat-label">Active Requests</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FiTruck />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.completedToday || 0}</div>
            <div className="stat-label">Completed Today</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.activeWorkers || 0}</div>
            <div className="stat-label">Active Workers</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <FiMapPin />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalWorkshops || 0}</div>
            <div className="stat-label">Partner Workshops</div>
          </div>
        </div>
      </div>

      <div className="revenue-section">
        <h2>Revenue Overview</h2>
        <div className="revenue-cards">
          <div className="revenue-card">
            <div className="revenue-icon">
              <FiDollarSign />
            </div>
            <div className="revenue-content">
              <div className="revenue-label">Today</div>
              <div className="revenue-value">₹{stats?.revenue?.today?.toLocaleString() || 0}</div>
              <div className="revenue-trend positive">
                <FiTrendingUp /> +12% from yesterday
              </div>
            </div>
          </div>

          <div className="revenue-card">
            <div className="revenue-icon">
              <FiDollarSign />
            </div>
            <div className="revenue-content">
              <div className="revenue-label">This Week</div>
              <div className="revenue-value">₹{stats?.revenue?.week?.toLocaleString() || 0}</div>
              <div className="revenue-trend positive">
                <FiTrendingUp /> +8% from last week
              </div>
            </div>
          </div>

          <div className="revenue-card">
            <div className="revenue-icon">
              <FiDollarSign />
            </div>
            <div className="revenue-content">
              <div className="revenue-label">This Month</div>
              <div className="revenue-value">₹{stats?.revenue?.month?.toLocaleString() || 0}</div>
              <div className="revenue-trend positive">
                <FiTrendingUp /> +15% from last month
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="request-status-section">
        <h2>Request Status Distribution</h2>
        <div className="status-distribution">
          <div className="status-item">
            <div className="status-bar pending" style={{ width: `${(stats?.requestsByStatus?.pending / stats?.totalRequests) * 100}%` }}></div>
            <div className="status-info">
              <span className="status-label">Pending</span>
              <span className="status-count">{stats?.requestsByStatus?.pending || 0}</span>
            </div>
          </div>
          <div className="status-item">
            <div className="status-bar in-progress" style={{ width: `${(stats?.requestsByStatus?.['in-progress'] / stats?.totalRequests) * 100}%` }}></div>
            <div className="status-info">
              <span className="status-label">In Progress</span>
              <span className="status-count">{stats?.requestsByStatus?.['in-progress'] || 0}</span>
            </div>
          </div>
          <div className="status-item">
            <div className="status-bar completed" style={{ width: `${(stats?.requestsByStatus?.completed / stats?.totalRequests) * 100}%` }}></div>
            <div className="status-info">
              <span className="status-label">Completed</span>
              <span className="status-count">{stats?.requestsByStatus?.completed || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <Link to="/admin/workshops" className="action-card">
            <div className="action-icon">
              <FiMapPin />
            </div>
            <h3>Manage Workshops</h3>
            <p>View and manage partner workshops</p>
          </Link>

          <Link to="/admin/users" className="action-card">
            <div className="action-icon">
              <FiUsers />
            </div>
            <h3>Manage Users</h3>
            <p>View and manage platform users</p>
          </Link>

          <Link to="/admin/reports" className="action-card">
            <div className="action-icon">
              <FiActivity />
            </div>
            <h3>Reports & Analytics</h3>
            <p>View platform insights</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
