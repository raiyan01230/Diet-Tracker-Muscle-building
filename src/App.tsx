import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CalendarBar } from './components/CalendarBar';
import { DashboardView } from './components/DashboardView';
import { FoodLogView } from './components/FoodLogView';
import { AiAssistantView } from './components/AiAssistantView';
import { VitaminsMineralsView } from './components/VitaminsMineralsView';
import { MacrosCaloriesView } from './components/MacrosCaloriesView';
import { HydrationTrackerView } from './components/HydrationTrackerView';
import { SmartGapSolverView } from './components/SmartGapSolverView';
import { RoutinePlannerView } from './components/RoutinePlannerView';
import { WeeklyAuditView } from './components/WeeklyAuditView';
import { GrowthTrackerView } from './components/GrowthTrackerView';
import { ProgressConsistencyView } from './components/ProgressConsistencyView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { DataSourcesView } from './components/DataSourcesView';
import { TestRunnerModal } from './components/TestRunnerModal';

function MainContent({ onOpenTestModal }: { onOpenTestModal: () => void }) {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar onOpenTestModal={onOpenTestModal} />
      <CalendarBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'food-log' && <FoodLogView />}
        {activeTab === 'ai-assistant' && <AiAssistantView />}
        {activeTab === 'vitamins' && <VitaminsMineralsView />}
        {activeTab === 'macros' && <MacrosCaloriesView />}
        {activeTab === 'hydration' && <HydrationTrackerView />}
        {activeTab === 'gap-solver' && <SmartGapSolverView />}
        {activeTab === 'routine' && <RoutinePlannerView />}
        {activeTab === 'audit' && <WeeklyAuditView />}
        {activeTab === 'growth' && <GrowthTrackerView />}
        {activeTab === 'progress' && <ProgressConsistencyView />}
        {activeTab === 'profile' && <ProfileSettingsView />}
        {activeTab === 'sources' && <DataSourcesView />}
      </main>
    </div>
  );
}

export default function App() {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  return (
    <AppProvider>
      <MainContent onOpenTestModal={() => setIsTestModalOpen(true)} />
      <TestRunnerModal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} />
    </AppProvider>
  );
}
