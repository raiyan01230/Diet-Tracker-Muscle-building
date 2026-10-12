import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { foodDbService } from '../services/foodDatabase';
import { scaleNutrients, getTodayDateString } from '../utils/calculations';
import { FoodItem } from '../types';
import { CombinedMealBuilderModal } from './CombinedMealBuilderModal';
import { 
  Search, 
  Plus, 
  Minus,
  Trash2, 
  Calendar, 
  UtensilsCrossed, 
  Sparkles, 
  Check, 
  Layers,
  Star,
  ChevronRight,
  Filter,
  Scale,
  Hash
} from 'lucide-react';

export function FoodLogView() {
  const { 
    foodLogs, 
    addFoodLog, 
    deleteFoodLog, 
    deleteMealGroup, 
    setActiveTab, 
    selectedDate, 
    setSelectedDate,
    goToPreviousDay,
    goToNextDay,
    goToToday
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedPortionIndex, setSelectedPortionIndex] = useState<number>(0);
  const [quantityMode, setQuantityMode] = useState<'count' | 'grams'>('count');
  const [quantityCount, setQuantityCount] = useState<number>(1);
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

  const isNutOrSmallSnack = (food: FoodItem | null): boolean => {
    if (!food) return false;
    const cat = food.category.toLowerCase();
    const name = food.nameEn.toLowerCase();
    return (
      cat.includes('nut') ||
      cat.includes('seed') ||
      name.includes('nut') ||
      name.includes('badam') ||
      name.includes('almond') ||
      name.includes('cashew') ||
      name.includes('peanut') ||
      name.includes('walnut') ||
      name.includes('pistachio') ||
      name.includes('khejur') ||
      name.includes('dates') ||
      food.standardPortions.some(p => p.grams <= 5)
    );
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    const nutItem = isNutOrSmallSnack(food);

    // If nut or small piece food, look for single piece/kernel portion if available
    let initialPortionIdx = 0;
    let initialCount = 1;

    if (nutItem) {
      const singleKernelIdx = food.standardPortions.findIndex(p => p.grams <= 2.5);
      if (singleKernelIdx !== -1) {
        initialPortionIdx = singleKernelIdx;
        initialCount = 10; // Default to 10 nuts for ease of use!
      } else {
        initialCount = 1;
      }
    } else {
      initialCount = 1;
    }

    setSelectedPortionIndex(initialPortionIdx);
    setQuantityCount(initialCount);
    setQuantityMode('count');

    const baseGrams = food.standardPortions[initialPortionIdx]?.grams || 100;
    const totalG = Math.round(baseGrams * initialCount * 10) / 10;
    setCustomGrams(totalG.toString());
  };

  const handleUpdateQuantityCount = (newCount: number) => {
    const validCount = Math.max(0.1, Math.round(newCount * 10) / 10);
    setQuantityCount(validCount);
    if (selectedFood) {
      const baseGrams = selectedFood.standardPortions[selectedPortionIndex]?.grams || 100;
      const totalG = Math.round(baseGrams * validCount * 10) / 10;
      setCustomGrams(totalG.toString());
    }
  };

  const handleSelectPortion = (idx: number) => {
    setSelectedPortionIndex(idx);
    if (selectedFood) {
      const baseGrams = selectedFood.standardPortions[idx]?.grams || 100;
      const totalG = Math.round(baseGrams * quantityCount * 10) / 10;
      setCustomGrams(totalG.toString());
    }
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) return;

    const grams = parseFloat(customGrams) || 100;
    const portionObj = selectedFood.standardPortions[selectedPortionIndex];
    let portionDesc = '';

    if (quantityMode === 'count') {
      if (quantityCount === 1) {
        portionDesc = `${portionObj?.label || '1 Portion'} (${grams}g)`;
      } else {
        portionDesc = `${quantityCount} × ${portionObj?.label || 'Portion'} (${grams}g)`;
      }
    } else {
      portionDesc = `${grams}g custom portion`;
    }

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

    setSuccessMessage(`Successfully logged ${selectedFood.nameEn} — ${portionDesc}!`);
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
          <div className="flex items-center space-x-1.5 bg-stone-50 px-2 py-1.5 rounded-xl border border-stone-200">
            <button
              onClick={goToPreviousDay}
              title="Previous Day"
              className="p-1 rounded-lg hover:bg-stone-200 text-stone-600 transition-colors"
            >
              ‹
            </button>
            <div className="flex items-center space-x-1.5 px-1">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => e.target.value && setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={goToNextDay}
              title="Next Day"
              className="p-1 rounded-lg hover:bg-stone-200 text-stone-600 transition-colors"
            >
              ›
            </button>
            {selectedDate !== getTodayDateString() && (
              <button
                onClick={goToToday}
                className="ml-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors"
              >
                Today
              </button>
            )}
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
              placeholder="Search foods (e.g. বুটের ডাল, booter dal, cha, chips, ruti, polao, biryani, chicken roast)..."
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

                {/* Measure Mode Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-emerald-200">
                      How would you like to measure?
                    </label>
                    <span className="text-[10px] text-emerald-300 font-medium">
                      {isNutOrSmallSnack(selectedFood) ? '🥜 Piece/Nut Count Ready' : 'Portion & Count'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 bg-emerald-950/60 p-1 rounded-xl border border-emerald-800">
                    <button
                      type="button"
                      onClick={() => {
                        setQuantityMode('count');
                        const baseGrams = selectedFood.standardPortions[selectedPortionIndex]?.grams || 100;
                        setCustomGrams((Math.round(baseGrams * quantityCount * 10) / 10).toString());
                      }}
                      className={`flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        quantityMode === 'count'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-emerald-300 hover:text-white'
                      }`}
                    >
                      <Hash className="w-3.5 h-3.5" />
                      <span>How Many I Ate (সংখ্যা / পিস)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuantityMode('grams')}
                      className={`flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        quantityMode === 'grams'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-emerald-300 hover:text-white'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Weigh in Grams (গ্রাম)</span>
                    </button>
                  </div>
                </div>

                {quantityMode === 'count' ? (
                  <div className="space-y-3 bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-800/80">
                    {/* Portion Unit Dropdown */}
                    <div>
                      <label className="block text-[11px] font-medium text-emerald-300 mb-1">
                        Serving Unit / Portion Size (একক)
                      </label>
                      <select
                        value={selectedPortionIndex}
                        onChange={e => handleSelectPortion(parseInt(e.target.value))}
                        className="w-full bg-emerald-800 border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        {selectedFood.standardPortions.map((p, idx) => (
                          <option key={idx} value={idx}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* How Many Eaten Stepper */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-white">
                          Quantity / How Many Eaten (কতগুলো খেয়েছেন?)
                        </label>
                        <span className="text-[11px] text-emerald-300 font-bold">
                          {quantityCount} {quantityCount === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantityCount(Math.max(1, quantityCount - (quantityCount > 10 ? 5 : 1)))}
                          className="w-9 h-9 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:scale-95 border border-emerald-700 flex items-center justify-center text-white transition-all font-bold text-base shadow-xs"
                          title="Decrease count"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <div className="relative flex-1">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={quantityCount}
                            onChange={e => handleUpdateQuantityCount(parseFloat(e.target.value) || 1)}
                            className="w-full bg-emerald-900 border border-emerald-700 rounded-xl px-3 py-2 text-center text-sm font-black text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUpdateQuantityCount(quantityCount + (quantityCount >= 10 ? 5 : 1))}
                          className="w-9 h-9 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:scale-95 border border-emerald-700 flex items-center justify-center text-white transition-all font-bold text-base shadow-xs"
                          title="Increase count"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quick Chips for Count */}
                      <div className="mt-2.5">
                        <div className="text-[10px] text-emerald-300 mb-1 font-medium">Quick Count Selection:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {(isNutOrSmallSnack(selectedFood) ? [1, 3, 5, 10, 15, 20, 25, 30] : [0.5, 1, 1.5, 2, 3, 4]).map(val => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleUpdateQuantityCount(val)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                quantityCount === val
                                  ? 'bg-white text-emerald-900 shadow-xs scale-105'
                                  : 'bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 border border-emerald-700/50'
                              }`}
                            >
                              {val}x
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Calculated Weight Result Banner */}
                    <div className="bg-emerald-900/90 rounded-xl px-3.5 py-2 border border-emerald-700/60 flex items-center justify-between text-xs">
                      <span className="text-emerald-200">Total Calculated Weight:</span>
                      <span className="font-bold text-white text-sm bg-emerald-800/80 px-2.5 py-0.5 rounded-lg border border-emerald-700/60">
                        {customGrams} g
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Exact Grams Mode */
                  <div className="space-y-2.5 bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-800/80">
                    <label className="block text-xs font-semibold text-emerald-200">
                      Total Weight in Grams (স্কেল অনুযায়ী ওজন)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={customGrams}
                        onChange={e => setCustomGrams(e.target.value)}
                        className="w-full bg-emerald-800 border border-emerald-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                        required
                      />
                      <span className="absolute right-3 top-2 text-xs text-emerald-400 font-bold">g</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[15, 28, 50, 100, 150, 200, 250].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setCustomGrams(g.toString())}
                          className="px-2 py-0.5 bg-emerald-800/70 hover:bg-emerald-700 rounded text-[11px] text-emerald-200 font-semibold"
                        >
                          {g}g
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nutrition Breakdown Card */}
                <div className="bg-emerald-950/70 p-3.5 rounded-xl border border-emerald-700/80 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-200 truncate pr-2">
                      Nutrients ({quantityMode === 'count' && quantityCount !== 1 ? `${quantityCount} × ` : ''}{selectedFood.standardPortions[selectedPortionIndex]?.label || `${customGrams}g`}):
                    </span>
                    <span className="font-black text-amber-300 text-sm shrink-0">
                      {scaleNutrients(selectedFood.per100g, parseFloat(customGrams) || 0).calories} kcal
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] pt-1 border-t border-emerald-800/80">
                    <div className="bg-emerald-900/60 rounded p-1 border border-emerald-800/50">
                      <div className="text-[10px] text-emerald-300">Protein</div>
                      <div className="font-bold text-white">{scaleNutrients(selectedFood.per100g, parseFloat(customGrams) || 0).protein}g</div>
                    </div>
                    <div className="bg-emerald-900/60 rounded p-1 border border-emerald-800/50">
                      <div className="text-[10px] text-emerald-300">Carbs</div>
                      <div className="font-bold text-white">{scaleNutrients(selectedFood.per100g, parseFloat(customGrams) || 0).carbs}g</div>
                    </div>
                    <div className="bg-emerald-900/60 rounded p-1 border border-emerald-800/50">
                      <div className="text-[10px] text-emerald-300">Fat</div>
                      <div className="font-bold text-white">{scaleNutrients(selectedFood.per100g, parseFloat(customGrams) || 0).fat}g</div>
                    </div>
                    <div className="bg-emerald-900/60 rounded p-1 border border-emerald-800/50">
                      <div className="text-[10px] text-emerald-300">Fibre</div>
                      <div className="font-bold text-white">{scaleNutrients(selectedFood.per100g, parseFloat(customGrams) || 0).fibre}g</div>
                    </div>
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
