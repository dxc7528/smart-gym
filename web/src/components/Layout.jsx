import React, { useContext } from 'react';
import { AppContext } from '../App.jsx';
import ModelStatus from './ModelStatus.jsx';

export default function Layout({ children }) {
  const { tts } = useContext(AppContext);

  return (
    <div className="layout">
      <header>
        <span className="logo-icon">🏋️</span>
        <span className="logo">Smart Gym</span>
        <ModelStatus isReady={tts.isReady} preferredVoice={tts.preferredVoice} />
        <span className="subtitle">训练计划 · 语音提示</span>
      </header>
      {children}
    </div>
  );
}
