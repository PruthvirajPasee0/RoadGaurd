import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAssignWorkerToWorkshop, adminGetUsers, getWorkshopById } from '../../services/api';

const AdminWorkshopAssign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workshop, setWorkshop] = useState(null);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ws, u] = await Promise.all([
          getWorkshopById(id),
          adminGetUsers(),
        ]);
        setWorkshop(ws);
        setUsers(Array.isArray(u) ? u : []);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const workers = useMemo(() => (users || []).filter(u => u.role === 'worker'), [users]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return workers;
    return workers.filter(w =>
      (w.name || '').toLowerCase().includes(q) ||
      (w.phone || '').toLowerCase().includes(q) ||
      String(w.id).includes(q)
    );
  }, [workers, query]);

  const assign = async (workerId, isPrimary = false) => {
    try {
      await adminAssignWorkerToWorkshop(id, { userId: workerId, isPrimary });
      toast.success('Worker assigned');
      navigate('/admin/workshops');
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to assign worker');
    }
  };

  return (
    <div className="container fade-in">
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2>Admin • Assign Worker</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {workshop ? `Assign a worker to ${workshop.name}` : 'Select a worker to assign'}
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input className="input" placeholder="Search workers by name/phone/id" value={query} onChange={e => setQuery(e.target.value)} />
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '1rem', textAlign: 'center' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center' }}>No workers found</div>
        ) : (
          <div className="grid grid-cols-3">
            {filtered.map(w => (
              <div key={w.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ marginBottom: 4 }}>{w.name || 'Worker'} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>#{w.id}</span></h3>
                </div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
                  <div>{w.phone || '-'}</div>
                  <div>{w.email || '-'}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn" onClick={() => assign(w.id, true)}>Assign Primary</button>
                  <button className="btn btn-secondary" onClick={() => assign(w.id, false)}>Assign</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWorkshopAssign;
