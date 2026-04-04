import { useState, useEffect, useCallback, useRef } from 'react';

export default function useWebSpeech() {
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const [preferredVoice, setPreferredVoice] = useState(null);

  // 初始化事件：选择最优的中文发音人
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
      
      // 优先选择包含 "zh-CN" 的高质量女声（如 macOS 的 Ting-Ting）
      const zhVoices = allVoices.filter(v => v.lang.includes('zh-CN') || v.lang.includes('zh_CN'));
      if (zhVoices.length > 0) {
        // 尝试找大家都比较喜欢的音色，或任意中文音色
        const bestVoice = zhVoices.find(v => v.name.includes('Tingting') || v.name.includes('Xiaoxiao')) || zhVoices[0];
        setPreferredVoice(bestVoice);
      }
    };

    // Chrome 需要靠事件触发，Safari 可能直接拿到
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      // 在一些浏览器里不清理可能有泄漏，不过一般是个单例
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  /**
   * 播放语音
   * @param {string} text 
   * @returns {Promise<void>} 播报完成后 resolve
   */
  const synthesize = useCallback((text) => {
    return new Promise((resolve) => {
      if (!isSupported) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      } else {
        utterance.lang = 'zh-CN';
      }
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        console.warn('语音合并播放中断或报错:', e);
        resolve(); // 不要阻塞训练流程
      };

      // 为了确保即时响应，先取消旧有的播报
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
  }, [isSupported, preferredVoice]);

  return {
    isReady: isSupported,
    voices,
    preferredVoice,
    synthesize,
  };
}
