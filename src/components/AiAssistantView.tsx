import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BANGLADESH_FOOD_DATABASE } from '../data/bangladeshFoods';
import { scaleNutrients, getTodayDateString } from '../utils/calculations';
import { Sparkles, Send, Check, AlertCircle, Loader2, UtensilsCrossed, Plus, Trash2 } from 'lucide-react';

interface ParsedFoodItem {
  foodItemId: string | null;
  foodName: string;
  preparationState: 'raw' | 'cooked';
  quantityGrams: number;
  portionDescription: string;
  confidence: number;
  clarifyingQuestion: string | null;
}

export function AiAssistantView() {
  const { addFoodLog } = useApp();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedFoodItem[] | null>(null);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setParsedItems(null);

    try {
      const res = await fetch('/api/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to parse food description.');
      }

      setParsedItems(data.items);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'AI service unavailable or not configured. Please check GEMINI_API_KEY.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItemGrams = (index: number, newGrams: number) => {
    if (!parsedItems) return;
    const updated = [...parsedItems];
    updated[index].quantityGrams = newGrams;
    setParsedItems(updated);
  };

  const handleRemoveParsedItem = (index: number) => {
    if (!parsedItems) return;
    setParsedItems(parsedItems.filter((_, idx) => idx !== index));
  };

  const handleConfirmAndSave = () => {
    if (!parsedItems || parsedItems.length === 0) return;

    const today = getTodayDateString();

    parsedItems.forEach(item => {
      // Find food in database or use default scaling
      const catalogFood = BANGLADESH_FOOD_DATABASE.find(f => f.id === item.foodItemId) || BANGLADESH_FOOD_DATABASE[0];
      const nutrients = scaleNutrients(catalogFood.per100g, item.quantityGrams);

      addFoodLog({
        date: today,
        mealType,
        foodItemId: catalogFood.id,
        foodName: `${item.foodName} (AI Extracted)`,
        preparationState: item.preparationState,
        quantityGrams: item.quantityGrams,
        portionDescription: item.portionDescription,
        source: 'AI Assistant (FAO 2013 Matched)',
        nutrients,
      });
    });

    setSuccessMsg('Successfully confirmed and saved all AI parsed items to your Daily Food Log!');
    setParsedItems(null);
    setInputText('');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 border border-emerald-400/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Food Assistant 🇧🇩</h1>
            <p className="text-xs text-emerald-200">
              Speak or type in English, Bangla, or Banglish (e.g., "দুপুরে ২ কাপ ভাত আর রুই মাছ খেলাম").
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs">
          <span>{successMsg}</span>
          <Check className="w-4 h-4 text-emerald-700" />
        </div>
      )}

      {errorMsg && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl text-xs font-medium flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">AI Notice</div>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Input Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <form onSubmit={handleParse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Describe what you ate (English, Bangla, or Banglish)
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="e.g. 2 rotis with dal and 1 boiled egg for breakfast..."
              className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Target Meal Type</label>
              <select
                value={mealType}
                onChange={e => setMealType(e.target.value as any)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none"
              >
                <option value="breakfast">Breakfast (সকালের নাস্তা)</option>
                <option value="lunch">Lunch (দুপুরের খাবার)</option>
                <option value="dinner">Dinner (রাতের খাবার)</option>
                <option value="snack">Snack (বিকাশের নাস্তা)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Parsing Food & Matching FAO 2013...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Parse with AI</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Editable Confirmation Screen */}
      {parsedItems && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Review & Confirm AI Extracted Foods</h3>
              <p className="text-xs text-stone-500">Verify quantities and portions before saving to your verified log.</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold border border-emerald-200">
              {parsedItems.length} items detected
            </span>
          </div>

          <div className="space-y-4">
            {parsedItems.map((item, index) => {
              const catalogFood = BANGLADESH_FOOD_DATABASE.find(f => f.id === item.foodItemId) || BANGLADESH_FOOD_DATABASE[0];
              const calculatedNutrients = scaleNutrients(catalogFood.per100g, item.quantityGrams);

              return (
                <div key={index} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-stone-900 text-sm">{item.foodName}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                          Confidence: {Math.round(item.confidence * 100)}%
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        Matched Catalog: <span className="font-medium text-stone-700">{catalogFood.nameEn} ({catalogFood.source})</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveParsedItem(index)}
                      className="text-stone-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.clarifyingQuestion && (
                    <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-900 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Clarification: {item.clarifyingQuestion}</span>
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
                        value={item.quantityGrams}
                        onChange={e => handleUpdateItemGrams(index, parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-800 font-bold text-emerald-700"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="bg-white p-2 rounded-lg border border-stone-200 text-[11px] flex justify-between">
                        <span className="text-stone-500">Calories:</span>
                        <span className="font-bold text-stone-900">{calculatedNutrients.calories} kcal</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-stone-100">
            <button
              onClick={handleConfirmAndSave}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Save to Daily Log</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
