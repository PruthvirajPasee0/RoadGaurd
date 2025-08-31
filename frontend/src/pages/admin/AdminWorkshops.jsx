import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { fetchWorkshops, adminUpdateWorkshop, adminDeleteWorkshop, getRequests, adminGetWorkshopWorkers, adminAssignRequest } from '../../services/api';
import OpenLayersMap from '../../components/OpenLayersMap';
import { haversineKm } from '../../utils/geo';

const AdminWorkshops = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [openOnly, setOpenOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState(null); // { lat, lng }
  const [radiusMode, setRadiusMode] = useState(''); // '', '2','5','10','custom'
  const [radiusKm, setRadiusKm] = useState(0);
  const [expandedId, setExpandedId] = useState(null); // workshopId currently expanded for requests
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelError, setPanelError] = useState('');
  const [panelRequests, setPanelRequests] = useState([]); // requests for expanded workshop
  const [panelWorkers, setPanelWorkers] = useState([]); // workers for expanded workshop
  const [selectedWorkerByReq, setSelectedWorkerByReq] = useState({}); // { [requestId]: workerId }
  const [assigningByReq, setAssigningByReq] = useState({}); // { [requestId]: boolean }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchWorkshops();
        setWorkshops(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load workshops', e);
        toast.error('Failed to load workshops');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return workshops.filter(w => {
      const q = query.toLowerCase();
      const matchesQ = !q || w.name.toLowerCase().includes(q) || w.address.toLowerCase().includes(q);
      const matchesOpen = !openOnly || w.isOpen;
      const matchesRating = w.rating >= minRating;
      const matchesDistance = !center || radiusKm <= 0 || haversineKm(center.lat, center.lng, w.lat, w.lng) <= radiusKm;
      return matchesQ && matchesOpen && matchesRating && matchesDistance;
    });
  }, [query, openOnly, minRating, workshops, center?.lat, center?.lng, radiusKm]);

  useEffect(() => {
    if (!center && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, [center]);

  const handleAdd = () => navigate('/admin/workshops/new');

  const handleEdit = async (w) => {
    try {
      const name = prompt('Name:', w.name) ?? w.name;
      const address = prompt('Address:', w.address) ?? w.address;
      const lat = Number(prompt('Latitude:', w.lat)) || w.lat;
      const lng = Number(prompt('Longitude:', w.lng)) || w.lng;
      const rating = Number(prompt('Rating (0-5):', w.rating ?? 4.2));
      const isOpen = window.confirm('Mark as open? OK = Yes, Cancel = No');
      const servicesStr = prompt('Services (comma separated):', (w.services || []).join(', ')) || '';
      const services = servicesStr.split(',').map(s => s.trim()).filter(Boolean);
      const updated = await adminUpdateWorkshop(w.id, { name, address, lat, lng, rating, isOpen, services });
      setWorkshops(prev => prev.map(x => x.id === w.id ? updated : x));
      toast.success('Workshop updated');
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to update workshop');
    }
  };

  const handleDelete = async (w) => {
    if (!window.confirm(`Delete workshop ${w.name}? This cannot be undone.`)) return;
    try {
      await adminDeleteWorkshop(w.id);
      setWorkshops(prev => prev.filter(x => x.id !== w.id));
      toast.success('Workshop deleted');
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to delete workshop');
    }
  };

  const toggleShowRequests = async (w) => {
    if (expandedId === w.id) {
      // collapse
      setExpandedId(null);
      setPanelRequests([]);
      setPanelWorkers([]);
      setPanelError('');
      setSelectedWorkerByReq({});
      return;
    }
    setExpandedId(w.id);
    setPanelLoading(true);
    setPanelError('');
    try {
      const [workers, requests] = await Promise.all([
        adminGetWorkshopWorkers(w.id),
        getRequests({ workshopId: w.id, status: 'pending' }),
      ]);
      setPanelWorkers(Array.isArray(workers) ? workers : []);
      setPanelRequests(Array.isArray(requests) ? requests : []);
      // preselect primary worker if any
      const primary = (workers || []).find(x => x.isPrimary);
      if (primary) {
        const preSel = {};
        (requests || []).forEach(r => { preSel[r.id] = primary.id; });
        setSelectedWorkerByReq(preSel);
      } else {
        setSelectedWorkerByReq({});
      }
    } catch (e) {
      console.error('Failed to load workshop panel data', e);
      setPanelError(e?.response?.data?.error || 'Failed to load requests');
    } finally {
      setPanelLoading(false);
    }
  };

  const handleAssign = async (req, workshopId) => {
    const workerId = selectedWorkerByReq[req.id];
    if (!workerId) {
      toast.warn('Select a worker first');
      return;
    }
    setAssigningByReq(prev => ({ ...prev, [req.id]: true }));
    try {
      const updated = await adminAssignRequest(req.id, { workshopId, workerId });
      // Move out of pending list (since it's now accepted) or reflect update inline
      setPanelRequests(prev => prev.filter(r => r.id !== req.id));
      toast.success('Worker assigned');
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to assign');
    } finally {
      setAssigningByReq(prev => ({ ...prev, [req.id]: false }));
    }
  };

  return (
    <div className="container fade-in">
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2>Admin • Workshops</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Manage listed workshops</p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="input" placeholder={t('workshops.searchPlaceholder')} style={{ maxWidth: 340 }} value={query} onChange={e => setQuery(e.target.value)} />
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={openOnly} onChange={e => setOpenOnly(e.target.checked)} /> {t('workshops.openNow')}
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t('workshops.rating')}</span>
            <select className="input" style={{ maxWidth: 120 }} value={minRating} onChange={e => setMinRating(Number(e.target.value))}>
              <option value={0}>All</option>
              <option value={3}>3+</option>
              <option value={4}>4+</option>
              <option value={4.5}>4.5+</option>
            </select>
          </div>
          <button className="btn" onClick={handleAdd}>Add Workshop</button>
        </div>
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

      <div className="card">
        {loading ? (
          <div style={{ padding: '1rem', textAlign: 'center' }}>Loading...</div>
        ) : (
          <div className="grid grid-cols-3">
            {filtered.map(w => (
              <div key={w.id} className="card" style={{ padding: '1rem' }}>
                {w.image ? (
                  <img src={w.image} alt={w.name} style={{ width: '100%', borderRadius: '0.5rem', marginBottom: '0.75rem' }} />
                ) : (
                  <div style={{
                    width: '100%', height: 140, borderRadius: '0.5rem', marginBottom: '0.75rem',
                    display: 'grid', placeItems: 'center', background: 'var(--bg-hover)', color: 'var(--text-secondary)'
                  }}>{w.name?.charAt(0) || 'W'}</div>
                )}
                <h3 style={{ marginBottom: 4 }}>{w.name}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>{w.address}</p>
                <div style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>
                  <span>⭐ {w.rating ?? '-'}</span>
                  <span style={{ color: w.isOpen ? 'var(--accent-success)' : 'var(--accent-danger)' }}>{w.isOpen ? t('workshops.open24x7') : t('workshops.closedNow')}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button className="btn btn-secondary" onClick={() => handleEdit(w)}>Edit</button>
                  <button className="btn btn-secondary" onClick={() => toggleShowRequests(w)}>{expandedId === w.id ? 'Hide Requests' : 'Show Requests'}</button>
                  <button className="btn btn-secondary" onClick={() => handleDelete(w)}>Delete</button>
                </div>
                {expandedId === w.id && (
                  <div className="card" style={{ marginTop: 8 }}>
                    <h4 style={{ marginBottom: 8 }}>Pending Requests</h4>
                    {panelLoading ? (
                      <div style={{ padding: '0.5rem' }}>Loading...</div>
                    ) : panelError ? (
                      <div style={{ padding: '0.5rem', color: 'var(--accent-danger)' }}>{panelError}</div>
                    ) : panelRequests.length === 0 ? (
                      <div style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>No pending requests for this workshop</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {panelRequests.map(req => (
                          <div key={req.id} className="card" style={{ padding: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong>{req.service}</strong>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{req.locationAddress || '-'} • {req.status}</span>
                              </div>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <select
                                  className="input"
                                  style={{ minWidth: 160 }}
                                  value={selectedWorkerByReq[req.id] || ''}
                                  onChange={e => setSelectedWorkerByReq(prev => ({ ...prev, [req.id]: Number(e.target.value) || '' }))}
                                >
                                  <option value="">Select worker</option>
                                  {panelWorkers.map(wk => (
                                    <option key={wk.id} value={wk.id}>
                                      {wk.name || wk.phone || `Worker #${wk.id}`}{wk.isPrimary ? ' • Primary' : ''}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  className="btn"
                                  disabled={assigningByReq[req.id] || !selectedWorkerByReq[req.id]}
                                  onClick={() => handleAssign(req, w.id)}
                                >
                                  {assigningByReq[req.id] ? 'Assigning...' : 'Assign'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWorkshops;
