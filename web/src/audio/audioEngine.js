/**
 * audioEngine.js — Web Audio API 播放引擎
 * 管理 AudioContext 生命周期，支持队列式播放和控制
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.queue = [];
    this.isPlaying = false;
    this.isPaused = false;
    this.currentSource = null;
    this.currentStartTime = 0;
    this.currentOffset = 0;
    this.currentBuffer = null;
    this.onStateChange = null;
    this._aborted = false;
  }

  async _ensureContext() {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx;
  }

  get sampleRate() {
    return this.ctx?.sampleRate ?? 24000;
  }

  /**
   * 重置中止标记（在新播放会话开始前调用）
   */
  resetAbort() {
    this._aborted = false;
  }

  /**
   * 播放一段 Float32Array 音频数据
   * @param {Float32Array} audioData
   * @param {number} sampleRate - 原始采样率
   * @returns {Promise<void>} 播放完成的 Promise
   */
  async playBuffer(audioData, sampleRate = 24000) {
    if (this._aborted) {
      return;
    }

    // 验证音频数据
    if (!audioData || !(audioData instanceof Float32Array) || audioData.length === 0) {
      console.warn('audioEngine.playBuffer: 无效的音频数据, 跳过');
      return;
    }

    const ctx = await this._ensureContext();

    return new Promise((resolve) => {
      if (this._aborted) {
        resolve();
        return;
      }

      try {
        const buffer = ctx.createBuffer(1, audioData.length, sampleRate);
        buffer.copyToChannel(audioData, 0);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);

        this.currentSource = source;
        this.currentBuffer = buffer;
        this.currentStartTime = ctx.currentTime;
        this.currentOffset = 0;

        source.onended = () => {
          this.currentSource = null;
          resolve();
        };

        source.start(0);
      } catch (err) {
        console.error('audioEngine.playBuffer error:', err);
        resolve(); // 不要阻塞后续播放
      }
    });
  }

  /**
   * 将一段音频加入播放队列
   * @param {Float32Array} audioData
   * @param {number} sampleRate
   */
  enqueue(audioData, sampleRate = 24000) {
    this.queue.push({ audioData, sampleRate });
    if (!this.isPlaying) {
      this._processQueue();
    }
  }

  async _processQueue() {
    this.isPlaying = true;
    this._aborted = false;

    while (this.queue.length > 0 && !this._aborted) {
      if (this.isPaused) {
        await new Promise(resolve => {
          this._resumeCallback = resolve;
        });
      }
      if (this._aborted) break;

      const { audioData, sampleRate } = this.queue.shift();
      await this.playBuffer(audioData, sampleRate);
    }

    this.isPlaying = false;
    this.onStateChange?.('idle');
  }

  pause() {
    this.isPaused = true;
    if (this.ctx) {
      this.ctx.suspend();
    }
    this.onStateChange?.('paused');
  }

  resume() {
    this.isPaused = false;
    if (this.ctx) {
      this.ctx.resume();
    }
    this._resumeCallback?.();
    this.onStateChange?.('playing');
  }

  stop() {
    this._aborted = true;
    this.isPaused = false;
    this.queue = [];
    if (this.currentSource) {
      try { this.currentSource.stop(); } catch {}
      this.currentSource = null;
    }
    this._resumeCallback?.();
    this.isPlaying = false;
    this.onStateChange?.('idle');
  }

  destroy() {
    this.stop();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// 单例
const audioEngine = new AudioEngine();
export default audioEngine;
