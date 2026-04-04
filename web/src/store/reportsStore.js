/**
 * reportsStore.js — 训练完成报告的存储与 Markdown 生成
 * 移植自原 Python reports_store.py
 */

const STORAGE_KEY = 'smart-gym-reports';

const SCORE_LABELS = {
  3: '⭐⭐⭐ 完成全部',
  2: '⭐⭐　 完成约80%',
  1: '⭐　　 完成约50%',
  0: '✗　　 无法完成',
};

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

function generateMd(report) {
  const { plan_name, date, time, exercises, notes, completion_pct } = report;

  const lines = [
    `# 训练总结：${plan_name}`,
    '',
    `**日期**：${date} ${time}`,
    `**计划**：${plan_name}`,
    '',
    '## 动作评分',
    '',
    '| 动作 | 完成度 | 难点描述 |',
    '|------|--------|---------|',
  ];

  exercises.forEach(ex => {
    const label = SCORE_LABELS[ex.score] || `${ex.score}/3`;
    const difficulty = (ex.difficulty || '').trim() || '—';
    lines.push(`| ${ex.name} | ${label} | ${difficulty} |`);
  });

  const totalScore = exercises.reduce((acc, e) => acc + (e.score || 0), 0);
  lines.push(
    '',
    '## 总体完成度',
    '',
    `**${completion_pct}%**（${totalScore} ÷ ${exercises.length * 3} × 100%）`,
    '',
  );

  if (notes) {
    lines.push('## 备注', '', notes, '');
  }

  return lines.join('\n');
}

export function saveReport(planId, planName, exerciseScores, notes = '') {
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

  report.md_content = generateMd(report);

  const reports = readReports();
  reports.unshift(report);
  writeReports(reports);

  return report;
}

export function getAllReports() {
  return readReports();
}
