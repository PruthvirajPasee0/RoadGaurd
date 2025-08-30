import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRequests } from '../services/api';
import { FiMapPin, FiTool, FiClock, FiCheckCircle, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentRequests();
  }, []);

  const loadRecentRequests = async () => {
    try {
      const data = await getRequests({ userId: user.id });
      setRecentRequests(Array.isArray(data) ? data.slice(0, 3) : []);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="status-icon completed" />;
      case 'in-progress':
        return <FiClock className="status-icon in-progress" />;
      default:
        return <FiAlertCircle className="status-icon pending" />;
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Get quick roadside assistance whenever you need it</p>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <Link to="/service-request" className="action-card">
            <div className="action-icon">
              <FiTool />
            </div>
            <h3>Request Service</h3>
            <p>Get immediate roadside assistance</p>
            <FiArrowRight className="arrow-icon" />
          </Link>

          <Link to="/workshops" className="action-card">
            <div className="action-icon">
              <FiMapPin />
            </div>
            <h3>Find Workshops</h3>
            <p>Locate nearby service centers</p>
            <FiArrowRight className="arrow-icon" />
          </Link>

          <Link to="/my-requests" className="action-card">
            <div className="action-icon">
              <FiClock />
            </div>
            <h3>My Requests</h3>
            <p>Track your service history</p>
            <FiArrowRight className="arrow-icon" />
          </Link>
        </div>
      </div>

      <div className="recent-requests">
        <div className="section-header">
          <h2>Recent Service Requests</h2>
          <Link to="/my-requests" className="view-all-link">
            View All <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : recentRequests.length > 0 ? (
          <div className="requests-list">
            {recentRequests.map((request) => (
              <Link
                key={request.id}
                to={`/requests/${request.id}`}
                className="request-card"
              >
                <div className="request-header">
                  <div className="request-id">#{request.id}</div>
                  {getStatusIcon(request.status)}
                </div>
                <div className="request-body">
                  <h4>{request.service}</h4>
                  <p className="workshop-name">{request.workshopName}</p>
                  <p className="request-time">
                    {new Date(request.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="request-footer">
                  <span className={`status-badge ${request.status}`}>
                    {getStatusLabel(request.status)}
                  </span>
                  {request.estimatedCost && (
                    <span className="cost">₹{request.estimatedCost}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FiTool className="empty-icon" />
            <h3>No recent requests</h3>
            <p>Request a service when you need assistance</p>
            <Link to="/service-request" className="btn btn-primary">
              Request Service Now
            </Link>
          </div>
        )}
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">24/7</div>
          <div className="stat-label">Service Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">30 min</div>
          <div className="stat-label">Avg. Response Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">50+</div>
          <div className="stat-label">Partner Workshops</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">4.8★</div>
          <div className="stat-label">Customer Rating</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
