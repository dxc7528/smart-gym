import React, { useContext } from 'react';
import { AppContext } from '../App.jsx';

export default function Sidebar() {
  const { plans, currentPlanId, selectPlan, setCurrentPlanId, page, setPage, refreshPlans } = useContext(AppContext);

  const handleNewPlan = () => {
    setCurrentPlanId(null);
    setPage('new');
  };

  return (
    <aside>
      <div className="sidebar-label">导航</div>
      <div
        className={`plan-item${page === 'plans' || page === 'new' ? ' active' : ''}`}
        onClick={() => { setPage('plans'); if (plans.length && !currentPlanId) selectPlan(plans[0].id); }}
      >
        <span className="plan-icon">📋</span>
        <span className="plan-name">训练计划</span>
      </div>
      <div
        className={`plan-item${page === 'howto' ? ' active' : ''}`}
        onClick={() => setPage('howto')}
      >
        <span className="plan-icon">📖</span>
        <span className="plan-name">使用说明</span>
      </div>

      <div className="sidebar-label" style={{ marginTop: 12 }}>我的计划</div>
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
        <span>＋</span> 新建计划
      </button>
    </aside>
  );
}
