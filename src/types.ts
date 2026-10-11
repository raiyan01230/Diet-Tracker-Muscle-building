export type ActivityLevel = 'inactive' | 'low_active' | 'active' | 'very_active';
export type ReferenceSex = 'male' | 'female';

export interface UserProfile {
  id: string;
  name: string;
  age: number; // e.g., 16
  referenceSex: ReferenceSex;
  heightCm: number; // e.g., 167.64
  weightKg: number; // e.g., 55.65
  activityLevel: ActivityLevel;
  country: string; // Bangladesh
  timezone: string; // Asia/Dhaka
  allergies: string[];
  preferences: string[];
  glassVolumeMl: number; // e.g., 250
}

export interface NutrientValues {
  calories: number; // kcal
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fibre: number; // g
  vitamins: {
    a: number; // mcg RAE
    c: number; // mg
    d: number; // mcg
    e: number; // mg
    k: number; // mcg
    b1: number; // mg
    b2: number; // mg
    b3: number; // mg NE
    b5: number; // mg
    b6: number; // mg
    b7: number; // mcg
    b9: number; // mcg DFE
    b12: number; // mcg
    choline: number; // mg
  };
  minerals: {
    calcium: number; // mg
    iron: number; // mg
    zinc: number; // mg
    magnesium: number; // mg
    phosphorus: number; // mg
    iodine: number; // mcg
    selenium: number; // mcg
    copper: number; // mg
    potassium: number; // mg
    sodium: number; // mg
    manganese: number; // mg
    chromium: number; // mcg
    molybdenum: number; // mcg
  };
}

export interface PortionOption {
  label: string;
  grams: number;
  description?: string;
}

export type FoodCategory = 
  | 'Cereals & Grains' 
  | 'Lentils & Pulses' 
  | 'Fish & Meat' 
  | 'Eggs & Dairy' 
  | 'Fruits' 
  | 'Vegetables' 
  | 'Nuts & Seeds' 
  | 'Prepared & Snacks' 
  | 'Beverages' 
  | 'Special Foods & Eating Out';

export interface FoodItem {
  id: string;
  nameEn: string;
  nameBn: string;
  banglish: string[];
  category: FoodCategory;
  source: 'FAO Bangladesh (2013)' | 'USDA FoodData Central' | 'User Recipe' | 'Package Label';
  sourceUrl: string;
  preparationState: 'raw' | 'cooked';
  ediblePortionPercent: number;
  per100g: NutrientValues;
  standardPortions: PortionOption[];
  isVerified?: boolean;
}

export interface FoodLogItem {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'routine_confirmed';
  foodItemId?: string;
  foodName: string;
  preparationState: 'raw' | 'cooked';
  quantityGrams: number;
  portionDescription: string;
  source: string;
  nutrients: NutrientValues;
  timestamp: number;
  mealGroupId?: string;
  mealGroupName?: string;
}

export interface PlannedMealItem {
  id: string;
  title: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  foodItemId?: string;
  grams: number;
  nutrients: NutrientValues;
  source: string;
  gapsAddressed: string[];
}

export interface HabitItem {
  id: string;
  title: string;
  titleBn: string;
  category: 'nutrition' | 'hydration' | 'routine' | 'wellness';
  enabled: boolean;
  completedDates: string[]; // List of YYYY-MM-DD
  order: number;
  reminderTime?: string; // e.g. "08:00 AM"
}

export interface FavoriteMealComponent {
  foodItemId: string;
  foodName: string;
  quantityGrams: number;
  portionLabel?: string;
}

export interface FavoriteMealTemplate {
  id: string;
  name: string;
  components: FavoriteMealComponent[];
  waterMl?: number;
}

export interface HydrationLog {
  date: string; // YYYY-MM-DD
  waterMl: number;
  glassesCount: number;
}

export interface GrowthMeasurement {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  heightCm: number;
  weightKg: number;
  notes?: string;
}

export interface NutrientReference {
  ageRange: string;
  sex: ReferenceSex;
  rdas: {
    protein: number;
    carbs: number;
    fibre: number;
    vitamins: { [key: string]: { amount: number; unit: string; type: 'RDA' | 'AI'; functionDesc?: string } };
    minerals: { [key: string]: { amount: number; unit: string; type: 'RDA' | 'AI'; functionDesc?: string } };
  };
  upperLimits: {
    vitamins: { [key: string]: { amount: number; unit: string; scope?: string } };
    minerals: { [key: string]: { amount: number; unit: string; scope?: string } };
  };
}
