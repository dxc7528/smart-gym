import React, { useMemo } from 'react';
import { getAllReports } from '../store/reportsStore.js';
import { t } from '../utils/i18n.js';

function getIntensityLevel(exercises) {
  // Calculate intensity based on total volume (sets * reps)
  const totalVolume = exercises.reduce((acc, ex) => {
    const sets = ex.sets || 0;
    const reps = ex.reps || 0;
    return acc + (sets * reps);
  }, 0);

  if (totalVolume > 100) return 'high';
  if (totalVolume > 50) return 'medium';
  return 'low';
}

function formatDuration(exercises) {
  // Estimate duration based on exercises
  let totalSeconds = 0;
  exercises.forEach(ex => {
    const sets = ex.sets || 0;
    const reps = ex.reps || 0;
    const rest = ex.rest || 60;
    const transitionRest = ex.transition_rest || 120;
    // Time per set = reps * 3 seconds (estimated) + rest
    const timePerSet = (reps * 3) + rest;
    totalSeconds += (sets * timePerSet) + transitionRest;
  });

  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours}h ${remainingMins}m`;
}

export default function WorkoutPreviewCard({ plan, isActive, onClick, reports = [], lang = 'en' }) {
  const { id, name, exercises = [] } = plan;

  const intensity = useMemo(() => getIntensityLevel(exercises), [exercises]);
  const duration = useMemo(() => formatDuration(exercises), [exercises]);
  const totalSets = exercises.reduce((acc, ex) => acc + (ex.sets || 0), 0);
  const totalExercises = exercises.length;

  // Get latest completion for this plan
  const latestReport = useMemo(() => {
    return reports
      .filter(r => r.plan_id === id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  }, [reports, id]);

  const completionPct = latestReport?.completion_pct || 0;
  const lastDate = latestReport?.date
    ? new Date(latestReport.date).toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'zh' ? 'zh-CN' : 'ja-JP')
    : t(lang, 'notYetCompleted');

  const intensityColors = {
    high: 'intensity-high',
    medium: 'intensity-medium',
    low: 'intensity-low',
  };

  const intensityLabels = {
    high: t(lang, 'intensityHigh'),
    medium: t(lang, 'intensityMedium'),
    low: t(lang, 'intensityLow'),
  };

  return (
    <div
      className={`workout-preview-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <div className="workout-preview-header">
        <h3 className="workout-preview-title">{name}</h3>
        <span className={`workout-preview-badge ${intensityColors[intensity]}`}>
          {intensityLabels[intensity]}
        </span>
      </div>

      <div className="workout-preview-body">
        <div className="workout-preview-stats">
          <div className="preview-stat">
            <div className="preview-stat-value">{totalExercises}</div>
            <div className="preview-stat-label">{t(lang, 'exercises')}</div>
          </div>
          <div className="preview-stat">
            <div className="preview-stat-value">{totalSets}</div>
            <div className="preview-stat-label">{t(lang, 'sets')}</div>
          </div>
          <div className="preview-stat">
            <div className="preview-stat-value">{duration}</div>
            <div className="preview-stat-label">{t(lang, 'duration')}</div>
          </div>
        </div>

        <div className="workout-preview-exercises">
          {exercises.slice(0, 4).map((ex, idx) => (
            <span key={idx} className="exercise-tag">{ex.name || t(lang, 'unnamedExercise')}</span>
          ))}
          {exercises.length > 4 && (
            <span className="exercise-tag">+{exercises.length - 4}</span>
          )}
        </div>
      </div>

      <div className="workout-preview-footer">
        <span className="workout-preview-date">{lastDate}</span>
        <div className="workout-preview-progress">
          <div className="progress-mini-bar">
            <div
              className="progress-mini-fill"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <span className="progress-mini-text">{completionPct}%</span>
        </div>
      </div>
    </div>
  );
}
