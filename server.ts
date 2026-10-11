import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { BANGLADESH_FOOD_DATABASE } from './src/data/bangladeshFoods.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json());

  // API endpoint for AI Food Assistant parsing
  app.post('/api/ai-parse', async (req, res) => {
    try {
      const { text, lang } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          success: false,
          error: 'AI API key not configured. Please configure GEMINI_API_KEY in secrets.',
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const foodCatalogSummary = BANGLADESH_FOOD_DATABASE.map(
        f => `- id: ${f.id}, name: ${f.nameEn} (${f.nameBn}), aliases: [${f.banglish.join(', ')}], category: ${f.category}, default per 100g calories: ${f.per100g.calories} kcal, protein: ${f.per100g.protein}g`
      ).join('\n');

      const prompt = `You are an expert clinical nutritionist and AI dietary assistant.
The user has logged any food item in English, Bangla, or Banglish (e.g. chips, chocolate, snacks, fast food, sweets, drinks, or traditional Bangladeshi meals like "1 packet potato chips", "chocolate bar", "1 cup cha", "2 ta rosogolla", "bhaat ar dal"):
"${text}"

Here is our verified database of foods:
${foodCatalogSummary}

Your task:
1. Parse the text to identify all food items mentioned, their quantities, portion units (e.g. packet, bar, cup, bowl, plate, grams, pieces), and preparation states.
2. Match each food item to the closest verified food id from the catalog above if possible. If it's a general item like chips, chocolate, or snacks not explicitly listed, match to the closest snack/prepared item in the catalog or estimate realistic nutrition values per 100g.
3. Determine the estimated weight in grams.
4. Return a strictly valid JSON array (no markdown code blocks, just raw JSON) with objects containing:
   - foodItemId (string or null if custom)
   - foodName (string with English and Bangla names if possible)
   - preparationState ("raw" or "cooked")
   - quantityGrams (number)
   - portionDescription (string)
   - confidence (number between 0 and 1)
   - clarifyingQuestion (string or null if clear)

Return ONLY valid JSON array format:
[
  {
    "foodItemId": "potato_chips",
    "foodName": "Potato Chips / Crisps (আলু চিপস)",
    "preparationState": "cooked",
    "quantityGrams": 50,
    "portionDescription": "1 Packet (50g)",
    "confidence": 0.95,
    "clarifyingQuestion": null
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const rawText = response.text || '';
      const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedItems = JSON.parse(cleanedJson);

      res.json({
        success: true,
        items: parsedItems,
      });
    } catch (error: any) {
      console.error('AI Parse error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to parse food description with AI.',
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

      const foodCatalogSummary = BANGLADESH_FOOD_DATABASE.map(
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
