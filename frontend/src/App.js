import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import AuthPage from './components/Auth/AuthPage';
import Sidebar from './components/Layout/Sidebar';
import TickerBar from './components/Layout/TickerBar';
import ToastContainer from './components/Layout/Toast';
import Dashboard from './components/Dashboard/Dashboard';
import Portfolio from './components/Portfolio/Portfolio';
import Transactions from './components/Transactions/Transactions';
import Budgets from './components/Budgets/Budgets';
import Analytics from './components/Analytics/Analytics';
import Tools from './components/Tools/Tools';
import {
  TransactionModal,
  InvestmentModal,
  BudgetModal,
  GoalModal,
} from './components/Modals/Modals';

function LoadingScreen() {
  return (
    <div style={{ position:'fixed', inset:0, background:'var(--bg-base)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ width:48, height:48, background:'linear-gradient(135deg,var(--accent),#7c3aed)', borderRadius:12, display:'grid', placeItems:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:'white' }}>F</div>
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700 }}>FinTrack <span style={{color:'var(--accent)'}}>Pro</span></div>
      <div style={{ width:32, height:32, border:'3px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function App() {
  const { user, loading, currentPage } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal state
  const [txnModal,  setTxnModal]  = useState({ open:false, data:null });
  const [invModal,  setInvModal]  = useState({ open:false, data:null });
  const [budModal,  setBudModal]  = useState({ open:false, data:null });
  const [goalModal, setGoalModal] = useState(false);

  const openModal = (type, data = null) => {
    if (type === 'transaction') setTxnModal({ open:true, data });
    if (type === 'investment')  setInvModal({ open:true, data });
    if (type === 'budget')      setBudModal({ open:true, data });
    if (type === 'goal')        setGoalModal(true);
  };

  if (loading) return <LoadingScreen />;
  if (!user)   return <><AuthPage /><ToastContainer /></>;

  const pages = { dashboard: Dashboard, portfolio: Portfolio, transactions: Transactions, budgets: Budgets, analytics: Analytics, tools: Tools };
  const PageComponent = pages[currentPage] || Dashboard;

  return (
    <>
      <TickerBar />
      <ToastContainer />

      {/* Sidebar overlay for mobile */}
      <div className={`sidebar-overlay${sidebarOpen ? ' show' : ''}`} onClick={() => setSidebarOpen(false)} />

      <div className="shell">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="main">
          {/* Mobile hamburger */}
          <div className="hamburger" onClick={() => setSidebarOpen(true)} style={{position:'fixed',top:42,left:12,zIndex:150}}>
            <span /><span /><span />
          </div>

          <PageComponent onOpenModal={openModal} />
        </main>
      </div>

      {/* Modals */}
      <TransactionModal open={txnModal.open}  onClose={() => setTxnModal({open:false,data:null})} editData={txnModal.data} />
      <InvestmentModal  open={invModal.open}  onClose={() => setInvModal({open:false,data:null})} editData={invModal.data} />
      <BudgetModal      open={budModal.open}  onClose={() => setBudModal({open:false,data:null})} editData={budModal.data} />
      <GoalModal        open={goalModal}      onClose={() => setGoalModal(false)} />
    </>
  );
}
