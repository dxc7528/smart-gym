/**
 * useWorkoutPlayer.js — 训练播放控制 Hook
 * 仅依赖原生的 Web Speech API 和 Web Audio API (音效)
 */

import { useState, useCallback, useRef } from 'react';
import audioEngine from '../audio/audioEngine.js';
import { buildWorkoutSequence, estimateWorkoutDuration } from '../audio/workoutPlayer.js';

const SAMPLE_RATE = 24000;

export default function useWorkoutPlayer(webSpeechHook) {
  const [playerState, setPlayerState] = useState('idle'); // idle | preparing | playing | paused | complete
  const [currentPhase, setCurrentPhase] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const abortRef = useRef(false);

  const startWorkout = useCallback(async (planName, exercises) => {
    if (!webSpeechHook.isReady) return;

    abortRef.current = false;
    setPlayerState('preparing');
    setCurrentPhase({ name: 'preparing', label: '正在准备训练序列...' });

    const sequence = buildWorkoutSequence(planName, exercises);
    const duration = estimateWorkoutDuration(exercises);
    setTotalDuration(duration);

    // 统计算总数量，仅供进度显示参考
    const ttsItems = sequence.filter(s => s.type === 'tts');
    setTotalCount(ttsItems.length);
    setProcessedCount(0);

    let ttsProcessed = 0;

    if (abortRef.current) return;

    // 重置音频系统的终止标记并尝试激活 Content
    audioEngine.resetAbort();
    
    // 中止当前正在播放的原生语音
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    setPlayerState('playing');

    // 逐条处理序列，由 Promise 原生事件产生串行等待
    for (const item of sequence) {
      if (abortRef.current) break;

      switch (item.type) {
        case 'phase':
          setCurrentPhase(item);
          break;

        case 'sound':
          await audioEngine.playBuffer(item.audio, SAMPLE_RATE);
          break;

        case 'tts': {
          await webSpeechHook.synthesize(item.text);
          ttsProcessed++;
          setProcessedCount(ttsProcessed);
          break;
        }
      }
    }

    if (!abortRef.current) {
      setPlayerState('complete');
      setCurrentPhase({ name: 'complete', label: '训练结束 🎉' });
    }
  }, [webSpeechHook]);

  const pause = useCallback(() => {
    audioEngine.pause();
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    setPlayerState('paused');
  }, []);

  const resume = useCallback(() => {
    audioEngine.resume();
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
    setPlayerState('playing');
  }, []);

  const stop = useCallback(() => {
    abortRef.current = true;
    audioEngine.stop();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlayerState('idle');
    setCurrentPhase(null);
  }, []);

  return {
    playerState,
    currentPhase,
    totalDuration,
    processedCount,
    totalCount,
    startWorkout,
    pause,
    resume,
    stop,
  };
}
