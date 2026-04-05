import React, { useContext } from 'react';
import { AppContext } from '../App.jsx';
import { t } from '../utils/i18n.js';

function HowToEN({ setPage }) {
  return (
    <>
      <a className="back-link" href="#" onClick={e => { e.preventDefault(); setPage('plans'); }}>
        ← Workout Plans
      </a>

      <h1>📖 Parameters Guide</h1>
      <div className="intro-banner">
        <p>❌ No more counting seconds in your head while struggling to hold a pose.</p>
        <p>❌ No more losing track of which set you're on mid-workout.</p>
        <p>❌ No more guessing the right tempo and giving up on proper form.</p>
        <p>✅ <strong>This app talks you through every rep</strong> — audio cues tell you exactly when to push, hold, and lower, so you can stay locked in on muscle contraction instead of watching the clock.</p>
      </div>
      <p className="page-desc">Understand each training parameter to scientifically design your workout rhythm.</p>

      {/* Sets */}
      <div className="param-section">
        <div className="param-header">
          <div className="param-icon">🔁</div>
          <div>
            <div className="param-title">Sets <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>sets</code></div>
          </div>
          <span className="param-tag">Integer</span>
        </div>
        <div className="param-card">
          <p>The <strong>total number of sets</strong> to complete. Rest is required between sets.</p>
          <p>Beginners usually start with <strong>3 sets</strong>; advanced lifters may go up to 4–5 sets.</p>
          <div className="example-row">
            <span className="ex-label">Example</span>
            <span className="ex-val">3 Sets</span>
            <span style={{ color: 'var(--text-muted)' }}>→ Complete a set, rest, and repeat 3 times in total.</span>
          </div>
        </div>
      </div>

      {/* Reps */}
      <div className="param-section">
        <div className="param-header">
          <div className="param-icon">💪</div>
          <div>
            <div className="param-title">Reps <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>reps</code></div>
          </div>
          <span className="param-tag">Integer</span>
        </div>
        <div className="param-card">
          <p>The <strong>number of repetitions</strong> within each set. The rep range varies by goal:</p>
          <p>
            <strong>1–5 Reps</strong>: Maximum Strength&nbsp;
            <strong>6–12 Reps</strong>: Hypertrophy (Muscle Gain)&nbsp;
            <strong>15–30 Reps</strong>: Endurance / Toning
          </p>
          <div className="example-row">
            <span className="ex-label">Example</span>
            <span className="ex-val">12 Reps</span>
            <span style={{ color: 'var(--text-muted)' }}>→ Perform 12 complete movements continuously per set.</span>
          </div>
        </div>
      </div>

      {/* Rest */}
      <div className="param-section">
        <div className="param-header">
          <div className="param-icon">⏱</div>
          <div>
            <div className="param-title">Rest <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>rest</code></div>
          </div>
          <span className="param-tag">Seconds</span>
        </div>
        <div className="param-card">
          <p>The <strong>rest time in seconds</strong> between sets. Rest duration affects training outcomes:</p>
          <p>
            <strong>30–60s</strong>: Supersets / Conditioning&nbsp;
            <strong>60–90s</strong>: Standard Hypertrophy&nbsp;
            <strong>2–5 mins</strong>: Max Strength
          </p>
          <p>In the final 10 seconds, the audio will play a countdown to remind you to get ready.</p>
          <div className="example-row">
            <span className="ex-label">Example</span>
            <span className="ex-val">90s</span>
            <span style={{ color: 'var(--text-muted)' }}>→ Approximately 1.5 minutes of rest.</span>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* Tempo */}
      <div className="param-section">
        <div className="param-header">
          <div className="param-icon">🎵</div>
          <div>
            <div className="param-title">Tempo <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>tempo</code></div>
          </div>
          <span className="param-tag">Three Numbers</span>
        </div>
        <div className="param-card">
          <p>Tempo controls the <strong>time rhythm</strong> of each repetition, formatted as three numbers:</p>
          <p style={{ textAlign: 'center', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.1em', margin: '12px 0' }}>
            <span style={{ color: 'var(--accent)' }}>Push</span>
            <span style={{ color: 'var(--text-muted)' }}> — </span>
            <span style={{ color: 'var(--warning)' }}>Hold</span>
            <span style={{ color: 'var(--text-muted)' }}> — </span>
            <span style={{ color: 'var(--blue)' }}>Down</span>
          </p>

          <p><strong style={{ color: 'var(--accent)' }}>① Push (Concentric)</strong>: Muscle shortens, overcoming resistance.<br />E.g., pushing up in a push-up, pulling up in a pull-up.</p>
          <p><strong style={{ color: 'var(--warning)' }}>② Hold (Isometric)</strong>: Briefly pausing at the peak to enhance mind-muscle connection.<br />Enter <strong>0</strong> for no pause.</p>
          <p><strong style={{ color: 'var(--blue)' }}>③ Down (Eccentric)</strong>: Muscle lengthening under resistance back to the starting position.<br />The eccentric phase is <strong>more important than the concentric phase</strong>—a slow negative produces greater muscle damage (→ more growth) and protects joints.</p>

          <p style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Example: <strong>tempo = [2, 1, 3]</strong> (Triceps Dips):</p>
          <div className="tempo-timeline">
            <div className="tempo-phase phase-concentric">
              <div className="phase-secs">2s</div>
              <div className="phase-name">Push</div>
            </div>
            <div className="tempo-phase phase-isometric">
              <div className="phase-secs">1s</div>
              <div className="phase-name">Peak Hold</div>
            </div>
            <div className="tempo-phase phase-eccentric">
              <div className="phase-secs">3s</div>
              <div className="phase-name">Slow Negative</div>
            </div>
          </div>

          <p style={{ marginTop: 16 }}>
            Calculated audio prompts play at the start of each phase (<strong>"Push" / "Hold" / "Down"</strong>), along with a <strong>Tick</strong> sound every second during the eccentric phase. This allows your brain to focus entirely on muscle contraction, without needing to silently count seconds.
          </p>

          <div className="example-row" style={{ marginTop: 12 }}>
            <span className="ex-label">Push-ups</span>
            <span className="ex-val">[2, 1, 2]</span>
            <span style={{ color: 'var(--text-muted)' }}>→ 2s Push · 1s Peak · 2s Down</span>
          </div>
        </div>
      </div>
    </>
  );
}

function HowToJA({ setPage }) {
  return (
    <>
      <a className="back-link" href="#" onClick={e => { e.preventDefault(); setPage('plans'); }}>
        ← プランに戻る
      </a>

      <h1>📖 パラメータの説明</h1>
      <div className="intro-banner">
        <p>❌ ポーズ保持中に秒を数えるのに必死…</p>
        <p>❌ 今が何セット目か分からなくなる…</p>
        <p>❌ 正しいテンポがわからずフォームが雑になる…</p>
        <p>✅ <strong>このアプリがテンポを音声で誘導</strong> — 「上げて／止めて／下ろして」の音声ガイドが的確な動きを诱导し、時計を見る代わりに筋肉の動きに集中できます。</p>
      </div>
      <p className="page-desc">各トレーニングパラメータの意味を理解し、効果的なリズムを設計しましょう。</p>

      {/* Sets */}
      <div className="param-section">
        <div className="param-header">
          <div className="param-icon">🔁</div>
          <div>
            <div className="param-title">セット数 <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>sets</code></div>
          </div>
          <span className="param-tag">整数</span>
        </div>
        <div className="param-card">
          <p>種目を実行する<strong>合計セット数</strong>です。セット間には休憩が必要です。</p>
          <p>初心者は通常 <strong>3 セット</strong>から始めます。</p>
        </div>
      </div>

      {/* Reps */}
      <div className="param-section">
        <div className="param-header">
          <div className="param-icon">💪</div>
          <div>
            <div className="param-title">回数 <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>reps</code></div>
          </div>
          <span className="param-tag">整数</span>
        </div>
        <div className="param-card">
          <p>1セット内で動作を反復する<strong>回数（レップ数）</strong>です。</p>
          <p>
            <strong>1–5 回</strong>: 最大筋力&nbsp;
            <strong>6–12 回</strong>: 筋肥大&nbsp;
            <strong>15–30 回</strong>: 筋持久力
          </p>
        </div>
      </div>

      {/* Rest */}
      <div className="param-section">
        <div className="param-header">
          <div className="param-icon">⏱</div>
          <div>
            <div className="param-title">休憩 <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>rest</code></div>
          </div>
          <span className="param-tag">秒</span>
        </div>
        <div className="param-card">
          <p>セット間の<strong>休憩時間（秒）</strong>です。最後の10秒間にはカウントダウン音声が流れます。</p>
        </div>
      </div>

      <hr className="divider" />

      {/* Tempo */}
      <div className="param-section">
        <div className="param-header">
          <div className="param-icon">🎵</div>
          <div>
            <div className="param-title">テンポ <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>tempo</code></div>
          </div>
          <span className="param-tag">3つの数字</span>
        </div>
        <div className="param-card">
          <p>テンポは反復時の<strong>時間的リズム</strong>を制御し、3つの数字で指定します：</p>
          <p style={{ textAlign: 'center', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.1em', margin: '12px 0' }}>
            <span style={{ color: 'var(--accent)' }}>上げて</span>
            <span style={{ color: 'var(--text-muted)' }}> — </span>
            <span style={{ color: 'var(--warning)' }}>キープ</span>
            <span style={{ color: 'var(--text-muted)' }}> — </span>
            <span style={{ color: 'var(--blue)' }}>下ろして</span>
          </p>
          <p><strong style={{ color: 'var(--accent)' }}>① 上げて（短縮性）</strong>：筋肉が縮む段階。</p>
          <p><strong style={{ color: 'var(--warning)' }}>② キープ（等尺性）</strong>：ピーク位置での一時停止。<strong>0</strong>でそのまま次へ。</p>
          <p><strong style={{ color: 'var(--blue)' }}>③ 下ろして（伸張性）</strong>：筋肉が伸びる段階。ここでは<strong>ゆっくり下ろす</strong>ことが重要です。</p>
        </div>
      </div>
    </>
  );
}

function HowToZH({ setPage }) {
  return (
    <>
      <a className="back-link" href="#" onClick={e => { e.preventDefault(); setPage('plans'); }}>
        ← 返回训练计划
      </a>

      <h1>📖 参数说明</h1>
      <div className="intro-banner">
        <p>❌ 动作做到一半，还要分神默数秒数？</p>
        <p>❌ 记不清这组做完了没有，只能靠猜？</p>
        <p>❌ 不知道该怎么控制节奏，做的动作总像在赶时间？</p>
        <p>✅ 这个应用<strong>全程语音引导</strong>——什么时候发力、什么时候停顿、什么时候下放，都有语音提示。你只需要专注在肌肉发力和动作标准上，不用再看时钟。</p>
      </div>
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
    </>
  );
}

export default function HowToPage() {
  const { setPage, lang } = useContext(AppContext);

  return (
    <div className="how-to-main">
      {lang === 'en' ? <HowToEN setPage={setPage} /> : lang === 'ja' ? <HowToJA setPage={setPage} /> : <HowToZH setPage={setPage} />}
    </div>
  );
}
