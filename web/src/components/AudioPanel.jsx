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
              ? '请等待 TTS 模型加载完成…'
              : '点击开始训练，实时生成语音引导并播放'
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
