import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTodayDateString } from '../utils/calculations';
import { Droplet, Plus, Minus, ShieldAlert, Info, CheckCircle2 } from 'lucide-react';

export function HydrationTrackerView() {
  const { userProfile, updateUserProfile, hydrationLogs, addWaterMl, removeWaterMl, selectedDate } = useApp();
  const today = getTodayDateString();
  const isToday = selectedDate === today;
  const waterToday = hydrationLogs[selectedDate] || 0;

  // Reference recommendation for 14-18 yrs (National Academies): 3.3L total water males, 2.3L females (including food)
  const targetWaterMl = userProfile.referenceSex === 'male' ? 3300 : 2300;
  const glassMl = userProfile.glassVolumeMl || 250;
  const glassesToday = Math.round((waterToday / glassMl) * 10) / 10;
  const pct = Math.min(100, Math.round((waterToday / targetWaterMl) * 100));

  const [showOrsInfo, setShowOrsInfo] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Smart Water & Hydration Tracker 💧</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Track daily plain water intake separately from other beverages. National Academies reference guidelines.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200">
          <span className="text-xs font-semibold text-stone-700">Glass Volume:</span>
          <select
            value={glassMl}
            onChange={e => updateUserProfile({ glassVolumeMl: parseInt(e.target.value) || 250 })}
            className="bg-transparent text-xs font-bold text-emerald-700 focus:outline-none"
          >
            <option value="200">200 ml</option>
            <option value="250">250 ml (Standard)</option>
            <option value="300">300 ml</option>
            <option value="500">500 ml Bottle</option>
          </select>
        </div>
      </div>

      {/* Hydration Overview Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
              {isToday ? "Today's Hydration Total" : `Hydration Total for ${selectedDate}`}
            </div>
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-bold text-stone-900">{(waterToday / 1000).toFixed(2)}</span>
              <span className="text-base text-stone-500">Litres ({waterToday} ml / ~{glassesToday} glasses)</span>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              National Academies reference guideline: {targetWaterMl} ml/day (total water including moisture from food).
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => removeWaterMl(selectedDate, glassMl)}
              className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors font-bold flex items-center space-x-1"
              title="Remove one glass"
            >
              <Minus className="w-4 h-4" />
              <span className="text-xs">-{glassMl}ml</span>
            </button>
            <button
              onClick={() => addWaterMl(selectedDate, glassMl)}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-bold text-xs shadow-sm flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add 1 Glass (+{glassMl}ml)</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-stone-700">Progress against reference</span>
            <span className="text-stone-900">{pct}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ORS Safety Panel & Rule */}
      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-amber-900 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-sm uppercase tracking-wide">ORS Safety Rule & Guidance</h3>
          </div>
          <button
            onClick={() => setShowOrsInfo(!showOrsInfo)}
            className="text-xs font-semibold bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-lg text-amber-900 transition-colors"
          >
            {showOrsInfo ? 'Hide Details' : 'Read ORS Guidelines'}
          </button>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Oral Rehydration Saline (ORS) is intended strictly for replacing fluid and electrolyte losses (such as with diarrhoea or dehydration), and should never be scheduled as a routine weekly drink or fitness ritual.
        </p>

        {showOrsInfo && (
          <div className="bg-white p-4 rounded-xl border border-amber-200 text-xs text-stone-700 space-y-2 mt-2">
            <div className="font-bold text-amber-900">Proper ORS Usage & Dilution:</div>
            <ul className="list-disc pl-4 space-y-1 text-stone-600">
              <li>Always mix an entire ORS packet into the exact quantity of clean drinking water specified on the packet (usually 500ml or 1 litre). Never mix into arbitrary amounts.</li>
              <li>Seek immediate medical attention if severe dehydration symptoms occur.</li>
              <li>Ordinary hydration should rely on plain drinking water, not routine ORS use.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
