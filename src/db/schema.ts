import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, real, jsonb, boolean, bigint } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Unique identifier e.g. user_bangladesh_01
  email: text('email').default('raiyan@pusty-bd.app'),
  name: text('name').notNull().default('Raiyan Ahmed'),
  age: integer('age').notNull().default(16),
  referenceSex: text('reference_sex').notNull().default('male'),
  heightCm: real('height_cm').notNull().default(167.64),
  weightKg: real('weight_kg').notNull().default(55.65),
  activityLevel: text('activity_level').notNull().default('low_active'),
  country: text('country').notNull().default('Bangladesh'),
  timezone: text('timezone').notNull().default('Asia/Dhaka'),
  allergies: jsonb('allergies').$type<string[]>().default([]),
  preferences: jsonb('preferences').$type<string[]>().default(['Traditional Bengali', 'Halal']),
  glassVolumeMl: integer('glass_volume_ml').notNull().default(250),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const foodLogs = pgTable('food_logs', {
  id: serial('id').primaryKey(),
  logId: text('log_id').notNull().unique(), // Client unique id: log_xxx
  userUid: text('user_uid').notNull().default('user_bangladesh_01'),
  date: text('date').notNull(), // YYYY-MM-DD
  mealType: text('meal_type').notNull(), // breakfast, lunch, dinner, snack
  mealGroupId: text('meal_group_id'),
  mealGroupName: text('meal_group_name'),
  foodItemId: text('food_item_id'),
  foodName: text('food_name').notNull(),
  preparationState: text('preparation_state').notNull().default('cooked'), // raw, cooked
  quantityGrams: real('quantity_grams').notNull(),
  portionDescription: text('portion_description').notNull(),
  source: text('source').notNull().default('FAO Bangladesh (2013)'),
  nutrients: jsonb('nutrients').notNull(),
  timestamp: bigint('timestamp', { mode: 'number' }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const growthMeasurements = pgTable('growth_measurements', {
  id: serial('id').primaryKey(),
  measurementId: text('measurement_id').notNull().unique(), // Client unique id: g_xxx
  userUid: text('user_uid').notNull().default('user_bangladesh_01'),
  date: text('date').notNull(),
  heightCm: real('height_cm').notNull(),
  weightKg: real('weight_kg').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const hydrationLogs = pgTable('hydration_logs', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull().default('user_bangladesh_01'),
  date: text('date').notNull(), // YYYY-MM-DD
  waterMl: integer('water_ml').notNull().default(0),
  targetMl: integer('target_ml').notNull().default(2500),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const plannedMeals = pgTable('planned_meals', {
  id: serial('id').primaryKey(),
  plannedId: text('planned_id').notNull().unique(), // Client unique id: pm_xxx
  userUid: text('user_uid').notNull().default('user_bangladesh_01'),
  title: text('title').notNull(),
  mealType: text('meal_type').notNull(),
  foodItemId: text('food_item_id'),
  foodName: text('food_name').notNull(),
  grams: real('grams').notNull(),
  nutrients: jsonb('nutrients').notNull(),
  source: text('source').notNull().default('FAO Bangladesh (2013)'),
  gapsAddressed: jsonb('gaps_addressed').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

export const habits = pgTable('habits', {
  id: serial('id').primaryKey(),
  habitId: text('habit_id').notNull().unique(), // Client unique id: h_xxx
  userUid: text('user_uid').notNull().default('user_bangladesh_01'),
  title: text('title').notNull(),
  titleBn: text('title_bn'),
  category: text('category').notNull(), // routine, nutrition, hydration, wellness
  enabled: boolean('enabled').notNull().default(true),
  completedDates: jsonb('completed_dates').$type<string[]>().notNull().default([]),
  habitOrder: integer('habit_order').notNull().default(1),
  reminderTime: text('reminder_time'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const favoriteMeals = pgTable('favorite_meals', {
  id: serial('id').primaryKey(),
  favoriteId: text('favorite_id').notNull().unique(), // Client unique id: fav_xxx
  userUid: text('user_uid').notNull().default('user_bangladesh_01'),
  name: text('name').notNull(),
  waterMl: integer('water_ml').notNull().default(0),
  components: jsonb('components').notNull(), // Array of meal components
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  foodLogs: many(foodLogs),
  growthMeasurements: many(growthMeasurements),
  hydrationLogs: many(hydrationLogs),
  plannedMeals: many(plannedMeals),
  habits: many(habits),
  favoriteMeals: many(favoriteMeals),
}));
