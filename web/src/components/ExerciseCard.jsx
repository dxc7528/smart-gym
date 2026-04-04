import React, { useRef, useContext } from 'react';
import { AppContext } from '../App.jsx';
import { t } from '../utils/i18n.js';

const DragIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity="0.4">
    <circle cx="9" cy="6" r="1.5"/>
    <circle cx="15" cy="6" r="1.5"/>
    <circle cx="9" cy="12" r="1.5"/>
    <circle cx="15" cy="12" r="1.5"/>
    <circle cx="9" cy="18" r="1.5"/>
    <circle cx="15" cy="18" r="1.5"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function ExerciseCard({ exercise, index, onChange, onRemove, onDragStart, onDragOver, onDragEnd }) {
  const cardRef = useRef(null);
  const { lang } = useContext(AppContext);

  const handleChange = (field, value) => {
    onChange(index, { ...exercise, [field]: value });
  };

  const handleTempoChange = (idx, value) => {
    const newTempo = [...exercise.tempo];
    newTempo[idx] = parseFloat(value) || 0;
    onChange(index, { ...exercise, tempo: newTempo });
  };

  return (
    <div
      ref={cardRef}
      className="exercise-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        cardRef.current.classList.add('dragging');
        onDragStart?.(index);
      }}
      onDragEnd={() => {
        cardRef.current.classList.remove('dragging');
        onDragEnd?.();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        onDragOver?.(e, index);
      }}
    >
      <div className="exercise-fields">
        <div className="field-group">
          <label>{t(lang, 'exerciseNameLabel')}</label>
          <input
            type="text"
            placeholder={t(lang, 'planNameHint')}
            value={exercise.name}
            onChange={e => handleChange('name', e.target.value)}
          />
        </div>
        <div className="field-group">
          <label>{t(lang, 'sets')}</label>
          <input
            type="number"
            min="1"
            max="20"
            value={exercise.sets}
            onChange={e => handleChange('sets', parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="field-group">
          <label>{t(lang, 'reps')}</label>
          <input
            type="number"
            min="1"
            max="200"
            value={exercise.reps}
            onChange={e => handleChange('reps', parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="field-group">
          <label>{t(lang, 'rest')}</label>
          <input
            type="number"
            min="0"
            max="600"
            value={exercise.rest}
            onChange={e => handleChange('rest', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="field-group">
          <label>{t(lang, 'transitionRest')}</label>
          <input
            type="number"
            min="0"
            max="600"
            value={exercise.transition_rest}
            onChange={e => handleChange('transition_rest', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="field-group" style={{ gridColumn: 'span 2' }}>
          <label>{t(lang, 'tempoLabel')}</label>
          <div className="tempo-inputs">
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={exercise.tempo[0]}
              onChange={e => handleTempoChange(0, e.target.value)}
            />
            <span className="tempo-sep">-</span>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={exercise.tempo[1]}
              onChange={e => handleTempoChange(1, e.target.value)}
            />
            <span className="tempo-sep">-</span>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={exercise.tempo[2]}
              onChange={e => handleTempoChange(2, e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="exercise-actions" style={{ cursor: 'grab' }} title="拖拽排序">
        <span style={{ marginRight: 10 }}><DragIcon /></span>
        <button className="btn btn-danger btn-sm" title="删除此动作" onClick={() => onRemove(index)}>
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
