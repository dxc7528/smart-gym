import React, { useContext, useEffect } from 'react';
import { AppContext } from '../App.jsx';
import useWorkoutPlayer from '../hooks/useWorkoutPlayer.js';

export default function WorkoutRunner({ planName, exercises, onClose }) {
  const { tts } = useContext(AppContext);
  const player = useWorkoutPlayer(tts);

  useEffect(() => {
    player.startWorkout(planName, exercises);
    return () => {
      player.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          {player.playerState === 'preparing' && '正在预生成音频...'}
          {player.playerState === 'playing' && `已合成 ${player.processedCount}/${player.totalCount} 段语音`}
          {player.playerState === 'paused' && '已暂停'}
          {player.playerState === 'complete' && '训练完成！'}
          {player.playerState === 'idle' && '已停止'}
        </div>
      </div>

      {/* 当前动作详情 */}
      {player.currentPhase?.exerciseName && (
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          动作 {(player.currentPhase.exerciseIndex ?? 0) + 1}/{player.currentPhase.totalExercises || exercises.length}
          {player.currentPhase.setIndex != null && (
            <span> · 第 {player.currentPhase.setIndex + 1}/{player.currentPhase.totalSets} 组</span>
          )}
          {player.currentPhase.repIndex != null && (
            <span> · 第 {player.currentPhase.repIndex + 1}/{player.currentPhase.totalReps} 次</span>
          )}
        </div>
      )}

      {/* 控制按钮 */}
      <div className="workout-controls">
        {player.playerState === 'playing' && (
          <button className="btn btn-secondary" onClick={player.pause}>
            ⏸ 暂停
          </button>
        )}
        {player.playerState === 'paused' && (
          <button className="btn btn-primary" onClick={player.resume}>
            ▶ 继续
          </button>
        )}
        {(player.playerState === 'playing' || player.playerState === 'paused' || player.playerState === 'preparing') && (
          <button className="btn btn-danger" onClick={() => { player.stop(); onClose(); }}>
            ⏹ 停止
          </button>
        )}
        {(player.playerState === 'complete' || player.playerState === 'idle') && (
          <button className="btn btn-ghost" onClick={onClose}>
            关闭
          </button>
        )}
      </div>
    </div>
  );
}
