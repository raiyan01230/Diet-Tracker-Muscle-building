import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, FoodLogItem, GrowthMeasurement, HydrationLog, PlannedMealItem } from '../types';
import { getTodayDateString } from '../utils/calculations';

interface AppContextType {
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  foodLogs: FoodLogItem[];
  addFoodLog: (log: Omit<FoodLogItem, 'id' | 'userId' | 'timestamp'>) => void;
  deleteFoodLog: (id: string) => void;
  updateFoodLog: (id: string, log: Partial<FoodLogItem>) => void;
  growthMeasurements: GrowthMeasurement[];
  addGrowthMeasurement: (m: Omit<GrowthMeasurement, 'id' | 'userId'>) => void;
  deleteGrowthMeasurement: (id: string) => void;
  hydrationLogs: Record<string, number>; // date -> water ml
  addWaterMl: (date: string, ml: number) => void;
  removeWaterMl: (date: string, ml: number) => void;
  plannedMeals: PlannedMealItem[];
  addPlannedMeal: (meal: Omit<PlannedMealItem, 'id'>) => void;
  confirmPlannedMealAsEaten: (plannedId: string, date: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
  deletePlannedMeal: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  exportDataJSON: () => string;
  exportDataCSV: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  resetToDefault: () => void;
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
    return saved ? JSON.parse(saved) : { [todayStr]: 750 }; // 3 glasses default
  });

  const [plannedMeals, setPlannedMeals] = useState<PlannedMealItem[]>(() => {
    const saved = localStorage.getItem('pusty_planned_meals');
    return saved ? JSON.parse(saved) : [
      {
        id: 'pm_1',
        title: 'Morning Banana Habit',
        mealType: 'breakfast',
        foodName: 'Fresh Banana (Kola)',
        grams: 118,
        nutrients: {
          calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fibre: 3.1,
          vitamins: { a: 3, c: 8.7, d: 0, e: 0.1, k: 0.5, b1: 0.03, b2: 0.07, b3: 0.7, b5: 0.3, b6: 0.4, b7: 0.5, b9: 24, b12: 0, choline: 11 },
          minerals: { calcium: 6, iron: 0.3, zinc: 0.2, magnesium: 27, phosphorus: 22, iodine: 1, selenium: 1, copper: 0.1, potassium: 358, sodium: 1, manganese: 0.3, chromium: 0.1, molybdenum: 2 }
        },
        source: 'USDA / FAO 2013',
        gapsAddressed: ['Potassium', 'Vitamin B6', 'Dietary Fibre'],
      }
    ];
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

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

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profile }));
  };

  const addFoodLog = (log: Omit<FoodLogItem, 'id' | 'userId' | 'timestamp'>) => {
    const newItem: FoodLogItem = {
      ...log,
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      userId: userProfile.id,
      timestamp: Date.now(),
    };
    setFoodLogs(prev => [newItem, ...prev]);
  };

  const deleteFoodLog = (id: string) => {
    setFoodLogs(prev => prev.filter(item => item.id !== id));
  };

  const updateFoodLog = (id: string, updatedFields: Partial<FoodLogItem>) => {
    setFoodLogs(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updatedFields } : item))
    );
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
  };

  const deleteGrowthMeasurement = (id: string) => {
    setGrowthMeasurements(prev => prev.filter(item => item.id !== id));
  };

  const addWaterMl = (date: string, ml: number) => {
    setHydrationLogs(prev => ({
      ...prev,
      [date]: (prev[date] || 0) + ml
    }));
  };

  const removeWaterMl = (date: string, ml: number) => {
    setHydrationLogs(prev => ({
      ...prev,
      [date]: Math.max(0, (prev[date] || 0) - ml)
    }));
  };

  const addPlannedMeal = (meal: Omit<PlannedMealItem, 'id'>) => {
    const newMeal: PlannedMealItem = {
      ...meal,
      id: 'pm_' + Math.random().toString(36).substring(2, 9),
    };
    setPlannedMeals(prev => [newMeal, ...prev]);
  };

  const confirmPlannedMealAsEaten = (plannedId: string, date: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const meal = plannedMeals.find(p => p.id === plannedId);
    if (!meal) return;

    addFoodLog({
      date,
      mealType,
      foodName: meal.foodName,
      preparationState: 'raw',
      quantityGrams: meal.grams,
      portionDescription: `${meal.grams}g (Confirmed from Routine Plan)`,
      source: meal.source,
      nutrients: meal.nutrients,
    });
  };

  const deletePlannedMeal = (id: string) => {
    setPlannedMeals(prev => prev.filter(p => p.id !== id));
  };

  const exportDataJSON = () => {
    const data = {
      userProfile,
      foodLogs,
      growthMeasurements,
      hydrationLogs,
      plannedMeals,
      exportedAt: new Date().toISOString(),
      app: 'Pusty & Briddhi Nutrition Intelligence Engine',
    };
    return JSON.stringify(data, null, 2);
  };

  const exportDataCSV = () => {
    let csv = 'Type,ID,Date,MealType,FoodName,QuantityGrams,Calories,Protein,Carbs,Fat\n';
    foodLogs.forEach(l => {
      csv += `FoodLog,${l.id},${l.date},${l.mealType},"${l.foodName}",${l.quantityGrams},${l.nutrients.calories},${l.nutrients.protein},${l.nutrients.carbs},${l.nutrients.fat}\n`;
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
    localStorage.clear();
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
        activeTab,
        setActiveTab,
        exportDataJSON,
        exportDataCSV,
        importDataJSON,
        resetToDefault,
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
