import React from 'react';

const stats = {
  totals: { requests: 156, revenue: 1200000, workshops: 12, workers: 45 },
  byStatus: { pending: 8, inProgress: 12, completed: 136 },
  topWorkshops: [
    { id: '2', name: 'RoadSide Heroes', completed: 58, rating: 4.8 },
    { id: '1', name: 'QuickFix Auto Services', completed: 47, rating: 4.5 },
    { id: '4', name: 'City Auto Care', completed: 31, rating: 4.6 }
  ]
};

const StatCard = ({ title, value, sub }) => (
  <div className="card" style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{title}</div>
    <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
  </div>
);

const AdminReports = () => {
  return (
    <div className="container fade-in">
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2>Admin • Reports</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>High-level platform analytics</p>
      </div>

      <div className="grid grid-cols-4" style={{ gap: '1rem', marginBottom: '1rem' }}>
        <StatCard title="Total Requests" value={stats.totals.requests} />
        <StatCard title="Revenue (M)" value={(stats.totals.revenue / 1000000).toFixed(1)} sub="INR" />
        <StatCard title="Workshops" value={stats.totals.workshops} />
        <StatCard title="Active Workers" value={stats.totals.workers} />
      </div>

      <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Requests by Status</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            {Object.entries(stats.byStatus).map(([k, v]) => (
              <div key={k} className="card" style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{k}</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Top Workshops</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Workshop</th>
                  <th style={{ padding: '0.75rem' }}>Completed</th>
                  <th style={{ padding: '0.75rem' }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {stats.topWorkshops.map(w => (
                  <tr key={w.id} style={{ borderTop: '1px solid var(--border-primary)' }}>
                    <td style={{ padding: '0.75rem' }}>{w.name}</td>
                    <td style={{ padding: '0.75rem' }}>{w.completed}</td>
                    <td style={{ padding: '0.75rem' }}>⭐ {w.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
