import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { getRequests, adminApproveRequest, adminAssignRequest, fetchWorkshops, adminGetUsers } from '../../services/api';
import OpenLayersMap from '../../components/OpenLayersMap';
import { haversineKm } from '../../utils/geo';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [workshops, setWorkshops] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [center, setCenter] = useState(null); // { lat, lng }
  const [radiusMode, setRadiusMode] = useState(''); // '', '2','5','10','custom'
  const [radiusKm, setRadiusKm] = useState(0);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [wshops, users] = await Promise.all([fetchWorkshops(), adminGetUsers()]);
        setWorkshops(Array.isArray(wshops) ? wshops : []);
        setWorkers((Array.isArray(users) ? users : []).filter(u => u.role === 'worker'));
      } catch (e) {
        console.error('Failed to load metadata', e);
      }
    };
    loadMeta();
  }, []);

  useEffect(() => {
    // Try geolocate for default center
    if (!center && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, [center]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getRequests({ status: statusFilter });
        setRequests(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load requests', e);
        toast.error(e?.response?.data?.error || 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [statusFilter]);

  const filtered = useMemo(() => {
    let list = requests;
    if (center && radiusKm > 0) {
      list = list.filter(r => {
        const d = haversineKm(center.lat, center.lng, r.lat, r.lng);
        return d <= radiusKm;
      });
    }
    return list;
  }, [requests, center?.lat, center?.lng, radiusKm]);

  const radiusOptions = [
    { label: 'No distance filter', value: '' },
    { label: '< 2 km', value: '2' },
    { label: '5 km', value: '5' },
    { label: '10 km', value: '10' },
    { label: 'Custom', value: 'custom' },
  ];

  const doApprove = async (r) => {
    try {
      const updated = await adminApproveRequest(r.id);
      setRequests(list => list.map(x => x.id === r.id ? updated : x));
      toast.success('Request approved');
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to approve');
    }
  };

  const doAssign = async (r) => {
    try {
      if (!workshops.length) return toast.error('No workshops available');
      const wsList = workshops.map(w => `${w.id}: ${w.name}`).join('\n');
      const wIdStr = prompt(`Assign to workshop ID:\n${wsList}`, r.workshopId || '');
      if (!wIdStr) return;
      const workshopId = Number(wIdStr);
      if (!workshopId || !workshops.find(w => w.id === workshopId)) return toast.error('Invalid workshop ID');

      const workerList = workers.map(u => `${u.id}: ${u.name || ''} ${u.phone ? '(' + u.phone + ')' : ''}`).join('\n');
      const workerIdStr = prompt(`Optional: assign to worker ID (Enter to skip)\n${workerList}`) || '';
      const workerId = workerIdStr ? Number(workerIdStr) : undefined;
      if (workerIdStr && (!workerId || !workers.find(u => u.id === workerId))) return toast.error('Invalid worker ID');

      const updated = await adminAssignRequest(r.id, { workshopId, workerId });
      setRequests(list => list.map(x => x.id === r.id ? updated : x));
      toast.success('Request assigned');
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to assign');
    }
  };

  return (
    <div className="container fade-in">
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2>Admin • Requests</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Approve and assign service requests</p>
      </div>

      <div className="card" style={{ marginBottom: '1rem', display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Status</span>
        <select className="input" style={{ maxWidth: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 12, alignItems: 'start' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
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
              if (v === '' ) setRadiusKm(0);
              else if (v !== 'custom') setRadiusKm(Number(v));
            }}>
              {radiusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {radiusMode === 'custom' && (
              <input type="number" className="input" style={{ width: 120 }} min={0.5} step={0.5} value={radiusKm}
                     onChange={(e) => setRadiusKm(Number(e.target.value) || 0)} placeholder="km" />
            )}
          </div>
          <div style={{ height: 220 }}>
            <OpenLayersMap
              center={[center?.lat || 12.9716, center?.lng || 77.5946]}
              zoom={13}
              circleKm={radiusKm}
              markers={center ? [{ lat: center.lat, lng: center.lng }] : []}
              onClick={(pos) => setCenter(pos)}
              style={{ height: 220 }}
            />
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '1rem', textAlign: 'center' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center' }}>No requests found</div>
        ) : (
          <div className="grid grid-cols-3">
            {filtered.map((r) => (
              <div key={r.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h3>#{r.id} • {r.service}</h3>
                  <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{r.status}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>{r.locationAddress || '-'}</div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
                  <span>Workshop: {r.workshopName || '-'}</span>
                  <span>Urgency: {r.urgency}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" onClick={() => doApprove(r)} disabled={r.status !== 'pending'}>Approve</button>
                  <button className="btn" onClick={() => doAssign(r)}>Assign</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequests;
