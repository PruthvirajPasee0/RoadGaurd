import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
  ];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  return (
    <div className="language-switcher">
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={`lang-btn ${i18n.language === lang.code ? 'active' : ''}`}
          onClick={() => handleLanguageChange(lang.code)}
          title={lang.name}
        >
          <span className="lang-flag">{lang.flag}</span>
          <span className="lang-name">{lang.name}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
