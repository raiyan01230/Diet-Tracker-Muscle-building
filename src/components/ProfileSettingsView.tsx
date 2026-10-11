import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Settings, Download, Upload, RefreshCw, Check, ShieldCheck } from 'lucide-react';

export function ProfileSettingsView() {
  const { userProfile, updateUserProfile, exportDataJSON, exportDataCSV, importDataJSON, resetToDefault } = useApp();
  const [importJsonText, setImportJsonText] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Profile and settings successfully updated!');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleExportJSON = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pusty_briddhi_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    const csvStr = exportDataCSV();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pusty_briddhi_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const ok = importDataJSON(importJsonText);
    if (ok) {
      setSuccessMsg('Data successfully imported!');
      setImportJsonText('');
    } else {
      alert('Failed to import JSON data. Please check format.');
    }
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
        <h1 className="text-xl font-bold text-stone-900">Profile & Settings</h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Configure personal metrics, timezone, units, and data backups.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs">
          <span>{successMsg}</span>
          <Check className="w-4 h-4 text-emerald-700" />
        </div>
      )}

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
          <span>Data Storage, Export & Backups</span>
        </h2>
        <p className="text-xs text-stone-500">
          Export your food logs and growth measurements as JSON or CSV, or restore from a backup.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold border border-stone-300 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export JSON Backup</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold border border-stone-300 transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export CSV Report</span>
          </button>
        </div>

        <div className="pt-4 border-t border-stone-100 space-y-2">
          <label className="block text-xs font-medium text-stone-700">Import Backup JSON</label>
          <textarea
            rows={3}
            value={importJsonText}
            onChange={e => setImportJsonText(e.target.value)}
            placeholder="Paste backup JSON string here..."
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
          />
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Import Data
          </button>
        </div>
      </div>
    </div>
  );
}
