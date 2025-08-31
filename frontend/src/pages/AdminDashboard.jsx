import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAdminStats, getRequests, fetchWorkshops, adminGetUsers, adminApproveRequest, adminAssignRequest } from '../services/api';
import { FiUsers, FiTruck, FiDollarSign, FiActivity, FiMapPin, FiTrendingUp } from 'react-icons/fi';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRequests, setActiveRequests] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [workshops, setWorkshops] = useState([]);
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    loadDashboardStats();
    loadActiveMeta();
    loadActiveRequests();
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

      const activeRequests = (byStatus['pending'] || 0) + (byStatus['in_progress'] || 0) + (byStatus['accepted'] || 0);

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

  const loadActiveMeta = async () => {
    try {
      setMetaLoading(true);
      const [wshops, users] = await Promise.all([fetchWorkshops(), adminGetUsers()]);
      setWorkshops(Array.isArray(wshops) ? wshops : []);
      setWorkers((Array.isArray(users) ? users : []).filter(u => u.role === 'worker'));
    } catch (e) {
      console.error('Failed to load metadata', e);
    } finally {
      setMetaLoading(false);
    }
  };

  const loadActiveRequests = async () => {
    try {
      const [pending, accepted, inprogress] = await Promise.all([
        getRequests({ status: 'pending' }),
        getRequests({ status: 'accepted' }),
        getRequests({ status: 'in_progress' }),
      ]);
      const combined = [...(pending || []), ...(accepted || []), ...(inprogress || [])]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
      setActiveRequests(combined);
    } catch (e) {
      console.error('Failed to load active requests', e);
    }
  };

  const doApprove = async (reqItem) => {
    try {
      const updated = await adminApproveRequest(reqItem.id);
      setActiveRequests(list => list.map(r => r.id === reqItem.id ? updated : r));
      // Also refresh stats to keep counters accurate
      loadDashboardStats();
    } catch (e) {
      console.error('Approve failed', e);
    }
  };

  const doAssign = async (reqItem) => {
    try {
      if (!workshops.length) return alert('No workshops available');
      const wsList = workshops.map(w => `${w.id}: ${w.name}`).join('\n');
      const wIdStr = prompt(`Assign to workshop ID:\n${wsList}`, reqItem.workshopId || '');
      if (!wIdStr) return;
      const workshopId = Number(wIdStr);
      if (!workshopId || !workshops.find(w => w.id === workshopId)) return alert('Invalid workshop ID');

      const workerList = workers.map(u => `${u.id}: ${u.name || ''} ${u.phone ? '(' + u.phone + ')' : ''}`).join('\n');
      const workerIdStr = prompt(`Optional: assign to worker ID (Enter to skip)\n${workerList}`) || '';
      const workerId = workerIdStr ? Number(workerIdStr) : undefined;
      if (workerIdStr && (!workerId || !workers.find(u => u.id === workerId))) return alert('Invalid worker ID');

      const updated = await adminAssignRequest(reqItem.id, { workshopId, workerId });
      setActiveRequests(list => list.map(r => r.id === reqItem.id ? updated : r));
      loadDashboardStats();
    } catch (e) {
      console.error('Assign failed', e);
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
            <div className="status-bar in-progress" style={{ width: `${(stats?.requestsByStatus?.['in_progress'] / stats?.totalRequests) * 100}%` }}></div>
            <div className="status-info">
              <span className="status-label">In Progress</span>
              <span className="status-count">{stats?.requestsByStatus?.['in_progress'] || 0}</span>
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

      <div className="card" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Active Requests</h2>
          <Link to="/admin/requests" className="btn btn-secondary">Open Requests Page</Link>
        </div>
        {metaLoading && activeRequests.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center' }}>Loading...</div>
        ) : activeRequests.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center' }}>No active requests</div>
        ) : (
          <div className="grid grid-cols-3" style={{ marginTop: 12 }}>
            {activeRequests.map((r) => (
              <div key={r.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h3>#{r.id} • {r.service}</h3>
                  <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{r.status}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>{r.locationAddress || '-'}</div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
                  <span>Workshop: {r.workshopName || '-'}</span>
                  <span>Urgency: {r.urgency}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" onClick={() => doApprove(r)} disabled={r.status !== 'pending'}>Approve</button>
                  <button className="btn" onClick={() => doAssign(r)}>Assign</button>
                </div>
              </div>
            ))}
          </div>
        )}
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

          <Link to="/admin/requests" className="action-card">
            <div className="action-icon">
              <FiActivity />
            </div>
            <h3>Manage Requests</h3>
            <p>Approve and assign service requests</p>
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
