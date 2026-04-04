# New Workout Plans Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three new default workout plans (Morning Yoga, Hangboard, Evening Stretch) to the app's seed data.

**Architecture:** Single file modification — append three plan objects to the `DEFAULT_PLANS` array in `plansStore.js`. The existing `seedDefaultPlans()` function will automatically create them on first load.

**Tech Stack:** Vanilla JS, localStorage.

---

## File Map

- Modify: `src/store/plansStore.js:70-80` — extend `DEFAULT_PLANS` array

---

## Task 1: Add three new workout plans to DEFAULT_PLANS

- [ ] **Step 1: Modify DEFAULT_PLANS in plansStore.js**

Edit `src/store/plansStore.js`, replacing the current `DEFAULT_PLANS` array (lines 70–80) with the expanded version that includes the original "Day 1 - Upper Body Push & Core" plus the three new plans.

**Old code (lines 70–80):**
```javascript
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
```

**New code:**
```javascript
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
  {
    name: 'Morning Wake-up Yoga',
    exercises: [
      { name: 'Cat-Cow', sets: 1, reps: 10, rest: 15, transition_rest: 30, tempo: [1, 0, 1] },
      { name: 'Sun Salutation A', sets: 1, reps: 3, rest: 30, transition_rest: 60, tempo: [1, 1, 1] },
      { name: 'Warrior I', sets: 1, reps: 1, rest: 15, transition_rest: 30, tempo: [1, 0, 1] },
      { name: 'Warrior II', sets: 1, reps: 1, rest: 15, transition_rest: 30, tempo: [1, 0, 1] },
      { name: 'Downward Dog', sets: 1, reps: 1, rest: 15, transition_rest: 30, tempo: [1, 0, 1] },
      { name: 'Hip Flexor Stretch', sets: 1, reps: 1, rest: 15, transition_rest: 30, tempo: [1, 0, 1] },
      { name: 'Supine Twist', sets: 1, reps: 1, rest: 15, transition_rest: 30, tempo: [1, 0, 1] },
    ],
  },
  {
    name: 'Hangboard Finger Strength',
    exercises: [
      { name: 'Open Hand Hang', sets: 5, reps: 1, rest: 180, transition_rest: 120, tempo: [0, 7, 0] },
      { name: 'Half Crimp Hang', sets: 5, reps: 1, rest: 180, transition_rest: 120, tempo: [0, 7, 0] },
      { name: 'Finger Board Slide', sets: 3, reps: 1, rest: 120, transition_rest: 90, tempo: [0, 5, 0] },
    ],
  },
  {
    name: 'Evening Relaxation Stretch',
    exercises: [
      { name: 'Deep Breathing', sets: 1, reps: 12, rest: 0, transition_rest: 30, tempo: [4, 2, 0] },
      { name: 'Chest Opener', sets: 1, reps: 1, rest: 15, transition_rest: 30, tempo: [1, 0, 1] },
      { name: 'Cat-Cow', sets: 1, reps: 10, rest: 15, transition_rest: 30, tempo: [1, 0, 1] },
      { name: "Child's Pose", sets: 1, reps: 1, rest: 15, transition_rest: 30, tempo: [1, 0, 1] },
      { name: 'Pigeon Pose', sets: 1, reps: 1, rest: 15, transition_rest: 30, tempo: [1, 0, 1] },
      { name: 'Knee-to-Chest', sets: 1, reps: 1, rest: 15, transition_rest: 30, tempo: [1, 0, 1] },
      { name: 'Supine Hamstring', sets: 1, reps: 1, rest: 15, transition_rest: 30, tempo: [1, 0, 1] },
    ],
  },
];
```

- [ ] **Step 2: Verify the change**

Read back the file to confirm the array is correct and well-formed JSON.

- [ ] **Step 3: Commit**

```bash
git add src/store/plansStore.js
git commit -m "feat: add three new default workout plans (yoga, hangboard, evening stretch)"
```

---

## Verification

After the change is committed:
1. Clear localStorage (or open in incognito) to trigger `seedDefaultPlans()`
2. Verify all 4 plans appear in the plans list
3. Verify "Day 1 - Upper Body Push & Core" still has exactly 4 exercises
4. Verify each new plan has the correct exercise count:
   - Morning Wake-up Yoga: 7 exercises
   - Hangboard Finger Strength: 3 exercises
   - Evening Relaxation Stretch: 7 exercises
