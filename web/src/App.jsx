import React, { createContext, useState, useCallback, useMemo } from 'react';
import './index.css';
import useWebSpeech from './hooks/useWebSpeech.js';
import Layout from './components/Layout.jsx';
import Sidebar from './components/Sidebar.jsx';
import PlanEditor from './components/PlanEditor.jsx';
import HowToPage from './components/HowToPage.jsx';
import DashboardPage from './components/DashboardPage.jsx';
import Toast from './components/Toast.jsx';
import { getAllPlans, seedDefaultPlans } from './store/plansStore.js';
import { getAllReports } from './store/reportsStore.js';
import { t } from './utils/i18n.js';

// 全局上下文
export const AppContext = createContext(null);
export const ToastContext = createContext(null);

// 初始化
seedDefaultPlans();

export default function App() {
  const [page, setPage] = useState('dashboard'); // 'dashboard' | 'plans' | 'howto'
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [plans, setPlans] = useState(() => getAllPlans());
  const [currentPlanId, setCurrentPlanId] = useState(() => {
    const all = getAllPlans();
    return all.length > 0 ? all[0].id : null;
  });

  // 应用语言状态：en, zh, ja
  const [lang, setLang] = useState('en');

  // 依赖原生 Web Speech
  const tts = useWebSpeech();

  // Toast 系统
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // Reports for progress tracking
  const reports = useMemo(() => getAllReports(), []);

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
    lang,
    setLang,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <ToastContext.Provider value={showToast}>
        <Layout
          sidebar={<Sidebar />}
          mobileNavOpen={mobileNavOpen}
          setMobileNavOpen={setMobileNavOpen}
        >
          <main>
            {page === 'dashboard' ? (
              <DashboardPage
                plans={plans}
                currentPlanId={currentPlanId}
                selectPlan={selectPlan}
                reports={reports}
                lang={lang}
              />
            ) : page === 'howto' ? (
              <HowToPage />
            ) : page === 'plans' ? (
              <PlanEditor key={currentPlanId || 'new'} />
            ) : (
              <DashboardPage
                plans={plans}
                currentPlanId={currentPlanId}
                selectPlan={selectPlan}
                reports={reports}
                lang={lang}
              />
            )}
          </main>
        </Layout>
        <Toast toasts={toasts} />
      </ToastContext.Provider>
    </AppContext.Provider>
  );
}
