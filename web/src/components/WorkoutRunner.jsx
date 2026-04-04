import React, { useContext, useEffect } from 'react';
import { AppContext } from '../App.jsx';
import useWorkoutPlayer from '../hooks/useWorkoutPlayer.js';
import { t } from '../utils/i18n.js';

export default function WorkoutRunner({ planName, exercises, onClose }) {
  const { tts, lang } = useContext(AppContext);
  const player = useWorkoutPlayer({ ...tts, audioLang: lang, lang });

  // 仅在组件挂载时启动一次，cleanup 在卸载时停止
  useEffect(() => {
    console.log('[WR] useEffect fired');
    // 依赖 workoutSeqRef 序列号机制来处理 StrictMode，不在这里用 ref 拦截
    console.log('[WR] calling startWorkout');
    player.startWorkout(planName, exercises);
    return () => {
      console.log('[WR] cleanup: calling stop');
      player.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressPct = player.totalCount > 0
    ? Math.round((player.processedCount / player.totalCount) * 100)
    : 0;

  return (
    <div className="workout-runner">
      {/* 阶段标签 */}
      <div className="workout-phase-label">
        {player.currentPhase?.label || '准备中...'}
      </div>

      {/* 进度条 */}
      <div className="workout-progress">
        <div className="workout-progress-bar">
          <div className="workout-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="workout-progress-text">
          {player.playerState === 'preparing' && t(lang, 'preparing')}
          {player.playerState === 'playing' && t(lang, 'audioProgress', { processed: player.processedCount, total: player.totalCount })}
          {player.playerState === 'paused' && t(lang, 'paused')}
          {player.playerState === 'complete' && t(lang, 'complete')}
          {player.playerState === 'idle' && t(lang, 'stopped')}
        </div>
      </div>

      {/* 当前动作详情 */}
      {player.currentPhase?.exerciseName && (
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {t(lang, 'exerciseStatus', { current: (player.currentPhase.exerciseIndex ?? 0) + 1, total: player.currentPhase.totalExercises || exercises.length })}
          {player.currentPhase.setIndex != null && (
            <span> · {t(lang, 'setStatus', { current: player.currentPhase.setIndex + 1, total: player.currentPhase.totalSets })}</span>
          )}
          {player.currentPhase.repIndex != null && (
            <span> · {t(lang, 'repStatus', { current: player.currentPhase.repIndex + 1, total: player.currentPhase.totalReps })}</span>
          )}
        </div>
      )}

      {/* 控制按钮 */}
      <div className="workout-controls">
        {player.playerState === 'playing' && (
          <button className="btn btn-secondary" onClick={player.pause}>
            {t(lang, 'btnPause')}
          </button>
        )}
        {player.playerState === 'paused' && (
          <button className="btn btn-primary" onClick={player.resume}>
            {t(lang, 'btnResume')}
          </button>
        )}
        {(player.playerState === 'playing' || player.playerState === 'paused' || player.playerState === 'preparing') && (
          <button className="btn btn-danger" onClick={() => { player.stop(); onClose(); }}>
            {t(lang, 'btnStop')}
          </button>
        )}
        {(player.playerState === 'complete' || player.playerState === 'idle') && (
          <button className="btn btn-ghost" onClick={onClose}>
            {t(lang, 'close')}
          </button>
        )}
      </div>

      {/* 跳转控制 */}
      {(player.playerState === 'playing' || player.playerState === 'paused') && (
        <div className="workout-seek-controls" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => player.seekTo('exercise', 'prev')}>
            {t(lang, 'seekPrevEx')}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => player.seekTo('set', 'prev')}>
            {t(lang, 'seekPrevSet')}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => player.seekTo('set', 'next')}>
            {t(lang, 'seekNextSet')}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => player.seekTo('exercise', 'next')}>
            {t(lang, 'seekNextEx')}
          </button>
        </div>
      )}
    </div>
  );
}
