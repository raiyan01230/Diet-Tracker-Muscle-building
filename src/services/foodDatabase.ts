import { FoodItem } from '../types';
import { BANGLADESH_FOOD_DATABASE } from '../data/bangladeshFoods';
import { EXPANDED_FOOD_CATALOG } from '../data/expandedFoodCatalog';

// Build unified 800+ verified food catalog
const foodMap = new Map<string, FoodItem>();
// Insert expanded catalog first, then baseline database
EXPANDED_FOOD_CATALOG.forEach(f => foodMap.set(f.id, f));
BANGLADESH_FOOD_DATABASE.forEach(f => foodMap.set(f.id, f));

export const INITIAL_800_FOOD_CATALOG: FoodItem[] = Array.from(foodMap.values());

/**
 * Verified Food Database Service managing 800+ authentic Bangladeshi, snacks, 
 * restaurant items, and USDA food catalog entries.
 */
export class FoodDatabaseService {
  private items: FoodItem[] = [];

  constructor() {
    this.items = [...INITIAL_800_FOOD_CATALOG];
  }

  public getAllFoods(): FoodItem[] {
    return this.items;
  }

  public searchFoods(query: string, category?: string): FoodItem[] {
    const q = query.toLowerCase().trim();
    return this.items.filter(item => {
      // Category filter handling
      if (category && category !== 'All') {
        if (category === 'Special Foods & Eating Out') {
          const isSpecial = 
            item.category === 'Prepared & Snacks' ||
            item.category === 'Beverages' ||
            item.nameEn.toLowerCase().includes('roast') ||
            item.nameEn.toLowerCase().includes('biryani') ||
            item.nameEn.toLowerCase().includes('tehari') ||
            item.nameEn.toLowerCase().includes('pizza') ||
            item.nameEn.toLowerCase().includes('burger') ||
            item.nameEn.toLowerCase().includes('curry') ||
            item.nameEn.toLowerCase().includes('bhuna') ||
            item.nameEn.toLowerCase().includes('jhol') ||
            item.nameEn.toLowerCase().includes('chips') ||
            item.nameEn.toLowerCase().includes('chocolate');
          if (!isSpecial) return false;
        } else if (item.category !== category) {
          return false;
        }
      }

      if (!q) return true;

      const matchesEn = item.nameEn.toLowerCase().includes(q);
      const matchesBn = item.nameBn.includes(q);
      const matchesBanglish = item.banglish.some(b => b.toLowerCase().includes(q) || q.includes(b.toLowerCase()));
      const matchesCategory = item.category.toLowerCase().includes(q);
      const matchesId = item.id.toLowerCase().includes(q);

      return matchesEn || matchesBn || matchesBanglish || matchesCategory || matchesId;
    });
  }

  public getFoodById(id: string): FoodItem | undefined {
    return this.items.find(item => item.id === id);
  }

  public getFoodCount(): number {
    return this.items.length;
  }
}

export const foodDbService = new FoodDatabaseService();

