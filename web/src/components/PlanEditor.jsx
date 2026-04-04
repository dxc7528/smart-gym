import React, { useState, useContext, useCallback } from 'react';
import { AppContext, ToastContext } from '../App.jsx';
import ExerciseCard from './ExerciseCard.jsx';
import AudioPanel from './AudioPanel.jsx';
import ReportModal from './ReportModal.jsx';
import { getPlan, createPlan, updatePlan, deletePlan as deletePlanStore } from '../store/plansStore.js';
import { t } from '../utils/i18n.js';

const DEFAULT_EXERCISE = {
  name: '',
  sets: 3,
  reps: 10,
  rest: 60,
  transition_rest: 120,
  tempo: [1, 1, 3],
};

export default function PlanEditor() {
  const { currentPlanId, selectPlan, refreshPlans, plans, setCurrentPlanId, setPage, lang } = useContext(AppContext);
  const showToast = useContext(ToastContext);

  const existingPlan = currentPlanId ? getPlan(currentPlanId) : null;

  const [name, setName] = useState(existingPlan?.name || '');
  const [exercises, setExercises] = useState(
    existingPlan?.exercises?.map(e => ({ ...DEFAULT_EXERCISE, ...e })) || []
  );
  const [saving, setSaving] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);

  const handleExerciseChange = useCallback((idx, updated) => {
    setExercises(prev => prev.map((ex, i) => i === idx ? updated : ex));
  }, []);

  const handleRemoveExercise = useCallback((idx) => {
    setExercises(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const handleAddExercise = () => {
    setExercises(prev => [...prev, { ...DEFAULT_EXERCISE }]);
  };

  const handleDragOver = useCallback((e, overIdx) => {
    if (dragIdx === null || dragIdx === overIdx) return;
    setExercises(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(overIdx, 0, moved);
      return next;
    });
    setDragIdx(overIdx);
  }, [dragIdx]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast('请填写计划名称', 'error');
      return;
    }
    setSaving(true);
    try {
      let saved;
      if (currentPlanId) {
        saved = updatePlan(currentPlanId, trimmedName, exercises);
        if (!saved) throw new Error('Plan does not exist');
      } else {
        saved = createPlan(trimmedName, exercises);
      }
      refreshPlans();
      selectPlan(saved.id);
      showToast(t(lang, 'planSaveSuccess'));
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!currentPlanId) return;
    if (!confirm(t(lang, 'planDeleteConfirm', { name: existingPlan?.name }))) return;
    deletePlanStore(currentPlanId);
    refreshPlans();
    const remaining = plans.filter(p => p.id !== currentPlanId);
    if (remaining.length > 0) {
      selectPlan(remaining[0].id);
    } else {
      setCurrentPlanId(null);
      setPage('plans');
    }
    showToast(t(lang, 'planDeleted'));
  };

  return (
    <div className="plan-editor">
      {/* 标题 + 操作按钮 */}
      <div className="plan-header">
        <input
          type="text"
          className="plan-title-input"
          placeholder={t(lang, 'planNamePlaceholder')}
          maxLength={60}
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div className="btn-group">
          {currentPlanId && (
            <button className="btn btn-danger btn-sm" onClick={handleDelete} title="Delete this plan">
              {t(lang, 'deletePlan')}
            </button>
          )}
          <button className={`btn btn-primary${saving ? ' loading' : ''}`} onClick={handleSave} disabled={saving}>
            <span className="btn-icon"></span>
            <span className="spinner"></span>
            {t(lang, 'savePlan')}
          </button>
        </div>
      </div>

      {/* 动作列表 */}
      <div className="exercises-container">
        <div className="section-header">
          <span className="section-title">{t(lang, 'exerciseList')}</span>
          <span className="badge badge-success">{t(lang, 'exerciseCount', { count: exercises.length })}</span>
        </div>
        {exercises.map((ex, idx) => (
          <ExerciseCard
            key={idx}
            exercise={ex}
            index={idx}
            onChange={handleExerciseChange}
            onRemove={handleRemoveExercise}
            onDragStart={setDragIdx}
            onDragOver={handleDragOver}
            onDragEnd={() => setDragIdx(null)}
          />
        ))}
        <button className="btn btn-add" onClick={handleAddExercise}>
          {t(lang, 'addExercise')}
        </button>
      </div>

      {/* 操作面板 */}
      {currentPlanId && (
        <div className="action-panels">
          <AudioPanel planId={currentPlanId} planName={existingPlan?.name} exercises={existingPlan?.exercises || []} />
          
          <div className="report-panel">
            <div className="audio-info">
              <h3>{t(lang, 'reportTitle')}</h3>
              <p>{t(lang, 'reportDesc')}</p>
            </div>
            <button className="btn btn-secondary" onClick={() => setShowReport(true)}>
              {t(lang, 'reportBtn')}
            </button>
          </div>
        </div>
      )}

      {/* 报告弹窗 */}
      {showReport && currentPlanId && (
        <ReportModal
          planId={currentPlanId}
          planName={existingPlan?.name}
          exercises={existingPlan?.exercises || []}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
