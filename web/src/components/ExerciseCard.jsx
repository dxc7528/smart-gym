import React, { useRef } from 'react';

export default function ExerciseCard({ exercise, index, onChange, onRemove, onDragStart, onDragOver, onDragEnd }) {
  const cardRef = useRef(null);

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
          <label>动作名称</label>
          <input
            type="text"
            placeholder="例：深蹲、卧推…"
            value={exercise.name}
            onChange={e => handleChange('name', e.target.value)}
          />
        </div>
        <div className="field-group">
          <label>组数</label>
          <input
            type="number"
            min="1"
            max="20"
            value={exercise.sets}
            onChange={e => handleChange('sets', parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="field-group">
          <label>每组次数</label>
          <input
            type="number"
            min="1"
            max="200"
            value={exercise.reps}
            onChange={e => handleChange('reps', parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="field-group">
          <label>组间休息 (秒)</label>
          <input
            type="number"
            min="0"
            max="600"
            value={exercise.rest}
            onChange={e => handleChange('rest', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="field-group">
          <label>过渡休息 (秒)</label>
          <input
            type="number"
            min="0"
            max="600"
            value={exercise.transition_rest}
            onChange={e => handleChange('transition_rest', parseInt(e.target.value) || 0)}
            title="完成此动作后，切换到下一个动作前的休息时间"
          />
        </div>
        <div className="field-group" style={{ gridColumn: 'span 2' }}>
          <label>节奏 (发力-停顿-复原)</label>
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
        <span style={{ fontSize: '1.2rem', opacity: 0.4, marginRight: 10 }}>☰</span>
        <button className="btn btn-danger btn-sm" title="删除此动作" onClick={() => onRemove(index)}>
          ✕
        </button>
      </div>
    </div>
  );
}
