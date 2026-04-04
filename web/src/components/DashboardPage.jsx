import React, { useMemo } from 'react';
import { getAllReports } from '../store/reportsStore.js';
import { t } from '../utils/i18n.js';
import ProgressDashboard from './ProgressDashboard.jsx';
import WorkoutPreviewCard from './WorkoutPreviewCard.jsx';

export default function DashboardPage({ plans, currentPlanId, selectPlan, reports, lang }) {
  return (
    <div className="dashboard-page">
      {/* Motivational Banner */}
      <div className="motivational-banner">
        <div className="banner-content">
          <div className="banner-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            {t(lang, 'motivationalTitle')}
          </div>
          <h2 className="banner-title">
            {t(lang, 'motivationalSubtitle')}
          </h2>
        </div>
      </div>

      {/* Progress Dashboard */}
      <ProgressDashboard lang={lang} />

      {/* Workout Preview Cards */}
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <span className="section-title">{t(lang, 'workoutPreview')}</span>
      </div>
      <div className="workout-preview-grid">
        {plans.map(plan => (
          <WorkoutPreviewCard
            key={plan.id}
            plan={plan}
            isActive={plan.id === currentPlanId}
            onClick={() => selectPlan(plan.id)}
            reports={reports}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}
