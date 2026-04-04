import React, { useState, useContext } from 'react';
import { AppContext, ToastContext } from '../App.jsx';
import { saveReport } from '../store/reportsStore.js';
import { t } from '../utils/i18n.js';

export default function ReportModal({ planId, planName, exercises, onClose }) {
  const showToast = useContext(ToastContext);
  const { lang } = useContext(AppContext);
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
      const report = saveReport(planId, planName, exerciseScores, notes, lang);
      setMdPreview(report.md_content);
      setSubmitted(true);
      showToast(t(lang, 'reportGeneratedToast'));
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
          <h2>{t(lang, 'reportModalTitle')}</h2>
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
                    {score === 3 ? t(lang, 'score3') :
                     score === 2 ? t(lang, 'score2') :
                     score === 1 ? t(lang, 'score1') :
                     t(lang, 'score0')}
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
              placeholder={t(lang, 'difficultyPlaceholder')}
              value={difficulties[idx]}
              onChange={e => setDifficulties(prev => prev.map((d, i) => i === idx ? e.target.value : d))}
            />
          </div>
        ))}

        <div className="report-notes">
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t(lang, 'overallNotesLabel')}</label>
          <textarea
            rows="3"
            placeholder={t(lang, 'notesPlaceholder')}
            value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

        {submitted && (
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t(lang, 'mdPreviewLabel')}</label>
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
            {submitted ? t(lang, 'close') : t(lang, 'cancel')}
          </button>
          {!submitted && (
            <button
              className={`btn btn-primary${saving ? ' loading' : ''}`}
              onClick={handleSubmit}
              disabled={saving}
            >
              <span className="spinner"></span> {t(lang, 'submitReport')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
