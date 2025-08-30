import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      // Mock save
      i18n.changeLanguage(language);
      localStorage.setItem('language', language);
      setSaving(false);
    }, 800);
  };

  return (
    <div className="container fade-in">
      <div className="card" style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1rem' }}>{t('navigation.profile')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {t('common.appName')} • {user?.role?.toUpperCase()}
        </p>

        <form onSubmit={handleSave} className="grid grid-cols-2" style={{ gap: '1.25rem' }}>
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>

          <div>
            <label className="label">Email</label>
            <input className="input" value={email} disabled />
          </div>

          <div>
            <label className="label">Role</label>
            <input className="input" value={user?.role || ''} disabled />
          </div>

          <div>
            <label className="label">Language</label>
            <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? t('common.loading') : t('common.save')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>
              {t('common.back')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
