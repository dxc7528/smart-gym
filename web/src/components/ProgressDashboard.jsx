import React, { useMemo } from 'react';
import { getAllReports } from '../store/reportsStore.js';
import { getAllPlans } from '../store/plansStore.js';
import { t } from '../utils/i18n.js';

export default function ProgressDashboard({ lang = 'en' }) {
  const reports = useMemo(() => getAllReports(), []);
  const plans = useMemo(() => getAllPlans(), []);

  // Calculate stats
  const totalWorkouts = reports.length;
  const totalExercises = reports.reduce((acc, r) => acc + (r.exercises?.length || 0), 0);
  const avgCompletion = totalWorkouts > 0
    ? Math.round(reports.reduce((acc, r) => acc + (r.completion_pct || 0), 0) / totalWorkouts)
    : 0;

  // Calculate streak (consecutive days with workouts)
  const streak = useMemo(() => {
    if (reports.length === 0) return 0;
    const today = new Date().toISOString().split('T')[0];
    const dates = [...new Set(reports.map(r => r.date))].sort().reverse();
    let count = 0;
    let current = new Date(today);
    for (const date of dates) {
      const d = new Date(date);
      const diff = Math.floor((current - d) / (1000 * 60 * 60 * 24));
      if (diff <= 1) {
        count++;
        current = d;
      } else {
        break;
      }
    }
    return count;
  }, [reports]);

  // Get best completion
  const bestCompletion = totalWorkouts > 0
    ? Math.max(...reports.map(r => r.completion_pct || 0))
    : 0;

  const statCards = [
    {
      icon: '🔥',
      value: streak,
      label: t(lang, 'statStreak'),
      accent: 'accent-orange',
      change: streak > 0 ? '+1' : null,
      changeType: 'up',
    },
    {
      icon: '💪',
      value: totalWorkouts,
      label: t(lang, 'statWorkouts'),
      accent: 'accent-cyan',
      change: totalWorkouts > 0 ? `+${Math.min(totalWorkouts, 1)}` : null,
      changeType: 'up',
    },
    {
      icon: '⚡',
      value: totalExercises,
      label: t(lang, 'statExercises'),
      accent: 'accent-lime',
      change: null,
    },
    {
      icon: '🎯',
      value: `${avgCompletion}%`,
      label: t(lang, 'statAvgCompletion'),
      accent: 'accent-warning',
      change: bestCompletion > 0 ? `Best: ${bestCompletion}%` : null,
      changeType: 'up',
    },
  ];

  const flames = [];
  for (let i = 0; i < 7; i++) {
    flames.push(
      <span key={i} className={`streak-flame ${i < streak ? 'active' : 'inactive'}`}>
        🔥
      </span>
    );
  }

  return (
    <div className="progress-section">
      {/* Streak Banner */}
      <div className="streak-container">
        <div className="streak-flames">{flames}</div>
        <div className="streak-info">
          <div className="streak-title">
            {streak > 0 ? `${streak} Day Streak!` : t(lang, 'streakTitle')}
          </div>
          <div className="streak-subtitle">{t(lang, 'streakSubtitle')}</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="progress-dashboard">
        {statCards.map((stat, idx) => (
          <div key={idx} className={`stat-card ${stat.accent}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            {stat.change && (
              <div className={`stat-change ${stat.changeType}`}>
                {stat.changeType === 'up' ? '↑' : '↓'} {stat.change}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
