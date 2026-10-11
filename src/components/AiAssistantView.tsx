import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { foodDbService } from '../services/foodDatabase';
import { parseLocalFoodQuery } from '../utils/aiFoodParser';
import { scaleNutrients, getTodayDateString } from '../utils/calculations';
import { Sparkles, Check, AlertCircle, Loader2, Trash2, Zap, ArrowRight } from 'lucide-react';

interface ParsedFoodItem {
  foodItemId: string | null;
  foodName: string;
  foodNameBn?: string;
  preparationState: 'raw' | 'cooked';
  quantityGrams: number;
  portionDescription: string;
  confidence: number;
  clarifyingQuestion: string | null;
}

export function AiAssistantView() {
  const { addFoodLog, setActiveTab } = useApp();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedFoodItem[] | null>(null);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [sourceTag, setSourceTag] = useState<string>('Instant Verified Catalog NLP');

  const QUICK_PROMPTS = [
    { label: '🥣 বুটের ডাল (Boot er Dal)', query: '1 bati booter dal ar 2 ta ruti', tag: 'Dal / Breakfast' },
    { label: '🥔 1 Packet Potato Chips', query: '1 packet potato chips', tag: 'Chips / Snacks' },
    { label: '🍫 Cadbury Chocolate', query: '1 Cadbury Dairy Milk chocolate bar', tag: 'Chocolate' },
    { label: '🍞 2 Rotis + Dal + Egg', query: '2 ta ruti, 1 bowl dal ar 1 dim sheddho', tag: 'Breakfast' },
    { label: '🍗 Rice + Chicken Curry', query: '1 plate bhaat ar murgir mangsho jhol', tag: 'Lunch' },
    { label: '☕ 1 Cup Dudh Cha (দুধ চা)', query: '1 cup dudh cha with sugar', tag: 'Tea' },
    { label: '🥤 1 Bottle Mojo Cola', query: '1 bottle mojo cola 250ml', tag: 'Drink' },
    { label: '🥟 1 Plate Fuchka & Tok', query: '1 plate fuchka with tok', tag: 'Street Food' },
  ];

  const handleParse = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const query = (overrideText || inputText).trim();
    if (!query) return;

    setIsLoading(true);
    setErrorMsg(null);

    // 1. Instant deterministic parse from 800+ catalog
    const localMatches = parseLocalFoodQuery(query);
    if (localMatches.length > 0) {
      setParsedItems(localMatches);
      setSourceTag('Verified Catalog NLP (800+ Items)');
    }

    // 2. Background AI enhancement if server endpoint is available
    try {
      const res = await fetch('/api/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setParsedItems(data.items);
          setSourceTag(data.source === 'gemini-ai' ? 'Gemini 3.8 Flash AI' : 'Verified Catalog NLP (800+ Items)');
        }
      }
    } catch (err: any) {
      console.warn('Background AI call note:', err);
      // We already have the instant local matches, so do not block the user!
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItemGrams = (index: number, newGrams: number) => {
    if (!parsedItems) return;
    const updated = [...parsedItems];
    updated[index].quantityGrams = Math.max(1, newGrams);
    setParsedItems(updated);
  };

  const handleRemoveParsedItem = (index: number) => {
    if (!parsedItems) return;
    const remaining = parsedItems.filter((_, idx) => idx !== index);
    setParsedItems(remaining.length > 0 ? remaining : null);
  };

  const handleConfirmAndSave = () => {
    if (!parsedItems || parsedItems.length === 0) return;

    const today = getTodayDateString();

    parsedItems.forEach(item => {
      // Find exact food in 800+ database
      const allFoods = foodDbService.getAllFoods();
      const catalogFood = 
        foodDbService.getFoodById(item.foodItemId || '') ||
        allFoods.find(f => f.id === item.foodItemId) ||
        allFoods.find(f => f.nameEn.toLowerCase() === item.foodName.toLowerCase()) ||
        allFoods.find(f => item.foodName.toLowerCase().includes(f.nameEn.toLowerCase())) ||
        allFoods.find(f => f.banglish.some(b => item.foodName.toLowerCase().includes(b))) ||
        allFoods[0];

      const nutrients = scaleNutrients(catalogFood.per100g, item.quantityGrams);

      addFoodLog({
        date: today,
        mealType,
        foodItemId: catalogFood.id,
        foodName: `${catalogFood.nameEn} (${catalogFood.nameBn})`,
        preparationState: item.preparationState || catalogFood.preparationState,
        quantityGrams: item.quantityGrams,
        portionDescription: item.portionDescription || `${item.quantityGrams}g portion`,
        source: `${catalogFood.source} (AI Assistant Matched)`,
        nutrients,
      });
    });

    setSuccessMsg(`Successfully confirmed and saved ${parsedItems.length} food items to your Daily Food Log!`);
    setParsedItems(null);
    setInputText('');
    setTimeout(() => setSuccessMsg(null), 4500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 border border-emerald-400/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold">AI Food Assistant 🇧🇩</h1>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-semibold border border-emerald-400/20">
                800+ Catalog Items
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              Ask or log anything: chips, chocolate, soft drinks, fast food, snacks, or complete Bangladeshi meals.
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setActiveTab('food_log')}
            className="text-emerald-700 font-bold hover:underline flex items-center space-x-1"
          >
            <span>View Food Log</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl text-xs font-medium flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Notice</div>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Input Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <form onSubmit={e => handleParse(e)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Describe what you ate or ask for any food (English, Bangla, or Banglish)
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="e.g. 1 packet potato chips, 1 dairy milk chocolate, 2 rotis with dal and 1 boiled egg..."
              className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          {/* Quick Examples */}
          <div>
            <div className="text-[11px] font-semibold text-stone-500 mb-2 flex items-center space-x-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Quick One-Click Prompts:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(qp.query);
                    handleParse(undefined, qp.query);
                  }}
                  className="px-2.5 py-1.5 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-stone-200 rounded-lg text-[11px] text-stone-700 font-medium transition-all"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-stone-100">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Target Meal Type</label>
              <select
                value={mealType}
                onChange={e => setMealType(e.target.value as any)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none"
              >
                <option value="breakfast">Breakfast (সকালের নাস্তা)</option>
                <option value="lunch">Lunch (দুপুরের খাবার)</option>
                <option value="dinner">Dinner (রাতের খাবার)</option>
                <option value="snack">Snack (বিকেলের নাস্তা)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Matching 800+ Catalog...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Parse Food & Match</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Editable Confirmation Screen */}
      {parsedItems && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-stone-900 text-base">Review & Confirm Extracted Foods</h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold">
                  {sourceTag}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Every component is individually matched against authentic nutrition records.
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold border border-emerald-200 self-start sm:self-auto">
              {parsedItems.length} {parsedItems.length === 1 ? 'item' : 'items'} detected
            </span>
          </div>

          <div className="space-y-4">
            {parsedItems.map((item, index) => {
              const allFoods = foodDbService.getAllFoods();
              const catalogFood = 
                foodDbService.getFoodById(item.foodItemId || '') ||
                allFoods.find(f => f.id === item.foodItemId) ||
                allFoods.find(f => f.nameEn.toLowerCase() === item.foodName.toLowerCase()) ||
                allFoods.find(f => item.foodName.toLowerCase().includes(f.nameEn.toLowerCase())) ||
                allFoods[0];

              const calculatedNutrients = scaleNutrients(catalogFood.per100g, item.quantityGrams);

              return (
                <div key={index} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-stone-900 text-sm">
                          {catalogFood.nameEn}
                        </span>
                        <span className="font-bold text-emerald-700 text-sm">
                          ({catalogFood.nameBn})
                        </span>
                        <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-medium">
                          {catalogFood.category}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        Source: <span className="font-medium text-stone-700">{catalogFood.source}</span> • Preparation: <span className="font-medium text-stone-700 capitalize">{item.preparationState}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveParsedItem(index)}
                      className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.clarifyingQuestion && (
                    <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-900 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Note: {item.clarifyingQuestion}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">Portion Description</label>
                      <input
                        type="text"
                        value={item.portionDescription}
                        onChange={e => {
                          const updated = [...parsedItems];
                          updated[index].portionDescription = e.target.value;
                          setParsedItems(updated);
                        }}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">Quantity (grams)</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantityGrams}
                        onChange={e => handleUpdateItemGrams(index, parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-800 font-bold text-emerald-700"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="bg-white p-2 rounded-lg border border-stone-200 text-[11px] flex items-center justify-between">
                        <span className="text-stone-500 font-medium">Energy:</span>
                        <span className="font-bold text-stone-900">{calculatedNutrients.calories} kcal</span>
                      </div>
                    </div>
                  </div>

                  {/* Macro snapshot */}
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-stone-200/60 text-[10px]">
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium border border-emerald-100">
                      Protein: {calculatedNutrients.protein}g
                    </span>
                    <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-medium border border-amber-100">
                      Carbs: {calculatedNutrients.carbs}g
                    </span>
                    <span className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded font-medium border border-rose-100">
                      Fat: {calculatedNutrients.fat}g
                    </span>
                    <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-medium border border-blue-100">
                      Fibre: {calculatedNutrients.fibre}g
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-stone-100">
            <button
              onClick={handleConfirmAndSave}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Save to Daily Food Log</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
