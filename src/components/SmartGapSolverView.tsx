import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BANGLADESH_FOOD_DATABASE } from '../data/bangladeshFoods';
import { NUTRIENT_REFERENCES_TEEN_14_18 } from '../data/nutrientReferences';
import { sumNutrients, getTodayDateString } from '../utils/calculations';
import { Sparkles, Plus, Check, Loader2, ShieldCheck, AlertCircle, Apple } from 'lucide-react';

export function SmartGapSolverView() {
  const { userProfile, foodLogs, addFoodLog } = useApp();
  const today = getTodayDateString();
  const todayLogs = foodLogs.filter(l => l.date === today);
  const total = sumNutrients(todayLogs);

  const refValues = NUTRIENT_REFERENCES_TEEN_14_18[userProfile.referenceSex];
  const proteinTarget = refValues.rdas.protein;
  const fibreTarget = refValues.rdas.fibre;

  const [isLoading, setIsLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[] | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setStatusNotice(null);
    try {
      const nutrientGaps = {
        proteinNeeded: Math.max(0, proteinTarget - total.protein),
        fibreNeeded: Math.max(0, fibreTarget - total.fibre),
        caloriesRemaining: Math.max(0, 2200 - total.calories),
      };

      const res = await fetch('/api/ai-gap-solver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: userProfile,
          todayTotals: total,
          nutrientGaps,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch AI recommendations.');

      // Map AI recommendations to catalog items with Bangla names
      const enhanced = data.recommendations.map((rec: any) => {
        const found = BANGLADESH_FOOD_DATABASE.find(f => f.id === rec.foodItemId) || BANGLADESH_FOOD_DATABASE[0];
        return {
          ...rec,
          foodItemId: found.id,
          foodNameEn: found.nameEn,
          foodNameBn: found.nameBn,
          source: found.source,
        };
      });

      setAiRecommendations(enhanced);
      setStatusNotice('Real-time AI recommendations generated successfully using FAO 2013 & USDA catalog.');
    } catch (err: any) {
      console.error(err);
      setStatusNotice('AI service key not active or network unavailable. Using fully configured local catalog fallback with Bangla names.');
      
      // Fully configured local catalog fallback based on nutritional gaps
      const fallback = [
        {
          foodItemId: 'peyara',
          foodNameEn: 'Guava (Raw)',
          foodNameBn: 'পেয়ারা',
          recommendedGrams: 120,
          reason: 'Exceptional source of Vitamin C and Dietary Fibre (228mg Vitamin C per 100g).',
          source: 'FAO Bangladesh (2013)',
        },
        {
          foodItemId: 'dal_masoor',
          foodNameEn: 'Red Lentil Soup (Masoor Dal)',
          foodNameBn: 'মসুর ডাল',
          recommendedGrams: 150,
          reason: 'Provides essential plant protein, iron, and folate for daily adolescent energy.',
          source: 'FAO Bangladesh (2013)',
        },
        {
          foodItemId: 'dim_sheddho',
          foodNameEn: 'Boiled Egg',
          foodNameBn: 'ডিম সেদ্ধ',
          recommendedGrams: 100,
          reason: 'High biological value protein, choline, and Vitamin B12.',
          source: 'USDA FoodData Central',
        },
      ];
      setAiRecommendations(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleLogRecommendation = (rec: any) => {
    const food = BANGLADESH_FOOD_DATABASE.find(f => f.id === rec.foodItemId) || BANGLADESH_FOOD_DATABASE[0];
    const grams = rec.recommendedGrams || 100;
    const factor = grams / 100;

    const nutrients = {
      calories: Math.round(food.per100g.calories * factor),
      protein: Math.round(food.per100g.protein * factor * 10) / 10,
      carbs: Math.round(food.per100g.carbs * factor * 10) / 10,
      fat: Math.round(food.per100g.fat * factor * 10) / 10,
      fibre: Math.round(food.per100g.fibre * factor * 10) / 10,
      vitamins: food.per100g.vitamins,
      minerals: food.per100g.minerals,
    };

    addFoodLog({
      date: today,
      mealType: 'snack',
      foodItemId: food.id,
      foodName: `${food.nameEn} (${food.nameBn})`,
      preparationState: food.preparationState,
      quantityGrams: grams,
      portionDescription: `${grams}g Smart Gap Serving`,
      source: food.source,
      nutrients,
    });

    setSuccessMsg(`Successfully confirmed and logged ${food.nameEn} (${food.nameBn})!`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center space-x-3 mb-2">
          <Sparkles className="w-6 h-6 text-emerald-300" />
          <h1 className="text-xl font-bold">Smart Nutrient Gap Solver & Meal Optimiser 🇧🇩</h1>
        </div>
        <p className="text-xs text-emerald-100">
          Analyzing today's confirmed intake and recommending verified local Bangladeshi foods with Bangla names to close nutritional gaps safely.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs">
          <span>{successMsg}</span>
          <Check className="w-4 h-4 text-emerald-700" />
        </div>
      )}

      {statusNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-medium flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <h2 className="text-base font-bold text-stone-900">Configured Catalog Recommendations</h2>
          <button
            onClick={fetchRecommendations}
            disabled={isLoading}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
            <span>Refresh Gap Solver</span>
          </button>
        </div>

        {isLoading && !aiRecommendations ? (
          <div className="text-center py-12 text-stone-500 text-xs flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span>Analyzing nutritional gaps against FAO 2013 & USDA catalog...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {aiRecommendations?.map((rec, idx) => {
              const food = BANGLADESH_FOOD_DATABASE.find(f => f.id === rec.foodItemId) || BANGLADESH_FOOD_DATABASE[0];
              const nameEn = rec.foodNameEn || food.nameEn;
              const nameBn = rec.foodNameBn || food.nameBn;
              const grams = rec.recommendedGrams || 100;
              const factor = grams / 100;
              const cals = Math.round(food.per100g.calories * factor);
              const protein = Math.round(food.per100g.protein * factor * 10) / 10;

              return (
                <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-stone-900 text-sm">{nameEn}</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        {nameBn}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">{rec.reason}</p>
                    <div className="text-[11px] text-stone-500 mt-1">
                      Serving: <strong>{grams}g</strong> • Calories: <strong>{cals} kcal</strong> • Protein: <strong>{protein}g</strong> • Source: <strong className="text-stone-700">{food.source}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLogRecommendation(rec)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center space-x-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Confirm & Log</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
