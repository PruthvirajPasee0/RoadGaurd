import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchWorkshops, createRequest } from '../services/api';
import { FiMapPin, FiTruck, FiPhone, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import '../styles/ServiceRequest.css';

const ServiceRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [workshops, setWorkshops] = useState([]);
  const [formData, setFormData] = useState({
    service: '',
    workshopId: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    registrationNumber: '',
    location: '',
    latitude: 12.9716,
    longitude: 77.5946,
    notes: '',
    urgency: 'normal'
  });

  useEffect(() => {
    loadWorkshops();
    // Get current location (mock for demo)
    getCurrentLocation();
  }, []);

  const loadWorkshops = async () => {
    try {
      const data = await fetchWorkshops();
      setWorkshops(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load workshops:', error);
    }
  };

  const getCurrentLocation = () => {
    // Mock location for demo
    setFormData(prev => ({
      ...prev,
      location: 'MG Road, Bengaluru',
      latitude: 12.9716,
      longitude: 77.5946
    }));
    
    // In production, use actual geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location obtained:', position.coords);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const urgency = ['urgent', 'emergency'].includes(formData.urgency)
        ? 'high'
        : (formData.urgency || 'normal');

      const body = {
        userId: user.id,
        workshopId: formData.workshopId ? Number(formData.workshopId) : null,
        service: formData.service,
        vehicleMake: formData.vehicleMake || null,
        vehicleModel: formData.vehicleModel || null,
        vehicleYear: formData.vehicleYear || null,
        registrationNumber: formData.registrationNumber || null,
        locationAddress: formData.location || null,
        lat: formData.latitude ? Number(formData.latitude) : null,
        lng: formData.longitude ? Number(formData.longitude) : null,
        notes: formData.notes || null,
        urgency,
      };

      const created = await createRequest(body);
      if (created?.id) {
        toast.success('Service request created successfully!');
        navigate(`/requests/${created.id}`);
      } else {
        toast.error('Failed to create service request');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    'Tire Change',
    'Battery Jump',
    'Towing',
    'Fuel Delivery',
    'Lockout Service',
    'Minor Repairs',
    'Oil Change',
    'Brake Service'
  ];

  return (
    <div className="service-request-container">
      <div className="service-request-header">
        <h1>Request Service</h1>
        <p>Get immediate roadside assistance</p>
      </div>

      <form onSubmit={handleSubmit} className="service-request-form">
        <div className="form-section">
          <h2>Service Details</h2>
          
          <div className="form-group">
            <label htmlFor="service" className="label">
              <FiTruck /> Service Type *
            </label>
            <select
              id="service"
              name="service"
              className="input"
              value={formData.service}
              onChange={handleChange}
              required
            >
              <option value="">Select a service</option>
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="workshopId" className="label">
              Workshop *
            </label>
            <select
              id="workshopId"
              name="workshopId"
              className="input"
              value={formData.workshopId}
              onChange={handleChange}
              required
            >
              <option value="">Select a workshop</option>
              {workshops.map(workshop => (
                <option key={workshop.id} value={workshop.id}>
                  {workshop.name}{workshop.address ? ` - ${workshop.address}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="urgency" className="label">
              <FiAlertCircle /> Urgency Level
            </label>
            <select
              id="urgency"
              name="urgency"
              className="input"
              value={formData.urgency}
              onChange={handleChange}
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h2>Vehicle Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicleMake" className="label">
                Make *
              </label>
              <input
                type="text"
                id="vehicleMake"
                name="vehicleMake"
                className="input"
                placeholder="e.g., Honda"
                value={formData.vehicleMake}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="vehicleModel" className="label">
                Model *
              </label>
              <input
                type="text"
                id="vehicleModel"
                name="vehicleModel"
                className="input"
                placeholder="e.g., City"
                value={formData.vehicleModel}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicleYear" className="label">
                Year
              </label>
              <input
                type="text"
                id="vehicleYear"
                name="vehicleYear"
                className="input"
                placeholder="e.g., 2020"
                value={formData.vehicleYear}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="registrationNumber" className="label">
                Registration Number *
              </label>
              <input
                type="text"
                id="registrationNumber"
                name="registrationNumber"
                className="input"
                placeholder="e.g., KA01AB1234"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Location</h2>
          
          <div className="form-group">
            <label htmlFor="location" className="label">
              <FiMapPin /> Current Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              className="input"
              placeholder="Enter your current location"
              value={formData.location}
              onChange={handleChange}
              required
            />
            <button type="button" className="location-btn" onClick={getCurrentLocation}>
              Use Current Location
            </button>
          </div>

          <div className="location-map">
            <div className="map-placeholder-small">
              <FiMapPin />
              <p>Map preview (Google Maps integration pending)</p>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Additional Information</h2>
          
          <div className="form-group">
            <label htmlFor="notes" className="label">
              Notes / Problem Description
            </label>
            <textarea
              id="notes"
              name="notes"
              className="input textarea"
              rows="4"
              placeholder="Describe the issue or any special instructions..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="emergency-contact">
          <FiPhone />
          <div>
            <p>Need immediate help?</p>
            <a href="tel:1800123456">Call Emergency: 1800-123-456</a>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <span className="spinner"></span> : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceRequest;
