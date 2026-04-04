/**
 * soundEffects.js — 程序化生成音效（替代 pydub）
 * 使用 Web Audio API 的 OscillatorNode 生成 beep / tick / silence
 */

/**
 * 创建指定频率和时长的正弦波音频数据 (Float32Array)
 * @param {number} freq - 频率 (Hz)  
 * @param {number} duration - 时长 (秒)
 * @param {number} sampleRate - 采样率
 * @param {number} gain - 音量增益 (0~1)
 * @returns {Float32Array}
 */
export function generateTone(freq, duration, sampleRate = 24000, gain = 0.3) {
  const length = Math.floor(sampleRate * duration);
  const buffer = new Float32Array(length);
  const fadeLength = Math.min(Math.floor(sampleRate * 0.005), length); // 5ms fade

  for (let i = 0; i < length; i++) {
    let sample = Math.sin(2 * Math.PI * freq * i / sampleRate) * gain;

    // 淡入
    if (i < fadeLength) {
      sample *= i / fadeLength;
    }
    // 淡出
    if (i > length - fadeLength) {
      sample *= (length - i) / fadeLength;
    }

    buffer[i] = sample;
  }
  return buffer;
}

/**
 * 生成 Beep 提示音（用于休息倒计时）
 * @param {number} freq - 频率，默认 800Hz
 * @param {number} duration - 时长（秒），默认 0.2s
 * @param {number} sampleRate
 * @returns {Float32Array}
 */
export function generateBeep(freq = 800, duration = 0.2, sampleRate = 24000) {
  return generateTone(freq, duration, sampleRate, 0.25);
}

/**
 * 生成短促 Tick 声（用于 Rep 阶段节拍提示）
 * @param {number} sampleRate
 * @returns {Float32Array}
 */
export function generateTick(sampleRate = 24000) {
  return generateTone(1000, 0.03, sampleRate, 0.2);
}

/**
 * 生成静音段
 * @param {number} seconds - 时长
 * @param {number} sampleRate
 * @returns {Float32Array}
 */
export function generateSilence(seconds, sampleRate = 24000) {
  return new Float32Array(Math.floor(sampleRate * seconds));
}

/**
 * 拼接多段 Float32Array 音频
 * @param  {...Float32Array} buffers
 * @returns {Float32Array}
 */
export function concatAudio(...buffers) {
  const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);
  const result = new Float32Array(totalLength);
  let offset = 0;
  for (const buf of buffers) {
    result.set(buf, offset);
    offset += buf.length;
  }
  return result;
}
