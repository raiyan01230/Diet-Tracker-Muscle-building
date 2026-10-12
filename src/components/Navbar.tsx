import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Sparkles, 
  Apple, 
  Flame, 
  TrendingUp, 
  BarChart3, 
  User, 
  BookOpen,
  ShieldCheck,
  FlaskConical,
  Droplet,
  Calendar,
  Database
} from 'lucide-react';

interface NavbarProps {
  onOpenTestModal: () => void;
}

export function Navbar({ onOpenTestModal }: NavbarProps) {
  const { activeTab, setActiveTab, userProfile, dbStatus } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'food-log', label: 'Daily Food Log', icon: UtensilsCrossed },
    { id: 'ai-assistant', label: 'AI Food Assistant', icon: Sparkles, badge: 'AI' },
    { id: 'vitamins', label: 'Vitamins & Minerals', icon: Apple },
    { id: 'macros', label: 'Calories & Macros', icon: Flame },
    { id: 'hydration', label: 'Water & Hydration', icon: Droplet },
    { id: 'gap-solver', label: 'Smart Gap Solver', icon: Sparkles },
    { id: 'routine', label: 'Routine Planner', icon: Calendar },
    { id: 'audit', label: 'Weekly Audit', icon: ShieldCheck },
    { id: 'growth', label: 'Height & Weight', icon: TrendingUp },
    { id: 'progress', label: 'Progress & Consistency', icon: BarChart3 },
    { id: 'profile', label: 'Profile & Settings', icon: User },
    { id: 'sources', label: 'Data Sources', icon: BookOpen },
  ];

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
              পু
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-stone-900 text-lg tracking-tight">পুষ্টি ও বৃদ্ধি</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                  Nutrition Intelligence
                </span>
              </div>
              <p className="text-xs text-stone-500">FAO 2013 • NIH ODS • National Academies</p>
            </div>
          </div>

          {/* Quick User & Test Runner */}
          <div className="flex items-center space-x-3">
            <div 
              onClick={() => setActiveTab('profile')}
              className={`hidden lg:flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
                dbStatus.connected 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                  : 'bg-stone-50 text-stone-800 border-stone-300 hover:bg-stone-100'
              }`}
              title="Dual Storage Architecture: Cloud SQL PostgreSQL (Cloud Persistence) and Offline Database (Local Storage Fallback)"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>{dbStatus.connected ? `Cloud SQL: Online (${dbStatus.totalFoodLogs} logs)` : 'Offline Database: Active'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${dbStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            </div>

            <button
              onClick={onOpenTestModal}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg transition-colors border border-stone-300"
            >
              <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
              <span>Run Validation Tests</span>
            </button>

            <div 
              onClick={() => setActiveTab('profile')}
              className="flex items-center space-x-2 bg-stone-50 hover:bg-stone-100 p-1.5 pr-3 rounded-full border border-stone-200 cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-semibold">
                {userProfile.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-stone-800">{userProfile.name}</div>
                <div className="text-[10px] text-stone-500">{userProfile.age} yrs • {userProfile.heightCm}cm / {userProfile.weightKg}kg</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-stone-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
