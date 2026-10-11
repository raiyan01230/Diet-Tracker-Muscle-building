import { NutrientValues, FoodLogItem } from '../types';

export function scaleNutrients(per100g: NutrientValues, grams: number): NutrientValues {
  const factor = grams / 100;
  return {
    calories: Math.round(per100g.calories * factor * 10) / 10,
    protein: Math.round(per100g.protein * factor * 10) / 10,
    carbs: Math.round(per100g.carbs * factor * 10) / 10,
    fat: Math.round(per100g.fat * factor * 10) / 10,
    fibre: Math.round(per100g.fibre * factor * 10) / 10,
    vitamins: {
      a: Math.round(per100g.vitamins.a * factor * 10) / 10,
      c: Math.round(per100g.vitamins.c * factor * 10) / 10,
      d: Math.round(per100g.vitamins.d * factor * 10) / 10,
      e: Math.round(per100g.vitamins.e * factor * 10) / 10,
      k: Math.round(per100g.vitamins.k * factor * 10) / 10,
      b1: Math.round(per100g.vitamins.b1 * factor * 100) / 100,
      b2: Math.round(per100g.vitamins.b2 * factor * 100) / 100,
      b3: Math.round(per100g.vitamins.b3 * factor * 10) / 10,
      b5: Math.round(per100g.vitamins.b5 * factor * 10) / 10,
      b6: Math.round(per100g.vitamins.b6 * factor * 100) / 100,
      b7: Math.round(per100g.vitamins.b7 * factor * 10) / 10,
      b9: Math.round(per100g.vitamins.b9 * factor * 10) / 10,
      b12: Math.round(per100g.vitamins.b12 * factor * 100) / 100,
      choline: Math.round(per100g.vitamins.choline * factor * 10) / 10,
    },
    minerals: {
      calcium: Math.round(per100g.minerals.calcium * factor * 10) / 10,
      iron: Math.round(per100g.minerals.iron * factor * 100) / 100,
      zinc: Math.round(per100g.minerals.zinc * factor * 100) / 100,
      magnesium: Math.round(per100g.minerals.magnesium * factor * 10) / 10,
      phosphorus: Math.round(per100g.minerals.phosphorus * factor * 10) / 10,
      iodine: Math.round(per100g.minerals.iodine * factor * 10) / 10,
      selenium: Math.round(per100g.minerals.selenium * factor * 10) / 10,
      copper: Math.round(per100g.minerals.copper * factor * 100) / 100,
      potassium: Math.round(per100g.minerals.potassium * factor * 10) / 10,
      sodium: Math.round(per100g.minerals.sodium * factor * 10) / 10,
      manganese: Math.round(per100g.minerals.manganese * factor * 100) / 100,
      chromium: Math.round(per100g.minerals.chromium * factor * 10) / 10,
      molybdenum: Math.round(per100g.minerals.molybdenum * factor * 10) / 10,
    },
  };
}

export function sumNutrients(items: FoodLogItem[]): NutrientValues {
  const empty: NutrientValues = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fibre: 0,
    vitamins: {
      a: 0, c: 0, d: 0, e: 0, k: 0,
      b1: 0, b2: 0, b3: 0, b5: 0, b6: 0, b7: 0, b9: 0, b12: 0, choline: 0
    },
    minerals: {
      calcium: 0, iron: 0, zinc: 0, magnesium: 0, phosphorus: 0,
      iodine: 0, selenium: 0, copper: 0, potassium: 0, sodium: 0,
      manganese: 0, chromium: 0, molybdenum: 0
    }
  };

  return items.reduce((acc, curr) => {
    const n = curr.nutrients;
    acc.calories += n.calories;
    acc.protein += n.protein;
    acc.carbs += n.carbs;
    acc.fat += n.fat;
    acc.fibre += n.fibre;

    // vitamins
    (Object.keys(acc.vitamins) as (keyof typeof acc.vitamins)[]).forEach(k => {
      acc.vitamins[k] += n.vitamins[k] || 0;
    });

    // minerals
    (Object.keys(acc.minerals) as (keyof typeof acc.minerals)[]).forEach(k => {
      acc.minerals[k] += n.minerals[k] || 0;
    });

    return acc;
  }, empty);
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
