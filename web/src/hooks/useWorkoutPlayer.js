/**
 * useWorkoutPlayer.js — 训练播放控制 Hook
 * 仅依赖原生的 Web Speech API 和 Web Audio API (音效)
 */

import { useState, useCallback, useRef } from 'react';
import audioEngine from '../audio/audioEngine.js';
import { buildWorkoutSequence, estimateWorkoutDuration } from '../audio/workoutPlayer.js';

const SAMPLE_RATE = 24000;

export default function useWorkoutPlayer({ isReady, synthesize, cancelAll }) {
  const [playerState, setPlayerState] = useState('idle'); // idle | preparing | playing | paused | complete
  const [currentPhase, setCurrentPhase] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const abortRef = useRef(false);
  const workoutSeqRef = useRef(0); // 区分不同启动序列

  const startWorkout = useCallback(async (planName, exercises) => {
    const seq = ++workoutSeqRef.current;
    console.log('[WP] startWorkout CALLED', { seq, isReady });

    if (!isReady) {
      console.log('[WP] early return: isReady=false');
      return;
    }

    console.log('[WP] proceeding, setState preparing', { seq });
    setPlayerState('preparing');
    setCurrentPhase({ name: 'preparing', label: '正在准备训练序列...' });

    const sequence = buildWorkoutSequence(planName, exercises);
    console.log('[WP] sequence built, items:', sequence.length, { seq });

    const duration = estimateWorkoutDuration(exercises);
    setTotalDuration(duration);

    // 统计算总数量，仅供进度显示参考
    const ttsItems = sequence.filter(s => s.type === 'tts' || s.type === 'overlay');
    console.log('[WP] ttsItems count:', ttsItems.length, { seq });
    setTotalCount(ttsItems.length);
    setProcessedCount(0);

    let ttsProcessed = 0;

    // 使用序列号区分启动批次：只有最新序列号的启动才有效
    console.log('[WP] checking seq', { seq, currentSeq: workoutSeqRef.current });
    if (workoutSeqRef.current !== seq) {
      console.log('[WP] stale workout, skipping', { seq, currentSeq: workoutSeqRef.current });
      return;
    }

    // 重置音频系统的终止标记并尝试激活 Content
    audioEngine.resetAbort();

    console.log('[WP] setState playing', { seq });
    setPlayerState('playing');

    // 逐条处理序列，由 Promise 原生事件产生串行等待
    for (const item of sequence) {
      // 每次循环检查序列号，过时则退出
      if (workoutSeqRef.current !== seq) {
        console.log('[WP] workout superseded, breaking', { seq, currentSeq: workoutSeqRef.current });
        break;
      }

      switch (item.type) {
        case 'phase':
          setCurrentPhase(item);
          break;

        case 'sound':
          await audioEngine.playBuffer(item.audio, SAMPLE_RATE);
          break;

        case 'tts': {
          console.log('[WP] tts synthesize START:', item.text.substring(0, 30), { seq });
          await synthesize(item.text);
          console.log('[WP] tts synthesize DONE:', item.text.substring(0, 30), { seq });
          ttsProcessed++;
          setProcessedCount(ttsProcessed);
          break;
        }

        case 'overlay': {
          // 启动 TTS 和 audio 并发执行
          // 真正的节奏由严格生成的 tick audio 控制
          const ttsPromise = synthesize(item.text).catch(() => {});

          await audioEngine.playBuffer(item.audio, SAMPLE_RATE);
          // 等待 TTS 实际完成后再计入进度，确保进度准确
          await ttsPromise;

          ttsProcessed++;
          setProcessedCount(ttsProcessed);
          break;
        }
      }
    }

    // 只有序列号匹配（未被 stop 打断）才进入 complete 状态
    if (workoutSeqRef.current === seq) {
      console.log('[WP] workout complete!', { seq });
      setPlayerState('complete');
      setCurrentPhase({ name: 'complete', label: '训练结束 🎉' });
    }
  }, [isReady, synthesize, cancelAll]);

  const pause = useCallback(() => {
    console.log('[WP] pause called');
    audioEngine.pause();
    // pause() 在 Safari 上不支持，忽略错误
    try {
      if (window.speechSynthesis?.pause) {
        window.speechSynthesis.pause();
      }
    } catch {}
    setPlayerState('paused');
  }, []);

  const resume = useCallback(() => {
    console.log('[WP] resume called');
    audioEngine.resume();
    // resume() 在 Safari 上不支持，忽略错误
    try {
      if (window.speechSynthesis?.resume) {
        window.speechSynthesis.resume();
      }
    } catch {}
    setPlayerState('playing');
  }, []);

  const stop = useCallback(() => {
    console.log('[WP] stop called, current seq:', workoutSeqRef.current);
    // 推进序列号，使当前正在运行的 workout 识别为过时并退出
    ++workoutSeqRef.current;
    console.log('[WP] seq advanced to:', workoutSeqRef.current);
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
  };
}
