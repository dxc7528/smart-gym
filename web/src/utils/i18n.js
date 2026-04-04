export const locales = {
  en: {
    // Layout & General
    subtitle: "Workout Plans · Voice Guide",
    langPicker: "🌐 Lang:",
    voiceReady: "Ready",
    voiceNotSupported: "Voice Not Supported",
    voiceDefault: "Voice Ready",
    close: "Close",
    
    // Sidebar
    navLabel: "Navigation",
    navPlans: "Workout Plans",
    newPlan: "New Plan",
    howToUse: "How to Use",
    myPlansLabel: "My Plans",
    
    // Empty State
    noPlanTitle: "No Workout Plan",
    noPlanDesc: "Click 'New Plan' on the left to start.",
    
    // Audio Panel
    audioPanelTitle: "🎵 Training Audio",
    audioNotSupportedDesc: "Sorry, your browser doesn't support native speech synthesis.",
    audioReadyDesc: "Click 'Start Workout' to begin real-time voice guidance.",
    startLoading: "Ready",
    startWorkoutBtn: "⚡ Start Workout",
    
    // Plan Editor
    planNamePlaceholder: "Enter plan name...",
    planSaveSuccess: "Plan saved ✨",
    planDeleteConfirm: "Delete '{name}'? This cannot be undone.",
    planDeleted: "Deleted",
    exerciseList: "Exercises",
    exerciseCount: "{count} exercises",
    planNameLabel: "Plan Name:",
    planNameHint: "e.g., Push Day",
    addExercise: "➕ Add Exercise",
    savePlan: "💾 Save Plan",
    deletePlan: "🗑️ Delete",
    exerciseNameLabel: "Exercise Name",
    sets: "Sets",
    reps: "Reps",
    rest: "Rest (s)",
    transitionRest: "Transition Rest (s)",
    tempoLabel: "Tempo (Ecc-Iso-Con)",
    reportTitle: "📝 Training Report",
    reportDesc: "Generate an MD report with ratings and notes.",
    reportBtn: "Write Report...",
    
    // Workout Runner
    preparing: "Preparing...",
    generatingAudio: "Generating audio...",
    audioProgress: "Generated {processed}/{total} voice segments",
    paused: "Paused",
    complete: "Workout Complete! 🎉",
    stopped: "Stopped",
    exerciseStatus: "Exercise {current}/{total}",
    setStatus: "Set {current}/{total}",
    repStatus: "Rep {current}/{total}",
    
    btnPause: "⏸ Pause",
    btnResume: "▶ Resume",
    btnStop: "⏹ Stop",
    
    seekPrevEx: "⏮ Prev Exercise",
    seekPrevSet: "⏪ Prev Set",
    seekNextSet: "Next Set ⏩",
    seekNextEx: "Next Exercise ⏭",
    
    // Phases (for WorkoutPlayer)
    phaseStartWorkout: "Let's begin the workout.",
    phaseNextExercise: "Next exercise: {name}. {sets} sets of {reps} reps.",
    phaseStartSet: "Set {set}. Let's go.",
    phaseSetComplete: "Set complete.",
    phaseRestPhase: "Rest for {time} seconds.",
    phaseRestRemain: "{time} seconds remaining.",
    phaseRestTransition: "Next exercise is {name}. {sets} sets of {reps} reps. Rest for {time} seconds.",
    phaseHalfTime: "Half time.",
    phaseAlmostDone: "10 seconds left.",
    phaseGetReady: "Get ready...",
    phaseWorkoutComplete: "Workout complete. Great job!",
  },
  zh: {
    // Layout & General
    subtitle: "训练计划 · 语音提示",
    langPicker: "🌐 语言：",
    voiceReady: "语音就绪",
    voiceNotSupported: "未支持原生语音",
    voiceDefault: "语音就绪",
    close: "关闭",
    
    // Sidebar
    navLabel: "导航",
    navPlans: "训练计划",
    newPlan: "新建计划",
    howToUse: "使用说明",
    myPlansLabel: "我的计划",
    
    // Empty State
    noPlanTitle: "还没有训练计划",
    noPlanDesc: "点击左侧「新建计划」开始吧",
    
    // Audio Panel
    audioPanelTitle: "🎵 训练语音音频",
    audioNotSupportedDesc: "抱歉，你的浏览器不支持原生语音合成",
    audioReadyDesc: "点击开始训练，开始实时语音引导",
    startLoading: "准备",
    startWorkoutBtn: "⚡ 开始训练",
    
    // Plan Editor
    planNamePlaceholder: "输入训练计划名称…",
    planSaveSuccess: "计划已保存 ✨",
    planDeleteConfirm: "确认删除「{name}」？此操作不可撤销。",
    planDeleted: "已删除",
    exerciseList: "动作列表",
    exerciseCount: "{count} 个动作",
    planNameLabel: "计划名称：",
    planNameHint: "如：推力日",
    addExercise: "➕ 添加动作",
    savePlan: "💾 保存",
    deletePlan: "🗑️ 删除",
    exerciseNameLabel: "动作名称",
    sets: "组数",
    reps: "每组次数",
    rest: "组间休息 (秒)",
    transitionRest: "过渡休息 (秒)",
    tempoLabel: "节奏 (发力-停顿-复原)",
    reportTitle: "📝 训练总结报告",
    reportDesc: "训练完成后，给动作打分并记录难点，生成复盘 MD 报告。",
    reportBtn: "撰写报告…",
    
    // Workout Runner
    preparing: "准备中...",
    generatingAudio: "正在生成音频...",
    audioProgress: "已合成 {processed}/{total} 段语音",
    paused: "已暂停",
    complete: "训练完成！ 🎉",
    stopped: "已停止",
    exerciseStatus: "动作 {current}/{total}",
    setStatus: "第 {current}/{total} 组",
    repStatus: "第 {current}/{total} 次",
    
    btnPause: "⏸ 暂停",
    btnResume: "▶ 继续",
    btnStop: "⏹ 停止",
    
    seekPrevEx: "⏮ 上一动作",
    seekPrevSet: "⏪ 上一组",
    seekNextSet: "下一组 ⏩",
    seekNextEx: "下一动作 ⏭",
    
    // Phases (for WorkoutPlayer)
    phaseStartWorkout: "开始训练。",
    phaseNextExercise: "接下来：{name}，目标 {sets} 组，每组 {reps} 次。",
    phaseStartSet: "第 {set} 组，准备开始。",
    phaseSetComplete: "这组完成。",
    phaseRestPhase: "休息 {time} 秒。",
    phaseRestRemain: "休息还剩 {time} 秒。",
    phaseRestTransition: "下一个动作：{name}，目标 {sets} 组，每组 {reps} 次。休息 {time} 秒。",
    phaseHalfTime: "时间过半。",
    phaseAlmostDone: "最后 10 秒。",
    phaseGetReady: "准备...",
    phaseWorkoutComplete: "训练完成，辛苦了！",
  },
  ja: {
    // Layout & General
    subtitle: "トレーニング・音声ガイド",
    langPicker: "🌐 言語設定：",
    voiceReady: "音声準備完了",
    voiceNotSupported: "音声未対応",
    voiceDefault: "音声準備完了",
    close: "閉じる",
    
    // Sidebar
    navLabel: "ナビゲーション",
    navPlans: "プラン",
    newPlan: "新規プラン",
    howToUse: "使い方",
    myPlansLabel: "マイプラン",
    
    // Empty State
    noPlanTitle: "プランがありません",
    noPlanDesc: "左の「新規プラン」をクリックして始めましょう",
    
    // Audio Panel
    audioPanelTitle: "🎵 トレーニング音声",
    audioNotSupportedDesc: "申し訳ありません。お使いのブラウザは音声合成に対応していません。",
    audioReadyDesc: "「トレーニングを開始」をクリックして音声ガイドを始めましょう。",
    startLoading: "準備",
    startWorkoutBtn: "⚡ トレーニングを開始",
    
    // Plan Editor
    planNamePlaceholder: "プラン名を入力...",
    planSaveSuccess: "保存しました ✨",
    planDeleteConfirm: "「{name}」を削除しますか？この操作は取り消せません。",
    planDeleted: "削除しました",
    exerciseList: "種目リスト",
    exerciseCount: "{count} 種目",
    planNameLabel: "プラン名：",
    planNameHint: "例：上半身",
    addExercise: "➕ 種目を追加",
    savePlan: "💾 保存",
    deletePlan: "🗑️ 削除",
    exerciseNameLabel: "種目名",
    sets: "セット",
    reps: "回数",
    rest: "休憩(s)",
    transitionRest: "移行休憩(s)",
    tempoLabel: "テンポ (エキ-アイソ-コン)",
    reportTitle: "📝 レポート",
    reportDesc: "記録を残してMDレポートを作成します。",
    reportBtn: "レポート作成...",
    
    // Workout Runner
    preparing: "準備中...",
    generatingAudio: "音声を生成中...",
    audioProgress: "{processed}/{total} 件の音声を生成しました",
    paused: "一時停止中",
    complete: "トレーニング完了！ 🎉",
    stopped: "停止",
    exerciseStatus: "種目 {current}/{total}",
    setStatus: "第 {current}/{total} セット",
    repStatus: "第 {current}/{total} 回",
    
    btnPause: "⏸ 一時停止",
    btnResume: "▶ 再開",
    btnStop: "⏹ 停止",
    
    seekPrevEx: "⏮ 前の種目",
    seekPrevSet: "⏪ 前のセット",
    seekNextSet: "次のセット ⏩",
    seekNextEx: "次の種目 ⏭",
    
    // Phases (for WorkoutPlayer)
    phaseStartWorkout: "トレーニングを始めます。",
    phaseNextExercise: "次は、{name}。目標 {sets} セット、各 {reps} 回です。",
    phaseStartSet: "第 {set} セット、始めましょう。",
    phaseSetComplete: "このセット完了です。",
    phaseRestPhase: "{time} 秒休憩します。",
    phaseRestRemain: "休憩残り {time} 秒です。",
    phaseRestTransition: "次の種目は {name}。目標 {sets} セット、各 {reps} 回です。{time} 秒休憩します。",
    phaseHalfTime: "残り半分です。",
    phaseAlmostDone: "残り 10 秒です。",
    phaseGetReady: "準備して...",
    phaseWorkoutComplete: "トレーニング完了です。お疲れ様でした！",
  }
};

export function t(lang, key, params = {}) {
  const dict = locales[lang] || locales['en'];
  let str = dict[key] || locales['en'][key] || key;
  Object.keys(params).forEach(k => {
    str = str.replace(`{${k}}`, params[k]);
  });
  return str;
}
