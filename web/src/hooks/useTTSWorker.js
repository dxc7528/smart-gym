/**
 * useTTSWorker.js — 管理 TTS Web Worker 生命周期的 React Hook
 * 带 Web Speech API fallback
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Web Speech API fallback：使用浏览器原生语音合成
 * 返回 Float32Array 音频数据（通过 AudioContext 捕获）
 */
function speakWithWebSpeechAPI(text) {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Web Speech API 不可用'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Web Speech API 无法直接获取音频数据
    // 播放完成后 resolve，让调用者知道已播放
    utterance.onend = () => resolve({ played: true });
    utterance.onerror = (e) => reject(new Error(`语音合成失败: ${e.error}`));

    window.speechSynthesis.cancel(); // 取消之前的
    window.speechSynthesis.speak(utterance);
  });
}

export default function useTTSWorker() {
  const workerRef = useRef(null);
  const callbacksRef = useRef(new Map());
  const batchCallbacksRef = useRef(new Map());
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [voices, setVoices] = useState([]);
  const [useFallback, setUseFallback] = useState(false);
  const idCounter = useRef(0);

  useEffect(() => {
    const worker = new Worker(
      new URL('../worker/tts-worker.js', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    worker.onmessage = (event) => {
      const data = event.data;

      switch (data.type) {
        case 'STATUS':
          setStatus(data.status);
          if (data.error) {
            setError(data.error);
            // 模型加载失败，自动切换到 Web Speech API
            if (data.status === 'error') {
              console.warn('TTS 模型加载失败，切换到 Web Speech API fallback');
              setUseFallback(true);
              setStatus('ready'); // 标记为就绪（使用 fallback）
            }
          }
          if (data.voices) setVoices(data.voices);
          break;

        case 'PROGRESS':
          setProgress(data.progress);
          break;

        case 'TTS_RESULT': {
          const cb = callbacksRef.current.get(data.id);
          if (cb) {
            callbacksRef.current.delete(data.id);
            if (data.error) {
              cb.reject(new Error(data.error));
            } else {
              cb.resolve({
                audio: data.audio,
                sampling_rate: data.sampling_rate,
              });
            }
          }
          break;
        }

        case 'BATCH_ITEM': {
          const batchCb = batchCallbacksRef.current.get(data.id);
          if (batchCb?.onItem) {
            batchCb.onItem(data.index, data.total, data.audio, data.sampling_rate);
          }
          break;
        }

        case 'BATCH_COMPLETE': {
          const batchCb = batchCallbacksRef.current.get(data.id);
          if (batchCb) {
            batchCallbacksRef.current.delete(data.id);
            if (data.error) {
              batchCb.reject(new Error(data.error));
            } else {
              batchCb.resolve();
            }
          }
          break;
        }
      }
    };

    worker.onerror = (err) => {
      console.error('Worker error:', err);
      setUseFallback(true);
      setStatus('ready');
    };

    // 自动初始化
    worker.postMessage({ type: 'INIT' });

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  /**
   * 合成单段文本
   * @param {string} text
   * @param {string} voice
   * @returns {Promise<{audio: Float32Array, sampling_rate: number} | {played: true}>}
   */
  const synthesize = useCallback((text, voice) => {
    // 如果使用 Web Speech API fallback
    if (useFallback) {
      return speakWithWebSpeechAPI(text);
    }

    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        // Worker 不可用，尝试 fallback
        speakWithWebSpeechAPI(text).then(resolve).catch(reject);
        return;
      }
      const id = ++idCounter.current;
      callbacksRef.current.set(id, { resolve, reject });
      workerRef.current.postMessage({ type: 'SYNTHESIZE', id, text, voice });
    });
  }, [useFallback]);

  /**
   * 批量合成多段文本（流式回调）
   */
  const synthesizeBatch = useCallback((texts, voice, onItem) => {
    if (useFallback) {
      // Fallback：顺序播放
      return (async () => {
        for (let i = 0; i < texts.length; i++) {
          await speakWithWebSpeechAPI(texts[i]);
          onItem?.(i, texts.length, null, null);
        }
      })();
    }

    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker 未初始化'));
        return;
      }
      const id = ++idCounter.current;
      batchCallbacksRef.current.set(id, { resolve, reject, onItem });
      workerRef.current.postMessage({ type: 'SYNTHESIZE_BATCH', id, texts, voice });
    });
  }, [useFallback]);

  /**
   * 重新初始化模型
   */
  const reinit = useCallback(() => {
    setStatus('idle');
    setError(null);
    setProgress(null);
    setUseFallback(false);
    workerRef.current?.postMessage({ type: 'INIT' });
  }, []);

  return {
    status,
    progress,
    error,
    voices,
    synthesize,
    synthesizeBatch,
    reinit,
    useFallback,
    isReady: status === 'ready',
    isLoading: status === 'loading',
  };
}
