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
    <div className="min-h-screen bg-[#ffffff] text-[#17191c] flex flex-col font-body selection:bg-[#fbe1d1] selection:text-[#5d2a1a]">
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
        className={`flex-1 transition-all duration-200 pt-[74px] px-3 sm:px-6 lg:px-8 pb-16
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
      >
        <div className="w-full max-w-[1360px] mx-auto">
          {renderActiveView()}
        </div>
      </main>

      {/* Global Interactive Modals & Toasts */}
      <JudgeDemoModal />
      <SearchModal />
      <AuthModal />
      <ToastContainer />

      {/* Steep Editorial Footer */}
      <footer
        className={`border-t border-[#17191c]/8 bg-[#ffffff] py-6 px-6 text-xs text-[#777b86] font-body transition-all duration-200
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#17191c]"></span>
            <span className="font-serif text-base text-[#17191c]">CivicPulse <em className="italic">Bengaluru</em></span>
            <span className="text-[#a3a6af]">·</span>
            <span className="text-[#777b86] text-xs">Editorial Civic Approval & Hazard Intelligence Ledger</span>
          </div>

          <div className="flex items-center gap-3 text-xs flex-wrap justify-center">
            <span className="pill-btn-peach text-xs">BBMP Sahaya 2.0</span>
            <span className="px-3 py-1 rounded-full bg-[#f2f2f3] text-[#17191c] font-medium">IRC:SP:100 Audited</span>
            <span className="px-3 py-1 rounded-full bg-[#f2f2f3] text-[#17191c] font-medium">Karnataka PWD DLP</span>
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
