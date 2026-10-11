import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { foodDbService } from '../services/foodDatabase';
import { scaleNutrients, getTodayDateString } from '../utils/calculations';
import { FoodItem } from '../types';
import { CombinedMealBuilderModal } from './CombinedMealBuilderModal';
import { 
  Search, 
  Plus, 
  Trash2, 
  Calendar, 
  UtensilsCrossed, 
  Sparkles, 
  Check, 
  Layers,
  Star,
  ChevronRight,
  Filter
} from 'lucide-react';

export function FoodLogView() {
  const { foodLogs, addFoodLog, deleteFoodLog, deleteMealGroup, setActiveTab } = useApp();
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedPortionIndex, setSelectedPortionIndex] = useState<number>(0);
  const [customGrams, setCustomGrams] = useState<string>('100');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isMealBuilderOpen, setIsMealBuilderOpen] = useState(false);

  const categories = [
    'All',
    'Special Foods & Eating Out',
    'Cereals & Grains',
    'Fish & Meat',
    'Vegetables',
    'Lentils & Pulses',
    'Eggs & Dairy',
    'Fruits',
    'Beverages',
    'Prepared & Snacks',
  ];

  const filteredFoods = foodDbService.searchFoods(searchQuery, selectedCategory);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setSelectedPortionIndex(0);
    setCustomGrams(food.standardPortions[0]?.grams.toString() || '100');
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) return;

    const grams = parseFloat(customGrams) || 100;
    const portionDesc = selectedFood.standardPortions[selectedPortionIndex]?.label || `${grams}g custom portion`;
    const nutrients = scaleNutrients(selectedFood.per100g, grams);

    addFoodLog({
      date: selectedDate,
      mealType,
      foodItemId: selectedFood.id,
      foodName: `${selectedFood.nameEn} (${selectedFood.nameBn})`,
      preparationState: selectedFood.preparationState,
      quantityGrams: grams,
      portionDescription: portionDesc,
      source: selectedFood.source,
      nutrients,
    });

    setSuccessMessage(`Successfully logged ${selectedFood.nameEn} (${selectedFood.nameBn})!`);
    setTimeout(() => setSuccessMessage(null), 3500);
    setSelectedFood(null);
  };

  const dayLogs = foodLogs.filter(l => l.date === selectedDate);

  // Group day logs by mealGroupId if present
  const groupedMeals = React.useMemo(() => {
    const groups: { [key: string]: { name: string; items: typeof dayLogs; totalCals: number } } = {};
    const standalones: typeof dayLogs = [];

    dayLogs.forEach(item => {
      if (item.mealGroupId) {
        if (!groups[item.mealGroupId]) {
          groups[item.mealGroupId] = {
            name: item.mealGroupName || 'Combined Meal',
            items: [],
            totalCals: 0,
          };
        }
        groups[item.mealGroupId].items.push(item);
        groups[item.mealGroupId].totalCals += item.nutrients.calories;
      } else {
        standalones.push(item);
      }
    });

    return { groups, standalones };
  }, [dayLogs]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Daily Food Log</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Log authentic Bangladeshi meals, eating out foods, and water using the FAO (2013) & USDA tables.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-2 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setIsMealBuilderOpen(true)}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>Build a Meal (খাবার তৈরি করুন)</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-assistant')}
            className="flex items-center space-x-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-xl text-xs font-semibold transition-colors border border-stone-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Assistant</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs animate-fade-in">
          <span>{successMessage}</span>
          <Check className="w-4 h-4 text-emerald-700" />
        </div>
      )}

      {/* Main Grid: Food Search & Selection vs Today's Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Food Catalog Search & Picker (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">Search Food Catalog</h2>
            <button
              onClick={() => setIsMealBuilderOpen(true)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create My Own Meal Combination</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search foods, special dishes, polao, biryani, chicken roast, pizza, mojo..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Category Chips */}
          <div className="flex space-x-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Food List */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
            <span>Verified Foods Catalog:</span>
            <span>Showing {Math.min(80, filteredFoods.length)} of {filteredFoods.length} foods</span>
          </div>
          <div className="max-h-[440px] overflow-y-auto space-y-2 pr-1">
            {filteredFoods.length === 0 ? (
              <div className="text-center py-12 text-stone-500 text-xs">
                No foods matched your search. Try searching &quot;bhaat&quot;, &quot;chips&quot;, &quot;chocolate&quot;, &quot;polao&quot;, &quot;chicken roast&quot;, &quot;pizza&quot;, or &quot;dal&quot;.
              </div>
            ) : (
              filteredFoods.slice(0, 80).map(food => (
                <div
                  key={food.id}
                  onClick={() => handleSelectFood(food)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedFood?.id === food.id
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                      : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-stone-900 text-sm">{food.nameEn}</span>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {food.nameBn}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-1">
                      {food.category} • <span className="font-medium text-stone-700">{food.source}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-stone-900">{food.per100g.calories} kcal / 100g</div>
                    <div className="text-[11px] text-stone-500">P: {food.per100g.protein}g • C: {food.per100g.carbs}g</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Log Form & Today's Meals (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Food Logging Form */}
          {selectedFood ? (
            <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-md space-y-4 relative animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-700 px-2 py-0.5 rounded text-emerald-200">
                    Individual Food Item
                  </span>
                  <h3 className="text-lg font-bold mt-1">{selectedFood.nameEn} ({selectedFood.nameBn})</h3>
                  <p className="text-xs text-emerald-200 mt-0.5">Source: {selectedFood.source}</p>
                </div>
                <button
                  onClick={() => setSelectedFood(null)}
                  className="text-emerald-300 hover:text-white text-xs font-semibold"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleAddLog} className="space-y-4 pt-2 border-t border-emerald-800">
                <div>
                  <label className="block text-xs font-medium text-emerald-200 mb-1">Meal Type</label>
                  <select
                    value={mealType}
                    onChange={e => setMealType(e.target.value as any)}
                    className="w-full bg-emerald-800 border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="breakfast">Breakfast (সকালের নাস্তা)</option>
                    <option value="lunch">Lunch (দুপুরের খাবার)</option>
                    <option value="dinner">Dinner (রাতের খাবার)</option>
                    <option value="snack">Snack / Special (নাস্তা / স্পেশাল)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-emerald-200 mb-1">Portion Size</label>
                  <select
                    value={selectedPortionIndex}
                    onChange={e => {
                      const idx = parseInt(e.target.value);
                      setSelectedPortionIndex(idx);
                      setCustomGrams(selectedFood.standardPortions[idx].grams.toString());
                    }}
                    className="w-full bg-emerald-800 border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {selectedFood.standardPortions.map((p, idx) => (
                      <option key={idx} value={idx}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-emerald-200 mb-1">Quantity in Grams (g)</label>
                  <input
                    type="number"
                    value={customGrams}
                    onChange={e => setCustomGrams(e.target.value)}
                    className="w-full bg-emerald-800 border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="bg-emerald-800/80 p-3 rounded-xl border border-emerald-700 text-xs space-y-1">
                  <div className="font-semibold text-emerald-200">Calculated Nutrients for {customGrams}g:</div>
                  <div className="flex justify-between text-emerald-100">
                    <span>Calories:</span>
                    <span className="font-bold">{scaleNutrients(selectedFood.per100g, parseFloat(customGrams) || 0).calories} kcal</span>
                  </div>
                  <div className="flex justify-between text-emerald-100">
                    <span>Protein / Carbs / Fat:</span>
                    <span>
                      {scaleNutrients(selectedFood.per100g, parseFloat(customGrams) || 0).protein}g / {scaleNutrients(selectedFood.per100g, parseFloat(customGrams) || 0).carbs}g / {scaleNutrients(selectedFood.per100g, parseFloat(customGrams) || 0).fat}g
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  Add to Daily Log
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center shadow-xs space-y-3">
              <UtensilsCrossed className="w-9 h-9 text-emerald-600 mx-auto" />
              <div>
                <h3 className="font-bold text-stone-800 text-sm">Add Complete Meal or Single Food</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Log your whole plate with main dish, sides, curry & water together using the Meal Builder, or select an individual food on the left.
                </p>
              </div>
              <button
                onClick={() => setIsMealBuilderOpen(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Layers className="w-4 h-4" />
                <span>Open Meal Builder (সম্পূর্ণ খাবার তৈরি)</span>
              </button>
            </div>
          )}

          {/* Today's Log Summary */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm">Recorded Meals ({selectedDate})</h3>
              <span className="text-xs font-semibold bg-stone-100 px-2.5 py-1 rounded-full text-stone-700">
                {dayLogs.length} items logged
              </span>
            </div>

            <div className="max-h-[380px] overflow-y-auto space-y-3">
              {dayLogs.length === 0 ? (
                <div className="text-center py-8 text-stone-500 text-xs">
                  No meals logged for this date.
                </div>
              ) : (
                <>
                  {/* Render Named Meal Groups */}
                  {Object.entries(groupedMeals.groups).map(([groupId, group]) => (
                    <div key={groupId} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <div className="flex items-center space-x-2">
                          <Layers className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-stone-900">{group.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-emerald-700">{group.totalCals} kcal</span>
                          <button
                            onClick={() => deleteMealGroup(groupId)}
                            className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                            title="Delete whole meal group"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 pl-2">
                        {group.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-[11px] text-stone-600">
                            <span>• {item.foodName} ({item.quantityGrams}g)</span>
                            <div className="flex items-center space-x-2">
                              <span>{item.nutrients.calories} kcal</span>
                              <button
                                onClick={() => deleteFoodLog(item.id)}
                                className="text-stone-300 hover:text-red-500"
                                title="Remove component"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Render Standalone Food Items */}
                  {groupedMeals.standalones.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
                      <div>
                        <div className="font-semibold text-stone-900 text-xs">{log.foodName}</div>
                        <div className="text-[10px] text-stone-500">
                          {log.mealType.toUpperCase()} • {log.quantityGrams}g ({log.portionDescription})
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="font-bold text-stone-900 text-xs">{log.nutrients.calories} kcal</div>
                          <div className="text-[10px] text-stone-500">P: {log.nutrients.protein}g</div>
                        </div>
                        <button
                          onClick={() => deleteFoodLog(log.id)}
                          className="text-stone-400 hover:text-red-600 transition-colors p-1"
                          title="Delete log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Combined Meal Builder Modal */}
      <CombinedMealBuilderModal
        isOpen={isMealBuilderOpen}
        onClose={() => setIsMealBuilderOpen(false)}
        selectedDate={selectedDate}
      />
    </div>
  );
}
