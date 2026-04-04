import React from 'react';

export default function ModelStatus({ isReady, preferredVoice }) {
  let dotClass = 'idle';
  let label = '未支持原生语音';

  if (isReady) {
    dotClass = 'ready';
    if (preferredVoice) {
      label = `语音就绪 (${preferredVoice.name})`;
    } else {
      label = '语音就绪 (默认中文)';
    }
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
