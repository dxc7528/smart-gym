import React, { useContext } from 'react';
import { AppContext } from '../App.jsx';
import { t } from '../utils/i18n.js';

export default function Sidebar() {
  const { plans, currentPlanId, selectPlan, setCurrentPlanId, page, setPage, refreshPlans, lang } = useContext(AppContext);

  const handleNewPlan = () => {
    setCurrentPlanId(null);
    setPage('new');
  };

  return (
    <aside>
      <div className="sidebar-label">{t(lang, 'navLabel')}</div>
      <div
        className={`plan-item${page === 'plans' || page === 'new' ? ' active' : ''}`}
        onClick={() => { setPage('plans'); if (plans.length && !currentPlanId) selectPlan(plans[0].id); }}
      >
        <span className="plan-icon">📋</span>
        <span className="plan-name">{t(lang, 'navPlans')}</span>
      </div>
      <div
        className={`plan-item${page === 'howto' ? ' active' : ''}`}
        onClick={() => setPage('howto')}
      >
        <span className="plan-icon">📖</span>
        <span className="plan-name">{t(lang, 'howToUse')}</span>
      </div>

      <div className="sidebar-label" style={{ marginTop: 12 }}>{t(lang, 'myPlansLabel')}</div>
      {plans.map(plan => (
        <div
          key={plan.id}
          className={`plan-item${plan.id === currentPlanId && page === 'plans' ? ' active' : ''}`}
          onClick={() => selectPlan(plan.id)}
        >
          <span className="plan-icon">📋</span>
          <span className="plan-name" title={plan.name}>{plan.name}</span>
        </div>
      ))}

      <button className="btn-new-plan" onClick={handleNewPlan}>
        <span>＋</span> {t(lang, 'newPlan')}
      </button>
    </aside>
  );
}
