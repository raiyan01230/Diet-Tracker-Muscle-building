import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NUTRIENT_REFERENCES_TEEN_14_18 } from '../data/nutrientReferences';
import { Apple, AlertCircle, Info, Calendar, ShieldAlert } from 'lucide-react';

export function VitaminsMineralsView() {
  const { userProfile, foodLogs } = useApp();
  const [viewTimeframe, setViewTimeframe] = useState<'today' | '7days' | '30days'>('today');

  const refValues = NUTRIENT_REFERENCES_TEEN_14_18[userProfile.referenceSex];

  // Calculate aggregated nutrients based on timeframe
  const todayStr = new Date().toISOString().split('T')[0];
  let filteredLogs = foodLogs;
  let daysCount = 1;

  if (viewTimeframe === 'today') {
    filteredLogs = foodLogs.filter(l => l.date === todayStr);
    daysCount = 1;
  } else if (viewTimeframe === '7days') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    filteredLogs = foodLogs.filter(l => new Date(l.date) >= cutoff);
    const uniqueDays = new Set(filteredLogs.map(l => l.date));
    daysCount = Math.max(uniqueDays.size, 1);
  } else {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    filteredLogs = foodLogs.filter(l => new Date(l.date) >= cutoff);
    const uniqueDays = new Set(filteredLogs.map(l => l.date));
    daysCount = Math.max(uniqueDays.size, 1);
  }

  // Sum total nutrients across filtered logs and divide by daysCount for average daily intake
  const totalVitamins = {
    a: 0, c: 0, d: 0, e: 0, k: 0,
    b1: 0, b2: 0, b3: 0, b5: 0, b6: 0, b7: 0, b9: 0, b12: 0, choline: 0
  };
  const totalMinerals = {
    calcium: 0, iron: 0, zinc: 0, magnesium: 0, phosphorus: 0,
    iodine: 0, selenium: 0, copper: 0, potassium: 0, sodium: 0,
    manganese: 0, chromium: 0, molybdenum: 0
  };

  filteredLogs.forEach(l => {
    const n = l.nutrients;
    (Object.keys(totalVitamins) as (keyof typeof totalVitamins)[]).forEach(k => {
      totalVitamins[k] += n.vitamins[k] || 0;
    });
    (Object.keys(totalMinerals) as (keyof typeof totalMinerals)[]).forEach(k => {
      totalMinerals[k] += n.minerals[k] || 0;
    });
  });

  const avgVitamins = {
    a: Math.round((totalVitamins.a / daysCount) * 10) / 10,
    c: Math.round((totalVitamins.c / daysCount) * 10) / 10,
    d: Math.round((totalVitamins.d / daysCount) * 10) / 10,
    e: Math.round((totalVitamins.e / daysCount) * 10) / 10,
    k: Math.round((totalVitamins.k / daysCount) * 10) / 10,
    b1: Math.round((totalVitamins.b1 / daysCount) * 100) / 100,
    b2: Math.round((totalVitamins.b2 / daysCount) * 100) / 100,
    b3: Math.round((totalVitamins.b3 / daysCount) * 10) / 10,
    b5: Math.round((totalVitamins.b5 / daysCount) * 10) / 10,
    b6: Math.round((totalVitamins.b6 / daysCount) * 100) / 100,
    b7: Math.round((totalVitamins.b7 / daysCount) * 10) / 10,
    b9: Math.round((totalVitamins.b9 / daysCount) * 10) / 10,
    b12: Math.round((totalVitamins.b12 / daysCount) * 100) / 100,
    choline: Math.round((totalVitamins.choline / daysCount) * 10) / 10,
  };

  const avgMinerals = {
    calcium: Math.round((totalMinerals.calcium / daysCount) * 10) / 10,
    iron: Math.round((totalMinerals.iron / daysCount) * 100) / 100,
    zinc: Math.round((totalMinerals.zinc / daysCount) * 100) / 100,
    magnesium: Math.round((totalMinerals.magnesium / daysCount) * 10) / 10,
    phosphorus: Math.round((totalMinerals.phosphorus / daysCount) * 10) / 10,
    iodine: Math.round((totalMinerals.iodine / daysCount) * 10) / 10,
    selenium: Math.round((totalMinerals.selenium / daysCount) * 10) / 10,
    copper: Math.round((totalMinerals.copper / daysCount) * 100) / 100,
    potassium: Math.round((totalMinerals.potassium / daysCount) * 10) / 10,
    sodium: Math.round((totalMinerals.sodium / daysCount) * 10) / 10,
    manganese: Math.round((totalMinerals.manganese / daysCount) * 100) / 100,
    chromium: Math.round((totalMinerals.chromium / daysCount) * 10) / 10,
    molybdenum: Math.round((totalMinerals.molybdenum / daysCount) * 10) / 10,
  };

  const vitaminLabels: Record<string, string> = {
    a: 'Vitamin A', c: 'Vitamin C', d: 'Vitamin D', e: 'Vitamin E', k: 'Vitamin K',
    b1: 'Thiamin (B1)', b2: 'Riboflavin (B2)', b3: 'Niacin (B3)', b5: 'Pantothenic Acid (B5)',
    b6: 'Vitamin B6', b7: 'Biotin (B7)', b9: 'Folate (B9)', b12: 'Vitamin B12', choline: 'Choline'
  };

  const mineralLabels: Record<string, string> = {
    calcium: 'Calcium', iron: 'Iron', zinc: 'Zinc', magnesium: 'Magnesium', phosphorus: 'Phosphorus',
    iodine: 'Iodine', selenium: 'Selenium', copper: 'Copper', potassium: 'Potassium', sodium: 'Sodium',
    manganese: 'Manganese', chromium: 'Chromium', molybdenum: 'Molybdenum'
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Vitamins & Minerals Tracker</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            NIH ODS & National Academies Dietary Reference Intakes for ages {userProfile.age} ({userProfile.referenceSex}).
          </p>
        </div>
        <div className="flex bg-stone-100 p-1 rounded-xl">
          {(['today', '7days', '30days'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setViewTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewTimeframe === tf ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tf === 'today' ? 'Today' : tf === '7days' ? '7-Day Avg' : '30-Day Avg'}
            </button>
          ))}
        </div>
      </div>

      {viewTimeframe !== 'today' && daysCount < (viewTimeframe === '7days' ? 3 : 10) && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Warning: Only {daysCount} day(s) have logged food records in this period. Averages may be skewed; diet logs do not diagnose micronutrient deficiencies.
          </span>
        </div>
      )}

      {/* Vitamins Section */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
          <Apple className="w-5 h-5 text-emerald-600" />
          <span>Vitamins & Essential Nutrients</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(avgVitamins) as (keyof typeof avgVitamins)[]).map(key => {
            const loggedVal = avgVitamins[key];
            const refObj = refValues.rdas.vitamins[key] || { amount: 100, unit: 'mg', type: 'RDA' };
            const ulObj = refValues.upperLimits.vitamins[key];
            const pct = Math.round((loggedVal / refObj.amount) * 100);

            return (
              <div key={key} className="bg-stone-50 rounded-xl p-4 border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 text-sm">{vitaminLabels[key]}</span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {refObj.type}: {refObj.amount} {refObj.unit}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2 mt-3">
                    <span className="text-2xl font-bold text-stone-900">{loggedVal}</span>
                    <span className="text-xs text-stone-500">{refObj.unit.split(' ')[0]}</span>
                  </div>
                  <div className="mt-2 w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
                  <span>{pct}% of reference</span>
                  {ulObj && ulObj.amount > 0 && (
                    <span className="text-stone-400">UL: {ulObj.amount} {ulObj.unit}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Minerals Section */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-600" />
          <span>Essential Minerals</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(avgMinerals) as (keyof typeof avgMinerals)[]).map(key => {
            const loggedVal = avgMinerals[key];
            const refObj = refValues.rdas.minerals[key] || { amount: 100, unit: 'mg', type: 'RDA' };
            const ulObj = refValues.upperLimits.minerals[key];
            const pct = Math.round((loggedVal / refObj.amount) * 100);

            return (
              <div key={key} className="bg-stone-50 rounded-xl p-4 border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 text-sm">{mineralLabels[key]}</span>
                    <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {refObj.type}: {refObj.amount} {refObj.unit}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2 mt-3">
                    <span className="text-2xl font-bold text-stone-900">{loggedVal}</span>
                    <span className="text-xs text-stone-500">{refObj.unit.split(' ')[0]}</span>
                  </div>
                  <div className="mt-2 w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct >= 100 ? 'bg-blue-600' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
                  <span>{pct}% of reference</span>
                  {ulObj && ulObj.amount > 0 && (
                    <span className="text-stone-400">UL: {ulObj.amount} {ulObj.unit}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
