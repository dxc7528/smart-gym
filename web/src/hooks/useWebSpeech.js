import { useState, useEffect, useCallback, useRef } from 'react';

// 全局缓存引用，防止被 Chrome/Safari 垃圾回收导致 onend 永远不触发
window.__utterances = window.__utterances || new Set();

/**
 * 根据白名单优先级获取最佳音色
 * @param {SpeechSynthesisVoice[]} voices - 从 speechSynthesis.getVoices() 获取的数组
 * @param {string} lang - 目标语言: 'zh', 'en', 'ja'
 * @returns {SpeechSynthesisVoice | null} 最佳音色对象
 */
function getBestVoice(voices, lang) {
  if (!voices || voices.length === 0) return null;

  // 1. 定义各语言的正则表达式优先级队列（索引越小，优先级越高）
  const priorityMap = {
    'zh': [
      /\bXiaoxiao\b/i,                 // Edge 高级在线
      /\bYaoyao\b|\bKangkang\b/i,          // Windows 本地
      /Google 普通话|Google.*zh-CN/i, // Chrome/Android
      /\bTing-Ting\b|\bTingting\b/i,       // Mac
      /\bYushu\b|\bMei-Jia\b/i,            // iOS
      /zh-CN|zh_CN/i               // 最终兜底
    ],
    'en': [
      /\bAria\b|\bGuy\b/i,                 // Edge 高级在线
      /Google US English|Google.*en-US/i, // Chrome/Android
      /\bSamantha\b|\bAlex\b|\bFred\b/i,       // Mac/iOS
      /\bZira\b|\bDavid\b/i,               // Windows 本地
      /en-US|en_US|en-GB/i         // 最终兜底
    ],
    'ja': [
      /\bNanami\b|\bKeita\b/i,             // Edge 高级在线
      /Google 日本語|Google.*ja-JP/i, // Chrome/Android
      /\bKyoko\b/i,                    // Mac/iOS
      /\bHaruka\b|\bIchiro\b/i,            // Windows 本地
      /ja-JP|ja_JP/i               // 最终兜底
    ]
  };

  const rules = priorityMap[lang];
  // 如果语言不支持，则降级为中文
  const fallbackRules = rules || priorityMap['zh'];
  const targetLang = rules ? lang : 'zh';

  // 2. 遍历规则队列，寻找匹配项
  for (const regex of fallbackRules) {
    const match = voices.find(voice => regex.test(voice.name) || regex.test(voice.lang));
    if (match) {
      return match;
    }
  }

  // 3. 极端情况：如果规则都没命中，返回该语言的第一个可用音色
  const fallbackRegex = new RegExp(targetLang, 'i');
  return voices.find(v => fallbackRegex.test(v.lang)) || voices[0] || null;
}

export default function useWebSpeech() {
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const [preferredVoice, setPreferredVoice] = useState(null);
  const voicesRef = useRef([]); // 持久化 voices 数组供 synthesize 同步读取

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
      voicesRef.current = allVoices;
      
      // 默认先尝试拿中文音色作为首选展示用
      const bestZhVoice = getBestVoice(allVoices, 'zh');
      if (bestZhVoice) {
        setPreferredVoice(bestZhVoice);
        console.log('[WebSpeech] Loaded CN voice:', bestZhVoice.name, 'local:', bestZhVoice.localService);
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
   * @param {string} [lang='zh'] - 目标语言: 'zh', 'en', 'ja'
   * @returns {Promise<void>} 播报完成后 resolve
   */
  const synthesize = useCallback((text, lang = 'zh') => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getBestVoice(voicesRef.current, lang);

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = lang === 'en' ? 'en-US' : lang === 'ja' ? 'ja-JP' : 'zh-CN';
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
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
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
    // 绝对禁止在 componentWillUnmount/useEffect cleanup 等非物理点击处调用 cancel()！
    // 否则 Safari 会认定这是“脚本强制中止”，进而永久收回允许自动发音的最高权限，导致后续全盘静默死锁。
  }, []);

  return {
    isReady: isSupported,
    voices,
    preferredVoice,
    synthesize,
    cancelAll,
  };
}
