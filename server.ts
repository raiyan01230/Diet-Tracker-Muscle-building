import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { foodDbService } from './src/services/foodDatabase.ts';
import { parseLocalFoodQuery } from './src/utils/aiFoodParser.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json());

  // API endpoint for AI Food Assistant parsing
  app.post('/api/ai-parse', async (req, res) => {
    const { text, lang } = req.body;
    if (!text || !text.trim()) {
      return res.json({ success: true, items: [] });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If API key is available, attempt Gemini model parsing
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are an expert clinical nutritionist and dietary assistant in Bangladesh.
The user input is: "${text}"
Extract the authentic foods eaten and their quantities.
Special guidance:
- If the user mentions "বুটের ডাল", "booter dal", "buter dal", "chana dal", or "cholar dal", map to foodItemId "dal_booter_chana" (Boot er Dal with Coconut / Chana Dal).
- If the user mentions tea ("cha", "ca", "dudh cha", "tea"), map to tea ("bev_tea_dudh_cha_sugar" or "cha_dudh").
- If the user includes conversational phrasing like "im trying to add this because ate this but everytime i ate...", ignore the conversational complaint/meta text and extract the intended food eaten.

Return ONLY a valid JSON array of objects with keys:
- foodItemId (string matching our catalog or null)
- foodName (string with English and Bangla)
- preparationState ("raw" or "cooked")
- quantityGrams (number)
- portionDescription (string)
- confidence (number between 0 and 1)
- clarifyingQuestion (string or null)`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const rawText = response.text || '';
        const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedItems = JSON.parse(cleanedJson);

        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          return res.json({
            success: true,
            items: parsedItems,
            source: 'gemini-ai',
          });
        }
      } catch (geminiError) {
        console.warn('Gemini AI failed, using verified database NLP fallback:', geminiError);
      }
    }

    // High-speed verified database NLP parser fallback (works instantly even without API key)
    try {
      const localItems = parseLocalFoodQuery(text);
      return res.json({
        success: true,
        items: localItems,
        source: 'verified-catalog-nlp',
      });
    } catch (localError: any) {
      console.error('Local parse error:', localError);
      return res.status(500).json({
        success: false,
        error: 'Unable to parse food item.',
      });
    }
  });

  // API endpoint for AI Smart Nutrient Gap Solver & Meal Optimiser
  app.post('/api/ai-gap-solver', async (req, res) => {
    try {
      const { profile, todayTotals, nutrientGaps } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          success: false,
          error: 'AI API key not configured.',
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const allFoods = foodDbService.getAllFoods();
      // Select top candidates matching nutrient gaps to minimize latency and token processing
      const candidateFoods = allFoods.filter(f => {
        if (nutrientGaps?.proteinNeeded > 5 && f.per100g.protein >= 8) return true;
        if (nutrientGaps?.fibreNeeded > 2 && f.per100g.fibre >= 3) return true;
        if (nutrientGaps?.vitCNeeded > 10 && (f.per100g.vitamins.c || 0) >= 15) return true;
        if (nutrientGaps?.calciumNeeded > 50 && (f.per100g.minerals.calcium || 0) >= 60) return true;
        if (nutrientGaps?.ironNeeded > 1 && (f.per100g.minerals.iron || 0) >= 2) return true;
        return ['peyara', 'dal_masoor', 'dim_sheddho', 'lal_shak', 'murgi_mangsho', 'rui_mach'].includes(f.id);
      }).slice(0, 35);

      const foodCatalogSummary = candidateFoods.map(
        f => `- id: ${f.id}, name: ${f.nameEn} (${f.nameBn}), category: ${f.category}, per 100g calories: ${f.per100g.calories}, protein: ${f.per100g.protein}g, vitamin C: ${f.per100g.vitamins.c}mg, calcium: ${f.per100g.minerals.calcium}mg, iron: ${f.per100g.minerals.iron}mg`
      ).join('\n');

      const prompt = `You are a clinical nutritionist specializing in adolescent nutrition in Bangladesh (FAO 2013 & USDA standards).
User profile: Age ${profile.age}, Sex ${profile.referenceSex}, Activity ${profile.activityLevel}.
Today's logged totals: Calories ${todayTotals.calories} kcal, Protein ${todayTotals.protein}g, Carbs ${todayTotals.carbs}g, Fat ${todayTotals.fat}g, Fibre ${todayTotals.fibre}g.
Current identified nutrient gaps: ${JSON.stringify(nutrientGaps)}.

Available verified food catalog:
${foodCatalogSummary}

Task: Recommend 3 optimal food items from the verified catalog above that best fill today's nutrient gaps without exceeding calorie limits.
Return ONLY a valid JSON array of objects with keys:
- foodItemId (string from catalog)
- foodName (string)
- recommendedGrams (number)
- reason (string explaining how it fills the gap)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const rawText = response.text || '';
      const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const recommendations = JSON.parse(cleanedJson);

      res.json({
        success: true,
        recommendations,
      });
    } catch (error: any) {
      console.error('AI Gap Solver error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate AI recommendations.',
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
