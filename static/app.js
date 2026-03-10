/**
 * app.js — Smart Gym 前端交互逻辑
 */

// ========== 状态 ==========
let plans = [];          // 所有计划
let currentPlanId = null; // 当前选中 / 编辑中的计划 ID（null = 新建）

// ========== DOM 元素 ==========
const planListEl      = document.getElementById('plan-list');
const emptyStateEl    = document.getElementById('empty-state');
const planEditorEl    = document.getElementById('plan-editor');
const planTitleEl     = document.getElementById('plan-title');
const exerciseListEl  = document.getElementById('exercise-list');
const exerciseCountEl = document.getElementById('exercise-count');
const audioPlayerEl   = document.getElementById('audio-player');
const audioDescEl     = document.getElementById('audio-desc');
const btnSavePlan     = document.getElementById('btn-save-plan');
const btnDeletePlan   = document.getElementById('btn-delete-plan');
const btnAddExercise  = document.getElementById('btn-add-exercise');
const btnGenAudio     = document.getElementById('btn-gen-audio');
const btnNewPlan      = document.getElementById('btn-new-plan');

// 报告 Modal 元素
const btnOpenReport   = document.getElementById('btn-open-report');
const reportModal     = document.getElementById('report-modal');
const btnCloseReport  = document.getElementById('btn-close-report');
const btnCancelReport = document.getElementById('btn-cancel-report');
const btnSubmitReport = document.getElementById('btn-submit-report');
const reportExList    = document.getElementById('report-exercise-list');
const reportNotes     = document.getElementById('report-notes');
const reportResArea   = document.getElementById('report-result-area');
const reportMdPreview = document.getElementById('report-md-preview');

// ========== Toast 提示 ==========
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${msg}`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ========== API 工具 ==========
async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `请求失败 (${res.status})`);
  return json;
}

// ========== 渲染侧边栏 ==========
function renderSidebar() {
  planListEl.innerHTML = '';
  plans.forEach(plan => {
    const item = document.createElement('div');
    item.className = `plan-item${plan.id === currentPlanId ? ' active' : ''}`;
    item.dataset.id = plan.id;
    item.innerHTML = `
      <span class="plan-icon">📋</span>
      <span class="plan-name" title="${plan.name}">${plan.name}</span>
    `;
    item.addEventListener('click', () => selectPlan(plan.id));
    planListEl.appendChild(item);
  });
}

// ========== 渲染编辑器 ==========
function renderEditor() {
  const plan = plans.find(p => p.id === currentPlanId);
  const exercises = plan ? plan.exercises : [];

  planTitleEl.value = plan ? plan.name : '';
  btnDeletePlan.style.display = plan ? '' : 'none';

  exerciseListEl.innerHTML = '';
  exercises.forEach((ex, idx) => addExerciseCard(ex, idx));
  updateExerciseCount();

  // 重置音频
  audioPlayerEl.style.display = 'none';
  audioPlayerEl.src = '';
  audioDescEl.textContent = '点击生成后，可在页面内直接播放完整训练引导音频';

  emptyStateEl.style.display = 'none';
  planEditorEl.style.display = 'flex';
}

function showEmpty() {
  emptyStateEl.style.display = 'flex';
  planEditorEl.style.display = 'none';
  currentPlanId = null;
  renderSidebar();
}

// ========== 动作卡片 ==========
function getCardValues(card) {
  return {
    name:  card.querySelector('.ex-name').value.trim(),
    sets:  parseInt(card.querySelector('.ex-sets').value)  || 3,
    reps:  parseInt(card.querySelector('.ex-reps').value)  || 10,
    rest:  parseInt(card.querySelector('.ex-rest').value)  || 60,
    transition_rest: parseInt(card.querySelector('.ex-trans-rest').value) || 120,
    tempo: [
      parseFloat(card.querySelector('.ex-t0').value) || 2,
      parseFloat(card.querySelector('.ex-t1').value) || 0,
      parseFloat(card.querySelector('.ex-t2').value) || 2,
    ],
  };
}

function addExerciseCard(ex = null, idx = null) {
  const card = document.createElement('div');
  card.className = 'exercise-card';
  const name   = ex?.name  ?? '';
  const sets   = ex?.sets  ?? 3;
  const reps   = ex?.reps  ?? 10;
  const rest   = ex?.rest  ?? 60;
  const trans_rest = ex?.transition_rest ?? 120;
  const tempo  = ex?.tempo ?? [1, 1, 3];
  const label  = idx !== null ? `动作 ${idx + 1}` : '新动作';

  card.setAttribute('draggable', 'true');

  card.innerHTML = `
    <div class="exercise-fields">
      <div class="field-group">
        <label>动作名称</label>
        <input class="ex-name" type="text" placeholder="例：深蹲、卧推…" value="${name}" />
      </div>
      <div class="field-group">
        <label>组数</label>
        <input class="ex-sets" type="number" min="1" max="20" value="${sets}" />
      </div>
      <div class="field-group">
        <label>每组次数</label>
        <input class="ex-reps" type="number" min="1" max="200" value="${reps}" />
      </div>
      <div class="field-group">
        <label>组间休息 (秒)</label>
        <input class="ex-rest" type="number" min="0" max="600" value="${rest}" />
      </div>
      <div class="field-group">
        <label>过渡休息 (秒)</label>
        <input class="ex-trans-rest" type="number" min="0" max="600" value="${trans_rest}" title="完成此动作后，切换到下一个动作前的休息时间" />
      </div>
      <div class="field-group" style="grid-column: span 2;">
        <label>节奏 (发力-停顿-复原)</label>
        <div class="tempo-inputs">
          <input class="ex-t0" type="number" min="0" max="10" step="0.5" value="${tempo[0]}" />
          <span class="tempo-sep">-</span>
          <input class="ex-t1" type="number" min="0" max="10" step="0.5" value="${tempo[1]}" />
          <span class="tempo-sep">-</span>
          <input class="ex-t2" type="number" min="0" max="10" step="0.5" value="${tempo[2]}" />
        </div>
      </div>
    </div>
    <div class="exercise-actions" style="cursor: grab;" title="拖拽排序">
      <span style="font-size:1.2rem;opacity:0.5;margin-right:12px;">☰</span>
      <button class="btn btn-danger btn-sm btn-rm-ex" title="删除此动作">✕</button>
    </div>
  `;

  card.querySelector('.btn-rm-ex').addEventListener('click', () => {
    card.style.animation = 'none';
    card.style.opacity = '0';
    card.style.transform = 'translateY(-8px)';
    card.style.transition = '0.18s ease';
    setTimeout(() => { card.remove(); updateExerciseCount(); }, 180);
  });

  // 拖拽排序逻辑
  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.effectAllowed = 'move';
    card.classList.add('dragging');
    setTimeout(() => card.style.opacity = '0.5', 0);
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    card.style.opacity = '1';
  });

  card.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const draggingEl = exerciseListEl.querySelector('.dragging');
    if (!draggingEl || draggingEl === card) return;

    const rect = card.getBoundingClientRect();
    const offset = e.clientY - rect.top - (rect.height / 2);
    if (offset < 0) {
      card.before(draggingEl);
    } else {
      card.after(draggingEl);
    }
  });

  exerciseListEl.appendChild(card);
  updateExerciseCount();
}

function updateExerciseCount() {
  const n = exerciseListEl.querySelectorAll('.exercise-card').length;
  exerciseCountEl.textContent = `${n} 个动作`;
}

function collectExercises() {
  return Array.from(exerciseListEl.querySelectorAll('.exercise-card')).map(c => getCardValues(c));
}

// ========== 计划选择 / 新建 ==========
function selectPlan(id) {
  currentPlanId = id;
  renderSidebar();
  renderEditor();
}

function newPlan() {
  currentPlanId = null;
  renderSidebar();

  // 清空编辑器
  planTitleEl.value = '';
  exerciseListEl.innerHTML = '';
  btnDeletePlan.style.display = 'none';
  audioPlayerEl.style.display = 'none';
  audioDescEl.textContent = '保存计划后即可生成音频';
  updateExerciseCount();

  emptyStateEl.style.display = 'none';
  planEditorEl.style.display = 'flex';
  planTitleEl.focus();
}

// ========== 保存 ==========
async function savePlan() {
  const name = planTitleEl.value.trim();
  if (!name) { showToast('请填写计划名称', 'error'); planTitleEl.focus(); return; }
  const exercises = collectExercises();

  setLoading(btnSavePlan, true);
  try {
    let saved;
    if (currentPlanId) {
      saved = await api('PUT', `/api/plans/${currentPlanId}`, { name, exercises });
    } else {
      saved = await api('POST', '/api/plans', { name, exercises });
    }
    currentPlanId = saved.id;
    await loadPlans();
    renderSidebar();
    showToast('计划已保存 ✨');
  } catch (e) {
    showToast(e.message, 'error');
  } finally {
    setLoading(btnSavePlan, false);
  }
}

// ========== 删除 ==========
async function deletePlan() {
  if (!currentPlanId) return;
  const plan = plans.find(p => p.id === currentPlanId);
  if (!confirm(`确认删除「${plan?.name}」？此操作不可撤销。`)) return;

  try {
    await api('DELETE', `/api/plans/${currentPlanId}`);
    currentPlanId = null;
    await loadPlans();
    if (plans.length) selectPlan(plans[0].id);
    else showEmpty();
    showToast('已删除');
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// ========== 生成音频 ==========
async function generateAudio() {
  if (!currentPlanId) {
    showToast('请先保存计划', 'error');
    return;
  }
  setLoading(btnGenAudio, true);
  audioDescEl.textContent = '正在生成音频，请稍候…（首次可能需要 1-2 分钟）';
  audioPlayerEl.style.display = 'none';

  try {
    const res = await fetch(`/api/plans/${currentPlanId}/generate-audio`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || '生成失败');
    }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    audioPlayerEl.src = url;
    audioPlayerEl.style.display = 'block';
    audioPlayerEl.play();
    audioDescEl.textContent = '音频已生成，正在播放 🎧';
    showToast('音频生成成功！');
  } catch (e) {
    audioDescEl.textContent = '生成失败，请检查网络或 gTTS / ffmpeg 配置。';
    showToast(e.message, 'error');
  } finally {
    setLoading(btnGenAudio, false);
  }
}

// ========== 辅助：Loading 状态 ==========
function setLoading(btn, loading) {
  if (loading) btn.classList.add('loading');
  else btn.classList.remove('loading');
  btn.disabled = loading;
}

// ========== 加载数据 ==========
async function loadPlans() {
  try {
    plans = await api('GET', '/api/plans');
  } catch (e) {
    plans = [];
    showToast('加载计划失败：' + e.message, 'error');
  }
}

// ========== 初始化 ==========
async function init() {
  await loadPlans();
  renderSidebar();
  if (plans.length) {
    selectPlan(plans[0].id);
  } else {
    showEmpty();
  }
}

// ========== 报告逻辑 ==========
function openReportModal() {
  if (!currentPlanId) {
    showToast('请先保存或选择一个计划', 'error');
    return;
  }
  const plan = plans.find(p => p.id === currentPlanId);
  if (!plan || !plan.exercises || plan.exercises.length === 0) {
    showToast('当前计划没有动作', 'error');
    return;
  }

  // 渲染打分列表
  reportExList.innerHTML = '';
  plan.exercises.forEach((ex, idx) => {
    const item = document.createElement('div');
    item.className = 'report-ex-item';
    item.dataset.idx = idx;
    item.dataset.name = ex.name;
    item.innerHTML = `
      <div class="report-ex-header">${idx + 1}. ${ex.name}</div>
      <div class="report-score-options">
        <label class="score-opt selected"><input type="radio" name="score-${idx}" value="3" checked>3: 能够完成每组</label>
        <label class="score-opt"><input type="radio" name="score-${idx}" value="2">2: 只能完成80%</label>
        <label class="score-opt"><input type="radio" name="score-${idx}" value="1">1: 只能完成50%</label>
        <label class="score-opt"><input type="radio" name="score-${idx}" value="0">0: 完全不能完成</label>
      </div>
      <div>
        <input type="text" class="ex-difficulty" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:var(--radius-sm); background:var(--bg-surface); color:var(--text-primary);" placeholder="可选：填写本动作难点或感受...">
      </div>
    `;

    // 绑定单选按钮高亮逻辑
    const labels = item.querySelectorAll('.score-opt');
    labels.forEach(lbl => {
      lbl.querySelector('input').addEventListener('change', (e) => {
        labels.forEach(l => l.classList.remove('selected'));
        if (e.target.checked) lbl.classList.add('selected');
      });
    });

    reportExList.appendChild(item);
  });

  reportNotes.value = '';
  reportResArea.style.display = 'none';
  btnSubmitReport.style.display = '';
  reportModal.style.display = 'flex';
}

function closeReportModal() {
  reportModal.style.display = 'none';
}

async function submitReport() {
  const exItems = reportExList.querySelectorAll('.report-ex-item');
  const exercises = [];
  exItems.forEach(item => {
    const name = item.dataset.name;
    const score = parseInt(item.querySelector('input[type="radio"]:checked').value);
    const difficulty = item.querySelector('.ex-difficulty').value.trim();
    exercises.push({ name, score, difficulty });
  });

  const notes = reportNotes.value.trim();
  const payload = { exercises, notes };

  setLoading(btnSubmitReport, true);
  try {
    const res = await api('POST', `/api/plans/${currentPlanId}/report`, payload);
    showToast('报告已生成 ✅');
    reportMdPreview.value = res.md_content;
    reportResArea.style.display = 'block';
    btnSubmitReport.style.display = 'none'; // 隐藏提交按钮，只看结果
  } catch (e) {
    showToast(e.message, 'error');
  } finally {
    setLoading(btnSubmitReport, false);
  }
}

// ========== 事件绑定 ==========
btnNewPlan.addEventListener('click', newPlan);
btnSavePlan.addEventListener('click', savePlan);
btnDeletePlan.addEventListener('click', deletePlan);
btnAddExercise.addEventListener('click', () => addExerciseCard());
btnGenAudio.addEventListener('click', generateAudio);
btnOpenReport.addEventListener('click', openReportModal);
btnCloseReport.addEventListener('click', closeReportModal);
btnCancelReport.addEventListener('click', closeReportModal);

// 若点击遮罩层也关闭
reportModal.addEventListener('click', (e) => {
  if (e.target === reportModal) closeReportModal();
});
btnSubmitReport.addEventListener('click', submitReport);

// 启动
init();
