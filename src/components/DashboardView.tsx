import React from 'react';
import { useApp } from '../context/AppContext';
import { calculateTeenEER, NUTRIENT_REFERENCES_TEEN_14_18 } from '../data/nutrientReferences';
import { sumNutrients, getTodayDateString } from '../utils/calculations';
import { 
  Flame, 
  UtensilsCrossed, 
  Sparkles, 
  TrendingUp, 
  Apple, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ArrowRight,
  Activity,
  Plus
} from 'lucide-react';

export function DashboardView() {
  const { userProfile, foodLogs, growthMeasurements, setActiveTab } = useApp();
  const today = getTodayDateString();

  // Filter food logs for today
  const todayLogs = foodLogs.filter(l => l.date === today);
  const totalNutrients = sumNutrients(todayLogs);

  // Calculate EER
  const estimatedCalories = calculateTeenEER(
    userProfile.referenceSex,
    userProfile.age,
    userProfile.heightCm,
    userProfile.weightKg,
    userProfile.activityLevel
  );

  const refValues = NUTRIENT_REFERENCES_TEEN_14_18[userProfile.referenceSex];
  const proteinTarget = refValues.rdas.protein;

  const caloriePercentage = Math.round((totalNutrients.calories / estimatedCalories) * 100);
  const proteinPercentage = Math.round((totalNutrients.protein / proteinTarget) * 100);

  const latestGrowth = growthMeasurements[0] || {
    heightCm: userProfile.heightCm,
    weightKg: userProfile.weightKg,
    date: today,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 opacity-30 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>Bangladesh Nutrition & Growth Monitor</span>
              <span>•</span>
              <span>Timezone: {userProfile.timezone}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              স্বাগতম, {userProfile.name}! 🇧🇩
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              Tracking your daily nutrition based on the FAO Food Composition Table for Bangladesh (2013), National Academies EER equations, and WHO 2007 growth references.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('ai-assistant')}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Food Assistant</span>
            </button>
            <button
              onClick={() => setActiveTab('food-log')}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold backdrop-blur-xs transition-all border border-white/20"
            >
              <Plus className="w-4 h-4" />
              <span>Log Meal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Today's Calories</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-stone-900">{totalNutrients.calories}</span>
              <span className="text-sm text-stone-500">/ {estimatedCalories} kcal</span>
            </div>
            <div className="mt-3 w-full bg-stone-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  caloriePercentage > 110 ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(caloriePercentage, 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Estimated EER Target</span>
            <span className="font-medium text-stone-700">{caloriePercentage}% achieved</span>
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Protein Intake</span>
              <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-stone-900">{totalNutrients.protein}g</span>
              <span className="text-sm text-stone-500">/ {proteinTarget}g RDA</span>
            </div>
            <div className="mt-3 w-full bg-stone-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(proteinPercentage, 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Teen RDA Target</span>
            <span className="font-medium text-stone-700">{proteinPercentage}% achieved</span>
          </div>
        </div>

        {/* Growth Card */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Height & Weight</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline space-x-3">
              <div>
                <span className="text-2xl font-bold text-stone-900">{latestGrowth.heightCm}</span>
                <span className="text-xs text-stone-500 ml-1">cm</span>
              </div>
              <span className="text-stone-300">|</span>
              <div>
                <span className="text-2xl font-bold text-stone-900">{latestGrowth.weightKg}</span>
                <span className="text-xs text-stone-500 ml-1">kg</span>
              </div>
            </div>
            <p className="text-xs text-stone-500 mt-3">
              WHO 2007 growth reference tracked. Last updated: {latestGrowth.date}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500">View growth history</span>
            <button
              onClick={() => setActiveTab('growth')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
            >
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Food Log Status Card */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Today's Log Status</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-stone-900">{todayLogs.length}</span>
              <span className="text-sm text-stone-500">meals logged</span>
            </div>
            <p className="text-xs text-stone-500 mt-3">
              {todayLogs.length > 0 ? 'Logged using FAO Bangladesh 2013 verified foods.' : 'No meals logged yet today.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500">Manage logs</span>
            <button
              onClick={() => setActiveTab('food-log')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
            >
              <span>Open Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Logged Meals */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Today's Food Log</h2>
              <p className="text-xs text-stone-500">Showing meals recorded for {today}</p>
            </div>
            <button
              onClick={() => setActiveTab('food-log')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
            >
              <span>View All / Add</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayLogs.length === 0 ? (
            <div className="text-center py-12 bg-stone-50 rounded-xl border border-dashed border-stone-200">
              <UtensilsCrossed className="w-10 h-10 text-stone-400 mx-auto mb-3" />
              <p className="text-stone-700 font-medium text-sm">No meals logged for today yet.</p>
              <p className="text-stone-500 text-xs mt-1">Use the Daily Food Log or AI Assistant to add local Bangladeshi meals.</p>
              <button
                onClick={() => setActiveTab('ai-assistant')}
                className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try AI Food Assistant</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-100 hover:border-stone-200 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {log.mealType.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900 text-sm">{log.foodName}</div>
                      <div className="text-xs text-stone-500">
                        {log.portionDescription} ({log.quantityGrams}g) • <span className="text-emerald-700 font-medium">{log.source}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-stone-900 text-sm">{log.nutrients.calories} kcal</div>
                    <div className="text-xs text-stone-500">P: {log.nutrients.protein}g • C: {log.nutrients.carbs}g</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Micronutrient Highlights & Guidance */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <h2 className="text-lg font-bold text-stone-900 mb-2">Micronutrient Highlights</h2>
            <p className="text-xs text-stone-500 mb-4">Key vitamins & minerals tracked today</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className="flex items-center space-x-2.5">
                  <Apple className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-stone-800">Vitamin C (Amla, Guava)</span>
                </div>
                <span className="text-xs font-bold text-stone-900">
                  {Math.round(totalNutrients.vitamins.c)} mg
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className="flex items-center space-x-2.5">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-stone-800">Calcium (Milk, Fish)</span>
                </div>
                <span className="text-xs font-bold text-stone-900">
                  {Math.round(totalNutrients.minerals.calcium)} mg
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className="flex items-center space-x-2.5">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-medium text-stone-800">Iron (Lentils, Meat)</span>
                </div>
                <span className="text-xs font-bold text-stone-900">
                  {Math.round(totalNutrients.minerals.iron * 10) / 10} mg
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('vitamins')}
              className="mt-4 w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors border border-stone-300 text-center"
            >
              View Full Micronutrient Breakdown
            </button>
          </div>

          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 text-emerald-900">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-xs uppercase tracking-wide text-emerald-800">Clinical Transparency Notice</h3>
                <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                  Calorie requirements use National Academies EER equations for teens. Diet logs do not diagnose deficiencies. Consult a qualified clinician for personalised medical advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
