import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ClerkAuthProvider } from './components/auth/ClerkAuthProvider';
import { AuthModal } from './components/auth/AuthModal';
import { ProtectedView } from './components/auth/ProtectedView';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ToastContainer } from './components/common/ToastContainer';
import { SearchModal } from './components/ui/SearchModal';
import { JudgeDemoModal } from './components/demo/JudgeDemoModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { ReportPage } from './pages/ReportPage';
import { GodsEyePage } from './pages/GodsEyePage';
import { PotholeIntelligencePage } from './pages/PotholeIntelligencePage';
import { PriorityQueuePage } from './pages/PriorityQueuePage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { RepairVerificationPage } from './pages/RepairVerificationPage';
import { ContractorIntelligencePage } from './pages/ContractorIntelligencePage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

const AppContent: React.FC = () => {
  const { currentView } = useApp();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (currentView) {
      case 'LANDING':
        return <LandingPage />;
      case 'REPORT':
        return (
          <ProtectedView title="Report Pothole">
            <ReportPage />
          </ProtectedView>
        );
      case 'GODS_EYE':
        return (
          <ProtectedView title="God's Eye Geospatial Intelligence">
            <GodsEyePage />
          </ProtectedView>
        );
      case 'AI_ANALYSIS':
        return (
          <ProtectedView title="Pothole Intelligence & Vision Lab">
            <PotholeIntelligencePage />
          </ProtectedView>
        );
      case 'PRIORITY_QUEUE':
        return (
          <ProtectedView title="Hazard Priority Queue">
            <PriorityQueuePage />
          </ProtectedView>
        );
      case 'INCIDENT_DETAIL':
        return (
          <ProtectedView title="Incident Investigation Dossier">
            <IncidentDetailPage />
          </ProtectedView>
        );
      case 'VERIFICATION':
        return (
          <ProtectedView title="AI Repair Verification Lab">
            <RepairVerificationPage />
          </ProtectedView>
        );
      case 'CONTRACTORS':
        return (
          <ProtectedView title="Contractor Compliance Intelligence">
            <ContractorIntelligencePage />
          </ProtectedView>
        );
      case 'COMPLAINTS':
        return (
          <ProtectedView title="BBMP Sahaya SLA Complaints">
            <ComplaintsPage />
          </ProtectedView>
        );
      case 'ANALYTICS':
        return (
          <ProtectedView title="Bengaluru Civic Analytics">
            <AnalyticsPage />
          </ProtectedView>
        );
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* Sidebar Component */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* TopBar Component */}
      <TopBar
        isSidebarCollapsed={isSidebarCollapsed}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 pt-20 px-4 sm:px-6 lg:px-8
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
      >
        <div className="max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </div>
      </main>

      {/* Global Interactive Modals & Toasts */}
      <JudgeDemoModal />
      <SearchModal />
      <AuthModal />
      <ToastContainer />

      {/* Footer */}
      <footer
        className={`border-t border-white/5 py-6 px-6 text-xs text-slate-500 font-mono transition-all duration-300
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="font-bold text-slate-300">CivicPulse Bengaluru</span>
            <span className="text-slate-600">|</span>
            <span>AI-Powered Pothole Intelligence &amp; Accountability</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Clerk Auth Protected</span>
            <span>•</span>
            <span>BBMP Sahaya 2.0 Synced</span>
            <span>•</span>
            <span>IRC-SP-100 Compliant</span>
            <span>•</span>
            <span>Karnataka PWD DLP Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ClerkAuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ClerkAuthProvider>
  );
}
