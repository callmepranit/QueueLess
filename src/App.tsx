/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { QueueProvider, useQueue } from './context/QueueContext';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { JoinQueueView } from './components/JoinQueueView';
import { MyTokenView } from './components/MyTokenView';
import { LiveQueueView } from './components/LiveQueueView';
import { NotificationsView } from './components/NotificationsView';
import { StaffDashboard } from './components/StaffDashboard';
import { AnalyticsView } from './components/AnalyticsView';
import { Footer } from './components/Footer';
import { ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentTab, currentRole, setCurrentRole, setCurrentTab } = useQueue();

  const renderCurrentView = () => {
    switch (currentTab) {
      case 'home':
        return <HomeView />;
      case 'join':
        return <JoinQueueView />;
      case 'my-token':
        return <MyTokenView />;
      case 'live-status':
        return <LiveQueueView />;
      case 'notifications':
        return <NotificationsView />;
      case 'staff':
        return <StaffDashboard />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100 selection:text-cyan-900">
      {/* Top Demo Context Banner */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1.5 border-b border-slate-800 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="font-medium text-white">
              QueueLess Prototype:
            </span>
            <span className="hidden sm:inline text-slate-400">
              College Administration Service Desks Demonstration
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              Active Role:{' '}
              <strong className="text-cyan-300 font-semibold uppercase tracking-wider">
                {currentRole === 'staff' ? 'Staff / Administrator' : 'Student / Customer'}
              </strong>
            </span>
            {currentRole === 'customer' ? (
              <button
                onClick={() => {
                  setCurrentRole('staff');
                  setCurrentTab('staff');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-2 cursor-pointer"
              >
                Switch to Staff View
              </button>
            ) : (
              <button
                onClick={() => {
                  setCurrentRole('customer');
                  setCurrentTab('home');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-2 cursor-pointer"
              >
                Switch to Customer View
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <Navbar />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <QueueProvider>
      <AppContent />
    </QueueProvider>
  );
}
