import { useState, useEffect, useCallback } from 'react';

// 全局缓存引用，防止被 Chrome/Safari 垃圾回收导致 onend 永远不触发
window.__utterances = window.__utterances || new Set();

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
        const bestVoice = zhVoices.find(v => v.name.includes('Tingting') || v.name.includes('Xiaoxiao')) || zhVoices[0];
        setPreferredVoice(bestVoice);
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
      
      // 语速适当调慢，中文系统语音常常过快
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      // 保持引用
      window.__utterances.add(utterance);

      const cleanup = () => {
        window.__utterances.delete(utterance);
        resolve();
      };

      utterance.onend = () => {
        cleanup();
      };
      
      utterance.onerror = (e) => {
        console.warn('语音合并播放中断或报错:', e);
        cleanup();
      };

      // 修复 Chrome/Safari Bug：
      // 立即调用的 speechSynthesis.cancel() 后紧接着调用 speak()，
      // 会导致刚插入的 speak 也立刻遭遇 "canceled" error 或者直接丢弃。
      // 所以我们给 speak 加一个微小的延时
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
        
        // 另一个非常臭名昭著的 Chrome bug 补丁：
        // 如果文本过长或长时间不发声，引擎可能会卡住。
        // 定期调用 pause() 和 resume() 可以激活引擎（这里对短语非必需，但可作防御）
        // if (process.env.NODE_ENV === 'development') {
        //    window.speechSynthesis.pause(); window.speechSynthesis.resume();
        // }
      }, 50);
    });
  }, [isSupported, preferredVoice]);

  return {
    isReady: isSupported,
    voices,
    preferredVoice,
    synthesize,
  };
}
