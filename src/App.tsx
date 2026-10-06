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
import { DemoPage } from './pages/DemoPage';
import { ScrollWorldPage } from './pages/ScrollWorldPage';

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
      case 'DEMO':
        return <DemoPage />;
      case 'SCROLL_WORLD':
        return <ScrollWorldPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#CFE8D6] grid-paper text-[#121210] flex flex-col font-body selection:bg-[#E8A030]/40 selection:text-[#121210]">
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
        className={`flex-1 transition-all duration-200 pt-[74px] px-3 sm:px-5 lg:px-6 pb-12
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
      >
        <div className="w-full">
          {renderActiveView()}
        </div>
      </main>

      {/* Global Interactive Modals & Toasts */}
      <JudgeDemoModal />
      <SearchModal />
      <AuthModal />
      <ToastContainer />

      {/* Brutalist Footer */}
      <footer
        className={`border-t-[3px] border-[#121210] bg-[#CFE8D6] py-5 px-6 text-xs text-[#121210] font-mono transition-all duration-200
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-bold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#2E8C42] border border-[#121210]"></span>
            <span className="font-display font-extrabold text-sm text-[#121210]">CIVICPULSE BENGALURU</span>
            <span className="text-[#121210]/40">·</span>
            <span className="text-[#121210]/70 text-[11px]">AI-Powered Civic Approval Operations Ledger</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#121210]/70 flex-wrap justify-center">
            <span className="tag bg-white py-0.5 px-2">CLERK AUTH</span>
            <span className="tag bg-white py-0.5 px-2">BBMP SAHAYA 2.0</span>
            <span className="tag bg-[#2E8C42] text-white py-0.5 px-2">IRC-SP-100 AUDITED</span>
            <span className="tag bg-[#E8A030] text-[#121210] py-0.5 px-2">KARNATAKA PWD DLP</span>
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
