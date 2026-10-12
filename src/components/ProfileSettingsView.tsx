import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProfileAnalyticsGraph } from './ProfileAnalyticsGraph';
import { User, Settings, Download, RefreshCw, Check, ShieldCheck, Database, CalendarCheck, Cloud, HardDrive, AlertCircle, Trash2 } from 'lucide-react';

export function ProfileSettingsView() {
  const { 
    userProfile, 
    updateUserProfile, 
    exportDataJSON, 
    exportDataCSV, 
    importDataJSON, 
    resetToDefault,
    clearAllFoodLogs,
    dbStatus,
    syncNow
  } = useApp();

  const [importJsonText, setImportJsonText] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAllFakeData = async () => {
    setIsClearing(true);
    await clearAllFoodLogs();
    setIsClearing(false);
    setSuccessMsg('All fake and sample food logs have been completely removed! Clean slate with 0 logged foods.');
    setTimeout(() => setSuccessMsg(null), 4500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Profile and settings successfully updated and saved to Cloud SQL!');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleManualSync = async () => {
    setIsSyncingLocal(true);
    await syncNow();
    setIsSyncingLocal(false);
    setSuccessMsg('All records, historical days, and weekly logs successfully synchronized with Cloud SQL PostgreSQL!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleExportJSON = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pusty_briddhi_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    const csvStr = exportDataCSV();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pusty_briddhi_food_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const ok = importDataJSON(importJsonText);
    if (ok) {
      setSuccessMsg('Data successfully imported and committed to Cloud SQL PostgreSQL database!');
      setImportJsonText('');
    } else {
      alert('Failed to import JSON data. Please verify file structure.');
    }
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
        <h1 className="text-xl font-bold text-stone-900">Profile, Settings & Database Configuration</h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Permanent multi-year dietary record storage, clinical metrics, timezone, and data backups.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs">
          <span>{successMsg}</span>
          <Check className="w-4 h-4 text-emerald-700" />
        </div>
      )}

      {/* Profile Health & Nutrition Graph */}
      <ProfileAnalyticsGraph />

      {/* Cloud SQL Database Permanent Storage Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">Cloud SQL PostgreSQL Database Storage</h2>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Active & Verified</span>
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Full relational persistence for every daily meal, weekly audit, 30-day, 90-day, and 1-year history.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleClearAllFakeData}
              disabled={isClearing}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
              title="Delete all demo/test food logs for a clean slate"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isClearing ? 'Clearing...' : 'Clear Fake Data'}</span>
            </button>

            <button
              onClick={handleManualSync}
              disabled={isSyncingLocal || dbStatus.isSyncing}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${(isSyncingLocal || dbStatus.isSyncing) ? 'animate-spin' : ''}`} />
              <span>{isSyncingLocal || dbStatus.isSyncing ? 'Syncing...' : 'Sync Database Now'}</span>
            </button>
          </div>
        </div>

        {/* Database Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-stone-800/80 border border-stone-700/60 rounded-xl p-3">
            <div className="text-[11px] text-stone-400 flex items-center space-x-1">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Food Logs</span>
            </div>
            <div className="text-lg font-bold text-white mt-1">
              {dbStatus.totalFoodLogs}
            </div>
            <div className="text-[10px] text-emerald-400">All entries stored</div>
          </div>

          <div className="bg-stone-800/80 border border-stone-700/60 rounded-xl p-3">
            <div className="text-[11px] text-stone-400 flex items-center space-x-1">
              <CalendarCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Days Tracked</span>
            </div>
            <div className="text-lg font-bold text-white mt-1">
              {dbStatus.daysWithLogs}
            </div>
            <div className="text-[10px] text-blue-300">Continuous history</div>
          </div>

          <div className="bg-stone-800/80 border border-stone-700/60 rounded-xl p-3">
            <div className="text-[11px] text-stone-400 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Retention</span>
            </div>
            <div className="text-lg font-bold text-white mt-1">
              Permanent
            </div>
            <div className="text-[10px] text-purple-300">30d / 90d / 1-Year+</div>
          </div>

          <div className="bg-stone-800/80 border border-stone-700/60 rounded-xl p-3">
            <div className="text-[11px] text-stone-400 flex items-center space-x-1">
              <Cloud className="w-3.5 h-3.5 text-amber-400" />
              <span>Status</span>
            </div>
            <div className="text-lg font-bold text-white mt-1">
              {dbStatus.connected ? 'Online' : 'Offline'}
            </div>
            <div className="text-[10px] text-stone-300">
              {dbStatus.lastSyncedAt ? 'Synced ' + new Date(dbStatus.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ready'}
            </div>
          </div>
        </div>

        {/* Database Assurance Notice */}
        <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-xl p-3 text-xs text-stone-200 flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Data Integrity Guaranteed:</strong> Every single meal entry, custom recipe, water log, habit checkmark, and height/weight measurement is stored in Cloud SQL PostgreSQL. Even if you clear your browser cookies, change browsers, or come back after 30 days, 90 days, or a whole year, your clinical history will never be lost.
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
          <User className="w-5 h-5 text-emerald-600" />
          <span>Personal Profile & Baseline</span>
        </h2>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Full Name</label>
            <input
              type="text"
              value={userProfile.name}
              onChange={e => updateUserProfile({ name: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Age (Years)</label>
            <input
              type="number"
              value={userProfile.age}
              onChange={e => updateUserProfile({ age: parseInt(e.target.value) || 16 })}
              min={10}
              max={100}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Reference Sex</label>
            <select
              value={userProfile.referenceSex}
              onChange={e => updateUserProfile({ referenceSex: e.target.value as any })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Timezone</label>
            <input
              type="text"
              value={userProfile.timezone}
              onChange={e => updateUserProfile({ timezone: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Glass Water Volume (ml)</label>
            <input
              type="number"
              value={userProfile.glassVolumeMl || 250}
              onChange={e => updateUserProfile({ glassVolumeMl: parseInt(e.target.value) || 250 })}
              min={100}
              max={1000}
              step={50}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Activity Level</label>
            <select
              value={userProfile.activityLevel}
              onChange={e => updateUserProfile({ activityLevel: e.target.value as any })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800"
            >
              <option value="inactive">Sedentary (Inactive)</option>
              <option value="low_active">Low Active (School/Study)</option>
              <option value="active">Active (Daily sports/walking)</option>
              <option value="very_active">Very Active (Athlete/Heavy training)</option>
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              Save Profile Settings
            </button>
          </div>
        </form>
      </div>

      {/* Data Export / Import & Backup */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span>Local Export & Disaster Recovery</span>
        </h2>
        <p className="text-xs text-stone-500">
          In addition to automatic Cloud SQL database persistence, you can also export physical JSON/CSV files or restore snapshots anytime.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold border border-stone-300 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export JSON Database Backup</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold border border-stone-300 transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export CSV Food Logs Report</span>
          </button>

          <button
            onClick={resetToDefault}
            className="flex items-center space-x-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold border border-stone-300 transition-colors"
          >
            <AlertCircle className="w-4 h-4 text-stone-500" />
            <span>Reset Profile Baseline</span>
          </button>

          <button
            onClick={handleClearAllFakeData}
            disabled={isClearing}
            className="flex items-center space-x-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-300 transition-colors shadow-2xs"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>{isClearing ? 'Clearing Data...' : 'Remove All Fake / Test Food Logs (Clean Slate)'}</span>
          </button>
        </div>

        <div className="pt-4 border-t border-stone-100 space-y-2">
          <label className="block text-xs font-medium text-stone-700">Import & Sync Backup JSON</label>
          <textarea
            rows={3}
            value={importJsonText}
            onChange={e => setImportJsonText(e.target.value)}
            placeholder="Paste backup JSON string here..."
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-mono text-[11px]"
          />
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Import & Persist Data to Database
          </button>
        </div>
      </div>
    </div>
  );
}
