import React, { useState, useContext } from 'react';
import { AppContext } from '../App.jsx';
import WorkoutRunner from './WorkoutRunner.jsx';
import { t } from '../utils/i18n.js';

const BoltIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

export default function AudioPanel({ planId, planName, exercises }) {
  const { tts, lang } = useContext(AppContext);
  const [showRunner, setShowRunner] = useState(false);

  return (
    <>
      <div className="audio-panel">
        <div className="audio-info">
          <h3>{t(lang, 'audioPanelTitle')}</h3>
          <p>
            {!tts.isReady
              ? t(lang, 'audioNotSupportedDesc')
              : t(lang, 'audioReadyDesc')
            }
          </p>
        </div>
        <button
          className="btn btn-primary"
          disabled={!tts.isReady || exercises.length === 0}
          onClick={() => {
            // 在产生实体用户点击交互时，激活 Speech 和 Audio 引擎
            if (window.speechSynthesis) {
              // 【重要解法】在点击的**同步上下文**中执行 cancel()，这是最安全、唯一能清空 HMR 残留且不会打断后续合法发音的位置！
              window.speechSynthesis.cancel();

              setTimeout(() => {
                const dummy = new SpeechSynthesisUtterance(t(lang, 'startLoading'));
                dummy.volume = 0.01;
                dummy.rate = 2.0;

                const startRunner = () => setShowRunner(true);
                // 必须等待 dummy 发音完全结束释放引擎后，才真正进入训练模块，否则 Safari 会将提前中断视为授权失败而永久锁死
                dummy.onend = startRunner;
                dummy.onerror = startRunner;

                window.speechSynthesis.speak(dummy);
              }, 50);
            } else {
              setShowRunner(true);
            }
          }}
        >
          <span className="btn-icon"><BoltIcon /></span>
          {t(lang, 'startWorkoutBtn').replace('⚡ ', '')}
        </button>
      </div>

      {showRunner && (
        <WorkoutRunner
          planName={planName}
          exercises={exercises}
          onClose={() => setShowRunner(false)}
        />
      )}
    </>
  );
}
