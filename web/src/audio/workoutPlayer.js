/**
 * workoutPlayer.js — 训练音频编排（核心业务逻辑）
 */

import { generateBeep, generateTick, generateSilence, concatAudio } from './soundEffects.js';

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
export function buildWorkoutSequence(planName, exercises) {
  const sequence = [];

  // 开场
  sequence.push({ type: 'phase', name: 'intro', label: '准备开始' });
  sequence.push({ type: 'tts', text: `开始今天的训练：${planName}。` });
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
    sequence.push({ type: 'tts', text: `下一个动作：${name}，共 ${sets} 组，每组 ${reps} 次。请做好准备` });
    sequence.push({ type: 'sound', audio: generateSilence(1.5, SAMPLE_RATE) });

    for (let s = 0; s < sets; s++) {
      // 组前倒数
      sequence.push({ 
        type: 'phase', 
        name: 'set-start', 
        label: `${name} - 第 ${s + 1}/${sets} 组`,
        exerciseIndex: exIdx,
        exerciseName: name,
        setIndex: s,
        totalSets: sets,
      });
      sequence.push({ type: 'tts', text: `第 ${s + 1} 组，准备。3, 2, 1, 开始。` });

      // Rep 循环
      for (let r = 0; r < reps; r++) {
        sequence.push({ 
          type: 'phase', 
          name: 'rep', 
          label: `${name} - 第 ${s + 1} 组 / 第 ${r + 1}/${reps} 次`,
          exerciseIndex: exIdx,
          setIndex: s,
          repIndex: r,
          totalReps: reps,
        });

        // 向心/发力阶段
        if (tempo[0] > 0) {
          sequence.push({ 
            type: 'overlay', 
            text: '推起', 
            audio: buildTicks(tempo[0])
          });
        }

        // 停顿阶段
        if (tempo[1] > 0) {
          sequence.push({ 
            type: 'overlay', 
            text: '停', 
            audio: buildTicks(tempo[1])
          });
        }

        // 离心/复原阶段
        if (tempo[2] > 0) {
          sequence.push({ 
            type: 'overlay', 
            text: '下放', 
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
          label: isLastSet ? `动作完成，休息 ${currentRest}s` : `休息 ${currentRest}s`,
          restDuration: currentRest,
        });

        if (isLastSet) {
          sequence.push({ type: 'tts', text: `动作完成。休息 ${currentRest} 秒。` });
        } else {
          sequence.push({ type: 'tts', text: `休息 ${currentRest} 秒。` });
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
  sequence.push({ type: 'phase', name: 'complete', label: '训练结束' });
  sequence.push({ type: 'tts', text: '训练结束，干得漂亮。记得拉伸。' });

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
