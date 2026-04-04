import React from 'react';

export default function ModelStatus({ status, progress, error, onRetry, useFallback }) {
  let dotClass = 'idle';
  let label = '模型待加载';

  if (useFallback) {
    dotClass = 'ready';
    label = '语音 (浏览器原生)';
  } else if (status === 'loading') {
    dotClass = 'loading';
    if (progress && progress.progress != null) {
      const pct = Math.round(progress.progress);
      label = `加载模型 ${pct}%`;
    } else {
      label = '加载模型中...';
    }
  } else if (status === 'ready') {
    dotClass = 'ready';
    label = 'TTS 就绪 (Kokoro)';
  } else if (status === 'error') {
    dotClass = 'error';
    label = '加载失败';
  }

  return (
    <div className="model-status-inline">
      <span className={`status-dot ${dotClass}`} />
      <span>{label}</span>
      {status === 'error' && !useFallback && (
        <button
          className="btn btn-sm btn-warning"
          onClick={onRetry}
          style={{ padding: '3px 10px', fontSize: '0.7rem' }}
        >
          重试
        </button>
      )}
    </div>
  );
}
