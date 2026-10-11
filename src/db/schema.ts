import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, real, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name').notNull(),
  age: integer('age').notNull().default(16),
  referenceSex: text('reference_sex').notNull().default('male'),
  heightCm: real('height_cm').notNull().default(167.64),
  weightKg: real('weight_kg').notNull().default(55.65),
  activityLevel: text('activity_level').notNull().default('low_active'),
  timezone: text('timezone').notNull().default('Asia/Dhaka'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const foodLogs = pgTable('food_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  mealType: text('meal_type').notNull(), // breakfast, lunch, dinner, snack
  foodItemId: text('food_item_id'),
  foodName: text('food_name').notNull(),
  preparationState: text('preparation_state').notNull(), // raw, cooked
  quantityGrams: real('quantity_grams').notNull(),
  portionDescription: text('portion_description').notNull(),
  source: text('source').notNull(),
  nutrients: jsonb('nutrients').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const growthMeasurements = pgTable('growth_measurements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  date: text('date').notNull(),
  heightCm: real('height_cm').notNull(),
  weightKg: real('weight_kg').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  foodLogs: many(foodLogs),
  growthMeasurements: many(growthMeasurements),
}));

export const foodLogsRelations = relations(foodLogs, ({ one }) => ({
  user: one(users, {
    fields: [foodLogs.userId],
    references: [users.id],
  }),
}));

export const growthRelations = relations(growthMeasurements, ({ one }) => ({
  user: one(users, {
    fields: [growthMeasurements.userId],
    references: [users.id],
  }),
}));
