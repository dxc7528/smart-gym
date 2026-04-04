/**
 * useWorkoutPlayer.js — 训练播放控制 Hook
 * 仅依赖原生的 Web Speech API 和 Web Audio API (音效)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import audioEngine from '../audio/audioEngine.js';
import { buildWorkoutSequence, estimateWorkoutDuration } from '../audio/workoutPlayer.js';

const SAMPLE_RATE = 24000;

export default function useWorkoutPlayer({ isReady, synthesize, cancelAll, audioLang = 'zh' }) {
  const [playerState, setPlayerState] = useState('idle'); // idle | preparing | playing | paused | complete
  const [currentPhase, setCurrentPhase] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const sequenceRef = useRef([]);
  const currentIndexRef = useRef(0);
  const currentPhaseRef = useRef(null);
  const ttsProcessedRef = useRef(0);
  const abortRef = useRef(false);
  const workoutSeqRef = useRef(0);
  const audioLangRef = useRef(audioLang);

  useEffect(() => {
    audioLangRef.current = audioLang;
  }, [audioLang]);

  const playFromIndex = useCallback(async (startIndex) => {
    const seq = ++workoutSeqRef.current;
    
    // 中断一切正在进行的任务
    audioEngine.stop();
    cancelAll();
    audioEngine.resetAbort();

    setPlayerState('playing');
    
    const sequence = sequenceRef.current;
    currentIndexRef.current = startIndex;

    while (currentIndexRef.current < sequence.length) {
      if (workoutSeqRef.current !== seq) {
        break; // 遭到新的播放打断
      }

      const item = sequence[currentIndexRef.current];

      switch (item.type) {
        case 'phase':
          setCurrentPhase(item);
          currentPhaseRef.current = item;
          break;

        case 'sound':
          await audioEngine.playBuffer(item.audio, SAMPLE_RATE);
          break;

        case 'tts': {
          await synthesize(item.text, audioLangRef.current);
          if (workoutSeqRef.current === seq) {
            ttsProcessedRef.current++;
            setProcessedCount(ttsProcessedRef.current);
          }
          break;
        }

        case 'overlay': {
          const ttsPromise = synthesize(item.text, audioLangRef.current).catch(() => {});
          await audioEngine.playBuffer(item.audio, SAMPLE_RATE);
          await ttsPromise;
          if (workoutSeqRef.current === seq) {
            ttsProcessedRef.current++;
            setProcessedCount(ttsProcessedRef.current);
          }
          break;
        }
      }

      if (workoutSeqRef.current === seq) {
        currentIndexRef.current++;
      }
    }

    if (workoutSeqRef.current === seq && currentIndexRef.current >= sequence.length) {
      setPlayerState('complete');
      setCurrentPhase({ name: 'complete', label: '训练结束 🎉' });
    }
  }, [synthesize, cancelAll]);

  const startWorkout = useCallback(async (planName, exercises) => {
    if (!isReady) return;

    setPlayerState('preparing');
    setCurrentPhase({ name: 'preparing', label: '正在准备训练序列...' });
    currentPhaseRef.current = null;

    const sequence = buildWorkoutSequence(planName, exercises, audioLangRef.current);
    sequenceRef.current = sequence;
    
    setTotalDuration(estimateWorkoutDuration(exercises));

    const ttsItems = sequence.filter(s => s.type === 'tts' || s.type === 'overlay');
    setTotalCount(ttsItems.length);
    
    ttsProcessedRef.current = 0;
    setProcessedCount(0);

    playFromIndex(0);
  }, [isReady, playFromIndex]);

  const seekTo = useCallback((targetType, direction) => {
    if (playerState !== 'playing' && playerState !== 'paused') return;

    const sequence = sequenceRef.current;
    if (!sequence || sequence.length === 0) return;

    const phase = currentPhaseRef.current;
    if (!phase) return;

    const currentEx = phase.exerciseIndex ?? 0;
    const currentSet = phase.setIndex ?? 0;

    let targetIdx = currentIndexRef.current;

    if (direction === 'next') {
      for (let i = currentIndexRef.current + 1; i < sequence.length; i++) {
        const p = sequence[i];
        if (p.type === 'phase') {
          if (targetType === 'exercise' && p.exerciseIndex !== undefined && p.exerciseIndex > currentEx) {
            targetIdx = i;
            break;
          }
          if (targetType === 'set' && p.setIndex !== undefined && (p.exerciseIndex > currentEx || (p.exerciseIndex === currentEx && p.setIndex > currentSet))) {
            targetIdx = i;
            break;
          }
        }
      }
    } else if (direction === 'prev') {
      let foundStartOfCurrent = -1;
      
      // 找出**当前单元**的真实起点索引
      for (let i = 0; i < sequence.length; i++) {
        const p = sequence[i];
        if (p.type === 'phase') {
           if (targetType === 'exercise' && p.exerciseIndex === currentEx && p.name === 'exercise-intro') {
              foundStartOfCurrent = i;
              break;
           }
           if (targetType === 'set' && p.exerciseIndex === currentEx && p.setIndex === currentSet && p.name === 'set-start') {
              foundStartOfCurrent = i;
              break;
           }
        }
      }

      // 判断离起点的步数。如果在起点周围（相差不超过 3 步），则跳向上一组，否则只回到本组起点（Restart Current Set）
      const isJustStarted = (currentIndexRef.current - foundStartOfCurrent) <= 3;

      if (!isJustStarted && foundStartOfCurrent !== -1) {
         targetIdx = foundStartOfCurrent;
      } else {
         let prevIdx = -1;
         for (let i = foundStartOfCurrent - 1; i >= 0; i--) {
            const p = sequence[i];
            if (p.type === 'phase') {
               if (targetType === 'exercise' && p.exerciseIndex !== undefined && p.exerciseIndex < currentEx && p.name === 'exercise-intro') {
                  prevIdx = i;
                  break;
               }
               // 如果是上一组，有可能是上一个动作的最后一组
               if (targetType === 'set' && p.setIndex !== undefined && (p.exerciseIndex < currentEx || (p.exerciseIndex === currentEx && p.setIndex < currentSet)) && p.name === 'set-start') {
                  prevIdx = i;
                  break;
               }
            }
         }
         targetIdx = prevIdx !== -1 ? prevIdx : Math.max(0, foundStartOfCurrent);
      }
    }

    if (targetIdx !== currentIndexRef.current) {
        // 重算进度条
        let targetTtsCount = 0;
        for(let i = 0; i < targetIdx; i++) {
            if(sequence[i].type === 'tts' || sequence[i].type === 'overlay') targetTtsCount++;
        }
        ttsProcessedRef.current = targetTtsCount;
        setProcessedCount(targetTtsCount);
        
        playFromIndex(targetIdx);
    }
  }, [playerState, playFromIndex]);

  const pause = useCallback(() => {
    audioEngine.pause();
    try { if (window.speechSynthesis?.pause) window.speechSynthesis.pause(); } catch {}
    setPlayerState('paused');
  }, []);

  const resume = useCallback(() => {
    // 【修改】调用 resume() 时如果引擎实际上是在 idle 或暂停，且 sequence 未完，重新对接
    audioEngine.resume();
    try { if (window.speechSynthesis?.resume) window.speechSynthesis.resume(); } catch {}
    setPlayerState('playing');
  }, []);

  const stop = useCallback(() => {
    ++workoutSeqRef.current;
    abortRef.current = true;
    audioEngine.stop();
    cancelAll();
    setPlayerState('idle');
    setCurrentPhase(null);
  }, [cancelAll]);

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
    seekTo,
  };
}
