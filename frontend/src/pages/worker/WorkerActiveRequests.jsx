import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRequests, updateRequestStatus } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import OpenLayersMap from '../../components/OpenLayersMap';
import { haversineKm } from '../../utils/geo';

const WorkerActiveRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [center, setCenter] = useState(null); // { lat, lng }
  const [radiusMode, setRadiusMode] = useState(''); // '', '2','5','10','custom'
  const [radiusKm, setRadiusKm] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getRequests({ assignedWorkerId: user?.id });
        setRequests(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load requests', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  useEffect(() => {
    if (!center && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, [center]);

  const active = useMemo(() => requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled'), [requests]);
  const filteredActive = useMemo(() => {
    let list = active;
    if (center && radiusKm > 0) {
      list = list.filter(r => haversineKm(center.lat, center.lng, r.lat, r.lng) <= radiusKm);
    }
    return list;
  }, [active, center?.lat, center?.lng, radiusKm]);

  const handleStatusChange = async (id, status) => {
    try {
      setUpdating(s => ({ ...s, [id]: true }));
      const updated = await updateRequestStatus(id, status);
      setRequests(list => list.map(r => (r.id === id ? { ...r, ...updated } : r)));
    } catch (e) {
      console.error('Failed to update status', e);
    } finally {
      setUpdating(s => ({ ...s, [id]: false }));
    }
  };

  return (
    <div className="container fade-in">
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2>Active Requests</h2>
        <p style={{ color: 'var(--text-secondary)' }}>View and manage current assignments</p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 12, alignItems: 'start' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                  () => {}
                );
              }
            }}>Use Current Location</button>
            <select className="input" style={{ maxWidth: 160 }} value={radiusMode} onChange={(e) => {
              const v = e.target.value;
              setRadiusMode(v);
              if (v === '') setRadiusKm(0);
              else if (v !== 'custom') setRadiusKm(Number(v));
            }}>
              <option value="">No distance filter</option>
              <option value="2">&lt; 2 km</option>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="custom">Custom</option>
            </select>
            {radiusMode === 'custom' && (
              <input type="number" className="input" style={{ width: 120 }} min={0.5} step={0.5} value={radiusKm}
                     onChange={(e) => setRadiusKm(Number(e.target.value) || 0)} placeholder="km" />
            )}
          </div>
          <div style={{ height: 180 }}>
            <OpenLayersMap
              center={[center?.lat || 12.9716, center?.lng || 77.5946]}
              zoom={13}
              circleKm={radiusKm}
              markers={center ? [{ lat: center.lat, lng: center.lng }] : []}
              onClick={(pos) => setCenter(pos)}
              style={{ height: 180 }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      ) : filteredActive.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>No active requests</p>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {filteredActive.map(req => (
            <div key={req.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3>{req.service}</h3>
                <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{req.status}</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>{req.locationAddress}</div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, color: 'var(--text-secondary)', fontSize: 14 }}>
                <span>Vehicle: {req.vehicleMake} {req.vehicleModel}</span>
                <span>Reg: {req.registrationNumber}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Link to={`/requests/${req.id}`} className="btn">Open</Link>
                <select
                  className="input"
                  value={req.status}
                  onChange={(e) => handleStatusChange(req.id, e.target.value)}
                  disabled={!!updating[req.id]}
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
  );
};

export default WorkerActiveRequests;
