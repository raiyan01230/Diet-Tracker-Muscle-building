import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { foodDbService } from '../services/foodDatabase';
import { scaleNutrients } from '../utils/calculations';
import { FoodItem, NutrientValues } from '../types';
import { 
  Plus, 
  Trash2, 
  Droplet, 
  Check, 
  X, 
  UtensilsCrossed, 
  Star, 
  Sparkles, 
  ChevronDown, 
  Info,
  Search,
  Scale
} from 'lucide-react';

interface MealComponentItem {
  id: string; // unique for this builder row
  foodItem: FoodItem;
  quantityGrams: number;
  portionDescription: string;
}

interface CombinedMealBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
}

export function CombinedMealBuilderModal({ isOpen, onClose, selectedDate }: CombinedMealBuilderModalProps) {
  const { addCompleteMeal, favoriteMeals, addFavoriteMeal, userProfile } = useApp();

  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [mealName, setMealName] = useState('দুপুরের সম্পূর্ণ খাবার (Combined Lunch)');
  const [components, setComponents] = useState<MealComponentItem[]>(() => {
    // Default starter combo: Rice + Chicken Curry + Alu Bhorta
    const rice = foodDbService.getFoodById('bhaat_boiled') || foodDbService.getAllFoods()[0];
    const chicken = foodDbService.getFoodById('murgi_mangsho') || foodDbService.getAllFoods()[1];
    const bhorta = foodDbService.getFoodById('alu_bhorta') || foodDbService.getAllFoods()[2];
    return [
      { id: 'c_1', foodItem: rice, quantityGrams: 200, portionDescription: '1 Plate (200g)' },
      { id: 'c_2', foodItem: chicken, quantityGrams: 150, portionDescription: '1 Bowl / 2 Pieces (150g)' },
      { id: 'c_3', foodItem: bhorta, quantityGrams: 60, portionDescription: '1 Serving (60g)' },
    ];
  });

  // Water with this meal
  const [waterGlasses, setWaterGlasses] = useState<number>(2);
  const glassVolume = userProfile.glassVolumeMl || 250;
  const totalWaterMl = waterGlasses * glassVolume;

  // Search & add new component
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddingFood, setIsAddingFood] = useState(false);

  // Favorite template save state
  const [saveAsFavoriteName, setSaveAsFavoriteName] = useState('');
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);

  // Success message
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

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

  const searchableFoods = useMemo(() => {
    return foodDbService.searchFoods(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  // Compute live meal total nutrition
  const totalNutrients = useMemo(() => {
    const res: NutrientValues = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fibre: 0,
      vitamins: { a: 0, c: 0, d: 0, e: 0, k: 0, b1: 0, b2: 0, b3: 0, b5: 0, b6: 0, b7: 0, b9: 0, b12: 0, choline: 0 },
      minerals: { calcium: 0, iron: 0, zinc: 0, magnesium: 0, phosphorus: 0, iodine: 0, selenium: 0, copper: 0, potassium: 0, sodium: 0, manganese: 0, chromium: 0, molybdenum: 0 },
    };

    components.forEach(comp => {
      const scaled = scaleNutrients(comp.foodItem.per100g, comp.quantityGrams);
      res.calories += scaled.calories;
      res.protein += scaled.protein;
      res.carbs += scaled.carbs;
      res.fat += scaled.fat;
      res.fibre += scaled.fibre;

      Object.keys(res.vitamins).forEach(k => {
        (res.vitamins as any)[k] += (scaled.vitamins as any)[k] || 0;
      });
      Object.keys(res.minerals).forEach(k => {
        (res.minerals as any)[k] += (scaled.minerals as any)[k] || 0;
      });
    });

    res.protein = Math.round(res.protein * 10) / 10;
    res.carbs = Math.round(res.carbs * 10) / 10;
    res.fat = Math.round(res.fat * 10) / 10;
    res.fibre = Math.round(res.fibre * 10) / 10;
    return res;
  }, [components]);

  const handleAddComponent = (food: FoodItem) => {
    const defPortion = food.standardPortions[0] || { label: '100g serving', grams: 100 };
    const newItem: MealComponentItem = {
      id: 'c_' + Math.random().toString(36).substring(2, 9),
      foodItem: food,
      quantityGrams: defPortion.grams,
      portionDescription: defPortion.label,
    };
    setComponents(prev => [...prev, newItem]);
    setIsAddingFood(false);
    setSearchQuery('');
  };

  const handleRemoveComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateComponentGrams = (id: string, grams: number, desc?: string) => {
    setComponents(prev => prev.map(c => {
      if (c.id !== id) return c;
      return {
        ...c,
        quantityGrams: Math.max(1, grams),
        portionDescription: desc || `${grams}g`,
      };
    }));
  };

  const handleLoadFavorite = (favId: string) => {
    const fav = favoriteMeals.find(f => f.id === favId);
    if (!fav) return;

    const newComps: MealComponentItem[] = fav.components.map(fc => {
      const food = foodDbService.getFoodById(fc.foodItemId) || foodDbService.getAllFoods()[0];
      return {
        id: 'c_' + Math.random().toString(36).substring(2, 9),
        foodItem: food,
        quantityGrams: fc.quantityGrams,
        portionDescription: fc.portionLabel || `${fc.quantityGrams}g`,
      };
    });

    setComponents(newComps);
    setMealName(fav.name);
    if (typeof fav.waterMl === 'number') {
      setWaterGlasses(Math.round(fav.waterMl / glassVolume));
    }
    setSuccessNotice(`Loaded template: "${fav.name}"`);
    setTimeout(() => setSuccessNotice(null), 2500);
  };

  const handleSaveFavorite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveAsFavoriteName.trim()) return;

    addFavoriteMeal({
      name: saveAsFavoriteName.trim(),
      waterMl: totalWaterMl,
      components: components.map(c => ({
        foodItemId: c.foodItem.id,
        foodName: `${c.foodItem.nameEn} (${c.foodItem.nameBn})`,
        quantityGrams: c.quantityGrams,
        portionLabel: c.portionDescription,
      })),
    });

    setSaveAsFavoriteName('');
    setIsSavingFavorite(false);
    setSuccessNotice('Saved combination to Favorite Meals!');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleConfirmMeal = () => {
    if (components.length === 0) return;

    const items = components.map(c => {
      const nutrients = scaleNutrients(c.foodItem.per100g, c.quantityGrams);
      return {
        foodItemId: c.foodItem.id,
        foodName: `${c.foodItem.nameEn} (${c.foodItem.nameBn})`,
        preparationState: c.foodItem.preparationState,
        quantityGrams: c.quantityGrams,
        portionDescription: c.portionDescription,
        source: c.foodItem.source,
        nutrients,
      };
    });

    addCompleteMeal({
      date: selectedDate,
      mealType,
      mealName,
      items,
      waterMl: totalWaterMl,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Build a Complete Meal (সম্পূর্ণ খাবার তৈরি)</h2>
              <p className="text-xs text-stone-500">
                Log main dish, curry, sides, and water together in one confirmed meal entry.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {successNotice && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in">
              <span>{successNotice}</span>
              <Check className="w-4 h-4 text-emerald-700" />
            </div>
          )}

          {/* Quick Favorite Templates */}
          {favoriteMeals.length > 0 && (
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                <span className="flex items-center space-x-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Favorite Meal Templates (সহজেই পুনরায় ব্যবহার করুন):</span>
                </span>
                <span className="text-[11px] text-stone-500">Click to load components</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {favoriteMeals.map(fav => (
                  <button
                    key={fav.id}
                    onClick={() => handleLoadFavorite(fav.id)}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 transition-colors flex items-center space-x-1.5 shadow-2xs"
                  >
                    <span>{fav.name}</span>
                    <span className="text-[10px] text-stone-400">({fav.components.length} items)</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Meal Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Meal Title</label>
              <input
                type="text"
                value={mealName}
                onChange={e => setMealName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. Rice + Chicken Curry + Alu Bhorta"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Meal Slot</label>
              <select
                value={mealType}
                onChange={e => setMealType(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none"
              >
                <option value="breakfast">Breakfast (সকালের নাস্তা)</option>
                <option value="lunch">Lunch (দুপুরের খাবার)</option>
                <option value="dinner">Dinner (রাতের খাবার)</option>
                <option value="snack">Snack / Special (নাস্তা / স্পেশাল)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Logging Date</label>
              <input
                type="date"
                value={selectedDate}
                readOnly
                className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Component Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-1.5">
                <span>Meal Components ({components.length} items)</span>
              </h3>
              <button
                onClick={() => setIsAddingFood(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Food Component</span>
              </button>
            </div>

            {components.length === 0 ? (
              <div className="text-center py-8 bg-stone-50 rounded-2xl border border-dashed border-stone-300 text-xs text-stone-500">
                No food components in this meal yet. Click &quot;Add Food Component&quot; to choose foods.
              </div>
            ) : (
              <div className="space-y-2.5">
                {components.map((comp) => {
                  const compNutrients = scaleNutrients(comp.foodItem.per100g, comp.quantityGrams);
                  return (
                    <div
                      key={comp.id}
                      className="p-3.5 bg-white rounded-xl border border-stone-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-stone-900 text-xs">{comp.foodItem.nameEn}</span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {comp.foodItem.nameBn}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Category: {comp.foodItem.category} • Source: <span className="font-medium text-stone-700">{comp.foodItem.source}</span>
                        </div>
                      </div>

                      {/* Portion Controls */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Preset options */}
                        {comp.foodItem.standardPortions.length > 0 && (
                          <select
                            value={comp.quantityGrams}
                            onChange={e => {
                              const g = parseFloat(e.target.value);
                              const matchP = comp.foodItem.standardPortions.find(p => p.grams === g);
                              handleUpdateComponentGrams(comp.id, g, matchP?.label);
                            }}
                            className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none"
                          >
                            {comp.foodItem.standardPortions.map((p, idx) => (
                              <option key={idx} value={p.grams}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        )}

                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min="1"
                            value={comp.quantityGrams}
                            onChange={e => handleUpdateComponentGrams(comp.id, parseFloat(e.target.value) || 1)}
                            className="w-16 px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 text-center font-bold focus:outline-none"
                          />
                          <span className="text-xs text-stone-500 font-semibold">g</span>
                        </div>

                        {/* Calculated numbers for this item */}
                        <div className="text-right px-2 min-w-[90px]">
                          <div className="text-xs font-bold text-stone-900">{compNutrients.calories} kcal</div>
                          <div className="text-[10px] text-stone-500">P: {compNutrients.protein}g • C: {compNutrients.carbs}g</div>
                        </div>

                        <button
                          onClick={() => handleRemoveComponent(comp.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition-colors rounded-lg hover:bg-stone-100"
                          title="Remove component"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Water with this Meal (FEATURE 4) */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-950">Water with this Meal (খাবারের সাথে পানি)</h4>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  Logged into Hydration Tracker with 0 food calories. Glass volume: {glassVolume} ml.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-lg border border-blue-200">
                <button
                  type="button"
                  onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
                  className="px-2 py-0.5 font-bold text-stone-700 hover:bg-stone-100 rounded text-sm"
                >
                  -
                </button>
                <span className="text-xs font-bold text-blue-950 min-w-[50px] text-center">
                  {waterGlasses} {waterGlasses === 1 ? 'glass' : 'glasses'}
                </span>
                <button
                  type="button"
                  onClick={() => setWaterGlasses(waterGlasses + 1)}
                  className="px-2 py-0.5 font-bold text-stone-700 hover:bg-stone-100 rounded text-sm"
                >
                  +
                </button>
              </div>
              <span className="text-xs font-extrabold text-blue-900">
                {totalWaterMl} ml
              </span>
            </div>
          </div>

          {/* Modal Food Picker Sub-Drawer */}
          {isAddingFood && (
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-300 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  Select Food Component to Add
                </h4>
                <button
                  onClick={() => setIsAddingFood(false)}
                  className="text-stone-400 hover:text-stone-700 text-xs font-bold"
                >
                  ✕ Close Picker
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search foods, curries, bhorta, rice, pizza, drinks..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Categories */}
              <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-stone-900 text-white'
                        : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Results List */}
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {searchableFoods.slice(0, 80).map(f => (
                  <div
                    key={f.id}
                    onClick={() => handleAddComponent(f)}
                    className="p-2.5 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-stone-900 text-xs">{f.nameEn}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {f.nameBn}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-500">{f.category} • {f.source}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-stone-900">{f.per100g.calories} kcal/100g</span>
                      <div className="text-[10px] text-stone-500">P: {f.per100g.protein}g</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Combined Preview & Real Nutrition (FEATURE 5) */}
          <div className="bg-emerald-950 text-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  Combined Meal Nutrition Preview
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{mealName}</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white">{totalNutrients.calories}</span>
                <span className="text-xs text-emerald-300 ml-1">kcal total</span>
              </div>
            </div>

            {/* Macros summary */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-emerald-900/80 p-2.5 rounded-xl border border-emerald-800">
                <div className="text-[10px] text-emerald-300 uppercase font-semibold">Protein</div>
                <div className="text-base font-bold text-white mt-0.5">{totalNutrients.protein}g</div>
              </div>
              <div className="bg-emerald-900/80 p-2.5 rounded-xl border border-emerald-800">
                <div className="text-[10px] text-emerald-300 uppercase font-semibold">Carbs</div>
                <div className="text-base font-bold text-white mt-0.5">{totalNutrients.carbs}g</div>
              </div>
              <div className="bg-emerald-900/80 p-2.5 rounded-xl border border-emerald-800">
                <div className="text-[10px] text-emerald-300 uppercase font-semibold">Fat</div>
                <div className="text-base font-bold text-white mt-0.5">{totalNutrients.fat}g</div>
              </div>
              <div className="bg-emerald-900/80 p-2.5 rounded-xl border border-emerald-800">
                <div className="text-[10px] text-emerald-300 uppercase font-semibold">Fibre</div>
                <div className="text-base font-bold text-white mt-0.5">{totalNutrients.fibre}g</div>
              </div>
            </div>

            {/* Micronutrients highlights */}
            <div className="text-[11px] text-emerald-200 flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-emerald-800/80">
              <span>Calcium: <strong>{Math.round(totalNutrients.minerals.calcium)} mg</strong></span>
              <span>Iron: <strong>{Math.round(totalNutrients.minerals.iron * 10)/10} mg</strong></span>
              <span>Zinc: <strong>{Math.round(totalNutrients.minerals.zinc * 10)/10} mg</strong></span>
              <span>Vit C: <strong>{Math.round(totalNutrients.vitamins.c * 10)/10} mg</strong></span>
              <span>Vit A: <strong>{Math.round(totalNutrients.vitamins.a)} mcg</strong></span>
              <span>Plain Water: <strong className="text-blue-300">{totalWaterMl} ml ({waterGlasses} gl)</strong></span>
            </div>
          </div>

          {/* Save As Favorite Template Toggle */}
          {isSavingFavorite ? (
            <form onSubmit={handleSaveFavorite} className="flex items-center space-x-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <input
                type="text"
                placeholder="Template name (e.g. My Everyday Lunch)"
                value={saveAsFavoriteName}
                onChange={e => setSaveAsFavoriteName(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
              >
                Save Template
              </button>
              <button
                type="button"
                onClick={() => setIsSavingFavorite(false)}
                className="px-2.5 py-1.5 text-stone-500 hover:text-stone-800 text-xs font-semibold"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSaveAsFavoriteName(mealName);
                  setIsSavingFavorite(true);
                }}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
              >
                <Star className="w-3.5 h-3.5" />
                <span>Save this combination as a Favorite Template</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-stone-500">
            {components.length} foods + {totalWaterMl}ml water will be logged under one named meal group.
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold border border-stone-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmMeal}
              disabled={components.length === 0}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Log Complete Meal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
