import React, { useContext } from 'react';
import { AppContext } from '../App.jsx';

export default function HowToPage() {
  const { setPage } = useContext(AppContext);

  return (
    <div className="how-to-main">
      <a className="back-link" href="#" onClick={e => { e.preventDefault(); setPage('plans'); }}>
        ← 返回训练计划
      </a>

      <h1>📖 参数说明</h1>
      <p className="page-desc">了解每个训练参数的含义，帮助你科学设计动作节奏。</p>

      {/* 组数 */}
      <div className="param-section">
        <div className="param-header">
          <div className="param-icon">🔁</div>
          <div>
            <div className="param-title">组数 <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>sets</code></div>
          </div>
          <span className="param-tag">整数</span>
        </div>
        <div className="param-card">
          <p>完成该动作的<strong>总组数</strong>。每组之间需要休息（见"组间休息"）。</p>
          <p>新手一般从 <strong>3 组</strong>开始；力量训练高级阶段可达 4–5 组。</p>
          <div className="example-row">
            <span className="ex-label">示例</span>
            <span className="ex-val">3 组</span>
            <span style={{ color: 'var(--text-muted)' }}>→ 做完一组，休息，再做，共重复 3 次</span>
          </div>
        </div>
      </div>

      {/* 次数 */}
      <div className="param-section">
        <div className="param-header">
          <div className="param-icon">💪</div>
          <div>
            <div className="param-title">次数 <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>reps</code></div>
          </div>
          <span className="param-tag">整数</span>
        </div>
        <div className="param-card">
          <p>每组内完成动作的<strong>重复次数</strong>。次数区间与训练目标有关：</p>
          <p>
            <strong>1–5 次</strong>：最大力量&nbsp;
            <strong>6–12 次</strong>：增肌&nbsp;
            <strong>15–30 次</strong>：肌耐力 / 轻重量形体塑造
          </p>
          <div className="example-row">
            <span className="ex-label">示例</span>
            <span className="ex-val">12 次</span>
            <span style={{ color: 'var(--text-muted)' }}>→ 每组连续做 12 个完整动作</span>
          </div>
        </div>
      </div>

      {/* 组间休息 */}
      <div className="param-section">
        <div className="param-header">
          <div className="param-icon">⏱</div>
          <div>
            <div className="param-title">组间休息 <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>rest</code></div>
          </div>
          <span className="param-tag">秒</span>
        </div>
        <div className="param-card">
          <p>每组完成后，下一组开始前的<strong>休息秒数</strong>。休息时长影响训练效果：</p>
          <p>
            <strong>30–60 秒</strong>：超级组 / 体能训练&nbsp;
            <strong>60–90 秒</strong>：增肌常规&nbsp;
            <strong>2–5 分钟</strong>：最大力量
          </p>
          <p>在最后 10 秒，音频会播放倒计时提示，提醒你准备下一组。</p>
          <div className="example-row">
            <span className="ex-label">示例</span>
            <span className="ex-val">90 秒</span>
            <span style={{ color: 'var(--text-muted)' }}>→ 约 1.5 分钟组间休息</span>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* Tempo */}
      <div className="param-section">
        <div className="param-header">
          <div className="param-icon">🎵</div>
          <div>
            <div className="param-title">动作节奏 <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>tempo</code></div>
          </div>
          <span className="param-tag">三个数字</span>
        </div>
        <div className="param-card">
          <p>Tempo 控制每次重复的<strong>时间节奏</strong>，格式为三个数字：</p>
          <p style={{ textAlign: 'center', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.1em', margin: '12px 0' }}>
            <span style={{ color: 'var(--accent)' }}>发力</span>
            <span style={{ color: 'var(--text-muted)' }}> — </span>
            <span style={{ color: 'var(--warning)' }}>停顿</span>
            <span style={{ color: 'var(--text-muted)' }}> — </span>
            <span style={{ color: 'var(--blue)' }}>复原</span>
          </p>

          <p><strong style={{ color: 'var(--accent)' }}>① 发力（向心收缩）</strong>：肌肉缩短、克服阻力的阶段。<br />例如俯卧撑向上推起、引体向上拉身体、举起哑铃。</p>
          <p><strong style={{ color: 'var(--warning)' }}>② 停顿（等长收缩）</strong>：在顶峰位置短暂静止，增强神经-肌肉连接。<br />填 <strong>0</strong> 表示无停顿，直接进入复原。</p>
          <p><strong style={{ color: 'var(--blue)' }}>③ 复原（离心收缩）</strong>：肌肉在抗阻力下缓慢伸长回到起始位。<br />离心阶段<strong>比发力更重要</strong>——慢速复原可产生更大的肌肉损伤（→ 更多增肌刺激），也保护关节。</p>

          <p style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>以 <strong>tempo = [2, 1, 3]</strong> 为例（双杠臂屈伸）：</p>
          <div className="tempo-timeline">
            <div className="tempo-phase phase-concentric">
              <div className="phase-secs">2s</div>
              <div className="phase-name">发力（推起）</div>
            </div>
            <div className="tempo-phase phase-isometric">
              <div className="phase-secs">1s</div>
              <div className="phase-name">顶峰停顿</div>
            </div>
            <div className="tempo-phase phase-eccentric">
              <div className="phase-secs">3s</div>
              <div className="phase-name">缓慢复原</div>
            </div>
          </div>

          <p style={{ marginTop: 16 }}>
            音频引导会在每个阶段起点播放语音（<strong>"推起" / "停" / "下放"</strong>），
            并在复原阶段的每整秒播放一声 <strong>Tick</strong>，让大脑专注于发力，无需默默数秒。
          </p>

          <div className="example-row" style={{ marginTop: 12 }}>
            <span className="ex-label">手把俯卧撑</span>
            <span className="ex-val">[2, 1, 2]</span>
            <span style={{ color: 'var(--text-muted)' }}>→ 2s 推起 · 1s 顶峰 · 2s 缓降</span>
          </div>
          <div className="example-row">
            <span className="ex-label">悬垂举腿</span>
            <span className="ex-val">[1, 1, 2]</span>
            <span style={{ color: 'var(--text-muted)' }}>→ 1s 抬腿 · 1s 顶峰 · 2s 缓放</span>
          </div>
          <div className="example-row">
            <span className="ex-label">侧平举</span>
            <span className="ex-val">[1, 1, 3]</span>
            <span style={{ color: 'var(--text-muted)' }}>→ 1s 举起 · 1s 顶峰 · 3s 缓降（肩部保护）</span>
          </div>
        </div>
      </div>
    </div>
  );
}
