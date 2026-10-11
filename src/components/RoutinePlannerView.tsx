import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTodayDateString } from '../utils/calculations';
import { Calendar, Check, Plus, UtensilsCrossed, ShieldCheck } from 'lucide-react';

export function RoutinePlannerView() {
  const { plannedMeals, addPlannedMeal, confirmPlannedMealAsEaten, deletePlannedMeal } = useApp();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const today = getTodayDateString();

  const handleEatNow = (mealId: string, foodName: string) => {
    confirmPlannedMealAsEaten(mealId, today, 'breakfast');
    setSuccessMsg(`Successfully confirmed "${foodName}" as eaten and added to your Daily Food Log!`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900">7-Day Morning & Meal Routine Planner 🍌</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Plan breakfast, school snacks, dinner, and habits like the morning banana. Meals only count after you confirm you ate them.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs">
          <span>{successMsg}</span>
          <Check className="w-4 h-4 text-emerald-700" />
        </div>
      )}

      {/* Routine Plan List */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-stone-900">Active Routine Items & Planned Meals</h2>

        <div className="space-y-3">
          {plannedMeals.map(meal => (
            <div key={meal.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-stone-900 text-sm">{meal.title}</span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
                    {meal.mealType}
                  </span>
                </div>
                <div className="text-xs text-stone-600 mt-1">
                  Food: <strong>{meal.foodName}</strong> ({meal.grams}g) • Calories: <strong>{meal.nutrients.calories} kcal</strong>
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  Target Gaps Addressed: {meal.gapsAddressed.join(', ')}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEatNow(meal.id, meal.foodName)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>I Ate This Today</span>
                </button>
                <button
                  onClick={() => deletePlannedMeal(meal.id)}
                  className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
