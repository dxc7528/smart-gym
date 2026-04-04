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

  _ensureContext() {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  get sampleRate() {
    return this._ensureContext().sampleRate;
  }

  /**
   * 播放一段 Float32Array 音频数据
   * @param {Float32Array} audioData
   * @param {number} sampleRate - 原始采样率
   * @returns {Promise<void>} 播放完成的 Promise
   */
  playBuffer(audioData, sampleRate = 24000) {
    return new Promise((resolve, reject) => {
      if (this._aborted) {
        resolve();
        return;
      }

      const ctx = this._ensureContext();
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
