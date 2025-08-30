import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiClock, FiGrid, FiList, FiMap, FiCrosshair, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { fetchWorkshopsByDistance, fetchWorkshops } from '../services/api';
import '../styles/Workshops.css';

const Workshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, map
  const [filters, setFilters] = useState({
    service: '',
    isOpen: '',
    minRating: ''
  });
  const [userPos, setUserPos] = useState(null);
  const [radiusKm, setRadiusKm] = useState(5);
  const [radiusMode, setRadiusMode] = useState('5'); // '2' | '5' | '10' | 'custom'
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (viewMode !== 'map') {
      loadWorkshops();
    }
  }, [filters, viewMode]);

  // Geolocate user when switching to map view
  useEffect(() => {
    if (viewMode === 'map' && !userPos && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserPos({ lat: 12.9716, lng: 77.5946 }) // fallback: Bengaluru
      );
    }
  }, [viewMode, userPos]);

  // When in map mode and we have userPos, fetch from backend by distance
  useEffect(() => {
    const loadByDistance = async () => {
      if (viewMode !== 'map' || !userPos) return;
      setLoading(true);
      try {
        const data = await fetchWorkshopsByDistance({
          lat: userPos.lat,
          lng: userPos.lng,
          radiusKm: radiusKm,
          service: filters.service || undefined,
        });
        setWorkshops(data.map(w => ({
          ...w,
          distance: w.distanceKm ?? undefined,
        })));
      } catch (e) {
        console.error('Failed to load nearby workshops:', e);
      } finally {
        setLoading(false);
      }
    };
    loadByDistance();
  }, [viewMode, userPos?.lat, userPos?.lng, radiusKm, filters.service]);

  const loadWorkshops = async () => {
    setLoading(true);
    try {
      const data = await fetchWorkshops();
      let list = Array.isArray(data) ? data : [];
      // client-side filters
      if (filters.service) {
        list = list.filter(w => Array.isArray(w.services) && w.services.includes(filters.service));
      }
      if (typeof filters.isOpen === 'boolean') {
        list = list.filter(w => w.isOpen === filters.isOpen);
      }
      if (filters.minRating) {
        const min = parseFloat(filters.minRating);
        list = list.filter(w => (w.rating ?? 0) >= min);
      }
      setWorkshops(list);
    } catch (error) {
      console.error('Failed to load workshops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }));
  };

  const radiusOptions = [
    { label: '< 2 km', value: '2' },
    { label: '5 km', value: '5' },
    { label: '10 km', value: '10' },
    { label: 'Custom', value: 'custom' },
  ];

  const handleRadiusModeChange = (e) => {
    const v = e.target.value;
    setRadiusMode(v);
    if (v !== 'custom') setRadiusKm(Number(v));
  };

  const userIcon = useMemo(() => L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }), []);

  const renderWorkshopCard = (workshop) => (
    <Link to={`/workshops/${workshop.id}`} key={workshop.id} className="workshop-card">
      <div className="workshop-image">
        {workshop.image ? (
          <img src={workshop.image} alt={workshop.name} />
        ) : (
          <div className="image-placeholder">{workshop.name?.charAt(0) || 'W'}</div>
        )}
        {workshop.isOpen ? (
          <span className="status-badge open">Open</span>
        ) : (
          <span className="status-badge closed">Closed</span>
        )}
      </div>
      <div className="workshop-content">
        <h3>{workshop.name}</h3>
        <div className="workshop-meta">
          <div className="location">
            <FiMapPin /> {typeof workshop.distance === 'number' ? `${workshop.distance} km away` : (workshop.address || '')}
          </div>
          <div className="rating">
            <FiStar /> {workshop.rating} ({workshop.reviews})
          </div>
        </div>
        <p className="workshop-address">{workshop.address}</p>
        <div className="workshop-services">
          {workshop.services.slice(0, 3).map((service, idx) => (
            <span key={idx} className="service-tag">{service}</span>
          ))}
          {workshop.services.length > 3 && (
            <span className="service-tag">+{workshop.services.length - 3} more</span>
          )}
        </div>
        <div className="workshop-timing">
          <FiClock /> {workshop.openTime === '24/7' ? '24/7 Available' : `${workshop.openTime} - ${workshop.closeTime}`}
        </div>
      </div>
    </Link>
  );

  const renderWorkshopList = (workshop) => (
    <Link to={`/workshops/${workshop.id}`} key={workshop.id} className="workshop-list-item">
      <div className="workshop-list-image">
        <img src={workshop.image} alt={workshop.name} />
      </div>
      <div className="workshop-list-content">
        <div className="workshop-list-header">
          <h3>{workshop.name}</h3>
          <div className="workshop-list-meta">
            <span>
              <FiStar /> {workshop.rating}
            </span>
            <span>
              <FiClock /> {workshop.isOpen ? 'Open Now' : 'Closed'}
            </span>
          </div>
        </div>
        <p className="workshop-address">{workshop.address}</p>
        <div className="workshop-services">
          {workshop.services.map((service, idx) => (
            <span key={idx} className="service-tag">{service}</span>
          ))}
        </div>
      </div>
    </Link>
  );

  const renderMapView = () => (
    <div className={`map-view-container ${isFullScreen ? 'fullscreen' : ''}`}>
      <div className="map-controls" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <button className="btn" onClick={() => setIsFullScreen(s => !s)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {isFullScreen ? <FiMinimize2 /> : <FiMaximize2 />} {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
        </button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <FiCrosshair />
          <span>Nearby</span>
          <select className="filter-select" value={radiusMode} onChange={handleRadiusModeChange}>
            {radiusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {radiusMode === 'custom' && (
            <input type="number" min={0.5} step={0.5} value={radiusKm} onChange={e => setRadiusKm(Number(e.target.value) || 0)} className="filter-select" style={{ width: 120 }} placeholder="km" />
          )}
        </div>
      </div>

      <div className="map-canvas" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)' }}>
        <MapContainer center={userPos || [12.9716, 77.5946]} zoom={13} scrollWheelZoom className="map-leaflet">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userPos && (
            <>
              <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
                <Popup>You are here</Popup>
              </Marker>
              {radiusKm > 0 && (
                <Circle center={[userPos.lat, userPos.lng]} radius={radiusKm * 1000} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1 }} />
              )}
            </>
          )}

          {workshops.map(w => (
            <Marker key={w.id} position={[w.lat, w.lng]} icon={userIcon}>
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <strong>{w.name}</strong>
                  <div style={{ color: 'var(--text-secondary)' }}>{w.address}</div>
                  {w.distance && <div style={{ marginTop: 4 }}>{w.distance} km away</div>}
                  <Link to={`/workshops/${w.id}`} className="btn btn-sm" style={{ marginTop: 8, display: 'inline-block' }}>View</Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="map-sidebar">
        {workshops.map(workshop => (
          <div key={workshop.id} className="map-workshop-item">
            <h4>{workshop.name}</h4>
            <p>{workshop.distance ? `${workshop.distance} km away` : ''}</p>
            <Link to={`/workshops/${workshop.id}`} className="btn btn-sm">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="workshops-container">
      <div className="workshops-header">
        <h1>Find Workshops</h1>
        <p>Locate trusted service centers near you</p>
      </div>

      <div className="workshops-controls">
        <div className="filters">
          <select
            name="service"
            value={filters.service || ''}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Services</option>
            <option value="Tire Change">Tire Change</option>
            <option value="Battery Jump">Battery Jump</option>
            <option value="Towing">Towing</option>
            <option value="Fuel Delivery">Fuel Delivery</option>
            <option value="Minor Repairs">Minor Repairs</option>
          </select>

          <select
            name="isOpen"
            value={filters.isOpen === undefined ? '' : filters.isOpen.toString()}
            onChange={(e) => handleFilterChange({
              target: {
                name: 'isOpen',
                value: e.target.value === '' ? '' : e.target.value === 'true'
              }
            })}
            className="filter-select"
          >
            <option value="">All Workshops</option>
            <option value="true">Open Now</option>
            <option value="false">Closed</option>
          </select>

          <select
            name="minRating"
            value={filters.minRating || ''}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Any Rating</option>
            <option value="4">4★ & above</option>
            <option value="4.5">4.5★ & above</option>
          </select>
        </div>

        <div className="view-toggles">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <FiGrid /> Grid
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FiList /> List
          </button>
          <button
            className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <FiMap /> Map
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : workshops.length === 0 ? (
        <div className="empty-state">
          <FiMapPin className="empty-icon" />
          <h3>No workshops found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <div className={`workshops-content ${viewMode}`}>
          {viewMode === 'grid' && (
            <div className="workshops-grid">
              {workshops.map(renderWorkshopCard)}
            </div>
          )}
          {viewMode === 'list' && (
            <div className="workshops-list">
              {workshops.map(renderWorkshopList)}
            </div>
          )}
          {viewMode === 'map' && renderMapView()}
        </div>
      )}
    </div>
  );
};

export default Workshops;
