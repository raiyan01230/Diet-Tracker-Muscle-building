import { NutrientReference, ReferenceSex, ActivityLevel } from '../types';

export const NUTRIENT_REFERENCES_TEEN_14_18: Record<ReferenceSex, NutrientReference> = {
  male: {
    ageRange: '14-18 years',
    sex: 'male',
    rdas: {
      protein: 52, // g/day
      carbs: 130, // g/day min carbohydrate
      fibre: 31, // g/day AI
      vitamins: {
        a: { amount: 900, unit: 'mcg RAE', type: 'RDA' },
        c: { amount: 75, unit: 'mg', type: 'RDA' },
        d: { amount: 15, unit: 'mcg (600 IU)', type: 'RDA' },
        e: { amount: 15, unit: 'mg', type: 'RDA' },
        k: { amount: 75, unit: 'mcg', type: 'AI' },
        b1: { amount: 1.2, unit: 'mg', type: 'RDA' },
        b2: { amount: 1.3, unit: 'mg', type: 'RDA' },
        b3: { amount: 16, unit: 'mg NE', type: 'RDA' },
        b5: { amount: 5, unit: 'mg', type: 'AI' },
        b6: { amount: 1.3, unit: 'mg', type: 'RDA' },
        b7: { amount: 25, unit: 'mcg', type: 'AI' },
        b9: { amount: 400, unit: 'mcg DFE', type: 'RDA' },
        b12: { amount: 2.4, unit: 'mcg', type: 'RDA' },
        choline: { amount: 550, unit: 'mg', type: 'AI' },
      },
      minerals: {
        calcium: { amount: 1300, unit: 'mg', type: 'RDA' },
        iron: { amount: 11, unit: 'mg', type: 'RDA' },
        zinc: { amount: 11, unit: 'mg', type: 'RDA' },
        magnesium: { amount: 410, unit: 'mg', type: 'RDA' },
        phosphorus: { amount: 1250, unit: 'mg', type: 'RDA' },
        iodine: { amount: 150, unit: 'mcg', type: 'RDA' },
        selenium: { amount: 55, unit: 'mcg', type: 'RDA' },
        copper: { amount: 890, unit: 'mcg', type: 'RDA' },
        potassium: { amount: 3000, unit: 'mg', type: 'AI' },
        sodium: { amount: 1500, unit: 'mg', type: 'AI' },
        manganese: { amount: 2.2, unit: 'mg', type: 'AI' },
        chromium: { amount: 35, unit: 'mcg', type: 'AI' },
        molybdenum: { amount: 43, unit: 'mcg', type: 'RDA' },
      },
    },
    upperLimits: {
      vitamins: {
        a: { amount: 2800, unit: 'mcg RAE' },
        c: { amount: 1800, unit: 'mg' },
        d: { amount: 100, unit: 'mcg (4000 IU)' },
        e: { amount: 800, unit: 'mg' },
        b6: { amount: 80, unit: 'mg' },
        b9: { amount: 1000, unit: 'mcg' },
        b12: { amount: 0, unit: 'Not established' },
        choline: { amount: 3500, unit: 'mg' },
      },
      minerals: {
        calcium: { amount: 3000, unit: 'mg' },
        iron: { amount: 40, unit: 'mg' },
        zinc: { amount: 34, unit: 'mg' },
        magnesium: { amount: 700, unit: 'mg (from supplements)' },
        phosphorus: { amount: 4000, unit: 'mg' },
        iodine: { amount: 900, unit: 'mcg' },
        selenium: { amount: 400, unit: 'mcg' },
        copper: { amount: 8000, unit: 'mcg' },
        sodium: { amount: 2300, unit: 'mg' },
        manganese: { amount: 9, unit: 'mg' },
        molybdenum: { amount: 1100, unit: 'mcg' },
      },
    },
  },
  female: {
    ageRange: '14-18 years',
    sex: 'female',
    rdas: {
      protein: 46, // g/day
      carbs: 130, // g/day min carbohydrate
      fibre: 26, // g/day AI
      vitamins: {
        a: { amount: 700, unit: 'mcg RAE', type: 'RDA' },
        c: { amount: 65, unit: 'mg', type: 'RDA' },
        d: { amount: 15, unit: 'mcg (600 IU)', type: 'RDA' },
        e: { amount: 15, unit: 'mg', type: 'RDA' },
        k: { amount: 75, unit: 'mcg', type: 'AI' },
        b1: { amount: 1.0, unit: 'mg', type: 'RDA' },
        b2: { amount: 1.0, unit: 'mg', type: 'RDA' },
        b3: { amount: 14, unit: 'mg NE', type: 'RDA' },
        b5: { amount: 5, unit: 'mg', type: 'AI' },
        b6: { amount: 1.2, unit: 'mg', type: 'RDA' },
        b7: { amount: 20, unit: 'mcg', type: 'AI' },
        b9: { amount: 400, unit: 'mcg DFE', type: 'RDA' },
        b12: { amount: 2.4, unit: 'mcg', type: 'RDA' },
        choline: { amount: 400, unit: 'mg', type: 'AI' },
      },
      minerals: {
        calcium: { amount: 1300, unit: 'mg', type: 'RDA' },
        iron: { amount: 15, unit: 'mg', type: 'RDA' },
        zinc: { amount: 9, unit: 'mg', type: 'RDA' },
        magnesium: { amount: 360, unit: 'mg', type: 'RDA' },
        phosphorus: { amount: 1250, unit: 'mg', type: 'RDA' },
        iodine: { amount: 150, unit: 'mcg', type: 'RDA' },
        selenium: { amount: 55, unit: 'mcg', type: 'RDA' },
        copper: { amount: 890, unit: 'mcg', type: 'RDA' },
        potassium: { amount: 2600, unit: 'mg', type: 'AI' },
        sodium: { amount: 1500, unit: 'mg', type: 'AI' },
        manganese: { amount: 1.6, unit: 'mg', type: 'AI' },
        chromium: { amount: 24, unit: 'mcg', type: 'AI' },
        molybdenum: { amount: 43, unit: 'mcg', type: 'RDA' },
      },
    },
    upperLimits: {
      vitamins: {
        a: { amount: 2800, unit: 'mcg RAE' },
        c: { amount: 1800, unit: 'mg' },
        d: { amount: 100, unit: 'mcg (4000 IU)' },
        e: { amount: 800, unit: 'mg' },
        b6: { amount: 80, unit: 'mg' },
        b9: { amount: 1000, unit: 'mcg' },
        b12: { amount: 0, unit: 'Not established' },
        choline: { amount: 3500, unit: 'mg' },
      },
      minerals: {
        calcium: { amount: 3000, unit: 'mg' },
        iron: { amount: 40, unit: 'mg' },
        zinc: { amount: 34, unit: 'mg' },
        magnesium: { amount: 700, unit: 'mg (from supplements)' },
        phosphorus: { amount: 4000, unit: 'mg' },
        iodine: { amount: 900, unit: 'mcg' },
        selenium: { amount: 400, unit: 'mcg' },
        copper: { amount: 8000, unit: 'mcg' },
        sodium: { amount: 2300, unit: 'mg' },
        manganese: { amount: 9, unit: 'mg' },
        molybdenum: { amount: 1100, unit: 'mcg' },
      },
    },
  },
};

/**
 * Calculates Estimated Energy Requirement (EER) for ages 14–18 using 2023 National Academies equations.
 * Parameters:
 * - sex: 'male' | 'female'
 * - age: years (e.g. 16)
 * - heightCm: height in cm
 * - weightKg: weight in kg
 * - activityLevel: 'inactive' | 'low_active' | 'active' | 'very_active'
 */
export function calculateTeenEER(
  sex: ReferenceSex,
  age: number,
  heightCm: number,
  weightKg: number,
  activityLevel: ActivityLevel
): number {
  if (sex === 'male') {
    switch (activityLevel) {
      case 'inactive':
        return Math.round(-447.51 + 3.68 * age + 13.01 * heightCm + 13.15 * weightKg + 20);
      case 'low_active':
        return Math.round(19.12 + 3.68 * age + 8.62 * heightCm + 20.28 * weightKg + 20);
      case 'active':
        return Math.round(-388.19 + 3.68 * age + 12.66 * heightCm + 20.46 * weightKg + 20);
      case 'very_active':
        return Math.round(-671.75 + 3.68 * age + 15.38 * heightCm + 23.25 * weightKg + 20);
      default:
        return Math.round(-388.19 + 3.68 * age + 12.66 * heightCm + 20.46 * weightKg + 20);
    }
  } else {
    switch (activityLevel) {
      case 'inactive':
        return Math.round(55.59 - 22.25 * age + 8.43 * heightCm + 17.07 * weightKg + 20);
      case 'low_active':
        return Math.round(-297.54 - 22.25 * age + 12.77 * heightCm + 14.73 * weightKg + 20);
      case 'active':
        return Math.round(-189.55 - 22.25 * age + 11.74 * heightCm + 18.34 * weightKg + 20);
      case 'very_active':
        return Math.round(-709.59 - 22.25 * age + 18.22 * heightCm + 14.25 * weightKg + 20);
      default:
        return Math.round(-189.55 - 22.25 * age + 11.74 * heightCm + 18.34 * weightKg + 20);
    }
  }
}
