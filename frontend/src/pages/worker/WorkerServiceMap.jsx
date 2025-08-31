import React, { useEffect, useMemo, useState } from 'react';
import { getRequests } from '../../services/api';
import OpenLayersMap from '../../components/OpenLayersMap';
import { haversineKm } from '../../utils/geo';

const WorkerServiceMap = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const active = useMemo(() => requests.filter(r => r.status !== 'completed'), [requests]);
  const [selectedId, setSelectedId] = useState(null);
  const selected = useMemo(() => active.find(r => r.id === selectedId), [active, selectedId]);
  const [center, setCenter] = useState(null); // { lat, lng }
  const [radiusMode, setRadiusMode] = useState(''); // '', '2','5','10','custom'
  const [radiusKm, setRadiusKm] = useState(0);
  const filteredActive = useMemo(() => {
    let list = active;
    if (center && radiusKm > 0) {
      list = list.filter(r => haversineKm(center.lat, center.lng, r.lat, r.lng) <= radiusKm);
    }
    return list;
  }, [active, center?.lat, center?.lng, radiusKm]);

  useEffect(() => {
    // Keep selection consistent with filtered results
    if (filteredActive.length === 0) {
      if (selectedId !== null) setSelectedId(null);
      return;
    }
    const exists = filteredActive.some(r => r.id === selectedId);
    if (!exists) setSelectedId(filteredActive[0].id);
  }, [filteredActive, selectedId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getRequests();
        setRequests(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length) setSelectedId(data.find(r => r.status !== 'completed')?.id ?? null);
      } catch (e) {
        console.error('Failed to load requests', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!center && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, [center]);

  return (
    <div className="container fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
      <div className="card">
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

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1rem' }}>
      <div className="card" style={{ height: '70vh', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: 12 }}>Requests</h3>
        {loading ? (
          <div>Loading...</div>
        ) : filteredActive.length === 0 ? (
          <div>No active requests</div>
        ) : filteredActive.map(req => (
          <button
            key={req.id}
            className="btn btn-secondary"
            style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 8, background: selectedId === req.id ? 'var(--bg-hover)' : undefined }}
            onClick={() => setSelectedId(req.id)}
          >
            <div style={{ fontWeight: 600 }}>{req.service} • {req.id}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{req.locationAddress}</div>
          </button>
        ))}
      </div>

      <div className="card" style={{ height: '70vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h3>Service Map</h3>
            <div style={{ color: 'var(--text-secondary)' }}>Live mechanic position (simulated)</div>
          </div>
          {selected && (
            <div style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
              <div><strong>Service:</strong> {selected.service}</div>
              <div><strong>Vehicle:</strong> {selected.vehicleMake} {selected.vehicleModel}</div>
            </div>
          )}
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #111827 100%)',
          border: '1px solid var(--border-primary)',
          borderRadius: '0.75rem',
          position: 'relative',
          height: 'calc(100% - 80px)'
        }}>
          {!selected ? (
            <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>
              Select a request to view on map
            </div>
          ) : (
            <div style={{ padding: 16, height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr', gap: 12 }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: 'var(--text-secondary)' }}>
                <div>
                  <div style={{ fontSize: 12 }}>Destination</div>
                  <div style={{ fontFamily: 'monospace' }}>{`${(selected.lat ?? 0).toFixed(5)}, ${(selected.lng ?? 0).toFixed(5)}`}</div>
                </div>
              </div>

              <div style={{ height: '100%' }}>
                <OpenLayersMap
                  center={[selected.lat || 12.9716, selected.lng || 77.5946]}
                  zoom={13}
                  markers={filteredActive.map(r => ({ lat: r.lat, lng: r.lng }))}
                  style={{ height: '100%' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default WorkerServiceMap;
