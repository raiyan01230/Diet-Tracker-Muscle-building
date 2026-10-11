import React from 'react';
import { useApp } from '../context/AppContext';
import { NUTRIENT_REFERENCES_TEEN_14_18 } from '../data/nutrientReferences';
import { BANGLADESH_FOOD_DATABASE } from '../data/bangladeshFoods';
import { Apple, ShieldCheck, X, Plus, Info, AlertTriangle } from 'lucide-react';

interface NutrientDetailDrawerProps {
  nutrientKey: string | null;
  nutrientCategory: 'vitamin' | 'mineral';
  onClose: () => void;
  onAddFood: (foodId: string, grams: number) => void;
}

export function NutrientDetailDrawer({ nutrientKey, nutrientCategory, onClose, onAddFood }: NutrientDetailDrawerProps) {
  const { userProfile, foodLogs } = useApp();
  if (!nutrientKey) return null;

  const refValues = NUTRIENT_REFERENCES_TEEN_14_18[userProfile.referenceSex];
  const refObj = nutrientCategory === 'vitamin'
    ? refValues.rdas.vitamins[nutrientKey]
    : refValues.rdas.minerals[nutrientKey];

  const ulObj = nutrientCategory === 'vitamin'
    ? refValues.upperLimits.vitamins[nutrientKey]
    : refValues.upperLimits.minerals[nutrientKey];

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = foodLogs.filter(l => l.date === todayStr);

  let loggedToday = 0;
  todayLogs.forEach(l => {
    if (nutrientCategory === 'vitamin') {
      loggedToday += (l.nutrients.vitamins as any)[nutrientKey] || 0;
    } else {
      loggedToday += (l.nutrients.minerals as any)[nutrientKey] || 0;
    }
  });

  const targetAmount = refObj?.amount || 100;
  const remaining = Math.max(0, targetAmount - loggedToday);
  const pct = Math.round((loggedToday / targetAmount) * 100);

  // Find top contributing foods from catalog
  const contributingFoods = BANGLADESH_FOOD_DATABASE.map(f => {
    const valPer100g = nutrientCategory === 'vitamin'
      ? (f.per100g.vitamins as any)[nutrientKey] || 0
      : (f.per100g.minerals as any)[nutrientKey] || 0;
    return { food: f, valPer100g };
  }).filter(item => item.valPer100g > 0).sort((a, b) => b.valPer100g - a.valPer100g).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto space-y-6 animate-slide-left">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center space-x-2">
            <Apple className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-stone-900 capitalize">{nutrientKey} Detail & Gap Solver</h2>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Today Status */}
        <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Today's Intake</span>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
              {refObj?.type}: {targetAmount} {refObj?.unit}
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-stone-900">{Math.round(loggedToday * 10) / 10}</span>
            <span className="text-sm text-stone-500">{refObj?.unit} ({pct}% of reference)</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-600' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <div className="text-xs text-stone-600 pt-1">
            Remaining to target: <strong className="text-stone-900">{Math.round(remaining * 10) / 10} {refObj?.unit}</strong>
          </div>
        </div>

        {/* Upper Limit Safety Context */}
        {ulObj && ulObj.amount > 0 ? (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Safe Upper Limit (UL) Context</span>
            </div>
            <p className="text-blue-800">
              Established UL: <strong>{ulObj.amount} {ulObj.unit}</strong>. {ulObj.scope || 'Safety reference for planning, not a target goal.'}
            </p>
          </div>
        ) : (
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-xs text-stone-600">
            <span className="font-semibold text-stone-800">Upper Limit:</span> No UL established by National Academies for this age group from ordinary dietary sources.
          </div>
        )}

        {/* Source-backed food contributors & 'Find foods' action */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Recommended Foods to Fill Gap ({nutrientKey.toUpperCase()})</span>
          </h3>

          <div className="space-y-3">
            {contributingFoods.map(({ food, valPer100g }, idx) => (
              <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900 text-sm">{food.nameEn} ({food.nameBn})</div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Provides <strong>{Math.round(valPer100g * 10) / 10} {refObj?.unit}</strong> per 100g • <span className="text-emerald-700">{food.source}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onAddFood(food.id, food.standardPortions[0]?.grams || 100);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Serving</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Close Detail Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
