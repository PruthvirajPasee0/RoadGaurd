import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getWorkshopById, getWorkshopReviews } from '../services/api';
import { FiMapPin, FiStar, FiClock, FiPhone, FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import '../styles/WorkshopDetail.css';
import OpenLayersMap from '../components/OpenLayersMap';

const WorkshopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    loadWorkshop();
    loadReviews();
  }, [id]);

  const loadWorkshop = async () => {
    try {
      const data = await getWorkshopById(id);
      setWorkshop(data || null);
    } catch (error) {
      console.error('Failed to load workshop:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const list = await getWorkshopReviews(id);
      setReviews(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Failed to load reviews:', e);
    } finally {
      setReviewsLoading(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="error-container">
        <h2>Workshop not found</h2>
        <Link to="/workshops" className="btn btn-primary">
          Back to Workshops
        </Link>
      </div>
    );
  }

  return (
    <div className="workshop-detail-container">
      <button
        className="back-button"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft /> Back
      </button>

      <div className="workshop-detail-header">
        <div className="workshop-images">
          {workshop.image ? (
            <img
              src={workshop.image}
              alt={workshop.name}
              className="main-image"
            />
          ) : (
            <div className="main-image placeholder">
              {workshop.name?.charAt(0) || 'W'}
            </div>
          )}
        </div>

        <div className="workshop-info">
          <div className="workshop-title">
            <h1>{workshop.name}</h1>
            {workshop.isOpen ? (
              <span className="status-badge open">Open Now</span>
            ) : (
              <span className="status-badge closed">Closed</span>
            )}
          </div>

          <div className="workshop-rating">
            <FiStar className="star-icon" />
            <span className="rating-value">{workshop.rating}</span>
            <span className="review-count">({workshop.reviews} reviews)</span>
          </div>

          <div className="workshop-location">
            <FiMapPin />
            <span>{workshop.address}</span>
          </div>

          {typeof workshop.distance === 'number' && (
            <div className="workshop-distance">
              <strong>{workshop.distance} km</strong> from your location
            </div>
          )}

          <div className="workshop-hours">
            <FiClock />
            <span>
              {workshop.openTime === '24/7' 
                ? '24/7 Available' 
                : `Open: ${workshop.openTime} - ${workshop.closeTime}`}
            </span>
          </div>

          {(workshop.phone || workshop.email) && (
            <div className="workshop-contact">
              {workshop.phone && (
                <a href={`tel:${workshop.phone}`} className="contact-item">
                  <FiPhone /> {workshop.phone}
                </a>
              )}
              {workshop.email && (
                <a href={`mailto:${workshop.email}`} className="contact-item">
                  <FiMail /> {workshop.email}
                </a>
              )}
            </div>
          )}

          <div className="workshop-actions">
            <Link
              to={`/service-request?workshop=${workshop.id}`}
              className="btn btn-primary btn-large"
            >
              Request Service
            </Link>
            <button className="btn btn-secondary btn-large">
              Get Directions
            </button>
          </div>
        </div>
      </div>

      <div className="workshop-details-content">
        <div className="services-section">
          <h2>Services Offered</h2>
          <div className="services-grid">
            {(workshop.services || []).map((service, index) => (
              <div key={index} className="service-item">
                <FiCheckCircle className="service-icon" />
                <span>{service}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="description-section">
          <h2>About</h2>
          <p>{workshop.description || 'Professional roadside assistance and vehicle repair services. Our experienced mechanics are available to help you get back on the road quickly and safely.'}</p>
        </div>

        <div className="map-section">
          <h2>Location</h2>
          <div className="map-container">
            <div style={{ height: 280 }}>
              <OpenLayersMap
                center={[workshop.lat || 12.9716, workshop.lng || 77.5946]}
                zoom={14}
                markers={[{ lat: workshop.lat || 12.9716, lng: workshop.lng || 77.5946 }]}
                style={{ height: 280 }}
              />
            </div>
          </div>
        </div>

        <div className="reviews-section">
          <h2>Customer Reviews</h2>
          <div className="reviews-list">
            {reviewsLoading ? (
              <div style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>No reviews yet.</div>
            ) : (
              reviews.map((rv) => (
                <div key={rv.id} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <span className="reviewer-name">{rv.userName || 'Anonymous'}</span>
                      <div className="review-rating">
                        {'★'.repeat(Math.max(0, Math.min(5, Number(rv.rating) || 0)))}
                      </div>
                    </div>
                    <span className="review-date">{formatDate(rv.createdAt)}</span>
                  </div>
                  <p className="review-text">{rv.comment || ''}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetail;
