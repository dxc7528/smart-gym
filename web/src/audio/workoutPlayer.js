/**
 * workoutPlayer.js — 训练音频编排（核心业务逻辑）
 * 移植自原 Python instructor_audio.py
 * 
 * 采用流式策略：先生成前几段内容开始播放，同时后台继续生成后续内容
 */

import { generateBeep, generateTick, generateSilence, concatAudio } from './soundEffects.js';

const SAMPLE_RATE = 24000; // Kokoro 模型输出采样率

/**
 * 构建单个 Rep 的音效部分（tick 节拍器 + 静音填充）
 * 注意：语音部分由 TTS 引擎生成，这里只负责 tick 和 silence
 */
function buildRepTicksAndSilence(phaseDuration, voiceDuration = 0) {
  const segments = [];
  
  // 语音播放完毕后，用 tick 填满剩余时间
  for (let sec = 1; sec <= Math.floor(phaseDuration); sec++) {
    const tickTime = sec;
    if (tickTime <= voiceDuration) continue; // 语音还没播完
    
    const gap = tickTime - (segments.length === 0 ? voiceDuration : 0);
    if (gap > 0 && segments.length === 0) {
      segments.push(generateSilence(gap, SAMPLE_RATE));
    } else if (segments.length > 0) {
      segments.push(generateSilence(1 - 0.03, SAMPLE_RATE)); // 1s 间隔减去 tick 时长
    }
    segments.push(generateTick(SAMPLE_RATE));
  }

  // 修正总时长
  const currentDuration = segments.reduce((sum, s) => sum + s.length, 0) / SAMPLE_RATE + voiceDuration;
  const remaining = phaseDuration - currentDuration;
  if (remaining > 0.01) {
    segments.push(generateSilence(remaining, SAMPLE_RATE));
  }

  return segments.length > 0 ? concatAudio(...segments) : generateSilence(Math.max(0, phaseDuration - voiceDuration), SAMPLE_RATE);
}

/**
 * 生成训练音频指令序列
 * 返回一个指令数组，每个指令代表一个需要播放的音频片段
 * 指令类型：
 *   - { type: 'tts', text: string } — 需要 TTS 合成的文本
 *   - { type: 'sound', audio: Float32Array } — 直接播放的音效
 *   - { type: 'phase', name: string } — 阶段标记（用于 UI 更新）
 * 
 * @param {string} planName
 * @param {Array} exercises
 * @returns {Array} 指令序列
 */
export function buildWorkoutSequence(planName, exercises) {
  const sequence = [];

  // 开场
  sequence.push({ type: 'phase', name: 'intro', label: '准备开始' });
  sequence.push({ type: 'tts', text: `开始今天的训练：${planName}。请做好准备。` });
  sequence.push({ type: 'sound', audio: generateSilence(3, SAMPLE_RATE) });

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
    sequence.push({ type: 'tts', text: `下一个动作：${name}，共 ${sets} 组，每组 ${reps} 次。` });
    sequence.push({ type: 'sound', audio: generateSilence(2, SAMPLE_RATE) });

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
        sequence.push({ type: 'tts', text: '推起' });
        if (tempo[0] > 0.8) {
          sequence.push({ type: 'sound', audio: buildRepTicksAndSilence(tempo[0], 0.6) });
        }

        // 停顿阶段
        if (tempo[1] > 0) {
          sequence.push({ type: 'tts', text: '停' });
          if (tempo[1] > 0.5) {
            sequence.push({ type: 'sound', audio: buildRepTicksAndSilence(tempo[1], 0.3) });
          }
        }

        // 离心/复原阶段
        sequence.push({ type: 'tts', text: '下放' });
        if (tempo[2] > 0.8) {
          sequence.push({ type: 'sound', audio: buildRepTicksAndSilence(tempo[2], 0.6) });
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
          sequence.push({ type: 'tts', text: `动作完成。休息 ${currentRest} 秒，准备切换动作。` });
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

/**
 * 估算训练总时长（秒）
 */
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
