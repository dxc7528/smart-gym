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
    name: 'Upper Body Push & Core',
    exercises: [
      { name: 'Push-ups', sets: 3, reps: 12, rest: 120, transition_rest: 120, tempo: [2, 0, 1] },
      { name: 'Triceps Dips', sets: 3, reps: 8, rest: 120, transition_rest: 120, tempo: [2, 0, 1] },
      { name: 'Lateral Raises', sets: 3, reps: 20, rest: 120, transition_rest: 120, tempo: [2, 0, 1] },
      { name: 'Hanging Leg Raises', sets: 3, reps: 12, rest: 120, transition_rest: 120, tempo: [2, 0, 1] },
    ],
  },
  {
    name: 'Morning Wake-up Yoga',
    exercises: [
      { name: 'Cat-Cow', sets: 1, reps: 10, rest: 0, transition_rest: 15, tempo: [2, 0, 2] },
      { name: 'Sun Salutation A', sets: 1, reps: 3, rest: 0, transition_rest: 20, tempo: [3, 0, 3] },
      { name: 'Warrior I', sets: 1, reps: 1, rest: 0, transition_rest: 15, tempo: [2, 5, 2] },
      { name: 'Warrior II', sets: 1, reps: 1, rest: 0, transition_rest: 15, tempo: [2, 5, 2] },
      { name: 'Downward Dog', sets: 1, reps: 1, rest: 0, transition_rest: 15, tempo: [2, 8, 2] },
      { name: 'Hip Flexor Stretch', sets: 1, reps: 1, rest: 0, transition_rest: 15, tempo: [2, 15, 2] },
      { name: 'Supine Twist', sets: 1, reps: 1, rest: 0, transition_rest: 15, tempo: [2, 10, 2] },
    ],
  },
  {
    name: 'Hangboard Finger Strength',
    exercises: [
      { name: 'Open Hand Hang', sets: 5, reps: 1, rest: 15, transition_rest: 60, tempo: [0, 7, 0] },
      { name: 'Half Crimp Hang', sets: 5, reps: 1, rest: 15, transition_rest: 60, tempo: [0, 7, 0] },
      { name: 'Finger Board Slide', sets: 3, reps: 1, rest: 15, transition_rest: 45, tempo: [0, 5, 0] },
    ],
  },
  {
    name: 'Evening Relaxation Stretch',
    exercises: [
      { name: 'Deep Breathing', sets: 1, reps: 12, rest: 0, transition_rest: 30, tempo: [4, 2, 6] },
      { name: 'Chest Opener', sets: 1, reps: 1, rest: 0, transition_rest: 20, tempo: [2, 15, 2] },
      { name: 'Cat-Cow', sets: 1, reps: 10, rest: 0, transition_rest: 20, tempo: [2, 0, 2] },
      { name: "Child's Pose", sets: 1, reps: 1, rest: 0, transition_rest: 20, tempo: [3, 20, 3] },
      { name: 'Pigeon Pose', sets: 1, reps: 1, rest: 0, transition_rest: 20, tempo: [2, 20, 2] },
      { name: 'Knee-to-Chest', sets: 1, reps: 1, rest: 0, transition_rest: 20, tempo: [2, 15, 2] },
      { name: 'Supine Hamstring', sets: 1, reps: 1, rest: 0, transition_rest: 20, tempo: [2, 15, 2] },
    ],
  },
];

export function seedDefaultPlans() {
  if (getAllPlans().length === 0) {
    DEFAULT_PLANS.forEach(p => createPlan(p.name, p.exercises));
  }
}
