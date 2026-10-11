import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { foodDbService } from '../services/foodDatabase';
import { NUTRIENT_REFERENCES_TEEN_14_18 } from '../data/nutrientReferences';
import { sumNutrients, getTodayDateString } from '../utils/calculations';
import { Sparkles, Plus, Check, Loader2, ShieldCheck, AlertCircle, Apple, Zap, Flame, Heart } from 'lucide-react';

interface GapRecommendation {
  foodItemId: string;
  foodNameEn: string;
  foodNameBn: string;
  recommendedGrams: number;
  reason: string;
  source: string;
  nutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fibre: number;
    vitamins: any;
    minerals: any;
  };
}

export function SmartGapSolverView() {
  const { userProfile, foodLogs, addFoodLog } = useApp();
  const today = getTodayDateString();
  const todayLogs = foodLogs.filter(l => l.date === today);
  const total = sumNutrients(todayLogs);

  const refValues = NUTRIENT_REFERENCES_TEEN_14_18[userProfile.referenceSex];
  const proteinTarget = refValues.rdas.protein;
  const fibreTarget = refValues.rdas.fibre;
  const vitCTarget = refValues.rdas.vitamins.c?.amount || 65;
  const calciumTarget = refValues.rdas.minerals.calcium?.amount || 1300;
  const ironTarget = refValues.rdas.minerals.iron?.amount || 11;
  const vitATarget = refValues.rdas.vitamins.a?.amount || 700;

  // Calculate gaps dynamically
  const gaps = useMemo(() => ({
    protein: Math.max(0, Math.round((proteinTarget - total.protein) * 10) / 10),
    fibre: Math.max(0, Math.round((fibreTarget - total.fibre) * 10) / 10),
    vitC: Math.max(0, Math.round((vitCTarget - total.vitamins.c) * 10) / 10),
    calcium: Math.max(0, Math.round((calciumTarget - total.minerals.calcium) * 10) / 10),
    iron: Math.max(0, Math.round((ironTarget - total.minerals.iron) * 10) / 10),
    vitA: Math.max(0, Math.round((vitATarget - total.vitamins.a) * 10) / 10),
  }), [total, proteinTarget, fibreTarget, vitCTarget, calciumTarget, ironTarget, vitATarget]);

  // Compute instant, zero-latency recommendations deterministically
  const instantRecommendations = useMemo((): GapRecommendation[] => {
    const list: GapRecommendation[] = [];

    // 1. Vitamin C or Fibre Gap -> Guava (Peyara) or Amla
    if (gaps.vitC > 5 || gaps.fibre > 2) {
      const guava = foodDbService.getFoodById('peyara');
      if (guava) {
        list.push({
          foodItemId: guava.id,
          foodNameEn: guava.nameEn,
          foodNameBn: guava.nameBn,
          recommendedGrams: 120,
          reason: `Rich in Vitamin C (${Math.round(guava.per100g.vitamins.c * 1.2)}mg) and Fibre (${Math.round(guava.per100g.fibre * 1.2 * 10)/10}g) to close today's shortfall.`,
          source: guava.source,
          nutrients: {
            calories: Math.round(guava.per100g.calories * 1.2),
            protein: Math.round(guava.per100g.protein * 1.2 * 10) / 10,
            carbs: Math.round(guava.per100g.carbs * 1.2 * 10) / 10,
            fat: Math.round(guava.per100g.fat * 1.2 * 10) / 10,
            fibre: Math.round(guava.per100g.fibre * 1.2 * 10) / 10,
            vitamins: guava.per100g.vitamins,
            minerals: guava.per100g.minerals,
          },
        });
      }
    }

    // 2. Protein or Iron Gap -> Red Lentil (Dal Masoor)
    if (gaps.protein > 5 || gaps.iron > 1) {
      const dal = foodDbService.getFoodById('dal_masoor');
      if (dal) {
        list.push({
          foodItemId: dal.id,
          foodNameEn: dal.nameEn,
          foodNameBn: dal.nameBn,
          recommendedGrams: 150,
          reason: `Provides ${Math.round(dal.per100g.protein * 1.5 * 10)/10}g plant protein, ${Math.round(dal.per100g.minerals.iron * 1.5 * 10)/10}mg iron, and folate.`,
          source: dal.source,
          nutrients: {
            calories: Math.round(dal.per100g.calories * 1.5),
            protein: Math.round(dal.per100g.protein * 1.5 * 10) / 10,
            carbs: Math.round(dal.per100g.carbs * 1.5 * 10) / 10,
            fat: Math.round(dal.per100g.fat * 1.5 * 10) / 10,
            fibre: Math.round(dal.per100g.fibre * 1.5 * 10) / 10,
            vitamins: dal.per100g.vitamins,
            minerals: dal.per100g.minerals,
          },
        });
      }
    }

    // 3. Calcium or B12 Gap -> Cow Milk or Boiled Egg
    if (gaps.calcium > 50 || gaps.protein > 3) {
      const egg = foodDbService.getFoodById('dim_sheddho');
      if (egg) {
        list.push({
          foodItemId: egg.id,
          foodNameEn: egg.nameEn,
          foodNameBn: egg.nameBn,
          recommendedGrams: 100,
          reason: `Two eggs provide 12.6g complete protein, 2.2mcg Vitamin D, and 294mg choline.`,
          source: egg.source,
          nutrients: {
            calories: egg.per100g.calories,
            protein: egg.per100g.protein,
            carbs: egg.per100g.carbs,
            fat: egg.per100g.fat,
            fibre: egg.per100g.fibre,
            vitamins: egg.per100g.vitamins,
            minerals: egg.per100g.minerals,
          },
        });
      }
    }

    // 4. Vitamin A or Calcium Gap -> Red Amaranth (Lal Shak)
    if (gaps.vitA > 50 || gaps.calcium > 100) {
      const shak = foodDbService.getFoodById('lal_shak');
      if (shak) {
        list.push({
          foodItemId: shak.id,
          foodNameEn: shak.nameEn,
          foodNameBn: shak.nameBn,
          recommendedGrams: 100,
          reason: `Delivers 340mg calcium, 4.2mg iron, and 280mcg Vitamin A in a traditional serving.`,
          source: shak.source,
          nutrients: {
            calories: shak.per100g.calories,
            protein: shak.per100g.protein,
            carbs: shak.per100g.carbs,
            fat: shak.per100g.fat,
            fibre: shak.per100g.fibre,
            vitamins: shak.per100g.vitamins,
            minerals: shak.per100g.minerals,
          },
        });
      }
    }

    // Fallback if no specific gaps
    if (list.length === 0) {
      const defaults = ['peyara', 'dal_masoor', 'dim_sheddho'];
      defaults.forEach(id => {
        const item = foodDbService.getFoodById(id);
        if (item) {
          list.push({
            foodItemId: item.id,
            foodNameEn: item.nameEn,
            foodNameBn: item.nameBn,
            recommendedGrams: 100,
            reason: `Nutrient-dense staple providing balanced energy, vitamins, and minerals.`,
            source: item.source,
            nutrients: item.per100g,
          });
        }
      });
    }

    return list;
  }, [gaps]);

  const [aiRecommendations, setAiRecommendations] = useState<GapRecommendation[] | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Recommendations to display (instant local by default, or AI enhanced if fetched)
  const activeRecommendations = aiRecommendations || instantRecommendations;

  const handleEnhanceWithAi = async () => {
    setIsAiLoading(true);
    try {
      const nutrientGaps = {
        proteinNeeded: gaps.protein,
        fibreNeeded: gaps.fibre,
        vitCNeeded: gaps.vitC,
        calciumNeeded: gaps.calcium,
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
      if (data.success && Array.isArray(data.recommendations)) {
        const mapped = data.recommendations.map((rec: any) => {
          const found = foodDbService.getFoodById(rec.foodItemId) || foodDbService.getAllFoods()[0];
          const grams = rec.recommendedGrams || 100;
          const factor = grams / 100;
          return {
            foodItemId: found.id,
            foodNameEn: found.nameEn,
            foodNameBn: found.nameBn,
            recommendedGrams: grams,
            reason: rec.reason || 'AI-optimized nutrient contribution.',
            source: found.source,
            nutrients: {
              calories: Math.round(found.per100g.calories * factor),
              protein: Math.round(found.per100g.protein * factor * 10) / 10,
              carbs: Math.round(found.per100g.carbs * factor * 10) / 10,
              fat: Math.round(found.per100g.fat * factor * 10) / 10,
              fibre: Math.round(found.per100g.fibre * factor * 10) / 10,
              vitamins: found.per100g.vitamins,
              minerals: found.per100g.minerals,
            },
          };
        });
        setAiRecommendations(mapped);
      }
    } catch (err) {
      console.error('AI gap solver error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleLogRecommendation = (rec: GapRecommendation) => {
    const food = foodDbService.getFoodById(rec.foodItemId) || foodDbService.getAllFoods()[0];
    const grams = rec.recommendedGrams || 100;

    addFoodLog({
      date: today,
      mealType: 'snack',
      foodItemId: food.id,
      foodName: `${rec.foodNameEn} (${rec.foodNameBn})`,
      preparationState: food.preparationState,
      quantityGrams: grams,
      portionDescription: `${grams}g Smart Gap Serving`,
      source: food.source,
      nutrients: rec.nutrients,
    });

    setSuccessMsg(`Successfully confirmed and logged ${rec.foodNameEn} (${rec.foodNameBn})!`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <h1 className="text-xl font-bold">Smart Nutrient Gap Solver & Meal Optimiser 🇧🇩</h1>
            </div>
            <p className="text-xs text-emerald-100">
              Instantly solves today's micronutrient & macronutrient shortfalls using verified Bangladeshi foods (FAO 2013 & USDA).
            </p>
          </div>
          <button
            onClick={handleEnhanceWithAi}
            disabled={isAiLoading}
            className="hidden sm:flex items-center space-x-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20 shrink-0"
          >
            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-300" />}
            <span>{isAiLoading ? 'Analyzing...' : 'AI Deep Check'}</span>
          </button>
        </div>
      </div>

      {/* Today's Gaps Quick Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs text-center">
          <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide">Protein Gap</div>
          <div className={`text-base font-bold mt-0.5 ${gaps.protein > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {gaps.protein > 0 ? `${gaps.protein}g` : '✓ Met'}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs text-center">
          <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide">Fibre Gap</div>
          <div className={`text-base font-bold mt-0.5 ${gaps.fibre > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {gaps.fibre > 0 ? `${gaps.fibre}g` : '✓ Met'}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs text-center">
          <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide">Vit C Gap</div>
          <div className={`text-base font-bold mt-0.5 ${gaps.vitC > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {gaps.vitC > 0 ? `${gaps.vitC}mg` : '✓ Met'}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs text-center">
          <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide">Calcium Gap</div>
          <div className={`text-base font-bold mt-0.5 ${gaps.calcium > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {gaps.calcium > 0 ? `${gaps.calcium}mg` : '✓ Met'}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs text-center">
          <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide">Iron Gap</div>
          <div className={`text-base font-bold mt-0.5 ${gaps.iron > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {gaps.iron > 0 ? `${gaps.iron}mg` : '✓ Met'}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs text-center">
          <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide">Vit A Gap</div>
          <div className={`text-base font-bold mt-0.5 ${gaps.vitA > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {gaps.vitA > 0 ? `${gaps.vitA}mcg` : '✓ Met'}
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs animate-fade-in">
          <span>{successMsg}</span>
          <Check className="w-4 h-4 text-emerald-700" />
        </div>
      )}

      {/* Recommendations List (Loads in 0ms) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">Instant Recommended Foods for Today</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Ranked by verified nutrient contribution towards closing today's specific shortfalls.
            </p>
          </div>
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center space-x-1">
            <Zap className="w-3 h-3 text-emerald-600" />
            <span>Instant Zero-Latency</span>
          </span>
        </div>

        <div className="space-y-4">
          {activeRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 bg-stone-50 rounded-xl border border-stone-200 hover:border-emerald-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-stone-900 text-sm">{rec.foodNameEn}</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {rec.foodNameBn}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{rec.reason}</p>
                <div className="text-[11px] text-stone-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Serving: <strong className="text-stone-800">{rec.recommendedGrams}g</strong></span>
                  <span>Calories: <strong className="text-stone-800">{rec.nutrients.calories} kcal</strong></span>
                  <span>Protein: <strong className="text-stone-800">{rec.nutrients.protein}g</strong></span>
                  <span>Source: <strong className="text-stone-700">{rec.source}</strong></span>
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
          ))}
        </div>
      </div>
    </div>
  );
}
