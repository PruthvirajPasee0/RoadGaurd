import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRequests, getMyWorkshop, updateRequestStatus } from '../services/api';
import { FiCheckCircle, FiClock, FiDollarSign, FiStar, FiTruck, FiMapPin } from 'react-icons/fi';
import '../styles/Dashboard.css';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workshop, setWorkshop] = useState(null);
  const [requests, setRequests] = useState([]);
  const [updating, setUpdating] = useState({}); // { [id]: true }

  useEffect(() => {
    const load = async () => {
      try {
        const wk = await getMyWorkshop();
        setWorkshop(wk);
        let data = [];
        if (wk?.id) {
          // Fetch all workshop requests; we'll filter client-side
          data = await getRequests({ workshopId: wk.id });
        }
        const now = new Date();
        const isToday = (d) => {
          if (!d) return false;
          const dt = new Date(d);
          return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth() && dt.getDate() === now.getDate();
        };
        setRequests(data || []);
        const assigned = (data || []).filter(r => r.status !== 'completed').length;
        const completedToday = (data || []).filter(r => r.status === 'completed' && (isToday(r.updatedAt) || isToday(r.createdAt))).length;
        setStats({
          assignedRequests: assigned,
          completedToday,
          rating: 0,
          totalReviews: 0,
          earnings: { today: 0, week: 0, month: 0 },
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
        setStats({ assignedRequests: 0, completedToday: 0, rating: 0, totalReviews: 0, earnings: { today: 0, week: 0, month: 0 } });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const activeRequests = useMemo(() => (requests || []).filter(r => r.status !== 'completed' && r.status !== 'cancelled'), [requests]);

  const handleStatusChange = async (reqId, newStatus) => {
    try {
      setUpdating((s) => ({ ...s, [reqId]: true }));
      const updated = await updateRequestStatus(reqId, newStatus);
      setRequests((list) => list.map((r) => (r.id === reqId ? { ...r, ...updated } : r)));
    } catch (e) {
      console.error('Failed to update status', e);
      // Optionally toast here
    } finally {
      setUpdating((s) => ({ ...s, [reqId]: false }));
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
    <div className="dashboard-container worker-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Worker Dashboard</h1>
          <p>Welcome back, {user?.name}! Here's your work overview.</p>
        </div>
      </div>

      <div className="workshop-overview">
        <h2>My Workshop</h2>
        {!workshop && (
          <div className="empty-state">
            <p>No workshop assignment found. Please contact admin to be assigned to a workshop.</p>
          </div>
        )}
        {workshop && (
          <div className="workshop-card">
            <div className="workshop-header">
              <h3>{workshop.name}</h3>
              <div className="badge">{workshop.isOpen ? 'Open' : 'Closed'}</div>
            </div>
            <p>{workshop.address}</p>
            <div className="workshop-meta">
              <span>
                <FiStar /> {workshop.rating ?? 0} ({workshop.reviews ?? 0})
              </span>
              <span>
                <FiClock /> {workshop.openTime} - {workshop.closeTime}
              </span>
            </div>
            <div className="workshop-services">
              {(workshop.services || []).slice(0, 6).map((s, i) => (
                <span key={i} className="chip">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FiTruck />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.assignedRequests || 0}</div>
            <div className="stat-label">Assigned Requests</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.completedToday || 0}</div>
            <div className="stat-label">Completed Today</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <FiStar />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.rating || 0}★</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalReviews || 0}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
        </div>
      </div>

      <div className="earnings-section">
        <h2>Earnings Overview</h2>
        <div className="revenue-cards">
          <div className="revenue-card">
            <div className="revenue-icon">
              <FiDollarSign />
            </div>
            <div className="revenue-content">
              <div className="revenue-label">Today</div>
              <div className="revenue-value">₹{stats?.earnings?.today?.toLocaleString() || 0}</div>
            </div>
          </div>

          <div className="revenue-card">
            <div className="revenue-icon">
              <FiDollarSign />
            </div>
            <div className="revenue-content">
              <div className="revenue-label">This Week</div>
              <div className="revenue-value">₹{stats?.earnings?.week?.toLocaleString() || 0}</div>
            </div>
          </div>

          <div className="revenue-card">
            <div className="revenue-icon">
              <FiDollarSign />
            </div>
            <div className="revenue-content">
              <div className="revenue-label">This Month</div>
              <div className="revenue-value">₹{stats?.earnings?.month?.toLocaleString() || 0}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="worker-actions">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <Link to="/worker/active-requests" className="action-card">
            <div className="action-icon">
              <FiTruck />
            </div>
            <h3>Active Requests</h3>
            <p>View and manage assigned requests</p>
          </Link>

          <Link to="/worker/completed" className="action-card">
            <div className="action-icon">
              <FiCheckCircle />
            </div>
            <h3>Completed Services</h3>
            <p>View service history</p>
          </Link>

          <Link to="/worker/map" className="action-card">
            <div className="action-icon">
              <FiMapPin />
            </div>
            <h3>Service Map</h3>
            <p>View requests on map</p>
          </Link>
        </div>
      </div>

      <div className="requests-section">
        <h2>Workshop Requests</h2>
        {!workshop ? (
          <div className="empty-state">No workshop assigned.</div>
        ) : activeRequests.length === 0 ? (
          <div className="empty-state">No active requests.</div>
        ) : (
          <div className="requests-list">
            {activeRequests.map((r) => (
              <div key={r.id} className="request-card">
                <div className="request-main">
                  <h4>{r.service}</h4>
                  <div className="request-meta">
                    <span>Vehicle: {r.vehicleMake || '-'} {r.vehicleModel || ''} {r.vehicleYear || ''}</span>
                    <span>Reg: {r.registrationNumber || '-'}</span>
                    <span>Urgency: {r.urgency}</span>
                    <span>Location: {r.locationAddress || '-'}</span>
                  </div>
                </div>
                <div className="request-actions">
                  <select
                    className="input"
                    value={r.status}
                    onChange={(e) => handleStatusChange(r.id, e.target.value)}
                    disabled={!!updating[r.id]}
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="recent-activities">
        <h2>Recent Activities</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon completed">
              <FiCheckCircle />
            </div>
            <div className="activity-content">
              <h4>Tire Change Service Completed</h4>
              <p>Honda City - KA01AB1234</p>
              <span className="activity-time">2 hours ago</span>
            </div>
            <div className="activity-amount">+₹1,500</div>
          </div>

          <div className="activity-item">
            <div className="activity-icon completed">
              <FiCheckCircle />
            </div>
            <div className="activity-content">
              <h4>Battery Jump Service</h4>
              <p>Maruti Swift - KA02CD5678</p>
              <span className="activity-time">5 hours ago</span>
            </div>
            <div className="activity-amount">+₹800</div>
          </div>

          <div className="activity-item">
            <div className="activity-icon in-progress">
              <FiClock />
            </div>
            <div className="activity-content">
              <h4>New Request Assigned</h4>
              <p>Fuel Delivery - Electronic City</p>
              <span className="activity-time">30 minutes ago</span>
            </div>
            <div className="activity-status">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
