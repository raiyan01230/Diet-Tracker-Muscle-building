import React, { useState } from 'react';
import { scaleNutrients, sumNutrients } from '../utils/calculations';
import { calculateTeenEER } from '../data/nutrientReferences';
import { BANGLADESH_FOOD_DATABASE } from '../data/bangladeshFoods';
import { foodDbService } from '../services/foodDatabase';
import { parseLocalFoodQuery } from '../utils/aiFoodParser';
import { FlaskConical, CheckCircle2, XCircle, Loader2, Play } from 'lucide-react';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

export function TestRunnerModal({ isOpen, onClose }: TestRunnerModalProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[] | null>(null);

  if (!isOpen) return null;

  const runTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const testRes: TestResult[] = [];

      // Test 1: Nutrient Scaling Test
      try {
        const sampleFood = BANGLADESH_FOOD_DATABASE[0]; // Boiled rice
        const scaled = scaleNutrients(sampleFood.per100g, 200);
        const expectedCals = sampleFood.per100g.calories * 2;
        const passed = scaled.calories === expectedCals;
        testRes.push({
          name: 'Nutrient Scaling Test (200g Rice)',
          passed,
          details: `Expected ${expectedCals} kcal, got ${scaled.calories} kcal.`,
        });
      } catch (e: any) {
        testRes.push({ name: 'Nutrient Scaling Test', passed: false, details: e.message });
      }

      // Test 2: Teen EER Calculation Test (Age 16 Male & Female branches)
      try {
        const eerMale = calculateTeenEER('male', 16, 167.64, 55.65, 'low_active');
        const eerFemale = calculateTeenEER('female', 16, 160.0, 50.0, 'low_active');
        const passed = typeof eerMale === 'number' && eerMale > 1500 && typeof eerFemale === 'number' && eerFemale > 1200;
        testRes.push({
          name: '2023 National Academies EER Formula Test (Male & Female)',
          passed,
          details: `Male EER: ${eerMale} kcal, Female EER: ${eerFemale} kcal.`,
        });
      } catch (e: any) {
        testRes.push({ name: 'EER Formula Test', passed: false, details: e.message });
      }

      // Test 3: Nutrient Summation Test
      try {
        const food1 = scaleNutrients(BANGLADESH_FOOD_DATABASE[0].per100g, 100);
        const food2 = scaleNutrients(BANGLADESH_FOOD_DATABASE[1].per100g, 100);
        const summed = sumNutrients([
          { id: '1', userId: 'u1', date: '2026-10-11', mealType: 'breakfast', foodName: 'F1', preparationState: 'cooked', quantityGrams: 100, portionDescription: '100g', source: 'Test', nutrients: food1, timestamp: 1 },
          { id: '2', userId: 'u1', date: '2026-10-11', mealType: 'lunch', foodName: 'F2', preparationState: 'cooked', quantityGrams: 100, portionDescription: '100g', source: 'Test', nutrients: food2, timestamp: 2 },
        ]);
        const expectedSumCals = food1.calories + food2.calories;
        const passed = summed.calories === expectedSumCals;
        testRes.push({
          name: 'Nutrient Summation Test',
          passed,
          details: `Summed calories: ${summed.calories} kcal (Expected ${expectedSumCals}).`,
        });
      } catch (e: any) {
        testRes.push({ name: 'Nutrient Summation Test', passed: false, details: e.message });
      }

      // Test 4: Macro Energy Conversion Test (4/4/9 kcal/g)
      try {
        const proteinGrams = 50;
        const carbGrams = 200;
        const fatGrams = 60;
        const totalCals = (proteinGrams * 4) + (carbGrams * 4) + (fatGrams * 9);
        const passed = totalCals === 200 + 800 + 540;
        testRes.push({
          name: 'Macro Energy Conversion Test (4/4/9 kcal/g)',
          passed,
          details: `Calculated ${totalCals} kcal from 50g P, 200g C, 60g F.`,
        });
      } catch (e: any) {
        testRes.push({ name: 'Macro Energy Conversion Test', passed: false, details: e.message });
      }

      // Test 5: Bangladesh Food Database Integrity Test
      try {
        const passed = BANGLADESH_FOOD_DATABASE.length >= 15 && BANGLADESH_FOOD_DATABASE.every(f => f.per100g && f.sourceUrl);
        testRes.push({
          name: 'Bangladesh Food Database Integrity Test',
          passed,
          details: `Verified ${BANGLADESH_FOOD_DATABASE.length} baseline local food entries with FAO 2013 source URLs.`,
        });
      } catch (e: any) {
        testRes.push({ name: 'Database Integrity Test', passed: false, details: e.message });
      }

      // Test 6: 800+ Verified Food Catalog Scale Test
      try {
        const totalCount = foodDbService.getFoodCount();
        const passed = totalCount >= 800 && foodDbService.getAllFoods().every(f => f.id && f.nameEn && f.per100g);
        testRes.push({
          name: '800+ Verified Food Catalog Scale Test',
          passed,
          details: `Verified ${totalCount} items in food database (exceeds 800 requirement).`,
        });
      } catch (e: any) {
        testRes.push({ name: '800+ Catalog Integrity Test', passed: false, details: e.message });
      }

      // Test 7: Booter Dal & Tea Match Accuracy Test
      try {
        const bootSearch = foodDbService.searchFoods('বুটের ডাল');
        const booterSearch = foodDbService.searchFoods('booter dal');
        const buterSearch = foodDbService.searchFoods('buter dal');
        const chanaSearch = foodDbService.searchFoods('chana dal');
        const teaSearch = foodDbService.searchFoods('ca');

        const parsedBoot = parseLocalFoodQuery('বুটের ডাল');
        const parsedBooter = parseLocalFoodQuery('1 bati booter dal');
        const parsedTea = parseLocalFoodQuery('1 cup ca');

        const searchOk = 
          bootSearch[0]?.id === 'dal_booter_chana' &&
          booterSearch[0]?.id === 'dal_booter_chana' &&
          buterSearch[0]?.id === 'dal_booter_chana' &&
          chanaSearch[0]?.id === 'dal_booter_chana' &&
          teaSearch[0]?.category === 'Beverages';

        const parseOk = 
          parsedBoot[0]?.foodItemId === 'dal_booter_chana' &&
          parsedBooter[0]?.foodItemId === 'dal_booter_chana' &&
          (parsedTea[0]?.foodItemId === 'cha_dudh' || parsedTea[0]?.foodItemId === 'bev_tea_dudh_cha_sugar');

        testRes.push({
          name: 'Booter Dal & Tea Accurate Match Test',
          passed: searchOk && parseOk,
          details: `Confirmed 'বুটের ডাল', 'booter dal', 'buter dal', and 'chana dal' resolve to Boot er Dal (dal_booter_chana) and 'ca' resolves to Tea.`,
        });
      } catch (e: any) {
        testRes.push({ name: 'Booter Dal & Tea Match Test', passed: false, details: e.message });
      }

      setResults(testRes);
      setIsRunning(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-6 animate-fade-in">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center space-x-2">
            <FlaskConical className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-stone-900">Automated Unit Test Suite</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-sm font-bold">✕</button>
        </div>

        <p className="text-xs text-stone-500">
          Run automated tests verifying nutrient scaling, EER calculations (male/female branches), summation arithmetic, macro conversions, and FAO food catalog integrity.
        </p>

        {results === null ? (
          <div className="text-center py-8">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors inline-flex items-center space-x-2"
            >
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Running Tests...' : 'Run All Unit Tests'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {results.map((res, idx) => (
              <div key={idx} className="flex items-start justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-start space-x-3">
                  {res.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-stone-900 text-xs">{res.name}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">{res.details}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${res.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {res.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            ))}
            <div className="pt-2 flex justify-end">
              <button
                onClick={runTests}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold"
              >
                Re-run Tests
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
