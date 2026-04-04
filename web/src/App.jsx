import React, { createContext, useState, useCallback } from 'react';
import './index.css';
import useWebSpeech from './hooks/useWebSpeech.js';
import Layout from './components/Layout.jsx';
import Sidebar from './components/Sidebar.jsx';
import PlanEditor from './components/PlanEditor.jsx';
import HowToPage from './components/HowToPage.jsx';
import Toast from './components/Toast.jsx';
import { getAllPlans, seedDefaultPlans } from './store/plansStore.js';

// 全局上下文
export const AppContext = createContext(null);
export const ToastContext = createContext(null);

// 初始化
seedDefaultPlans();

export default function App() {
  const [page, setPage] = useState('plans'); // 'plans' | 'howto'
  const [plans, setPlans] = useState(() => getAllPlans());
  const [currentPlanId, setCurrentPlanId] = useState(() => {
    const all = getAllPlans();
    return all.length > 0 ? all[0].id : null;
  });

  // 依赖原生 Web Speech
  const tts = useWebSpeech();

  // Toast 系统
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const refreshPlans = useCallback(() => {
    setPlans(getAllPlans());
  }, []);

  const selectPlan = useCallback((id) => {
    setCurrentPlanId(id);
    setPage('plans');
  }, []);

  const contextValue = {
    plans,
    currentPlanId,
    selectPlan,
    refreshPlans,
    setCurrentPlanId,
    tts,
    page,
    setPage,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <ToastContext.Provider value={showToast}>
        <Layout>
          <Sidebar />
          <main>
            {page === 'howto' ? (
              <HowToPage />
            ) : currentPlanId || page === 'new' ? (
              <PlanEditor key={currentPlanId || 'new'} />
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h2>还没有训练计划</h2>
                <p>点击左侧「新建计划」开始吧</p>
              </div>
            )}
          </main>
        </Layout>
        <Toast toasts={toasts} />
      </ToastContext.Provider>
    </AppContext.Provider>
  );
}
