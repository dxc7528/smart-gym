import React, { useState, useContext } from 'react';
import { ToastContext } from '../App.jsx';
import { saveReport } from '../store/reportsStore.js';

export default function ReportModal({ planId, planName, exercises, onClose }) {
  const showToast = useContext(ToastContext);
  const [scores, setScores] = useState(exercises.map(() => 3));
  const [difficulties, setDifficulties] = useState(exercises.map(() => ''));
  const [notes, setNotes] = useState('');
  const [mdPreview, setMdPreview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleScoreChange = (idx, score) => {
    setScores(prev => prev.map((s, i) => i === idx ? score : s));
  };

  const handleSubmit = () => {
    setSaving(true);
    try {
      const exerciseScores = exercises.map((ex, i) => ({
        name: ex.name,
        score: scores[i],
        difficulty: difficulties[i],
      }));
      const report = saveReport(planId, planName, exerciseScores, notes);
      setMdPreview(report.md_content);
      setSubmitted(true);
      showToast('报告已生成 ✅');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <h2>训练复盘报告</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {exercises.map((ex, idx) => (
            <div key={idx} className="report-ex-item">
              <div className="report-ex-header">{idx + 1}. {ex.name}</div>
              <div className="report-score-options">
                {[3, 2, 1, 0].map(score => (
                  <label
                    key={score}
                    className={`score-opt${scores[idx] === score ? ' selected' : ''}`}
                    onClick={() => handleScoreChange(idx, score)}
                  >
                    <input type="radio" name={`score-${idx}`} value={score} checked={scores[idx] === score} readOnly />
                    {score === 3 ? '3: 能够完成每组' :
                     score === 2 ? '2: 只能完成80%' :
                     score === 1 ? '1: 只能完成50%' :
                     '0: 完全不能完成'}
                  </label>
                ))}
              </div>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font)',
                  fontSize: '0.85rem',
                }}
                placeholder="可选：填写本动作难点或感受..."
                value={difficulties[idx]}
                onChange={e => setDifficulties(prev => prev.map((d, i) => i === idx ? e.target.value : d))}
              />
            </div>
          ))}

          <div className="report-notes">
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>总体备注 / 感受</label>
            <textarea
              rows="3"
              placeholder="写下今天的训练感受…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {submitted && (
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>报告已生成。Markdown 内容预览：</label>
              <textarea
                rows="8"
                readOnly
                style={{ fontFamily: 'monospace', fontSize: '0.78rem', marginTop: 8 }}
                value={mdPreview}
              />
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            {submitted ? '关闭' : '取消'}
          </button>
          {!submitted && (
            <button
              className={`btn btn-primary${saving ? ' loading' : ''}`}
              onClick={handleSubmit}
              disabled={saving}
            >
              <span className="spinner"></span> 提交并生成
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
