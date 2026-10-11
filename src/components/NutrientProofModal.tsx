import React from 'react';
import { FoodLogItem } from '../types';
import { ShieldCheck, Info, X } from 'lucide-react';

interface NutrientProofModalProps {
  logItem: FoodLogItem | null;
  onClose: () => void;
}

export function NutrientProofModal({ logItem, onClose }: NutrientProofModalProps) {
  if (!logItem) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-6 animate-fade-in">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-stone-900">Traceable Food-to-Nutrient Proof</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-sm font-bold">✕</button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
            <div className="font-bold text-stone-900 text-sm">{logItem.foodName}</div>
            <div className="grid grid-cols-2 gap-2 text-stone-600">
              <div>Meal Type: <strong className="text-stone-900 uppercase">{logItem.mealType}</strong></div>
              <div>Date Logged: <strong className="text-stone-900">{logItem.date}</strong></div>
              <div>Preparation State: <strong className="text-stone-900 uppercase">{logItem.preparationState}</strong></div>
              <div>Gram Weight: <strong className="text-stone-900">{logItem.quantityGrams} g</strong></div>
            </div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2 text-emerald-900">
            <div className="font-bold flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>Source Provenance & Scaling Formula</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              Dataset Source: <strong>{logItem.source}</strong>. All calculations use deterministic application scaling: `(per_100g_value / 100) * quantity_grams`.
            </p>
          </div>

          <div className="space-y-1 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="font-bold text-stone-800 mb-1">Calculated Contribution:</div>
            <div className="flex justify-between"><span>Calories:</span> <strong>{logItem.nutrients.calories} kcal</strong></div>
            <div className="flex justify-between"><span>Protein:</span> <strong>{logItem.nutrients.protein} g</strong></div>
            <div className="flex justify-between"><span>Carbohydrates:</span> <strong>{logItem.nutrients.carbs} g</strong></div>
            <div className="flex justify-between"><span>Fat:</span> <strong>{logItem.nutrients.fat} g</strong></div>
            <div className="flex justify-between"><span>Fibre:</span> <strong>{logItem.nutrients.fibre} g</strong></div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-stone-100">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
          >
            Close Proof View
          </button>
        </div>
      </div>
    </div>
  );
}
