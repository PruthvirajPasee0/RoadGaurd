import React, { useEffect, useMemo, useState } from 'react';
import { getRequests } from '../../services/api';

const WorkerServiceMap = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const active = useMemo(() => requests.filter(r => r.status !== 'completed'), [requests]);
  const [selectedId, setSelectedId] = useState(null);
  const selected = useMemo(() => active.find(r => r.id === selectedId), [active, selectedId]);

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

  return (
    <div className="container fade-in" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1rem' }}>
      <div className="card" style={{ height: '70vh', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: 12 }}>Requests</h3>
        {loading ? (
          <div>Loading...</div>
        ) : active.length === 0 ? (
          <div>No active requests</div>
        ) : active.map(req => (
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
            <div style={{ padding: 16, height: '100%' }}>
              <div style={{ marginBottom: 12, display: 'flex', gap: 16, flexWrap: 'wrap', color: 'var(--text-secondary)' }}>
                <div>
                  <div style={{ fontSize: 12 }}>Mechanic</div>
                  <div style={{ fontFamily: 'monospace' }}>-</div>
                </div>
                <div>
                  <div style={{ fontSize: 12 }}>Destination</div>
                  <div style={{ fontFamily: 'monospace' }}>{`${(selected.lat ?? 0).toFixed(5)}, ${(selected.lng ?? 0).toFixed(5)}`}</div>
                </div>
              </div>

              <div style={{
                height: '100%',
                borderRadius: '0.5rem',
                border: '1px dashed var(--border-secondary)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, marginBottom: 8 }}>Map Placeholder</div>
                  <div style={{ fontSize: 12 }}>Integrate Google Maps here using the API key in .env</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>{selected.locationAddress || 'No address provided'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerServiceMap;
