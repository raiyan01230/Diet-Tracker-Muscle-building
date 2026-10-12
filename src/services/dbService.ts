import { eq, desc, and, sql } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { 
  users, 
  foodLogs, 
  growthMeasurements, 
  hydrationLogs, 
  plannedMeals, 
  habits, 
  favoriteMeals 
} from '../db/schema.ts';
import { 
  UserProfile, 
  FoodLogItem, 
  GrowthMeasurement, 
  PlannedMealItem, 
  HabitItem, 
  FavoriteMealTemplate 
} from '../types.ts';

export const DEFAULT_USER_UID = 'user_bangladesh_01';

export const defaultProfile: UserProfile = {
  id: DEFAULT_USER_UID,
  name: 'Raiyan Ahmed',
  age: 16,
  referenceSex: 'male',
  heightCm: 167.64,
  weightKg: 55.65,
  activityLevel: 'low_active',
  country: 'Bangladesh',
  timezone: 'Asia/Dhaka',
  allergies: [],
  preferences: ['Traditional Bengali', 'Halal'],
  glassVolumeMl: 250,
};

export const initialHabits: HabitItem[] = [
  { id: 'h_1', title: 'Eat Breakfast', titleBn: 'সকালের পুষ্টিকর নাস্তা খাওয়া', category: 'routine', enabled: true, completedDates: [], order: 1, reminderTime: '08:00 AM' },
  { id: 'h_2', title: 'Eat a Fruit', titleBn: 'একটি তাজা ফল খাওয়া (কলা / পেয়ারা)', category: 'nutrition', enabled: true, completedDates: [], order: 2, reminderTime: '11:00 AM' },
  { id: 'h_3', title: 'Include Protein-Rich Food', titleBn: 'প্রোটিনযুক্ত খাবার (ডিম, মাছ, মাংস বা ডাল)', category: 'nutrition', enabled: true, completedDates: [], order: 3 },
  { id: 'h_4', title: 'Eat Dal or Green Vegetables', titleBn: 'ডাল বা টাটকা শাকসবজি খাওয়া', category: 'nutrition', enabled: true, completedDates: [], order: 4 },
  { id: 'h_5', title: 'Healthy School / Afternoon Snack', titleBn: 'স্কুল বা বিকেলের স্বাস্থ্যকর নাস্তা', category: 'routine', enabled: true, completedDates: [], order: 5, reminderTime: '04:30 PM' },
  { id: 'h_6', title: 'Drink Water Regularly', titleBn: 'নিয়মিত ও পর্যাপ্ত পানি পান করা', category: 'hydration', enabled: true, completedDates: [], order: 6 },
  { id: 'h_7', title: 'Log Meals Faithfully', titleBn: 'আজকের খাবার সঠিকভাবে রেকর্ড করা', category: 'routine', enabled: true, completedDates: [], order: 7, reminderTime: '09:00 PM' },
  { id: 'h_8', title: 'Follow Regular Sleep Routine', titleBn: 'নিয়মিত ঘুমের অভ্যাস মেনে চলা (৭-৮ ঘণ্টা)', category: 'wellness', enabled: true, completedDates: [], order: 8, reminderTime: '10:30 PM' },
  { id: 'h_9', title: 'Review Today\'s Nutrition', titleBn: 'আজকের পুষ্টি ও ক্যালোরির হিসাব পর্যালোচনা', category: 'wellness', enabled: true, completedDates: [], order: 9 },
];

export const initialFavoriteMeals: FavoriteMealTemplate[] = [
  {
    id: 'fav_1',
    name: 'ভাত + মুরগির মাংসের ঝোল + আলু ভর্তা',
    waterMl: 500,
    components: [
      { foodItemId: 'bhaat_boiled', foodName: 'Boiled Rice (White) (সাদা ভাত)', quantityGrams: 200, portionLabel: '1 Plate (200g)' },
      { foodItemId: 'murgi_mangsho', foodName: 'Chicken Curry (মুরগির মাংসের ঝোল)', quantityGrams: 150, portionLabel: '1 Bowl / 2 Pieces (150g)' },
      { foodItemId: 'alu_bhorta', foodName: 'Mashed Potato (Alu Bhorta) (আলু ভর্তা)', quantityGrams: 60, portionLabel: '1 Serving (60g)' },
    ],
  },
  {
    id: 'fav_2',
    name: 'পোলাও + চিকেন রোস্ট',
    waterMl: 250,
    components: [
      { foodItemId: 'polao_rice', foodName: 'Polao (Ghee Flavored Rice) (পোলাও)', quantityGrams: 200, portionLabel: '1 Plate (200g)' },
      { foodItemId: 'chicken_roast', foodName: 'Chicken Roast (Biye Bari Style) (চিকেন রোস্ট)', quantityGrams: 140, portionLabel: '1 Piece with Gravy (140g)' },
    ],
  },
  {
    id: 'fav_3',
    name: 'ভাত + মাছের ঝোল + মসুর ডাল',
    waterMl: 500,
    components: [
      { foodItemId: 'bhaat_boiled', foodName: 'Boiled Rice (White) (সাদা ভাত)', quantityGrams: 200, portionLabel: '1 Plate (200g)' },
      { foodItemId: 'rui_mach', foodName: 'Rui Fish Curry (রুই মাছের ঝোল)', quantityGrams: 120, portionLabel: '1 Medium Piece with gravy (120g)' },
      { foodItemId: 'dal_masoor', foodName: 'Red Lentil Soup (Masoor Dal) (মসুর ডাল)', quantityGrams: 150, portionLabel: '1 Bowl (150g)' },
    ],
  },
  {
    id: 'fav_4',
    name: 'খিচুড়ি + ডিম সেদ্ধ',
    waterMl: 250,
    components: [
      { foodItemId: 'khichuri', foodName: 'Khichuri (Rice & Lentil Hotpot) (খিচুড়ি)', quantityGrams: 200, portionLabel: '1 Plate (200g)' },
      { foodItemId: 'dim_sheddho', foodName: 'Boiled Egg (Whole, USDA SR Legacy) (ডিম সেদ্ধ)', quantityGrams: 50, portionLabel: '1 Large Egg (50g)' },
    ],
  },
  {
    id: 'fav_5',
    name: 'চিকেন পিজ্জা + মোজো কোমল পানীয়',
    waterMl: 0,
    components: [
      { foodItemId: 'pizza_slice', foodName: 'Chicken Pizza (Regular Crust) (চিকেন পিজ্জা)', quantityGrams: 100, portionLabel: '1 Slice (100g)' },
      { foodItemId: 'mojo_cola', foodName: 'Mojo Cola Soft Drink (মোজো)', quantityGrams: 250, portionLabel: '1 Bottle (250ml)' },
    ],
  },
  {
    id: 'fav_6',
    name: 'হাতে তৈরি আটার রুটি + বুটের ডাল',
    waterMl: 250,
    components: [
      { foodItemId: 'roti_handmade', foodName: 'Handmade Whole Wheat Ruti (হাতে তৈরি আটার রুটি)', quantityGrams: 80, portionLabel: '2 Rotis (80g)' },
      { foodItemId: 'dal_booter_chana', foodName: 'Boot er Dal with Coconut (Chana Dal) (নারকেল দিয়ে বুটের ডাল)', quantityGrams: 150, portionLabel: '1 Bowl (150g)' },
    ],
  },
];

export const initialPlannedMeal: PlannedMealItem = {
  id: 'pm_1',
  title: 'Morning Banana Habit',
  mealType: 'breakfast',
  foodItemId: 'banana_kola',
  foodName: 'Banana (Ripe) (কলা)',
  grams: 118,
  nutrients: {
    calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fibre: 3.1,
    vitamins: { a: 3, c: 8.7, d: 0, e: 0.1, k: 0.5, b1: 0.03, b2: 0.07, b3: 0.7, b5: 0.3, b6: 0.4, b7: 0.5, b9: 24, b12: 0, choline: 11 },
    minerals: { calcium: 6, iron: 0.3, zinc: 0.2, magnesium: 27, phosphorus: 22, iodine: 1, selenium: 1, copper: 0.1, potassium: 358, sodium: 1, manganese: 0.3, chromium: 0.1, molybdenum: 2 }
  },
  source: 'FAO Bangladesh (2013)',
  gapsAddressed: ['Potassium', 'Vitamin B6', 'Dietary Fibre'],
};

export class DbService {
  /**
   * Initializes user profile and default records in Cloud SQL if not yet seeded
   */
  async ensureUserInitialized(userUid: string = DEFAULT_USER_UID) {
    try {
      const existingUser = await db.select().from(users).where(eq(users.uid, userUid)).limit(1);
      if (existingUser.length === 0) {
        await db.insert(users).values({
          uid: userUid,
          email: 'raiyan@pusty-bd.app',
          name: defaultProfile.name,
          age: defaultProfile.age,
          referenceSex: defaultProfile.referenceSex,
          heightCm: defaultProfile.heightCm,
          weightKg: defaultProfile.weightKg,
          activityLevel: defaultProfile.activityLevel,
          country: defaultProfile.country,
          timezone: defaultProfile.timezone,
          allergies: defaultProfile.allergies,
          preferences: defaultProfile.preferences,
          glassVolumeMl: defaultProfile.glassVolumeMl,
        });

        // Insert initial baseline growth measurement
        const todayStr = new Date().toISOString().split('T')[0];
        await db.insert(growthMeasurements).values({
          measurementId: 'g_init_1',
          userUid: userUid,
          date: todayStr,
          heightCm: defaultProfile.heightCm,
          weightKg: defaultProfile.weightKg,
          notes: 'Baseline measurement recorded at account creation.',
        });

        // Insert initial planned meal
        await db.insert(plannedMeals).values({
          plannedId: initialPlannedMeal.id,
          userUid: userUid,
          title: initialPlannedMeal.title,
          mealType: initialPlannedMeal.mealType,
          foodItemId: initialPlannedMeal.foodItemId,
          foodName: initialPlannedMeal.foodName,
          grams: initialPlannedMeal.grams,
          nutrients: initialPlannedMeal.nutrients,
          source: initialPlannedMeal.source,
          gapsAddressed: initialPlannedMeal.gapsAddressed,
        });

        // Insert initial habits
        for (const h of initialHabits) {
          await db.insert(habits).values({
            habitId: h.id,
            userUid: userUid,
            title: h.title,
            titleBn: h.titleBn,
            category: h.category,
            enabled: h.enabled,
            completedDates: h.completedDates,
            habitOrder: h.order,
            reminderTime: h.reminderTime,
          });
        }

        // Insert initial favorite meals
        for (const f of initialFavoriteMeals) {
          await db.insert(favoriteMeals).values({
            favoriteId: f.id,
            userUid: userUid,
            name: f.name,
            waterMl: f.waterMl || 0,
            components: f.components,
          });
        }

        // Insert initial hydration for today (starts at 0ml)
        await db.insert(hydrationLogs).values({
          userUid: userUid,
          date: todayStr,
          waterMl: 0,
          targetMl: 2500,
        }).onConflictDoNothing();

        // Clean start: No fake food logs auto-seeded. Food logs are strictly user-recorded.
      }
    } catch (err) {
      console.error('Error in ensureUserInitialized:', err);
    }
  }

  /**
   * Clears all food logs for user to ensure zero fake data and clean slate
   */
  async clearAllFoodLogs(userUid: string = DEFAULT_USER_UID) {
    try {
      await db.delete(foodLogs).where(eq(foodLogs.userUid, userUid));
      return { success: true };
    } catch (err) {
      console.error('Error in clearAllFoodLogs:', err);
      throw err;
    }
  }

  /**
   * No-op: No fake food logs are ever seeded. All dietary data is strictly user-recorded.
   */
  async seedHistoricalSampleLogs(_userUid: string) {
    return;
  }

  /**
   * Fetches full application state for user
   */
  async getUserData(userUid: string = DEFAULT_USER_UID) {
    await this.ensureUserInitialized(userUid);

    const userRows = await db.select().from(users).where(eq(users.uid, userUid)).limit(1);
    const profileRow = userRows[0];

    const profile: UserProfile = profileRow ? {
      id: profileRow.uid,
      name: profileRow.name,
      age: profileRow.age,
      referenceSex: profileRow.referenceSex as any,
      heightCm: profileRow.heightCm,
      weightKg: profileRow.weightKg,
      activityLevel: profileRow.activityLevel as any,
      country: profileRow.country,
      timezone: profileRow.timezone,
      allergies: (profileRow.allergies as string[]) || [],
      preferences: (profileRow.preferences as string[]) || ['Traditional Bengali', 'Halal'],
      glassVolumeMl: profileRow.glassVolumeMl,
    } : defaultProfile;

    const dbFoodLogs = await db.select().from(foodLogs)
      .where(eq(foodLogs.userUid, userUid))
      .orderBy(desc(foodLogs.timestamp), desc(foodLogs.id));

    const clientFoodLogs: FoodLogItem[] = dbFoodLogs.map(row => ({
      id: row.logId,
      userId: row.userUid,
      date: row.date,
      mealType: row.mealType as any,
      foodItemId: row.foodItemId || undefined,
      foodName: row.foodName,
      preparationState: (row.preparationState as any) || 'cooked',
      quantityGrams: row.quantityGrams,
      portionDescription: row.portionDescription,
      source: row.source,
      nutrients: row.nutrients as any,
      timestamp: row.timestamp || Date.now(),
      mealGroupId: row.mealGroupId || undefined,
      mealGroupName: row.mealGroupName || undefined,
    }));

    const dbGrowth = await db.select().from(growthMeasurements)
      .where(eq(growthMeasurements.userUid, userUid))
      .orderBy(desc(growthMeasurements.date), desc(growthMeasurements.id));

    const clientGrowth: GrowthMeasurement[] = dbGrowth.map(row => ({
      id: row.measurementId,
      userId: row.userUid,
      date: row.date,
      heightCm: row.heightCm,
      weightKg: row.weightKg,
      notes: row.notes || undefined,
    }));

    const dbHydration = await db.select().from(hydrationLogs)
      .where(eq(hydrationLogs.userUid, userUid));

    const hydrationMap: Record<string, number> = {};
    dbHydration.forEach(h => {
      hydrationMap[h.date] = h.waterMl;
    });

    const dbPlanned = await db.select().from(plannedMeals)
      .where(eq(plannedMeals.userUid, userUid));

    const clientPlanned: PlannedMealItem[] = dbPlanned.map(row => ({
      id: row.plannedId,
      title: row.title,
      mealType: row.mealType as any,
      foodItemId: row.foodItemId || undefined,
      foodName: row.foodName,
      grams: row.grams,
      nutrients: row.nutrients as any,
      source: row.source,
      gapsAddressed: (row.gapsAddressed as string[]) || [],
    }));

    const dbHabits = await db.select().from(habits)
      .where(eq(habits.userUid, userUid))
      .orderBy(habits.habitOrder);

    const clientHabits: HabitItem[] = dbHabits.map(row => ({
      id: row.habitId,
      title: row.title,
      titleBn: row.titleBn || '',
      category: row.category as any,
      enabled: row.enabled,
      completedDates: (row.completedDates as string[]) || [],
      order: row.habitOrder,
      reminderTime: row.reminderTime || undefined,
    }));

    const dbFavorites = await db.select().from(favoriteMeals)
      .where(eq(favoriteMeals.userUid, userUid));

    const clientFavorites: FavoriteMealTemplate[] = dbFavorites.map(row => ({
      id: row.favoriteId,
      name: row.name,
      waterMl: row.waterMl || 0,
      components: row.components as any,
    }));

    return {
      userProfile: profile,
      foodLogs: clientFoodLogs,
      growthMeasurements: clientGrowth,
      hydrationLogs: hydrationMap,
      plannedMeals: clientPlanned,
      habits: clientHabits,
      favoriteMeals: clientFavorites,
    };
  }

  /**
   * Updates user profile
   */
  async updateProfile(userUid: string, updates: Partial<UserProfile>) {
    await this.ensureUserInitialized(userUid);
    const dbUpdates: any = { updatedAt: new Date() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.age !== undefined) dbUpdates.age = updates.age;
    if (updates.referenceSex !== undefined) dbUpdates.referenceSex = updates.referenceSex;
    if (updates.heightCm !== undefined) dbUpdates.heightCm = updates.heightCm;
    if (updates.weightKg !== undefined) dbUpdates.weightKg = updates.weightKg;
    if (updates.activityLevel !== undefined) dbUpdates.activityLevel = updates.activityLevel;
    if (updates.country !== undefined) dbUpdates.country = updates.country;
    if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
    if (updates.allergies !== undefined) dbUpdates.allergies = updates.allergies;
    if (updates.preferences !== undefined) dbUpdates.preferences = updates.preferences;
    if (updates.glassVolumeMl !== undefined) dbUpdates.glassVolumeMl = updates.glassVolumeMl;

    await db.update(users).set(dbUpdates).where(eq(users.uid, userUid));
    return true;
  }

  /**
   * Adds or updates a food log item
   */
  async addFoodLog(userUid: string, item: FoodLogItem) {
    await this.ensureUserInitialized(userUid);
    await db.insert(foodLogs).values({
      logId: item.id,
      userUid: userUid,
      date: item.date,
      mealType: item.mealType,
      mealGroupId: item.mealGroupId,
      mealGroupName: item.mealGroupName,
      foodItemId: item.foodItemId,
      foodName: item.foodName,
      preparationState: item.preparationState,
      quantityGrams: item.quantityGrams,
      portionDescription: item.portionDescription,
      source: item.source,
      nutrients: item.nutrients,
      timestamp: item.timestamp || Date.now(),
    }).onConflictDoUpdate({
      target: foodLogs.logId,
      set: {
        date: item.date,
        mealType: item.mealType,
        quantityGrams: item.quantityGrams,
        portionDescription: item.portionDescription,
        nutrients: item.nutrients,
      }
    });
    return true;
  }

  /**
   * Batch inserts food logs (used for complete meal or bulk add)
   */
  async addFoodLogsBatch(userUid: string, items: FoodLogItem[]) {
    await this.ensureUserInitialized(userUid);
    for (const item of items) {
      await this.addFoodLog(userUid, item);
    }
    return true;
  }

  /**
   * Deletes a food log item by logId
   */
  async deleteFoodLog(userUid: string, logId: string) {
    await db.delete(foodLogs).where(and(eq(foodLogs.userUid, userUid), eq(foodLogs.logId, logId)));
    return true;
  }

  /**
   * Deletes all items belonging to a mealGroupId
   */
  async deleteMealGroup(userUid: string, mealGroupId: string) {
    await db.delete(foodLogs).where(and(eq(foodLogs.userUid, userUid), eq(foodLogs.mealGroupId, mealGroupId)));
    return true;
  }

  /**
   * Updates fields of a food log item
   */
  async updateFoodLog(userUid: string, logId: string, updates: Partial<FoodLogItem>) {
    const dbUpdates: any = {};
    if (updates.quantityGrams !== undefined) dbUpdates.quantityGrams = updates.quantityGrams;
    if (updates.portionDescription !== undefined) dbUpdates.portionDescription = updates.portionDescription;
    if (updates.nutrients !== undefined) dbUpdates.nutrients = updates.nutrients;
    if (updates.mealType !== undefined) dbUpdates.mealType = updates.mealType;
    if (updates.date !== undefined) dbUpdates.date = updates.date;

    await db.update(foodLogs)
      .set(dbUpdates)
      .where(and(eq(foodLogs.userUid, userUid), eq(foodLogs.logId, logId)));
    return true;
  }

  /**
   * Adds growth measurement
   */
  async addGrowthMeasurement(userUid: string, m: GrowthMeasurement) {
    await this.ensureUserInitialized(userUid);
    await db.insert(growthMeasurements).values({
      measurementId: m.id,
      userUid: userUid,
      date: m.date,
      heightCm: m.heightCm,
      weightKg: m.weightKg,
      notes: m.notes,
    }).onConflictDoUpdate({
      target: growthMeasurements.measurementId,
      set: {
        heightCm: m.heightCm,
        weightKg: m.weightKg,
        notes: m.notes,
      }
    });

    // Also update users table profile current height & weight
    await db.update(users).set({
      heightCm: m.heightCm,
      weightKg: m.weightKg,
      updatedAt: new Date(),
    }).where(eq(users.uid, userUid));

    return true;
  }

  /**
   * Deletes growth measurement
   */
  async deleteGrowthMeasurement(userUid: string, measurementId: string) {
    await db.delete(growthMeasurements)
      .where(and(eq(growthMeasurements.userUid, userUid), eq(growthMeasurements.measurementId, measurementId)));
    return true;
  }

  /**
   * Sets hydration for a date
   */
  async setHydration(userUid: string, date: string, waterMl: number) {
    await this.ensureUserInitialized(userUid);
    const existing = await db.select().from(hydrationLogs)
      .where(and(eq(hydrationLogs.userUid, userUid), eq(hydrationLogs.date, date)))
      .limit(1);

    if (existing.length > 0) {
      await db.update(hydrationLogs)
        .set({ waterMl, updatedAt: new Date() })
        .where(and(eq(hydrationLogs.userUid, userUid), eq(hydrationLogs.date, date)));
    } else {
      await db.insert(hydrationLogs).values({
        userUid: userUid,
        date: date,
        waterMl: waterMl,
        targetMl: 2500,
      });
    }
    return true;
  }

  /**
   * Adds or updates planned meal
   */
  async addPlannedMeal(userUid: string, meal: PlannedMealItem) {
    await this.ensureUserInitialized(userUid);
    await db.insert(plannedMeals).values({
      plannedId: meal.id,
      userUid: userUid,
      title: meal.title,
      mealType: meal.mealType,
      foodItemId: meal.foodItemId,
      foodName: meal.foodName,
      grams: meal.grams,
      nutrients: meal.nutrients,
      source: meal.source,
      gapsAddressed: meal.gapsAddressed,
    }).onConflictDoUpdate({
      target: plannedMeals.plannedId,
      set: {
        title: meal.title,
        mealType: meal.mealType,
        grams: meal.grams,
        nutrients: meal.nutrients,
        gapsAddressed: meal.gapsAddressed,
      }
    });
    return true;
  }

  /**
   * Deletes planned meal
   */
  async deletePlannedMeal(userUid: string, plannedId: string) {
    await db.delete(plannedMeals)
      .where(and(eq(plannedMeals.userUid, userUid), eq(plannedMeals.plannedId, plannedId)));
    return true;
  }

  /**
   * Adds or updates habit
   */
  async upsertHabit(userUid: string, habit: HabitItem) {
    await this.ensureUserInitialized(userUid);
    await db.insert(habits).values({
      habitId: habit.id,
      userUid: userUid,
      title: habit.title,
      titleBn: habit.titleBn,
      category: habit.category,
      enabled: habit.enabled,
      completedDates: habit.completedDates,
      habitOrder: habit.order,
      reminderTime: habit.reminderTime,
    }).onConflictDoUpdate({
      target: habits.habitId,
      set: {
        title: habit.title,
        titleBn: habit.titleBn,
        category: habit.category,
        enabled: habit.enabled,
        completedDates: habit.completedDates,
        habitOrder: habit.order,
        reminderTime: habit.reminderTime,
        updatedAt: new Date(),
      }
    });
    return true;
  }

  /**
   * Toggles habit completion date
   */
  async toggleHabit(userUid: string, habitId: string, date: string) {
    const existing = await db.select().from(habits)
      .where(and(eq(habits.userUid, userUid), eq(habits.habitId, habitId)))
      .limit(1);

    if (existing.length === 0) return false;
    const currentDates = (existing[0].completedDates as string[]) || [];
    const isCompleted = currentDates.includes(date);
    const newDates = isCompleted 
      ? currentDates.filter(d => d !== date)
      : [...currentDates, date];

    await db.update(habits)
      .set({ completedDates: newDates, updatedAt: new Date() })
      .where(and(eq(habits.userUid, userUid), eq(habits.habitId, habitId)));

    return true;
  }

  /**
   * Deletes habit
   */
  async deleteHabit(userUid: string, habitId: string) {
    await db.delete(habits)
      .where(and(eq(habits.userUid, userUid), eq(habits.habitId, habitId)));
    return true;
  }

  /**
   * Adds or updates favorite meal
   */
  async upsertFavoriteMeal(userUid: string, fav: FavoriteMealTemplate) {
    await this.ensureUserInitialized(userUid);
    await db.insert(favoriteMeals).values({
      favoriteId: fav.id,
      userUid: userUid,
      name: fav.name,
      waterMl: fav.waterMl || 0,
      components: fav.components,
    }).onConflictDoUpdate({
      target: favoriteMeals.favoriteId,
      set: {
        name: fav.name,
        waterMl: fav.waterMl || 0,
        components: fav.components,
      }
    });
    return true;
  }

  /**
   * Deletes favorite meal
   */
  async deleteFavoriteMeal(userUid: string, favoriteId: string) {
    await db.delete(favoriteMeals)
      .where(and(eq(favoriteMeals.userUid, userUid), eq(favoriteMeals.favoriteId, favoriteId)));
    return true;
  }

  /**
   * Bulk Sync / Import: Persists complete snapshot into Cloud SQL PostgreSQL
   */
  async syncAllData(userUid: string, fullData: {
    userProfile?: UserProfile;
    foodLogs?: FoodLogItem[];
    growthMeasurements?: GrowthMeasurement[];
    hydrationLogs?: Record<string, number>;
    plannedMeals?: PlannedMealItem[];
    habits?: HabitItem[];
    favoriteMeals?: FavoriteMealTemplate[];
  }) {
    await this.ensureUserInitialized(userUid);

    if (fullData.userProfile) {
      await this.updateProfile(userUid, fullData.userProfile);
    }

    if (Array.isArray(fullData.foodLogs)) {
      for (const item of fullData.foodLogs) {
        await this.addFoodLog(userUid, item);
      }
    }

    if (Array.isArray(fullData.growthMeasurements)) {
      for (const m of fullData.growthMeasurements) {
        await this.addGrowthMeasurement(userUid, m);
      }
    }

    if (fullData.hydrationLogs) {
      for (const [date, ml] of Object.entries(fullData.hydrationLogs)) {
        await this.setHydration(userUid, date, ml);
      }
    }

    if (Array.isArray(fullData.plannedMeals)) {
      for (const p of fullData.plannedMeals) {
        await this.addPlannedMeal(userUid, p);
      }
    }

    if (Array.isArray(fullData.habits)) {
      for (const h of fullData.habits) {
        await this.upsertHabit(userUid, h);
      }
    }

    if (Array.isArray(fullData.favoriteMeals)) {
      for (const f of fullData.favoriteMeals) {
        await this.upsertFavoriteMeal(userUid, f);
      }
    }

    return true;
  }

  /**
   * Returns database health, statistics, and 30d/90d/365d storage metrics
   */
  async getDatabaseStats(userUid: string = DEFAULT_USER_UID) {
    const totalLogsRes = await db.select({ count: sql<number>`count(*)` }).from(foodLogs).where(eq(foodLogs.userUid, userUid));
    const totalGrowthRes = await db.select({ count: sql<number>`count(*)` }).from(growthMeasurements).where(eq(growthMeasurements.userUid, userUid));
    const totalHydrationRes = await db.select({ count: sql<number>`count(*)` }).from(hydrationLogs).where(eq(hydrationLogs.userUid, userUid));
    const distinctDatesRes = await db.execute(sql`SELECT COUNT(DISTINCT date) as distinct_days FROM food_logs WHERE user_uid = ${userUid}`);

    return {
      connected: true,
      databaseEngine: 'Cloud SQL PostgreSQL',
      totalFoodLogs: Number(totalLogsRes[0]?.count || 0),
      totalGrowthRecords: Number(totalGrowthRes[0]?.count || 0),
      totalHydrationRecords: Number(totalHydrationRes[0]?.count || 0),
      daysWithLogs: Number((distinctDatesRes.rows[0] as any)?.distinct_days || 0),
      retentionPolicy: 'Permanent (30-day, 90-day, 1-year and multi-year permanent cloud persistence)',
      verifiedAt: new Date().toISOString(),
    };
  }
}

export const dbService = new DbService();
