import React, { useContext } from 'react';
import { AppContext } from '../App.jsx';
import ModelStatus from './ModelStatus.jsx';
import { t } from '../utils/i18n.js';

const DumbbellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 6.5h11M6.5 17.5h11M3 10h3M3 14h3M18 10h3M18 14h3M6.5 6.5V8M6.5 16V17.5M17.5 6.5V8M17.5 16V17.5"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default function Layout({ children }) {
  const { tts, lang, setLang } = useContext(AppContext);

  return (
    <div className="layout">
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span className="logo-icon" style={{ color: 'var(--accent)' }}><DumbbellIcon /></span>
        <span className="logo" style={{ marginRight: 'auto' }}>Smart Gym</span>

        <div className="lang-selector-wrapper">
          <div className="lang-selector">
            <span className="lang-icon"><GlobeIcon /></span>
            <select
              value={lang}
              onChange={e => setLang(e.target.value)}
              className="lang-select"
            >
              <option value="en">EN</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
            </select>
            <span className="lang-chevron"><ChevronIcon /></span>
          </div>
        </div>

        <ModelStatus isReady={tts.isReady} lang={lang} />
        <span className="subtitle" style={{ marginLeft: '1rem' }}>{t(lang, 'subtitle')}</span>
      </header>
      {children}
    </div>
  );
}
