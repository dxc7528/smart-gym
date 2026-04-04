import React, { useContext } from 'react';
import { AppContext } from '../App.jsx';
import { t } from '../utils/i18n.js';

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const PlanIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 5v14M18 5v14M6 12h12M3 5h18M3 19h18"/>
  </svg>
);

const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export default function Sidebar() {
  const { plans, currentPlanId, selectPlan, setCurrentPlanId, page, setPage, lang } = useContext(AppContext);

  const handleNewPlan = () => {
    setCurrentPlanId(null);
    setPage('plans');
  };

  return (
    <aside>
      <div className="sidebar-label">{t(lang, 'navLabel')}</div>
      <div
        className={`plan-item${page === 'dashboard' ? ' active' : ''}`}
        onClick={() => setPage('dashboard')}
      >
        <span className="plan-icon"><DashboardIcon /></span>
        <span className="plan-name">{t(lang, 'navDashboard')}</span>
      </div>
      <div
        className={`plan-item${page === 'plans' || page === 'new' ? ' active' : ''}`}
        onClick={() => { setPage('plans'); if (plans.length && !currentPlanId) selectPlan(plans[0].id); }}
      >
        <span className="plan-icon"><PlanIcon /></span>
        <span className="plan-name">{t(lang, 'navPlans')}</span>
      </div>
      <div
        className={`plan-item${page === 'howto' ? ' active' : ''}`}
        onClick={() => setPage('howto')}
      >
        <span className="plan-icon"><HelpIcon /></span>
        <span className="plan-name">{t(lang, 'howToUse')}</span>
      </div>

      <div className="sidebar-label" style={{ marginTop: 12 }}>{t(lang, 'myPlansLabel')}</div>
      {plans.map(plan => (
        <div
          key={plan.id}
          className={`plan-item${plan.id === currentPlanId && page === 'plans' ? ' active' : ''}`}
          onClick={() => selectPlan(plan.id)}
        >
          <span className="plan-icon"><PlanIcon /></span>
          <span className="plan-name" title={plan.name}>{plan.name}</span>
        </div>
      ))}

      <button className="btn-new-plan" onClick={handleNewPlan}>
        <PlusIcon /> {t(lang, 'newPlan')}
      </button>
    </aside>
  );
}
