import { FoodItem } from '../types';
import { BANGLADESH_FOOD_DATABASE } from '../data/bangladeshFoods';

/**
 * Verified Food Database Service managing authentic Bangladeshi and USDA food catalog entries.
 */
export class FoodDatabaseService {
  private items: FoodItem[] = [];

  constructor() {
    this.items = [...BANGLADESH_FOOD_DATABASE];
  }

  public getAllFoods(): FoodItem[] {
    return this.items;
  }

  public searchFoods(query: string, category?: string): FoodItem[] {
    const q = query.toLowerCase().trim();
    return this.items.filter(item => {
      const matchesCat = !category || category === 'All' || item.category === category;
      if (!matchesCat) return false;
      if (!q) return true;

      const matchesEn = item.nameEn.toLowerCase().includes(q);
      const matchesBn = item.nameBn.includes(q);
      const matchesBanglish = item.banglish.some(b => b.includes(q) || q.includes(b));
      const matchesCategory = item.category.toLowerCase().includes(q);

      return matchesEn || matchesBn || matchesBanglish || matchesCategory;
    });
  }

  public getFoodById(id: string): FoodItem | undefined {
    return this.items.find(item => item.id === id);
  }
}

export const foodDbService = new FoodDatabaseService();
