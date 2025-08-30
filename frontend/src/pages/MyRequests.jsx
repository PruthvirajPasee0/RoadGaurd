import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRequests } from '../services/api';
import { FiClock, FiCheckCircle, FiAlertCircle, FiMapPin, FiCalendar } from 'react-icons/fi';
import '../styles/MyRequests.css';

const MyRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getRequests({ userId: user.id, status: filter });
      setRequests(Array.isArray(data) ? data : []);
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
      case 'pending':
        return <FiClock className="status-icon pending" />;
      case 'cancelled':
        return <FiAlertCircle className="status-icon cancelled" />;
      default:
        return <FiClock className="status-icon" />;
    }
  };

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(/\s+/g, '-');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="my-requests-container">
      <div className="requests-header">
        <h1>My Service Requests</h1>
        <p>Track and manage your service requests</p>
      </div>

      <div className="requests-controls">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Requests
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-tab ${filter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilter('in-progress')}
          >
            In Progress
          </button>
          <button
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>

        <Link to="/service-request" className="btn btn-primary">
          New Request
        </Link>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <FiAlertCircle className="empty-icon" />
          <h3>No requests found</h3>
          <p>You haven't made any service requests yet</p>
          <Link to="/service-request" className="btn btn-primary">
            Create First Request
          </Link>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map(request => (
            <Link
              to={`/requests/${request.id}`}
              key={request.id}
              className="request-card"
            >
              <div className="request-header">
                <div className="request-id">#{request.id}</div>
                <div className={`request-status ${getStatusClass(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span>{request.status}</span>
                </div>
              </div>

              <div className="request-content">
                <h3>{request.service}</h3>
                <div className="request-meta">
                  <div className="meta-item">
                    <FiMapPin />
                    <span>{request.workshopName}</span>
                  </div>
                  <div className="meta-item">
                    <FiCalendar />
                    <span>{formatDate(request.createdAt)}</span>
                  </div>
                </div>

                <div className="request-vehicle">
                  <strong>Vehicle:</strong> {(request.vehicleMake || '')} {(request.vehicleModel || '')} - {(request.registrationNumber || '')}
                </div>

                {request.mechanicName && (
                  <div className="request-mechanic">
                    <strong>Assigned to:</strong> {request.mechanicName}
                  </div>
                )}

                {request.estimatedTime && request.status === 'in-progress' && (
                  <div className="request-eta">
                    <FiClock />
                    <span>ETA: {request.estimatedTime}</span>
                  </div>
                )}

                {request.cost && request.status === 'completed' && (
                  <div className="request-cost">
                    <strong>Total Cost:</strong> ₹{request.cost.toLocaleString()}
                  </div>
                )}
              </div>

              <div className="request-actions">
                <span className="view-details">View Details →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
