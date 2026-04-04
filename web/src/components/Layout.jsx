import React, { useContext } from 'react';
import { AppContext } from '../App.jsx';
import ModelStatus from './ModelStatus.jsx';
import { t } from '../utils/i18n.js';

export default function Layout({ children }) {
  const { tts, lang, setLang } = useContext(AppContext);

  return (
    <div className="layout">
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span className="logo-icon">🏋️</span>
        <span className="logo" style={{ marginRight: 'auto' }}>Smart Gym</span>
        
        <div className="layout-lang-selector" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t(lang, 'langPicker')}</label>
          <select 
            value={lang} 
            onChange={e => setLang(e.target.value)}
            className="input"
            style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem', width: 'auto', background: 'transparent', border: '1px solid var(--border)' }}
          >
            <option value="en">EN</option>
            <option value="zh">ZH</option>
            <option value="ja">JA</option>
          </select>
        </div>

        <ModelStatus isReady={tts.isReady} lang={lang} />
        <span className="subtitle" style={{ marginLeft: '1rem' }}>{t(lang, 'subtitle')}</span>
      </header>
      {children}
    </div>
  );
}
