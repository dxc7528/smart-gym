/**
 * workoutPlayer.js — 训练音频编排（核心业务逻辑）
 */

import { generateBeep, generateTick, generateSilence, concatAudio } from './soundEffects.js';
import { t } from '../utils/i18n.js';

const SAMPLE_RATE = 24000;

/**
 * 构建精确时长的 Ticks
 * 每秒 1 个 tick，总时长严格等于 durationInSeconds
 */
function buildTicks(durationInSeconds) {
  if (durationInSeconds <= 0) return generateSilence(0.01, SAMPLE_RATE);
  const segments = [];
  for (let sec = 1; sec <= Math.floor(durationInSeconds); sec++) {
    // TICK_DURATION 之前设定为 0.03s
    segments.push(generateTick(SAMPLE_RATE));
    segments.push(generateSilence(1 - 0.03, SAMPLE_RATE)); 
  }
  const remaining = durationInSeconds - Math.floor(durationInSeconds);
  if (remaining > 0.01) {
    segments.push(generateSilence(remaining, SAMPLE_RATE));
  }
  return segments.length > 0 ? concatAudio(...segments) : generateSilence(0.01, SAMPLE_RATE);
}

/**
 * 生成训练音频指令序列
 *   - { type: 'tts', text: string } — 严格串行播报（等待播完）
 *   - { type: 'sound', audio: Float32Array } — 直接播放音效（等待播完）
 *   - { type: 'overlay', text: string, audio: Float32Array } — 在同一时间开始：播放音效和播报文本，**仅等待音效完成**（严格按照音效的时长前进）
 *   - { type: 'phase', ... } — 状态机标记
 */
export function buildWorkoutSequence(planName, exercises, lang = 'en') {
  const sequence = [];

  // 开场
  sequence.push({ type: 'phase', name: 'intro', label: t(lang, 'startLoading') });
  sequence.push({ type: 'tts', text: t(lang, 'phaseStartWorkout', { name: planName }) });
  sequence.push({ type: 'sound', audio: generateSilence(1, SAMPLE_RATE) });

  exercises.forEach((ex, exIdx) => {
    const { name, sets, reps, rest, tempo } = ex;
    const transRest = ex.transition_rest || rest;

    // 动作介绍
    sequence.push({ 
      type: 'phase', 
      name: 'exercise-intro', 
      label: name,
      exerciseIndex: exIdx,
      exerciseName: name,
      totalExercises: exercises.length,
    });
    sequence.push({ type: 'tts', text: t(lang, 'phaseNextExercise', { name, sets, reps }) });
    sequence.push({ type: 'sound', audio: generateSilence(1.5, SAMPLE_RATE) });

    for (let s = 0; s < sets; s++) {
      // 组前倒数
      sequence.push({ 
        type: 'phase', 
        name: 'set-start', 
        label: `${name} - ${s + 1}/${sets}`,
        exerciseIndex: exIdx,
        exerciseName: name,
        setIndex: s,
        totalSets: sets,
      });
      sequence.push({ type: 'tts', text: t(lang, 'phaseStartSet', { set: s + 1 }) });

      // Rep 循环
      for (let r = 0; r < reps; r++) {
        sequence.push({ 
          type: 'phase', 
          name: 'rep', 
          label: `${name} - ${s + 1}/${sets} / ${r + 1}/${reps}`,
          exerciseIndex: exIdx,
          setIndex: s,
          repIndex: r,
          totalReps: reps,
        });

        // 向心/发力阶段
        if (tempo[0] > 0) {
          sequence.push({ 
            type: 'overlay', 
            text: t(lang, 'tempoPush', { default: 'Push' }), 
            audio: buildTicks(tempo[0])
          });
        }

        // 停顿阶段
        if (tempo[1] > 0) {
          sequence.push({ 
            type: 'overlay', 
            text: t(lang, 'tempoHold', { default: 'Hold' }), 
            audio: buildTicks(tempo[1])
          });
        }

        // 离心/复原阶段
        if (tempo[2] > 0) {
          sequence.push({ 
            type: 'overlay', 
            text: t(lang, 'tempoDown', { default: 'Down' }), 
            audio: buildTicks(tempo[2])
          });
        }
      }

      // 组间休息
      const isLastSet = s === sets - 1;
      const isLastExercise = exIdx === exercises.length - 1;

      if (!(isLastSet && isLastExercise)) {
        const currentRest = isLastSet ? transRest : rest;

        sequence.push({ 
          type: 'phase', 
          name: 'rest', 
          label: t(lang, 'rest') + ` ${currentRest}s`,
          restDuration: currentRest,
        });

        if (isLastSet) {
          const nextExName = exercises[exIdx + 1]?.name;
          const nextSets = exercises[exIdx + 1]?.sets;
          const nextReps = exercises[exIdx + 1]?.reps;
          sequence.push({ type: 'tts', text: t(lang, 'phaseRestTransition', { name: nextExName, sets: nextSets, reps: nextReps, time: currentRest }) });
        } else {
          sequence.push({ type: 'tts', text: t(lang, 'phaseRestPhase', { time: currentRest }) });
        }

        // 休息时间音效
        if (currentRest > 10) {
          sequence.push({ type: 'sound', audio: generateSilence(currentRest - 10, SAMPLE_RATE) });
          // 最后 10 秒的 3 声 beep
          for (let i = 0; i < 3; i++) {
            sequence.push({ type: 'sound', audio: concatAudio(generateBeep(1000, 0.1, SAMPLE_RATE), generateSilence(0.9, SAMPLE_RATE)) });
          }
          sequence.push({ type: 'sound', audio: generateSilence(7, SAMPLE_RATE) });
        } else {
          sequence.push({ type: 'sound', audio: generateSilence(currentRest, SAMPLE_RATE) });
        }
      }
    }
  });

  // 结束
  sequence.push({ type: 'phase', name: 'complete', label: t(lang, 'complete') });
  sequence.push({ type: 'tts', text: t(lang, 'phaseWorkoutComplete') });

  return sequence;
}

export function estimateWorkoutDuration(exercises) {
  let total = 5; // 开场
  exercises.forEach((ex, exIdx) => {
    total += 4; // 动作介绍
    for (let s = 0; s < ex.sets; s++) {
      total += 4; // 组前倒数
      const repDuration = ex.tempo[0] + ex.tempo[1] + ex.tempo[2];
      total += repDuration * ex.reps;
      
      const isLastSet = s === ex.sets - 1;
      const isLastExercise = exIdx === exercises.length - 1;
      if (!(isLastSet && isLastExercise)) {
        total += isLastSet ? (ex.transition_rest || ex.rest) : ex.rest;
      }
    }
  });
  total += 3; // 结束
  return total;
}
