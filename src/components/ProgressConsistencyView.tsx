import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, Calendar, CheckCircle2, TrendingUp, Flame } from 'lucide-react';

export function ProgressConsistencyView() {
  const { foodLogs, growthMeasurements } = useApp();
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  const uniqueDaysTracked = new Set(foodLogs.map(l => l.date)).size;
  const totalLogsCount = foodLogs.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Progress & Consistency</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Review your logging consistency, tracked days, and nutritional trends over time.
          </p>
        </div>
        <div className="flex bg-stone-100 p-1 rounded-xl">
          {(['7d', '30d', '90d'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition-all ${
                range === r ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900">{uniqueDaysTracked}</div>
            <div className="text-xs text-stone-500 font-medium">Total Days Tracked</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900">{totalLogsCount}</div>
            <div className="text-xs text-stone-500 font-medium">Completed Meal Entries</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900">{growthMeasurements.length}</div>
            <div className="text-xs text-stone-500 font-medium">Growth Measurements</div>
          </div>
        </div>
      </div>

      {/* Consistency Chart Placeholder / Analysis */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-stone-900">Logging Consistency ({range.toUpperCase()})</h2>
        <p className="text-xs text-stone-500">
          Consistent logging helps provide accurate weekly averages for vitamins, minerals, and caloric balance.
        </p>

        <div className="h-64 bg-stone-50 rounded-xl border border-stone-200 flex flex-col items-center justify-center text-center p-6">
          <BarChart3 className="w-12 h-12 text-stone-400 mb-3" />
          <h3 className="font-bold text-stone-800 text-sm">Consistency Analysis Active</h3>
          <p className="text-xs text-stone-500 max-w-md mt-1">
            Your logs are securely recorded in local storage / database. No data is presented as a medical diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
}
