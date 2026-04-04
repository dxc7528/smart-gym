/**
 * useWorkoutPlayer.js — 训练播放控制 Hook
 * 实现流式策略：生成前面内容的同时开始播放，后续内容在后台持续生成
 * 支持 Web Speech API fallback
 */

import { useState, useCallback, useRef } from 'react';
import audioEngine from '../audio/audioEngine.js';
import { buildWorkoutSequence, estimateWorkoutDuration } from '../audio/workoutPlayer.js';

const SAMPLE_RATE = 24000;

// 预生成缓冲区大小（先生成多少条 TTS 指令后再开始播放）
const PREFETCH_COUNT = 3;

export default function useWorkoutPlayer(ttsHook) {
  const [playerState, setPlayerState] = useState('idle'); // idle | preparing | playing | paused | complete
  const [currentPhase, setCurrentPhase] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const abortRef = useRef(false);
  const sequenceRef = useRef([]);

  /**
   * 播放 TTS 结果 — 处理 kokoro worker 返回的音频数据或 Web Speech API fallback
   */
  const playTTSResult = async (result) => {
    if (!result) return;

    // Web Speech API fallback 返回 { played: true }
    // 音频已经由浏览器播放，无需额外处理
    if (result.played) return;

    // Kokoro worker 返回 { audio: Float32Array, sampling_rate: number }
    if (result.audio && result.audio instanceof Float32Array) {
      await audioEngine.playBuffer(result.audio, result.sampling_rate || SAMPLE_RATE);
    }
  };

  /**
   * 启动训练播放（流式）
   * @param {string} planName
   * @param {Array} exercises
   * @param {string} voice - TTS voice ID
   */
  const startWorkout = useCallback(async (planName, exercises, voice = 'af_bella') => {
    if (!ttsHook.isReady) return;

    abortRef.current = false;
    setPlayerState('preparing');
    setCurrentPhase({ name: 'preparing', label: '正在准备训练音频...' });

    const sequence = buildWorkoutSequence(planName, exercises);
    sequenceRef.current = sequence;
    const duration = estimateWorkoutDuration(exercises);
    setTotalDuration(duration);

    // 统计 TTS 项数量
    const ttsItems = sequence.filter(s => s.type === 'tts');
    setTotalCount(ttsItems.length);
    setProcessedCount(0);

    // 流式策略：TTS 合成使用缓存避免重复合成相同文本
    const ttsCache = new Map();
    let ttsProcessed = 0;

    const ttsOrder = [];
    for (const item of sequence) {
      if (item.type === 'tts') {
        ttsOrder.push(item);
      }
    }

    // 如果不是 fallback 模式，预生成前几条
    if (!ttsHook.useFallback) {
      const prefetchTexts = [];
      for (let i = 0; i < Math.min(PREFETCH_COUNT, ttsOrder.length); i++) {
        if (!ttsCache.has(ttsOrder[i].text)) {
          prefetchTexts.push(ttsOrder[i].text);
        }
      }

      await Promise.all(
        prefetchTexts.map(async (text) => {
          try {
            const result = await ttsHook.synthesize(text, voice);
            if (result && !result.played) {
              ttsCache.set(text, result);
            }
            ttsProcessed++;
            setProcessedCount(ttsProcessed);
          } catch (e) {
            console.warn('TTS 预生成失败:', text, e);
          }
        })
      );
    }

    if (abortRef.current) return;
    setPlayerState('playing');
    audioEngine.stop();

    // 逐条处理序列（边生成边播放）
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
          // 先检查缓存（仅 kokoro 模式有效）
          let result = ttsCache.get(item.text);

          if (!result) {
            try {
              result = await ttsHook.synthesize(item.text, voice);
              // 缓存 kokoro 结果（Web Speech API 结果不需要缓存）
              if (result && !result.played) {
                ttsCache.set(item.text, result);
              }
              ttsProcessed++;
              setProcessedCount(ttsProcessed);
            } catch (e) {
              console.warn('TTS 合成失败:', item.text, e);
              break;
            }
          }

          if (!abortRef.current) {
            await playTTSResult(result);
          }

          // 后台预生成下一条未缓存的 TTS（仅 kokoro 模式）
          if (!ttsHook.useFallback) {
            const nextUncached = ttsOrder.find(t => !ttsCache.has(t.text));
            if (nextUncached) {
              ttsHook.synthesize(nextUncached.text, voice).then(r => {
                if (r && !r.played) {
                  ttsCache.set(nextUncached.text, r);
                }
                ttsProcessed++;
                setProcessedCount(ttsProcessed);
              }).catch(() => {});
            }
          }
          break;
        }
      }
    }

    if (!abortRef.current) {
      setPlayerState('complete');
      setCurrentPhase({ name: 'complete', label: '训练结束 🎉' });
    }
  }, [ttsHook]);

  const pause = useCallback(() => {
    audioEngine.pause();
    // 也暂停 Web Speech API
    if (ttsHook.useFallback && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    setPlayerState('paused');
  }, [ttsHook.useFallback]);

  const resume = useCallback(() => {
    audioEngine.resume();
    if (ttsHook.useFallback && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    setPlayerState('playing');
  }, [ttsHook.useFallback]);

  const stop = useCallback(() => {
    abortRef.current = true;
    audioEngine.stop();
    if ('speechSynthesis' in window) {
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
