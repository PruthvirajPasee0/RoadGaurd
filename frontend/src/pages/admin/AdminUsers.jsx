import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const initialUsers = [
  { id: 'u1', name: 'Alice Johnson', email: 'alice@example.com', role: 'user', status: 'active' },
  { id: 'u2', name: 'Bob Admin', email: 'admin@example.com', role: 'admin', status: 'active' },
  { id: 'u3', name: 'Charlie Worker', email: 'worker@example.com', role: 'worker', status: 'active' },
  { id: 'u4', name: 'Diana User', email: 'diana@example.com', role: 'user', status: 'blocked' }
];

const AdminUsers = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');

  const filtered = useMemo(() => {
    return initialUsers.filter(u => {
      const q = query.toLowerCase();
      const matchesQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = role === 'all' || u.role === role;
      return matchesQ && matchesRole;
    });
  }, [query, role]);

  return (
    <div className="container fade-in">
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2>{t('navigation.dashboard')} • Admin • Users</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Manage platform users</p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input className="input" placeholder="Search name or email" style={{ maxWidth: 320 }} value={query} onChange={e => setQuery(e.target.value)} />
          <select className="input" style={{ maxWidth: 200 }} value={role} onChange={e => setRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="worker">Worker</option>
          </select>
          <button className="btn" disabled title="Mock only">Add User</button>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Role</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderTop: '1px solid var(--border-primary)' }}>
                  <td style={{ padding: '0.75rem' }}>{u.name}</td>
                  <td style={{ padding: '0.75rem' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{u.role}</td>
                  <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{u.status}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <button className="btn btn-secondary" disabled style={{ marginRight: 8 }}>Edit</button>
                    <button className="btn btn-secondary" disabled>Disable</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
