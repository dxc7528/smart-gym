/**
 * tts-worker.js — TTS Web Worker
 * 使用 kokoro-js (Kokoro-82M-ONNX Q4) 进行语音合成
 * 运行在独立线程，不会阻塞 UI
 */

import { KokoroTTS } from 'kokoro-js';

let tts = null;
let isInitializing = false;

/**
 * 从 kokoro-js 返回的 RawAudio 对象中提取音频数据
 * RawAudio 有 .audio (Float32Array) 和 .sampling_rate (number)
 */
function extractAudioData(rawAudio) {
  // RawAudio 类的属性是 .audio 和 .sampling_rate
  const audioData = rawAudio.audio;
  const sampleRate = rawAudio.sampling_rate || 24000;

  if (!(audioData instanceof Float32Array)) {
    throw new Error(`Unexpected audio data type: ${typeof audioData}`);
  }

  return { audioData, sampleRate };
}

// 监听来自 React 的消息
self.addEventListener('message', async (event) => {
  const { type, id, text, voice } = event.data;

  if (type === 'INIT') {
    if (tts || isInitializing) return;
    isInitializing = true;

    self.postMessage({ type: 'STATUS', status: 'loading', message: '正在加载 TTS 模型...' });

    try {
      tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-ONNX', {
        dtype: 'q4',
        device: 'wasm',
        progress_callback: (progress) => {
          self.postMessage({ type: 'PROGRESS', progress });
        },
      });

      const voices = tts.list_voices();
      self.postMessage({ type: 'STATUS', status: 'ready', voices });
    } catch (err) {
      self.postMessage({ type: 'STATUS', status: 'error', error: err.message });
    } finally {
      isInitializing = false;
    }
  }

  if (type === 'SYNTHESIZE') {
    if (!tts) {
      self.postMessage({ type: 'TTS_RESULT', id, error: '模型未就绪' });
      return;
    }

    try {
      const selectedVoice = voice || 'af_bella';
      const rawAudio = await tts.generate(text, { voice: selectedVoice });
      const { audioData, sampleRate } = extractAudioData(rawAudio);

      // 复制数据以确保可以安全 transfer
      const copy = new Float32Array(audioData);
      self.postMessage({
        type: 'TTS_RESULT',
        id,
        audio: copy,
        sampling_rate: sampleRate,
      }, [copy.buffer]);
    } catch (err) {
      self.postMessage({ type: 'TTS_RESULT', id, error: err.message });
    }
  }

  if (type === 'SYNTHESIZE_BATCH') {
    if (!tts) {
      self.postMessage({ type: 'BATCH_COMPLETE', id, error: '模型未就绪' });
      return;
    }

    const { texts } = event.data;
    const selectedVoice = voice || 'af_bella';

    try {
      for (let i = 0; i < texts.length; i++) {
        const rawAudio = await tts.generate(texts[i], { voice: selectedVoice });
        const { audioData, sampleRate } = extractAudioData(rawAudio);
        const copy = new Float32Array(audioData);

        self.postMessage({
          type: 'BATCH_ITEM',
          id,
          index: i,
          total: texts.length,
          audio: copy,
          sampling_rate: sampleRate,
        }, [copy.buffer]);
      }
      self.postMessage({ type: 'BATCH_COMPLETE', id });
    } catch (err) {
      self.postMessage({ type: 'BATCH_COMPLETE', id, error: err.message });
    }
  }
});
