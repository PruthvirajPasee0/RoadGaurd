import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRequests } from '../../services/api';

const WorkerCompleted = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getRequests({ status: 'completed' });
        setRequests(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load requests', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const completed = useMemo(() => requests, [requests]);

  return (
    <div className="container fade-in">
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2>Completed Services</h2>
        <p style={{ color: 'var(--text-secondary)' }}>History of completed requests</p>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      ) : completed.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>No completed services yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {completed.map(req => (
            <div key={req.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3>{req.service}</h3>
                <span style={{ color: 'var(--text-secondary)' }}>{new Date(req.updatedAt || req.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>{req.locationAddress}</div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
                <span>Vehicle: {req.vehicleMake} {req.vehicleModel}</span>
                <span>Reg: {req.registrationNumber}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, color: 'var(--text-secondary)', fontSize: 14 }}>
                <span>Rating: N/A</span>
                <span>Amount: -</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/requests/${req.id}`} className="btn">View Details</Link>
                <button className="btn btn-secondary" disabled>Invoice</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerCompleted;
