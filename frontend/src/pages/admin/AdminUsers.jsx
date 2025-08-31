import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { adminGetUsers, adminUpdateUser, adminDeleteUser, authSignUp } from '../../services/api';

const AdminUsers = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminGetUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = query.toLowerCase();
      const matchesQ = !q || (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.phone || '').toLowerCase().includes(q);
      const matchesRole = role === 'all' || u.role === role;
      return matchesQ && matchesRole;
    });
  }, [query, role, users]);

  const handleAdd = async () => {
    try {
      const phone = prompt('Phone (required):');
      if (!phone) return;
      const name = prompt('Name (optional):') || undefined;
      const email = prompt('Email (optional):') || undefined;
      const role = prompt("Role (user/worker/admin):", 'user');
      if (!['user','worker','admin'].includes(role)) return toast.error('Invalid role');
      const password = prompt('Temporary password (min 6 chars):', 'password123');
      if (!password || password.length < 6) return toast.error('Password too short');
      let adminSecret;
      if (role === 'admin') {
        adminSecret = prompt('Enter ADMIN_SIGNUP_SECRET to create admin:');
        if (!adminSecret) return toast.error('Admin secret required');
      }
      await authSignUp({ phone, name, email, password, role, adminSecret });
      toast.success('User created');
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to create user');
    }
  };

  const handleEdit = async (u) => {
    try {
      const name = prompt('Name:', u.name || '') ?? u.name;
      const email = prompt('Email:', u.email || '') ?? u.email;
      const role = prompt('Role (user/worker/admin):', u.role) ?? u.role;
      if (!['user','worker','admin'].includes(role)) return toast.error('Invalid role');
      const updated = await adminUpdateUser(u.id, { name, email, role });
      setUsers(prev => prev.map(x => x.id === u.id ? updated : x));
      toast.success('User updated');
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user ${u.name || u.phone}? This cannot be undone.`)) return;
    try {
      await adminDeleteUser(u.id);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      toast.success('User deleted');
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to delete user');
    }
  };

  return (
    <div className="container fade-in">
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2>{t('navigation.dashboard')} • Admin • Users</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Manage platform users</p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input className="input" placeholder="Search name, email or phone" style={{ maxWidth: 320 }} value={query} onChange={e => setQuery(e.target.value)} />
          <select className="input" style={{ maxWidth: 200 }} value={role} onChange={e => setRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="worker">Worker</option>
          </select>
          <button className="btn" onClick={handleAdd}>Add User</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '1rem', textAlign: 'center' }}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Name</th>
                  <th style={{ padding: '0.75rem' }}>Phone</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                  <th style={{ padding: '0.75rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} style={{ borderTop: '1px solid var(--border-primary)' }}>
                    <td style={{ padding: '0.75rem' }}>{u.name || '-'}</td>
                    <td style={{ padding: '0.75rem' }}>{u.phone}</td>
                    <td style={{ padding: '0.75rem' }}>{u.email || '-'}</td>
                    <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{u.role}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <button className="btn btn-secondary" style={{ marginRight: 8 }} onClick={() => handleEdit(u)}>Edit</button>
                      <button className="btn btn-secondary" onClick={() => handleDelete(u)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
