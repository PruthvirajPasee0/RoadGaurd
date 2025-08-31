import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminCreateWorkshop } from '../../services/api';
import OpenLayersMap from '../../components/OpenLayersMap';

const defaultCenter = { lat: 12.9716, lng: 77.5946 };

const AdminWorkshopNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    lat: defaultCenter.lat,
    lng: defaultCenter.lng,
    rating: 4.2,
    reviews: 0,
    isOpen: true,
    openTime: '09:00',
    closeTime: '21:00',
    services: ['Tire Change', 'Battery Jump', 'Towing'],
    imageUrl: ''
  });

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address) return toast.error('Name and address are required');
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        address: form.address,
        lat: Number(form.lat),
        lng: Number(form.lng),
        rating: Number(form.rating) || 4.2,
        reviews: Number(form.reviews) || 0,
        isOpen: !!form.isOpen,
        openTime: form.openTime,
        closeTime: form.closeTime,
        services: Array.isArray(form.services) ? form.services : [],
        imageUrl: form.imageUrl || null,
      };
      await adminCreateWorkshop(payload);
      toast.success('Workshop created');
      navigate('/admin/workshops');
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to create workshop');
    } finally {
      setLoading(false);
    }
  };

  const serviceOptions = ['Tire Change','Battery Jump','Towing','Fuel Delivery','Minor Repairs','Oil Change','Brake Service'];

  return (
    <div className="container fade-in">
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2>Admin • Add Workshop</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Create a new workshop and set its map location</p>
      </div>

      <form onSubmit={onSubmit} className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div className="form-group">
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={e => setField('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={e => setField('address', e.target.value)} required />
          </div>
          <div className="form-row" style={{ display: 'flex', gap: 8 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Latitude</label>
              <input className="input" type="number" step="0.000001" value={form.lat} onChange={e => setField('lat', e.target.value)} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Longitude</label>
              <input className="input" type="number" step="0.000001" value={form.lng} onChange={e => setField('lng', e.target.value)} required />
            </div>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: 8 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Open Time</label>
              <input className="input" type="time" value={form.openTime} onChange={e => setField('openTime', e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Close Time</label>
              <input className="input" type="time" value={form.closeTime} onChange={e => setField('closeTime', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Services</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {serviceOptions.map(s => (
                <label key={s} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  <input type="checkbox" checked={form.services.includes(s)} onChange={(e) => {
                    setForm(prev => ({
                      ...prev,
                      services: e.target.checked ? [...prev.services, s] : prev.services.filter(x => x !== s)
                    }))
                  }} />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Image URL</label>
            <input className="input" value={form.imageUrl} onChange={e => setField('imageUrl', e.target.value)} />
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/workshops')}>Cancel</button>
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create Workshop'}</button>
          </div>
        </div>

        <div style={{ height: 420 }}>
          <OpenLayersMap
            center={[Number(form.lat) || defaultCenter.lat, Number(form.lng) || defaultCenter.lng]}
            zoom={14}
            markers={[{ lat: Number(form.lat), lng: Number(form.lng) }]}
            onClick={(pos) => { setField('lat', pos.lat); setField('lng', pos.lng); }}
            style={{ height: 420 }}
          />
          <div style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
            Tip: Click on the map to set the workshop location
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminWorkshopNew;
