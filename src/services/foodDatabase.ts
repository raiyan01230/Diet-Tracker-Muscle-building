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

  private matchesCategoryFilter(item: FoodItem, category: string): boolean {
    if (category === 'Special Foods & Eating Out') {
      return (
        item.category === 'Special Foods & Eating Out' ||
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
        item.nameEn.toLowerCase().includes('chocolate')
      );
    }
    return item.category === category;
  }

  public searchFoods(query: string, category?: string): FoodItem[] {
    const q = query.toLowerCase().trim();
    if (!q) {
      if (!category || category === 'All') return this.items;
      return this.items.filter(item => this.matchesCategoryFilter(item, category));
    }

    const qTokens = q.split(/\s+/).filter(t => t.length > 0);
    const scored: { item: FoodItem; score: number }[] = [];

    for (const item of this.items) {
      if (category && category !== 'All' && !this.matchesCategoryFilter(item, category)) {
        continue;
      }

      let score = 0;
      const id = item.id.toLowerCase();
      const nameEn = item.nameEn.toLowerCase();
      const nameBn = item.nameBn;
      const banglishList = item.banglish.map(b => b.toLowerCase());

      // 1. Exact match on Bengali name, English name, id, or banglish alias
      if (nameBn === q || nameEn === q || id === q || banglishList.includes(q)) {
        score += 1000;
      }

      // 2. Starts with query
      if (nameEn.startsWith(q) || nameBn.startsWith(q) || banglishList.some(b => b.startsWith(q))) {
        score += 500;
      }

      // 3. Exact phrase contained in English or Bangla name
      if (nameEn.includes(q) || nameBn.includes(q)) {
        score += 300;
      }

      // 4. Banglish alias match (careful with short words like cha/tea/ca):
      for (const b of banglishList) {
        if (b === q) {
          score += 400;
        } else if (b.includes(q)) {
          // Query is a substring of the alias (e.g. q="booter", b="booter dal")
          score += 200;
        } else if (b.length >= 4 && q.includes(b)) {
          // Alias is a substring of query (e.g. q="1 bowl booter dal", b="booter dal")
          // Strictly length >= 4 to avoid 2-3 char collisions!
          score += 150;
        } else if (b.length < 4) {
          // Short alias (e.g. "cha", "tea", "ca"): match ONLY if full token in query!
          if (qTokens.includes(b)) {
            score += 250;
          }
        }
      }

      // 5. Token-level matching
      let matchedTokens = 0;
      for (const token of qTokens) {
        if (token.length < 2) continue;
        let tokenMatched = false;
        if (nameEn.includes(token) || nameBn.includes(token) || id.includes(token)) {
          tokenMatched = true;
        } else if (banglishList.some(b => b.includes(token))) {
          tokenMatched = true;
        }
        if (tokenMatched) {
          matchedTokens++;
          score += 50;
        }
      }

      if (qTokens.length > 1 && matchedTokens === qTokens.length) {
        score += 200;
      }

      // 6. Intent priority boosts:
      // Booter Dal / Chana Dal / Cholar Dal:
      if (
        /\b(booter|buter|boot\s*er|boot|bute|cholar|chana)\b/i.test(q) &&
        (id.includes('booter') || id === 'dal_booter_chana' || id.includes('cholar_dal'))
      ) {
        score += 350;
      }

      // Tea (Cha / Dudh Cha):
      if (
        /\b(cha|tea|ca)\b/i.test(q) &&
        (id.includes('tea') || id === 'cha_dudh')
      ) {
        // Do not boost tea if the user query is about chana, chola, chocolate, etc.!
        if (!/\b(chana|chola|cholar|chocolate|chips)\b/i.test(q)) {
          score += 350;
        }
      }

      if (score > 0) {
        scored.push({ item, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.item);
  }

  public getFoodById(id: string): FoodItem | undefined {
    return this.items.find(item => item.id === id);
  }

  public getFoodCount(): number {
    return this.items.length;
  }
}

export const foodDbService = new FoodDatabaseService();

