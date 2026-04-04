import { useState, useEffect, useCallback, useRef } from 'react';

// 全局缓存引用，防止被 Chrome/Safari 垃圾回收导致 onend 永远不触发
window.__utterances = window.__utterances || new Set();

export default function useWebSpeech() {
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const [preferredVoice, setPreferredVoice] = useState(null);
  const preferredVoiceRef = useRef(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length === 0) return;
      
      setVoices(allVoices);
      
      const zhVoices = allVoices.filter(v => v.lang.includes('zh-CN') || v.lang.includes('zh_CN'));
      if (zhVoices.length > 0) {
        // 优先使用本地声音，防止国内网络环境下云端网络引擎被墙导致卡死
        const localVoices = zhVoices.filter(v => v.localService);
        const candidates = localVoices.length > 0 ? localVoices : zhVoices;
        
        // Android 通常没有 Tingting 或 Xiaoxiao，会降级命中 candidates[0]，即安卓系统自带的默认中文引擎
        const bestVoice = candidates.find(v => v.name.includes('Tingting') || v.name.includes('Xiaoxiao')) || candidates[0];
        setPreferredVoice(bestVoice);
        preferredVoiceRef.current = bestVoice;
        console.log('[WebSpeech] Loaded CN voice:', bestVoice.name, 'local:', bestVoice.localService);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  /**
   * 播放语音 — 使用计时器估算，避免依赖可能永不触发的 onend
   * @param {string} text
   * @returns {Promise<void>} 播报完成后 resolve
   */
  const synthesize = useCallback((text) => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = preferredVoiceRef.current;

      if (voice) {
        utterance.voice = voice;
      } else {
        utterance.lang = 'zh-CN';
      }

      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0; // 明确指定音量，防止被前面的 dummy 静音污染

      // 估算语音时长作为 fallback 机制（onend 失效时触发）
      // 按照较慢的语速（每秒约 3 个中文字）加上较大的缓冲时间（3秒），确保即使播报较慢也不会提前打断
      const estimatedDuration = text.length * 350 + 3000;
      const timeoutId = setTimeout(() => {
        console.log('[WebSpeech] done (timeout)', text.substring(0, 20));
        window.__utterances.delete(utterance);
        resolve();
      }, estimatedDuration);

      window.__utterances.add(utterance);

      const cleanup = () => {
        clearTimeout(timeoutId);
        window.__utterances.delete(utterance);
        resolve();
      };

      utterance.onend = cleanup;
      utterance.onerror = (e) => {
        if (e.error !== 'canceled') {
          console.warn('[WebSpeech] onerror:', e.error);
        }
        cleanup();
      };

      try {
        // 防御性恢复：如果引擎处于暂停/卡死状态，先 resume()
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('[WebSpeech] speak() threw:', err);
        cleanup();
      }
    });
  }, []); // 无依赖 — 通过 ref 访问 voice

  /**
   * 强制停止所有语音（仅在用户显式停止训练时调用）
   */
  const cancelAll = useCallback(() => {
    // 清理所有挂起的引用
    window.__utterances.clear();
    // [修复核心] 2. 组件卸载或主动停止时，彻底清除全局队列
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}
  }, []);

  return {
    isReady: isSupported,
    voices,
    preferredVoice,
    synthesize,
    cancelAll,
  };
}
