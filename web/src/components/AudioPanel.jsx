import React, { useState, useContext } from 'react';
import { AppContext } from '../App.jsx';
import WorkoutRunner from './WorkoutRunner.jsx';

export default function AudioPanel({ planId, planName, exercises }) {
  const { tts } = useContext(AppContext);
  const [showRunner, setShowRunner] = useState(false);

  return (
    <>
      <div className="audio-panel">
        <div className="audio-info">
          <h3>🎵 训练语音音频</h3>
          <p>
            {!tts.isReady 
              ? '抱歉，你的浏览器不支持原生语音合成'
              : '点击开始训练，开始实时语音引导'
            }
          </p>
        </div>
        <button
          className="btn btn-primary"
          disabled={!tts.isReady || exercises.length === 0}
          onClick={() => setShowRunner(true)}
        >
          <span className="btn-icon">⚡</span>
          开始训练
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
