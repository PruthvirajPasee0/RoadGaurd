import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequestById } from '../services/api';
import { FiArrowLeft, FiMapPin, FiClock, FiPhone, FiUser, FiTruck, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import '../styles/RequestDetail.css';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    try {
      const data = await getRequestById(id);
      setRequest(data || null);
    } catch (error) {
      console.error('Failed to load request:', error);
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="error-container">
        <h2>Request not found</h2>
        <button onClick={() => navigate('/my-requests')} className="btn btn-primary">
          Back to My Requests
        </button>
      </div>
    );
  }

  return (
    <div className="request-detail-container">
      <button
        className="back-button"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft /> Back
      </button>

      <div className="request-detail-header">
        <div className="request-info">
          <h1>Service Request #{request.id}</h1>
          <div className={`request-status ${getStatusClass(request.status)}`}>
            {getStatusIcon(request.status)}
            <span>{request.status}</span>
          </div>
        </div>
      </div>

      <div className="request-detail-content">
        <div className="detail-section">
          <h2>Service Details</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Service Type</label>
              <p>{request.service}</p>
            </div>
            <div className="detail-item">
              <label>Workshop</label>
              <p>{request.workshopName || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Date Requested</label>
              <p>{new Date(request.createdAt).toLocaleString()}</p>
            </div>
            <div className="detail-item">
              <label>Urgency</label>
              <p className={`urgency-${request.urgency}`}>{request.urgency}</p>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Vehicle Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Make</label>
              <p>{request.vehicleMake || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Model</label>
              <p>{request.vehicleModel || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Year</label>
              <p>{request.vehicleYear || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Registration Number</label>
              <p>{request.registrationNumber || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Location</h2>
          <div className="location-info">
            <FiMapPin />
            <p>{request.locationAddress || 'N/A'}</p>
          </div>
          <div className="map-preview">
            <div className="map-placeholder">
              <FiMapPin />
              <p>Map preview (Google Maps integration pending)</p>
            </div>
          </div>
        </div>

        {request.mechanicName && (
          <div className="detail-section">
            <h2>Assigned Mechanic</h2>
            <div className="mechanic-info">
              <div className="mechanic-header">
                <FiUser className="mechanic-icon" />
                <div>
                  <h3>{request.mechanicName}</h3>
                  <p>Professional Mechanic</p>
                </div>
              </div>
              <div className="mechanic-contact">
                <a href={`tel:${request.mechanicPhone || '+91-9876543210'}`} className="btn btn-secondary">
                  <FiPhone /> Call Mechanic
                </a>
              </div>
            </div>
          </div>
        )}

        {request.status === 'in-progress' && (
          <div className="detail-section">
            <h2>Live Tracking</h2>
            <div className="tracking-info">
              <div className="eta-card">
                <FiClock className="eta-icon" />
                <div>
                  <label>Estimated Arrival</label>
                  <p>{request.estimatedTime || '30-45 minutes'}</p>
                </div>
              </div>
              <div className="tracking-map">
                <div className="map-placeholder">
                  <FiTruck />
                  <p>Live tracking will be available here</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {request.notes && (
          <div className="detail-section">
            <h2>Additional Notes</h2>
            <p className="notes-text">{request.notes}</p>
          </div>
        )}

        {request.status === 'completed' && (
          <div className="detail-section">
            <h2>Service Summary</h2>
            <div className="summary-card">
              <div className="summary-item">
                <label>Service Completed At</label>
                <p>{new Date(request.completedAt || Date.now()).toLocaleString()}</p>
              </div>
              <div className="summary-item">
                <label>Total Duration</label>
                <p>45 minutes</p>
              </div>
              <div className="summary-item highlight">
                <label>Total Cost</label>
                <p className="cost">₹{request.cost?.toLocaleString() || '1,500'}</p>
              </div>
            </div>
            <div className="payment-actions">
              <button className="btn btn-primary">Pay Now</button>
              <button className="btn btn-secondary">Download Invoice</button>
            </div>
          </div>
        )}

        <div className="request-actions">
          {request.status === 'pending' && (
            <button className="btn btn-danger">Cancel Request</button>
          )}
          {request.status === 'completed' && (
            <button className="btn btn-primary">Rate Service</button>
          )}
          <button className="btn btn-secondary">Contact Support</button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
