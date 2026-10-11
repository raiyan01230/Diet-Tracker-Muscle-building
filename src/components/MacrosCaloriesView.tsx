import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateTeenEER, NUTRIENT_REFERENCES_TEEN_14_18 } from '../data/nutrientReferences';
import { sumNutrients, getTodayDateString } from '../utils/calculations';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Flame, 
  UtensilsCrossed, 
  Activity, 
  Info, 
  CheckCircle2, 
  BarChart3, 
  PieChart as PieIcon 
} from 'lucide-react';

export function MacrosCaloriesView() {
  const { userProfile, updateUserProfile, foodLogs } = useApp();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  const todayStr = getTodayDateString();

  // Calculate EER
  const calculatedEER = calculateTeenEER(
    userProfile.referenceSex,
    userProfile.age,
    userProfile.heightCm,
    userProfile.weightKg,
    userProfile.activityLevel
  );

  const refValues = NUTRIENT_REFERENCES_TEEN_14_18[userProfile.referenceSex];
  const proteinRDA = refValues.rdas.protein;
  const carbRDA = refValues.rdas.carbs;
  const fibreAI = refValues.rdas.fibre;
  const fatTargetGrams = Math.round((calculatedEER * 0.30) / 9);

  // Today totals
  const todayLogs = foodLogs.filter(l => l.date === todayStr);
  const todayTotals = sumNutrients(todayLogs);
  const remainingCalories = calculatedEER - todayTotals.calories;
  const logCompleteness = todayLogs.length > 0 ? (todayLogs.length >= 3 ? 'Complete' : 'Partial') : 'Incomplete';

  // Build daily data series for Recharts based on dateRange (7, 30, or 90 days)
  const daysCount = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
  const chartData = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Format label for axis (e.g. "Oct 11")
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const dayLogs = foodLogs.filter(l => l.date === dateStr);
    const dayNutrients = sumNutrients(dayLogs);

    chartData.push({
      date: label,
      fullDate: dateStr,
      calories: dayNutrients.calories,
      eer: calculatedEER,
      protein: dayNutrients.protein,
      proteinTarget: proteinRDA,
      carbs: dayNutrients.carbs,
      fat: dayNutrients.fat,
      fibre: dayNutrients.fibre,
      hasLogs: dayLogs.length > 0,
    });
  }

  // Tracked days count in range
  const trackedDaysCount = chartData.filter(d => d.hasLogs).length;

  const avgNutrients = trackedDaysCount > 0 ? {
    calories: Math.round(chartData.reduce((acc, curr) => acc + curr.calories, 0) / trackedDaysCount),
    protein: Math.round((chartData.reduce((acc, curr) => acc + curr.protein, 0) / trackedDaysCount) * 10) / 10,
    carbs: Math.round((chartData.reduce((acc, curr) => acc + curr.carbs, 0) / trackedDaysCount) * 10) / 10,
    fat: Math.round((chartData.reduce((acc, curr) => acc + curr.fat, 0) / trackedDaysCount) * 10) / 10,
    fibre: Math.round((chartData.reduce((acc, curr) => acc + curr.fibre, 0) / trackedDaysCount) * 10) / 10,
  } : { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 };

  // Energy distribution share (calories from macros today)
  const proteinCals = todayTotals.protein * 4;
  const carbCals = todayTotals.carbs * 4;
  const fatCals = todayTotals.fat * 9;
  const totalMacroCals = proteinCals + carbCals + fatCals || 1;

  const proteinShare = Math.round((proteinCals / totalMacroCals) * 100);
  const carbShare = Math.round((carbCals / totalMacroCals) * 100);
  const fatShare = Math.round((fatCals / totalMacroCals) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header & Date Range Filter */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <span>Nutrition Analytics Dashboard</span>
            <span>•</span>
            <span>Asia/Dhaka Timezone</span>
          </div>
          <h1 className="text-xl font-bold text-stone-900">Calories & Macronutrient Intelligence</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            National Academies 2023 EER equations & AMDR distribution ranges for ages 14–18.
          </p>
        </div>
        <div className="flex bg-stone-100 p-1 rounded-xl">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase transition-all ${
                dateRange === range ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Estimated EER */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Estimated Daily EER</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-stone-900">{calculatedEER}</span>
              <span className="text-sm text-stone-500">kcal/day</span>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              Based on age {userProfile.age}, {userProfile.heightCm}cm, {userProfile.weightKg}kg, {userProfile.activityLevel}.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>2023 National Academies</span>
            <span className="font-medium text-emerald-700">Verified Reference</span>
          </div>
        </div>

        {/* 2. Calories Logged Today */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Calories Logged Today</span>
              <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-stone-900">{todayTotals.calories}</span>
              <span className="text-sm text-stone-500">kcal</span>
            </div>
            <div className="mt-3 w-full bg-stone-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(Math.round((todayTotals.calories / calculatedEER) * 100), 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>Completeness Status</span>
            <span className={`font-semibold px-2 py-0.5 rounded ${
              logCompleteness === 'Complete' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {logCompleteness} Log
            </span>
          </div>
        </div>

        {/* 3. Estimated Energy Remaining */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Estimated Energy Remaining</span>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-stone-900">{Math.max(remainingCalories, 0)}</span>
              <span className="text-sm text-stone-500">kcal remaining</span>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              {remainingCalories > 0 ? 'Estimated energy needed to meet daily reference.' : 'Daily EER reference reached or exceeded.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>Planning Comparison</span>
            <span className="font-medium text-stone-700">Neutral Target</span>
          </div>
        </div>

        {/* 4. Food Log Completeness */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Logging Consistency</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-stone-900">{trackedDaysCount}</span>
              <span className="text-sm text-stone-500">days tracked ({dateRange})</span>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              {trackedDaysCount > 0 ? 'Averages computed from recorded days only.' : 'No days recorded in timeframe.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>Active Range</span>
            <span className="font-medium text-stone-700 uppercase">{dateRange}</span>
          </div>
        </div>
      </div>

      {/* Energy Estimator Configuration */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <span>Accurate Energy Estimator (2023 National Academies EER)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Reference Sex</label>
            <select
              value={userProfile.referenceSex}
              onChange={e => updateUserProfile({ referenceSex: e.target.value as any })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800"
            >
              <option value="male">Male (কিশোর)</option>
              <option value="female">Female (কিশোরী)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Age (14–18 years)</label>
            <input
              type="number"
              value={userProfile.age}
              onChange={e => updateUserProfile({ age: parseInt(e.target.value) || 16 })}
              min={14}
              max={18}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Height (cm)</label>
            <input
              type="number"
              step="0.1"
              value={userProfile.heightCm}
              onChange={e => updateUserProfile({ heightCm: parseFloat(e.target.value) || 167.64 })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={userProfile.weightKg}
              onChange={e => updateUserProfile({ weightKg: parseFloat(e.target.value) || 55.65 })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">Physical Activity Level Category</label>
          <select
            value={userProfile.activityLevel}
            onChange={e => updateUserProfile({ activityLevel: e.target.value as any })}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800"
          >
            <option value="inactive">Inactive / Sedentary</option>
            <option value="low_active">Low Active</option>
            <option value="active">Active</option>
            <option value="very_active">Very Active</option>
          </select>
        </div>
      </div>

      {/* INTERACTIVE TREND CHARTS (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Calorie Intake vs Calculated EER */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              <span>Calorie Intake vs. Calculated EER ({dateRange.toUpperCase()})</span>
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            Comparing daily logged calories against your calculated daily energy requirement.
          </p>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="calories" name="Logged Calories (kcal)" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="eer" name="Calculated EER (kcal)" stroke="#f97316" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Protein Intake vs RDA Target */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>Protein Intake vs. RDA Target ({dateRange.toUpperCase()})</span>
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            Tracking daily protein consumption against the teen RDA target ({proteinRDA}g).
          </p>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="protein" name="Logged Protein (g)" fill="#059669" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="proteinTarget" name="RDA Target (g)" stroke="#2563eb" strokeWidth={2} dot={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Macronutrient Breakdown Panel & Energy Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Macronutrient Progress vs Targets */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>Macronutrient Target Engine (Today)</span>
          </h2>

          <div className="space-y-4">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-stone-800">Protein (RDA: {proteinRDA}g)</span>
                <span className="text-stone-900">{todayTotals.protein}g / {proteinRDA}g ({Math.round((todayTotals.protein / proteinRDA) * 100)}%)</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.round((todayTotals.protein / proteinRDA) * 100), 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-stone-500 mt-1">Source: NIH ODS / National Academies (Ages 14–18)</div>
            </div>

            {/* Carbohydrates */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-stone-800">Carbohydrates (RDA: {carbRDA}g)</span>
                <span className="text-stone-900">{todayTotals.carbs}g / {carbRDA}g ({Math.round((todayTotals.carbs / carbRDA) * 100)}%)</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.round((todayTotals.carbs / carbRDA) * 100), 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-stone-500 mt-1">AMDR Range: 45–65% of total energy (~{carbShare}%)</div>
            </div>

            {/* Total Fat */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-stone-800">Total Fat (AMDR Target: ~{fatTargetGrams}g)</span>
                <span className="text-stone-900">{todayTotals.fat}g / {fatTargetGrams}g ({Math.round((todayTotals.fat / fatTargetGrams) * 100)}%)</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.round((todayTotals.fat / fatTargetGrams) * 100), 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-stone-500 mt-1">AMDR Range: 25–35% of total energy (~{fatShare}%)</div>
            </div>

            {/* Dietary Fibre */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-stone-800">Dietary Fibre (AI Target: {fibreAI}g)</span>
                <span className="text-stone-900">{todayTotals.fibre}g / {fibreAI}g ({Math.round((todayTotals.fibre / fibreAI) * 100)}%)</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.round((todayTotals.fibre / fibreAI) * 100), 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-stone-500 mt-1">Adequate Intake (AI) reference for adolescents</div>
            </div>
          </div>
        </div>

        {/* Macro Energy Share */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
            <PieIcon className="w-5 h-5 text-blue-600" />
            <span>Daily Macro Energy Share</span>
          </h2>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
              <div className="flex items-center space-x-3">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-600" />
                <span className="text-xs font-semibold text-stone-800">Protein (4 kcal/g)</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-stone-900">{proteinCals} kcal</span>
                <span className="text-[11px] text-stone-500 ml-2">({proteinShare}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
              <div className="flex items-center space-x-3">
                <div className="w-3.5 h-3.5 rounded-full bg-blue-600" />
                <span className="text-xs font-semibold text-stone-800">Carbohydrates (4 kcal/g)</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-stone-900">{carbCals} kcal</span>
                <span className="text-[11px] text-stone-500 ml-2">({carbShare}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
              <div className="flex items-center space-x-3">
                <div className="w-3.5 h-3.5 rounded-full bg-orange-500" />
                <span className="text-xs font-semibold text-stone-800">Fat (9 kcal/g)</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-stone-900">{fatCals} kcal</span>
                <span className="text-[11px] text-stone-500 ml-2">({fatShare}%)</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>Transparent Calculation Service</span>
            </div>
            <p className="text-emerald-700 leading-relaxed">
              Acceptable Macronutrient Distribution Ranges (AMDR) for ages 14–18: Carbohydrate 45–65%, Protein 10–30%, Fat 25–35%. Conversion factors: 4/4/9 kcal/g.
            </p>
          </div>
        </div>
      </div>

      {/* Averages Summary */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-stone-900">Averages & Trends ({dateRange.toUpperCase()})</h2>
        <p className="text-xs text-stone-500">
          Aggregating actual recorded days in timeframe. Unlogged days are treated as missing observations, never zero.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-center">
            <div className="text-xs text-stone-500">Avg Calories</div>
            <div className="text-xl font-bold text-stone-900 mt-1">{avgNutrients.calories} kcal</div>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-center">
            <div className="text-xs text-stone-500">Avg Protein</div>
            <div className="text-xl font-bold text-stone-900 mt-1">{avgNutrients.protein} g</div>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-center">
            <div className="text-xs text-stone-500">Avg Carbs</div>
            <div className="text-xl font-bold text-stone-900 mt-1">{avgNutrients.carbs} g</div>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-center">
            <div className="text-xs text-stone-500">Avg Fat</div>
            <div className="text-xl font-bold text-stone-900 mt-1">{avgNutrients.fat} g</div>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-center">
            <div className="text-xs text-stone-500">Avg Fibre</div>
            <div className="text-xl font-bold text-stone-900 mt-1">{avgNutrients.fibre} g</div>
          </div>
        </div>
      </div>
    </div>
  );
}
