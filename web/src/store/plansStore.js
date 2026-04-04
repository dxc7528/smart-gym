/**
 * plansStore.js — 训练计划的 localStorage 存储（CRUD）
 * 移植自原 Python plans_store.py
 */

const STORAGE_KEY = 'smart-gym-plans';

function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function readPlans() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function writePlans(plans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

// ---- 公共 CRUD 接口 ----

export function getAllPlans() {
  return readPlans();
}

export function getPlan(planId) {
  return readPlans().find(p => p.id === planId) || null;
}

export function createPlan(name, exercises) {
  const plans = readPlans();
  const newPlan = {
    id: generateId(),
    name,
    exercises,
  };
  plans.push(newPlan);
  writePlans(plans);
  return newPlan;
}

export function updatePlan(planId, name, exercises) {
  const plans = readPlans();
  const idx = plans.findIndex(p => p.id === planId);
  if (idx === -1) return null;
  plans[idx] = { id: planId, name, exercises };
  writePlans(plans);
  return plans[idx];
}

export function deletePlan(planId) {
  const plans = readPlans();
  const filtered = plans.filter(p => p.id !== planId);
  if (filtered.length === plans.length) return false;
  writePlans(filtered);
  return true;
}

// ---- 预置示例数据 ----

const DEFAULT_PLANS = [
  {
    name: 'Day 1 - Upper Body Push & Core',
    exercises: [
      { name: 'Push-ups', sets: 3, reps: 12, rest: 60, transition_rest: 120, tempo: [1, 1, 3] },
      { name: 'Triceps Dips', sets: 3, reps: 8, rest: 90, transition_rest: 120, tempo: [1, 1, 3] },
      { name: 'Lateral Raises', sets: 3, reps: 20, rest: 45, transition_rest: 90, tempo: [1, 1, 3] },
      { name: 'Hanging Leg Raises', sets: 3, reps: 12, rest: 60, transition_rest: 90, tempo: [1, 1, 3] },
    ],
  },
];

export function seedDefaultPlans() {
  if (getAllPlans().length === 0) {
    DEFAULT_PLANS.forEach(p => createPlan(p.name, p.exercises));
  }
}
