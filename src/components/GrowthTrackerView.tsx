import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTodayDateString } from '../utils/calculations';
import { TrendingUp, Plus, Trash2, Calendar, Info, ShieldCheck } from 'lucide-react';

export function GrowthTrackerView() {
  const { growthMeasurements, addGrowthMeasurement, deleteGrowthMeasurement } = useApp();
  const [height, setHeight] = useState('167.64');
  const [weight, setWeight] = useState('55.65');
  const [date, setDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '1yr' | 'all'>('all');

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w) return;

    addGrowthMeasurement({
      date,
      heightCm: h,
      weightKg: w,
      notes: notes.trim() || undefined,
    });

    setNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Height & Weight Tracker</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitor growth observations using WHO 2007 reference standards for adolescents.
          </p>
        </div>
        <div className="flex bg-stone-100 p-1 rounded-xl">
          {(['30d', '90d', '1yr', 'all'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition-all ${
                timeframe === tf ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Section: Add Form vs Measurement History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Add Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-stone-900">Add New Measurement</h2>

          <form onSubmit={handleAddMeasurement} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Height (centimetres - cm)</label>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={e => setHeight(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Weight (kilograms - kg)</label>
              <input
                type="number"
                step="0.05"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Morning measurement before breakfast"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Save Measurement</span>
            </button>
          </form>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
            <div className="font-semibold text-stone-800 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>WHO 2007 Observation Guidance</span>
            </div>
            <p>
              Growth charts support observation and are not diagnoses. Short-term weight and height fluctuations are normal.
            </p>
          </div>
        </div>

        {/* Right: History & List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">Measurement History</h2>
            <span className="text-xs font-semibold bg-stone-100 px-3 py-1 rounded-full text-stone-700">
              {growthMeasurements.length} recorded
            </span>
          </div>

          <div className="max-h-[420px] overflow-y-auto space-y-3">
            {growthMeasurements.length === 0 ? (
              <div className="text-center py-12 text-stone-500 text-xs">
                No growth measurements recorded yet.
              </div>
            ) : (
              growthMeasurements.map(m => (
                <div key={m.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-stone-900 text-sm">{m.date}</span>
                      {m.notes && (
                        <span className="text-xs text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                          {m.notes}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-600 mt-1 flex items-center space-x-4">
                      <span>Height: <strong className="text-stone-900">{m.heightCm} cm</strong></span>
                      <span>Weight: <strong className="text-stone-900">{m.weightKg} kg</strong></span>
                      <span>BMI: <strong className="text-stone-900">{(m.weightKg / Math.pow(m.heightCm / 100, 2)).toFixed(1)}</strong></span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGrowthMeasurement(m.id)}
                    className="text-stone-400 hover:text-red-600 p-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
