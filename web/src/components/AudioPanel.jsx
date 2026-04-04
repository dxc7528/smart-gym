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
          onClick={() => {
            // 在产生实体用户点击交互时，激活 Speech 和 Audio 引擎
            if (window.speechSynthesis) {
              // 【重要解法】在点击的**同步上下文**中执行 cancel()，这是最安全、唯一能清空 HMR 残留且不会打断后续合法发音的位置！
              window.speechSynthesis.cancel();

              setTimeout(() => {
                const dummy = new SpeechSynthesisUtterance('准备');
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
