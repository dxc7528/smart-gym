/**
 * reportsStore.js — 训练完成报告的存储与 Markdown 生成
 * 移植自原 Python reports_store.py
 */

import { t } from '../utils/i18n.js';

const STORAGE_KEY = 'smart-gym-reports';

function readReports() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function writeReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

function generateMd(report, lang) {
  const { plan_name, date, time, exercises, notes, completion_pct } = report;

  const getScoreLabel = (score) => {
    switch (score) {
      case 3: return t(lang, 'mdScore3');
      case 2: return t(lang, 'mdScore2');
      case 1: return t(lang, 'mdScore1');
      case 0: return t(lang, 'mdScore0');
      default: return `${score}/3`;
    }
  };

  const lines = [
    t(lang, 'mdSummaryTitle', { name: plan_name }),
    '',
    t(lang, 'mdDate', { date, time }),
    t(lang, 'mdPlan', { name: plan_name }),
    '',
    t(lang, 'mdExerciseScoresTitle'),
    '',
    t(lang, 'mdTableHeader'),
    '|------|--------|---------|',
  ];

  exercises.forEach(ex => {
    const label = getScoreLabel(ex.score);
    const difficulty = (ex.difficulty || '').trim() || '—';
    lines.push(`| ${ex.name} | ${label} | ${difficulty} |`);
  });

  const totalScore = exercises.reduce((acc, e) => acc + (e.score || 0), 0);
  lines.push(
    '',
    t(lang, 'mdTotalCompletionTitle'),
    '',
    `**${completion_pct}%** (${totalScore} ÷ ${exercises.length * 3} × 100%)`,
    '',
  );

  if (notes) {
    lines.push(t(lang, 'mdNotesTitle'), '', notes, '');
  }

  return lines.join('\n');
}

export function saveReport(planId, planName, exerciseScores, notes = '', lang = 'en') {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().slice(0, 5);
  const reportId = crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);

  const maxScore = exerciseScores.length * 3;
  const actualScore = exerciseScores.reduce((acc, e) => acc + (e.score || 0), 0);
  const pct = maxScore ? Math.round(actualScore / maxScore * 100) : 0;

  const report = {
    id: reportId,
    plan_id: planId,
    plan_name: planName,
    date: dateStr,
    time: timeStr,
    exercises: exerciseScores,
    notes,
    completion_pct: pct,
  };

  report.md_content = generateMd(report, lang);

  const reports = readReports();
  reports.unshift(report);
  writeReports(reports);

  return report;
}

export function getAllReports() {
  return readReports();
}
