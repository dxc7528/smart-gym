import React from 'react';
import { t } from '../utils/i18n.js';

export default function ModelStatus({ isReady, lang }) {
  let dotClass = 'idle';
  let label = t(lang, 'voiceNotSupported');

  if (isReady) {
    dotClass = 'ready';
    label = t(lang, 'voiceReady');
  } else {
    dotClass = 'error';
  }

  return (
    <div className="model-status-inline">
      <span className={`status-dot ${dotClass}`} />
      <span>{label}</span>
    </div>
  );
}
