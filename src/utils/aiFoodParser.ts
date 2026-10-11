import { foodDbService } from '../services/foodDatabase';
import { FoodItem } from '../types';

export interface ParsedFoodItem {
  foodItemId: string;
  foodName: string;
  foodNameBn: string;
  preparationState: 'raw' | 'cooked';
  quantityGrams: number;
  portionDescription: string;
  confidence: number;
  clarifyingQuestion: string | null;
  matchedFood: FoodItem;
}

/**
 * High-speed deterministic NLP parser for Bangladeshi everyday meals, snacks, drinks & restaurant foods.
 * Powered by verified 800+ food database.
 * Instantly parses English, Bangla, Banglish queries like:
 * - "chips" or "1 packet potato chips"
 * - "collate" or "chocolate" or "cadbury"
 * - "chips collate" (both chips and chocolate!)
 * - "2 ta ruti ar dal"
 * - "1 plate bhaat ar murgir jhol"
 * - "1 cup dudh cha"
 * - "2 dim sheddho"
 * - "1 bottle mojo"
 */
export function parseLocalFoodQuery(text: string): ParsedFoodItem[] {
  if (!text || !text.trim()) return [];

  const allFoods = foodDbService.getAllFoods();
  const normalized = text.toLowerCase().trim();

  // Pre-process user query to strip conversational filler and instructions
  // e.g. "বুটের ডাল im trying to add this becude ate this but this everytime i ate ca or tea something fix that" -> "বুটের ডাল"
  let preprocessed = normalized
    .replace(/\b(i'?m|i am)\s+(trying|wanting)\s+to\s+(add|log|record)\s+(this|it)\b/gi, '')
    .replace(/\b(becude|because|cause|cos)\s+(i\s+)?(ate|had|consumed)\s+(this|it)\b/gi, '')
    .replace(/\b(but\s+this\s+everytime\s+.*|fix\s+that.*|please\s+fix.*)\b/gi, '')
    .trim();

  const queryToParse = preprocessed.length > 0 ? preprocessed : normalized;

  // Split clauses by conjunctions, commas, pluses, newlines, and spaces when multiple distinct keywords are present
  // Also split if words like "chips collate" are typed together
  let rawClauses = queryToParse
    .split(/[,+&;\n]|\bar\b|\bebong\b|\bo\b|\bwith\b|\bdiye\b|\bsathe\b|\band\b/)
    .map(c => c.trim())
    .filter(c => c.length > 0);

  // If a clause contains both known snacks/foods (e.g. "chips collate"), sub-split it
  const clauses: string[] = [];
  for (const clause of rawClauses) {
    if (/\bchips\b/.test(clause) && /\b(collate|chocolate|choclat|cadbury)\b/.test(clause)) {
      clauses.push(clause.replace(/\b(collate|chocolate|choclat|cadbury).*/, '').trim());
      const secondPart = clause.match(/\b(collate|chocolate|choclat|cadbury).*$/);
      if (secondPart) clauses.push(secondPart[0].trim());
    } else {
      clauses.push(clause);
    }
  }

  const results: ParsedFoodItem[] = [];

  for (const clause of clauses) {
    if (!clause) continue;

    // 1. Extract quantity and unit
    let multiplier = 1;
    let explicitGrams: number | null = null;
    let unitLabel = 'portion';

    // Check for explicit grams e.g. "100g", "50 g", "250 ml", "250ml"
    const gramMatch = clause.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|gram|grams|ml|milli)/i);
    if (gramMatch) {
      explicitGrams = parseFloat(gramMatch[1]);
    }

    // Number extraction: digits or Bangla digits or words
    const digitMatch = clause.match(/(\d+(?:\.\d+)?)/);
    if (digitMatch && !explicitGrams) {
      multiplier = parseFloat(digitMatch[1]) || 1;
    } else if (/\b(half|adhe|aadha|অর্ধেক)\b/i.test(clause)) {
      multiplier = 0.5;
    } else if (/\b(one|ek|ekta|এক|একটি|একটা)\b/i.test(clause)) {
      multiplier = 1;
    } else if (/\b(two|dui|duita|দুই|দুটি|দুইটা)\b/i.test(clause)) {
      multiplier = 2;
    } else if (/\b(three|tin|tinta|তিন|তিনটি|তিনটা)\b/i.test(clause)) {
      multiplier = 3;
    } else if (/\b(four|char|charta|চার|চারটি|চারটা)\b/i.test(clause)) {
      multiplier = 4;
    } else if (/\b(five|paanch|panch|পাঁচ|পাঁচটি|পাঁচটা)\b/i.test(clause)) {
      multiplier = 5;
    } else if (/\b(ten|dosh|দশ|দশটি|দশটা)\b/i.test(clause)) {
      multiplier = 10;
    } else if (/\b(fifteen|ponero|পনের|পনেরো)\b/i.test(clause)) {
      multiplier = 15;
    } else if (/\b(twenty|bish|kuri|বিশ|কুড়ি)\b/i.test(clause)) {
      multiplier = 20;
    }

    // Unit detection
    if (/packet|pack|প্যাকেট/i.test(clause)) unitLabel = 'Packet';
    else if (/plate|প্লেট/i.test(clause)) unitLabel = 'Plate';
    else if (/bowl|বাটি/i.test(clause)) unitLabel = 'Bowl';
    else if (/cup|কাপ/i.test(clause)) unitLabel = 'Cup';
    else if (/handful|handfull|মুঠো/i.test(clause)) unitLabel = 'Handful';
    else if (/glass|গ্লাস/i.test(clause)) unitLabel = 'Glass';
    else if (/bottle|বোতল/i.test(clause)) unitLabel = 'Bottle';
    else if (/slice|স্লাইস/i.test(clause)) unitLabel = 'Slice';
    else if (/piece|pc|ta|টি|টা|পিস|দানা|kernel|nut/i.test(clause)) unitLabel = 'Piece';

    // 2. Search for best matching food in the 800+ catalog
    let bestFood: FoodItem | null = null;
    let bestScore = -1;

    // Clean quantity words and conversational phrasing
    const cleanWords = clause
      .replace(/(\d+(?:\.\d+)?)/g, '')
      .replace(/\b(ta|ti|g|gm|grams|ml|packet|pack|plate|bowl|cup|glass|bottle|slice|piece|pc|kheyechi|khelam|khabo|ate|had|eating|for|breakfast|lunch|dinner|snack|khawa|khabar|i ate|ate this|becude|because|everytime|something|fix that|trying to add|add this)\b/gi, '')
      .trim();

    for (const food of allFoods) {
      let score = 0;
      const searchTerms = [
        food.id.toLowerCase(),
        food.nameEn.toLowerCase(),
        food.nameBn,
        ...food.banglish.map(b => b.toLowerCase())
      ];

      // Exact keyword match
      if (cleanWords) {
        for (const term of searchTerms) {
          if (cleanWords === term) {
            score = Math.max(score, 150);
            break;
          }
          if (term.includes(cleanWords) || (cleanWords.length >= 4 && cleanWords.includes(term))) {
            const matchLen = Math.min(cleanWords.length, term.length);
            score = Math.max(score, 60 + matchLen);
          }
        }
      }

      // Unique token-level overlap
      const clauseTokens = cleanWords.split(/\s+/).filter(t => t.length >= 2);
      for (const token of clauseTokens) {
        if (searchTerms.some(term => term.includes(token))) {
          score += 25;
        }
      }

      // Priority aliases & phonetic variations for common user prompts:

      // 1. Booter Dal / Chana Dal / Cholar Dal / বুটের ডাল (High priority Bengali staple)
      if (
        /booter\s*dal|buter\s*dal|boot\s*er\s*dal|boot\s*dal|bute\s*dal|বুটের\s*ডাল|বুট\s*ডাল|cholar\s*dal|cholar\s*daal|chana\s*dal|chana\s*daal|bengal\s*gram/i.test(clause) &&
        (food.id.includes('booter') || food.id === 'dal_booter_chana' || food.id.includes('cholar_dal'))
      ) {
        score += 150;
      }

      // 2. Chips / Snacks
      if (/chips|crisps|lays|kurkure|potata/i.test(clause) && (food.id.includes('chips') || food.id.includes('crackers'))) {
        score += 90;
      }

      // 3. Chocolate
      if (/collate|chocolate|choclate|cadbury|kitkat|dairy milk/i.test(clause) && (food.id.includes('chocolate') || food.id.includes('kitkat') || food.id.includes('dairy_milk'))) {
        score += 90;
      }

      // 4. Rice (Bhaat)
      if (/bhaat|bhat|rice|চাল/i.test(clause) && (food.id.includes('bhaat') || food.id.includes('rice') || food.id === 'bhaat_cooked')) {
        score += 70;
      }

      // 5. Roti (Ruti)
      if (/ruti|roti|রুটি/i.test(clause) && (food.id.includes('roti') || food.id.includes('ruti'))) {
        score += 70;
      }

      // 6. Generic Dal (only if not already specialized)
      if (/\b(dal|daal|ডাল)\b/i.test(clause) && food.id.includes('dal')) {
        score += 50;
      }

      // 7. Egg (Dim)
      if (/dim|egg|ডিম/i.test(clause) && (food.id.includes('dim') || food.id.includes('egg'))) {
        score += 70;
      }

      // 8. Chicken (Murgi)
      if (/murgi|chicken|চিকেন/i.test(clause) && food.id.includes('chicken')) {
        score += 70;
      }

      // 9. Beef (Goru)
      if (/gorur|beef|গরুর/i.test(clause) && food.id.includes('beef')) {
        score += 70;
      }

      // 10. Tea (Cha / Ca / Tea / Dudh Cha)
      // Must use word boundaries so it NEVER matches chana, chola, chocolate, etc.!
      if (
        /\b(cha|tea|chai|ca|dudh\s*cha|dudh\s*ca|lal\s*cha|lal\s*ca)\b|চা/i.test(clause) &&
        !/\b(chana|chola|cholar|chocolate|chips)\b/i.test(clause) &&
        (food.id.startsWith('bev_tea') || food.id === 'cha_dudh' || food.id.includes('tea') || food.id.includes('chai'))
      ) {
        score += 120;
      }

      // 11. Soft Drinks / Mojo
      if (/mojo|cola|কোক/i.test(clause) && food.id.includes('mojo')) {
        score += 85;
      }
      if (/7up|seven up|sprite/i.test(clause) && (food.id.includes('7up') || food.id.includes('sprite'))) {
        score += 85;
      }

      if (score > bestScore) {
        bestScore = score;
        bestFood = food;
      }
    }

    if (bestFood && bestScore >= 20) {
      // Determine grams and portion description accurately
      let grams = 100;
      let portionDesc = '';

      const isNutOrSeed = 
        bestFood.category === 'Nuts & Seeds' ||
        bestFood.nameEn.toLowerCase().includes('nut') ||
        bestFood.nameEn.toLowerCase().includes('badam') ||
        bestFood.nameEn.toLowerCase().includes('almond') ||
        bestFood.nameEn.toLowerCase().includes('cashew') ||
        bestFood.nameEn.toLowerCase().includes('peanut');

      if (explicitGrams) {
        grams = explicitGrams;
        portionDesc = `${explicitGrams}g portion`;
      } else if (isNutOrSeed && !/handful|packet|bowl|cup|মুঠো|প্যাকেট|বাটি|কাপ/i.test(clause)) {
        // User asked for piece count of nuts, e.g. "10 kaju badam" or "15 kath badam" or "20 peanuts"
        const singleKernel = bestFood.standardPortions.find(p => p.grams <= 2.5);
        if (singleKernel) {
          grams = Math.round(singleKernel.grams * multiplier * 10) / 10;
          portionDesc = `${multiplier} ${multiplier === 1 ? 'Nut/Kernel' : 'Nuts/Kernels'} (${grams}g)`;
        } else {
          const standardPortion = bestFood.standardPortions[0];
          const baseGrams = standardPortion ? standardPortion.grams : 28;
          grams = Math.round(baseGrams * multiplier);
          portionDesc = `${multiplier} ${unitLabel} (${grams}g)`;
        }
      } else {
        let matchedPortion = bestFood.standardPortions[0];
        if (unitLabel === 'Handful') {
          const hp = bestFood.standardPortions.find(p => /handful|মুঠো/i.test(p.label));
          if (hp) matchedPortion = hp;
        } else if (unitLabel === 'Packet') {
          const pp = bestFood.standardPortions.find(p => /packet|pack|প্যাকেট/i.test(p.label));
          if (pp) matchedPortion = pp;
        }
        const baseGrams = matchedPortion ? matchedPortion.grams : 100;
        grams = Math.round(baseGrams * multiplier);
        portionDesc = `${multiplier} ${unitLabel} (${grams}g)`;
      }

      results.push({
        foodItemId: bestFood.id,
        foodName: `${bestFood.nameEn} (${bestFood.nameBn})`,
        foodNameBn: bestFood.nameBn,
        preparationState: bestFood.preparationState,
        quantityGrams: grams,
        portionDescription: portionDesc,
        confidence: Math.min(0.99, Math.max(0.75, bestScore / 120)),
        clarifyingQuestion: null,
        matchedFood: bestFood,
      });
    }
  }

  // Fallback whole-query search if no clauses matched
  if (results.length === 0 && text.trim().length > 1) {
    const q = text.toLowerCase().trim();
    const fallbackFood = allFoods.find(f => 
      f.nameEn.toLowerCase().includes(q) ||
      f.nameBn.includes(q) ||
      f.banglish.some(b => b.toLowerCase().includes(q) || q.includes(b.toLowerCase())) ||
      (q.includes('chips') && f.id.includes('chips')) ||
      (q.includes('collate') && f.id.includes('chocolate')) ||
      (q.includes('chocolate') && f.id.includes('chocolate'))
    );

    if (fallbackFood) {
      const portion = fallbackFood.standardPortions[0] || { label: '1 Serving (100g)', grams: 100 };
      results.push({
        foodItemId: fallbackFood.id,
        foodName: `${fallbackFood.nameEn} (${fallbackFood.nameBn})`,
        foodNameBn: fallbackFood.nameBn,
        preparationState: fallbackFood.preparationState,
        quantityGrams: portion.grams,
        portionDescription: portion.label,
        confidence: 0.88,
        clarifyingQuestion: null,
        matchedFood: fallbackFood,
      });
    }
  }

  return results;
}

