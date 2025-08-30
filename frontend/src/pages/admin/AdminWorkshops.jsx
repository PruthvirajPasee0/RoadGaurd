import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchWorkshops } from '../../services/api';

const AdminWorkshops = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [openOnly, setOpenOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchWorkshops();
        setWorkshops(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load workshops', e);
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
      return matchesQ && matchesOpen && matchesRating;
    });
  }, [query, openOnly, minRating, workshops]);

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
          <button className="btn" disabled title="Mock only">Add Workshop</button>
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
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" disabled>Edit</button>
                  <button className="btn btn-secondary" disabled>Disable</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWorkshops;
