import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  UserProfile, 
  FoodLogItem, 
  GrowthMeasurement, 
  PlannedMealItem,
  HabitItem,
  FavoriteMealTemplate,
  NutrientValues
} from '../types';
import { getTodayDateString } from '../utils/calculations';

interface AddCompleteMealParams {
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mealName: string;
  items: Array<{
    foodItemId?: string;
    foodName: string;
    preparationState: 'raw' | 'cooked';
    quantityGrams: number;
    portionDescription: string;
    source: string;
    nutrients: NutrientValues;
  }>;
  waterMl?: number;
}

export interface DatabaseSyncStatus {
  connected: boolean;
  databaseEngine: string;
  totalFoodLogs: number;
  totalGrowthRecords: number;
  totalHydrationRecords: number;
  daysWithLogs: number;
  retentionPolicy: string;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error?: string | null;
}

interface AppContextType {
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  foodLogs: FoodLogItem[];
  addFoodLog: (log: Omit<FoodLogItem, 'id' | 'userId' | 'timestamp'>) => void;
  deleteFoodLog: (id: string) => void;
  updateFoodLog: (id: string, log: Partial<FoodLogItem>) => void;
  addCompleteMeal: (params: AddCompleteMealParams) => string;
  deleteMealGroup: (mealGroupId: string) => void;
  growthMeasurements: GrowthMeasurement[];
  addGrowthMeasurement: (m: Omit<GrowthMeasurement, 'id' | 'userId'>) => void;
  deleteGrowthMeasurement: (id: string) => void;
  hydrationLogs: Record<string, number>; // date -> water ml
  addWaterMl: (date: string, ml: number) => void;
  removeWaterMl: (date: string, ml: number) => void;
  plannedMeals: PlannedMealItem[];
  addPlannedMeal: (meal: Omit<PlannedMealItem, 'id'>) => void;
  confirmPlannedMealAsEaten: (plannedId: string, date: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', actualGrams?: number) => void;
  deletePlannedMeal: (id: string) => void;
  habits: HabitItem[];
  toggleHabit: (id: string, date: string) => void;
  addHabit: (habit: Omit<HabitItem, 'id' | 'completedDates' | 'order'>) => void;
  updateHabit: (id: string, updates: Partial<HabitItem>) => void;
  deleteHabit: (id: string) => void;
  favoriteMeals: FavoriteMealTemplate[];
  addFavoriteMeal: (template: Omit<FavoriteMealTemplate, 'id'>) => void;
  deleteFavoriteMeal: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
  clearAllFoodLogs: () => Promise<void>;
  exportDataJSON: () => string;
  exportDataCSV: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  resetToDefault: () => void;
  dbStatus: DatabaseSyncStatus;
  syncNow: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  id: 'user_bangladesh_01',
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

const initialHabits: HabitItem[] = [
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

const initialFavoriteMeals: FavoriteMealTemplate[] = [
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

const initialFoodLogs: FoodLogItem[] = [];
const todayStr = getTodayDateString();

const initialGrowthMeasurements: GrowthMeasurement[] = [
  {
    id: 'g_1',
    userId: 'user_bangladesh_01',
    date: todayStr,
    heightCm: 167.64,
    weightKg: 55.65,
    notes: 'Baseline measurement recorded at start.',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('pusty_user_profile');
    return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile;
  });

  const [foodLogs, setFoodLogs] = useState<FoodLogItem[]>(() => {
    const saved = localStorage.getItem('pusty_food_logs');
    return saved ? JSON.parse(saved) : initialFoodLogs;
  });

  const [growthMeasurements, setGrowthMeasurements] = useState<GrowthMeasurement[]>(() => {
    const saved = localStorage.getItem('pusty_growth_measurements');
    return saved ? JSON.parse(saved) : initialGrowthMeasurements;
  });

  const [hydrationLogs, setHydrationLogs] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('pusty_hydration_logs');
    return saved ? JSON.parse(saved) : { [todayStr]: 0 };
  });

  const [plannedMeals, setPlannedMeals] = useState<PlannedMealItem[]>(() => {
    const saved = localStorage.getItem('pusty_planned_meals');
    return saved ? JSON.parse(saved) : [
      {
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
      }
    ];
  });

  const [habits, setHabits] = useState<HabitItem[]>(() => {
    const saved = localStorage.getItem('pusty_habits');
    return saved ? JSON.parse(saved) : initialHabits;
  });

  const [favoriteMeals, setFavoriteMeals] = useState<FavoriteMealTemplate[]>(() => {
    const saved = localStorage.getItem('pusty_favorite_meals');
    return saved ? JSON.parse(saved) : initialFavoriteMeals;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const goToPreviousDay = useCallback(() => {
    setSelectedDate(prev => {
      const d = new Date(prev + 'T12:00:00');
      d.setDate(d.getDate() - 1);
      return d.toISOString().split('T')[0];
    });
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate(prev => {
      const d = new Date(prev + 'T12:00:00');
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    });
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(getTodayDateString());
  }, []);

  const [dbStatus, setDbStatus] = useState<DatabaseSyncStatus>({
    connected: false,
    databaseEngine: 'Cloud SQL PostgreSQL',
    totalFoodLogs: 0,
    totalGrowthRecords: 0,
    totalHydrationRecords: 0,
    daysWithLogs: 0,
    retentionPolicy: 'Permanent 30/90/365+ Day Cloud SQL Storage',
    isSyncing: true,
    lastSyncedAt: null,
    error: null,
  });

  // Keep localStorage as local fallback
  useEffect(() => {
    localStorage.setItem('pusty_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('pusty_food_logs', JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    localStorage.setItem('pusty_growth_measurements', JSON.stringify(growthMeasurements));
  }, [growthMeasurements]);

  useEffect(() => {
    localStorage.setItem('pusty_hydration_logs', JSON.stringify(hydrationLogs));
  }, [hydrationLogs]);

  useEffect(() => {
    localStorage.setItem('pusty_planned_meals', JSON.stringify(plannedMeals));
  }, [plannedMeals]);

  useEffect(() => {
    localStorage.setItem('pusty_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('pusty_favorite_meals', JSON.stringify(favoriteMeals));
  }, [favoriteMeals]);

  // Load authoritative data from Cloud SQL Database on initial mount
  const loadDatabaseData = useCallback(async () => {
    setDbStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      const res = await fetch('/api/data?uid=user_bangladesh_01');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const { 
            userProfile: dbProfile, 
            foodLogs: dbLogs, 
            growthMeasurements: dbGrowth, 
            hydrationLogs: dbHydration, 
            plannedMeals: dbPlanned, 
            habits: dbHabits, 
            favoriteMeals: dbFavorites 
          } = json.data;

          if (dbProfile) setUserProfile(dbProfile);
          if (Array.isArray(dbLogs)) setFoodLogs(dbLogs);
          if (Array.isArray(dbGrowth)) setGrowthMeasurements(dbGrowth);
          if (dbHydration) setHydrationLogs(dbHydration);
          if (Array.isArray(dbPlanned)) setPlannedMeals(dbPlanned);
          if (Array.isArray(dbHabits)) setHabits(dbHabits);
          if (Array.isArray(dbFavorites)) setFavoriteMeals(dbFavorites);

          // Fetch database retention stats
          const statsRes = await fetch('/api/database/status?uid=user_bangladesh_01');
          if (statsRes.ok) {
            const statsJson = await statsRes.json();
            if (statsJson.success && statsJson.stats) {
              setDbStatus({
                connected: true,
                databaseEngine: statsJson.stats.databaseEngine || 'Cloud SQL PostgreSQL',
                totalFoodLogs: statsJson.stats.totalFoodLogs || dbLogs.length,
                totalGrowthRecords: statsJson.stats.totalGrowthRecords || dbGrowth.length,
                totalHydrationRecords: statsJson.stats.totalHydrationRecords || Object.keys(dbHydration).length,
                daysWithLogs: statsJson.stats.daysWithLogs || 1,
                retentionPolicy: 'Permanent 30-day, 90-day & 365+ Day Cloud Storage',
                isSyncing: false,
                lastSyncedAt: new Date(),
                error: null,
              });
              return;
            }
          }

          setDbStatus(prev => ({
            ...prev,
            connected: true,
            isSyncing: false,
            totalFoodLogs: dbLogs.length,
            lastSyncedAt: new Date(),
            error: null,
          }));
        }
      }
    } catch (err: any) {
      console.warn('Database load fallback to localStorage:', err);
      setDbStatus(prev => ({
        ...prev,
        connected: false,
        isSyncing: false,
        error: err.message || 'Offline mode',
      }));
    }
  }, []);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // Manual Trigger Full Sync
  const syncNow = async () => {
    setDbStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      const payload = {
        userProfile,
        foodLogs,
        growthMeasurements,
        hydrationLogs,
        plannedMeals,
        habits,
        favoriteMeals,
      };
      const res = await fetch('/api/sync?uid=user_bangladesh_01', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        setDbStatus({
          connected: true,
          databaseEngine: 'Cloud SQL PostgreSQL',
          totalFoodLogs: json.stats?.totalFoodLogs || foodLogs.length,
          totalGrowthRecords: json.stats?.totalGrowthRecords || growthMeasurements.length,
          totalHydrationRecords: json.stats?.totalHydrationRecords || Object.keys(hydrationLogs).length,
          daysWithLogs: json.stats?.daysWithLogs || 1,
          retentionPolicy: 'Permanent 30-day, 90-day & 365+ Day Cloud Storage',
          isSyncing: false,
          lastSyncedAt: new Date(),
          error: null,
        });
      }
    } catch (err: any) {
      console.error('Manual sync error:', err);
      setDbStatus(prev => ({ ...prev, isSyncing: false, error: err.message }));
    }
  };

  const clearAllFoodLogs = async () => {
    setFoodLogs([]);
    localStorage.removeItem('pusty_food_logs');
    setDbStatus(prev => ({ ...prev, totalFoodLogs: 0, isSyncing: true }));
    try {
      await fetch('/api/food-logs/all?uid=user_bangladesh_01', { method: 'DELETE' });
      await syncNow();
    } catch (e) {
      console.error('Error clearing all food logs:', e);
      setDbStatus(prev => ({ ...prev, isSyncing: false }));
    }
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...profile };
      fetch('/api/profile?uid=user_bangladesh_01', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(e => console.warn('Profile sync error:', e));
      return updated;
    });
  };

  const addFoodLog = (log: Omit<FoodLogItem, 'id' | 'userId' | 'timestamp'>) => {
    const newItem: FoodLogItem = {
      ...log,
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      userId: userProfile.id,
      timestamp: Date.now(),
    };
    setFoodLogs(prev => [newItem, ...prev]);

    // Send immediately to Cloud SQL PostgreSQL
    fetch('/api/food-logs?uid=user_bangladesh_01', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    }).catch(e => console.warn('Food log sync error:', e));

    // Check off habit "Log Meals Faithfully" for today automatically
    markHabitCompletedIfDateMatches('h_7', log.date);
    if (log.mealType === 'breakfast') {
      markHabitCompletedIfDateMatches('h_1', log.date);
    }
  };

  const addCompleteMeal = (params: AddCompleteMealParams): string => {
    const groupId = 'group_' + Math.random().toString(36).substring(2, 9);
    const now = Date.now();

    const newItems: FoodLogItem[] = params.items.map(item => ({
      ...item,
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      userId: userProfile.id,
      date: params.date,
      mealType: params.mealType,
      mealGroupId: groupId,
      mealGroupName: params.mealName,
      timestamp: now,
    }));

    setFoodLogs(prev => [...newItems, ...prev]);

    // Send batch to Cloud SQL PostgreSQL
    fetch('/api/food-logs?uid=user_bangladesh_01', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: newItems }),
    }).catch(e => console.warn('Batch food logs sync error:', e));

    // If water was logged with this meal, log plain water separately
    if (params.waterMl && params.waterMl > 0) {
      addWaterMl(params.date, params.waterMl);
      markHabitCompletedIfDateMatches('h_6', params.date);
    }

    // Auto-mark appropriate habits
    markHabitCompletedIfDateMatches('h_7', params.date);
    if (params.mealType === 'breakfast') {
      markHabitCompletedIfDateMatches('h_1', params.date);
    }
    const hasProtein = params.items.some(i => i.nutrients.protein >= 5);
    if (hasProtein) {
      markHabitCompletedIfDateMatches('h_3', params.date);
    }
    const hasVegOrDal = params.items.some(i => 
      i.foodName.toLowerCase().includes('dal') || 
      i.foodName.toLowerCase().includes('shak') || 
      i.foodName.toLowerCase().includes('vegetable') ||
      i.foodName.toLowerCase().includes('bhorta')
    );
    if (hasVegOrDal) {
      markHabitCompletedIfDateMatches('h_4', params.date);
    }

    return groupId;
  };

  const deleteMealGroup = (mealGroupId: string) => {
    setFoodLogs(prev => prev.filter(item => item.mealGroupId !== mealGroupId));
    fetch(`/api/food-logs/group/${mealGroupId}?uid=user_bangladesh_01`, {
      method: 'DELETE',
    }).catch(e => console.warn('Delete meal group error:', e));
  };

  const deleteFoodLog = (id: string) => {
    setFoodLogs(prev => prev.filter(item => item.id !== id));
    fetch(`/api/food-logs/${id}?uid=user_bangladesh_01`, {
      method: 'DELETE',
    }).catch(e => console.warn('Delete food log error:', e));
  };

  const updateFoodLog = (id: string, updatedFields: Partial<FoodLogItem>) => {
    setFoodLogs(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updatedFields } : item))
    );
    fetch(`/api/food-logs/${id}?uid=user_bangladesh_01`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields),
    }).catch(e => console.warn('Update food log error:', e));
  };

  const addGrowthMeasurement = (m: Omit<GrowthMeasurement, 'id' | 'userId'>) => {
    const newM: GrowthMeasurement = {
      ...m,
      id: 'g_' + Math.random().toString(36).substring(2, 9),
      userId: userProfile.id,
    };
    setGrowthMeasurements(prev => [newM, ...prev]);
    setUserProfile(prev => ({
      ...prev,
      heightCm: m.heightCm,
      weightKg: m.weightKg,
    }));

    fetch('/api/growth?uid=user_bangladesh_01', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newM),
    }).catch(e => console.warn('Growth sync error:', e));
  };

  const deleteGrowthMeasurement = (id: string) => {
    setGrowthMeasurements(prev => prev.filter(item => item.id !== id));
    fetch(`/api/growth/${id}?uid=user_bangladesh_01`, {
      method: 'DELETE',
    }).catch(e => console.warn('Delete growth error:', e));
  };

  const addWaterMl = (date: string, ml: number) => {
    setHydrationLogs(prev => {
      const newWater = (prev[date] || 0) + ml;
      fetch('/api/hydration?uid=user_bangladesh_01', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, waterMl: newWater }),
      }).catch(e => console.warn('Hydration sync error:', e));
      return {
        ...prev,
        [date]: newWater
      };
    });
  };

  const removeWaterMl = (date: string, ml: number) => {
    setHydrationLogs(prev => {
      const newWater = Math.max(0, (prev[date] || 0) - ml);
      fetch('/api/hydration?uid=user_bangladesh_01', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, waterMl: newWater }),
      }).catch(e => console.warn('Hydration sync error:', e));
      return {
        ...prev,
        [date]: newWater
      };
    });
  };

  const addPlannedMeal = (meal: Omit<PlannedMealItem, 'id'>) => {
    const newMeal: PlannedMealItem = {
      ...meal,
      id: 'pm_' + Math.random().toString(36).substring(2, 9),
    };
    setPlannedMeals(prev => [newMeal, ...prev]);

    fetch('/api/planned-meals?uid=user_bangladesh_01', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMeal),
    }).catch(e => console.warn('Planned meal sync error:', e));
  };

  const confirmPlannedMealAsEaten = (
    plannedId: string, 
    date: string, 
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    actualGrams?: number
  ) => {
    const meal = plannedMeals.find(p => p.id === plannedId);
    if (!meal) return;

    const grams = actualGrams || meal.grams;
    const factor = grams / meal.grams;

    const scaledNutrients: NutrientValues = {
      calories: Math.round(meal.nutrients.calories * factor),
      protein: Math.round(meal.nutrients.protein * factor * 10) / 10,
      carbs: Math.round(meal.nutrients.carbs * factor * 10) / 10,
      fat: Math.round(meal.nutrients.fat * factor * 10) / 10,
      fibre: Math.round(meal.nutrients.fibre * factor * 10) / 10,
      vitamins: meal.nutrients.vitamins,
      minerals: meal.nutrients.minerals,
    };

    addFoodLog({
      date,
      mealType,
      foodItemId: meal.foodItemId,
      foodName: meal.foodName,
      preparationState: 'raw',
      quantityGrams: grams,
      portionDescription: `${grams}g (Confirmed from Routine Plan)`,
      source: meal.source,
      nutrients: scaledNutrients,
    });
  };

  const deletePlannedMeal = (id: string) => {
    setPlannedMeals(prev => prev.filter(p => p.id !== id));
    fetch(`/api/planned-meals/${id}?uid=user_bangladesh_01`, {
      method: 'DELETE',
    }).catch(e => console.warn('Delete planned meal error:', e));
  };

  // Habits methods
  const toggleHabit = (id: string, date: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const isCompleted = h.completedDates.includes(date);
      const newDates = isCompleted 
        ? h.completedDates.filter(d => d !== date)
        : [...h.completedDates, date];
      return { ...h, completedDates: newDates };
    }));

    fetch(`/api/habits/${id}/toggle?uid=user_bangladesh_01`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    }).catch(e => console.warn('Toggle habit error:', e));
  };

  const markHabitCompletedIfDateMatches = (habitId: string, date: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      if (h.completedDates.includes(date)) return h;
      fetch(`/api/habits/${habitId}/toggle?uid=user_bangladesh_01`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      }).catch(e => console.warn('Toggle habit auto error:', e));
      return { ...h, completedDates: [...h.completedDates, date] };
    }));
  };

  const addHabit = (habit: Omit<HabitItem, 'id' | 'completedDates' | 'order'>) => {
    const newH: HabitItem = {
      ...habit,
      id: 'h_' + Math.random().toString(36).substring(2, 9),
      completedDates: [],
      order: habits.length + 1,
    };
    setHabits(prev => [...prev, newH]);

    fetch('/api/habits?uid=user_bangladesh_01', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newH),
    }).catch(e => console.warn('Add habit error:', e));
  };

  const updateHabit = (id: string, updates: Partial<HabitItem>) => {
    setHabits(prev => {
      const updatedList = prev.map(h => h.id === id ? { ...h, ...updates } : h);
      const target = updatedList.find(h => h.id === id);
      if (target) {
        fetch('/api/habits?uid=user_bangladesh_01', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target),
        }).catch(e => console.warn('Update habit error:', e));
      }
      return updatedList;
    });
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    fetch(`/api/habits/${id}?uid=user_bangladesh_01`, {
      method: 'DELETE',
    }).catch(e => console.warn('Delete habit error:', e));
  };

  // Favorites methods
  const addFavoriteMeal = (template: Omit<FavoriteMealTemplate, 'id'>) => {
    const newFav: FavoriteMealTemplate = {
      ...template,
      id: 'fav_' + Math.random().toString(36).substring(2, 9),
    };
    setFavoriteMeals(prev => [newFav, ...prev]);

    fetch('/api/favorite-meals?uid=user_bangladesh_01', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFav),
    }).catch(e => console.warn('Add favorite meal error:', e));
  };

  const deleteFavoriteMeal = (id: string) => {
    setFavoriteMeals(prev => prev.filter(f => f.id !== id));
    fetch(`/api/favorite-meals/${id}?uid=user_bangladesh_01`, {
      method: 'DELETE',
    }).catch(e => console.warn('Delete favorite meal error:', e));
  };

  const exportDataJSON = () => {
    const data = {
      userProfile,
      foodLogs,
      growthMeasurements,
      hydrationLogs,
      plannedMeals,
      habits,
      favoriteMeals,
      exportedAt: new Date().toISOString(),
      app: 'Pusty & Briddhi Nutrition Intelligence Engine',
      database: 'Cloud SQL PostgreSQL Permanent Storage',
    };
    return JSON.stringify(data, null, 2);
  };

  const exportDataCSV = () => {
    let csv = 'Type,ID,Date,MealType,MealGroup,FoodName,QuantityGrams,Calories,Protein,Carbs,Fat\n';
    foodLogs.forEach(l => {
      csv += `FoodLog,${l.id},${l.date},${l.mealType},"${l.mealGroupName || ''}","${l.foodName}",${l.quantityGrams},${l.nutrients.calories},${l.nutrients.protein},${l.nutrients.carbs},${l.nutrients.fat}\n`;
    });
    return csv;
  };

  const importDataJSON = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.userProfile) setUserProfile(parsed.userProfile);
      if (parsed.foodLogs) setFoodLogs(parsed.foodLogs);
      if (parsed.growthMeasurements) setGrowthMeasurements(parsed.growthMeasurements);
      if (parsed.hydrationLogs) setHydrationLogs(parsed.hydrationLogs);
      if (parsed.plannedMeals) setPlannedMeals(parsed.plannedMeals);
      if (parsed.habits) setHabits(parsed.habits);
      if (parsed.favoriteMeals) setFavoriteMeals(parsed.favoriteMeals);

      // Persist the whole imported dataset into Cloud SQL PostgreSQL immediately
      fetch('/api/sync?uid=user_bangladesh_01', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      }).then(() => syncNow()).catch(e => console.warn('Import DB sync error:', e));

      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  const resetToDefault = () => {
    setUserProfile(defaultProfile);
    setFoodLogs(initialFoodLogs);
    setGrowthMeasurements(initialGrowthMeasurements);
    setHydrationLogs({ [todayStr]: 0 });
    setPlannedMeals([]);
    setHabits(initialHabits);
    setFavoriteMeals(initialFavoriteMeals);
    localStorage.clear();
    syncNow();
  };

  return (
    <AppContext.Provider
      value={{
        userProfile,
        updateUserProfile,
        foodLogs,
        addFoodLog,
        deleteFoodLog,
        updateFoodLog,
        addCompleteMeal,
        deleteMealGroup,
        growthMeasurements,
        addGrowthMeasurement,
        deleteGrowthMeasurement,
        hydrationLogs,
        addWaterMl,
        removeWaterMl,
        plannedMeals,
        addPlannedMeal,
        confirmPlannedMealAsEaten,
        deletePlannedMeal,
        habits,
        toggleHabit,
        addHabit,
        updateHabit,
        deleteHabit,
        favoriteMeals,
        addFavoriteMeal,
        deleteFavoriteMeal,
        activeTab,
        setActiveTab,
        selectedDate,
        setSelectedDate,
        goToPreviousDay,
        goToNextDay,
        goToToday,
        clearAllFoodLogs,
        exportDataJSON,
        exportDataCSV,
        importDataJSON,
        resetToDefault,
        dbStatus,
        syncNow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
