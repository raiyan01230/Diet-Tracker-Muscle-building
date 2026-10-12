import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTodayDateString } from '../utils/calculations';
import { foodDbService } from '../services/foodDatabase';
import { HabitItem } from '../types';
import { 
  Check, 
  Plus, 
  Trash2, 
  Edit2, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Calendar, 
  AlertCircle,
  X,
  Apple,
  UtensilsCrossed,
  Droplet,
  Moon,
  ChevronDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export function RoutinePlannerView() {
  const { 
    habits, 
    toggleHabit, 
    addHabit, 
    updateHabit, 
    deleteHabit, 
    plannedMeals, 
    addPlannedMeal, 
    confirmPlannedMealAsEaten, 
    deletePlannedMeal,
    userProfile,
    selectedDate
  } = useApp();

  const today = getTodayDateString();
  const activeDate = selectedDate || today;
  const isToday = activeDate === today;
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter or active habits
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
  const [isAddPlannedMealModalOpen, setIsAddPlannedMealModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitItem | null>(null);

  // New Habit form state
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitTitleBn, setNewHabitTitleBn] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<'routine' | 'nutrition' | 'hydration' | 'wellness'>('nutrition');
  const [newHabitReminder, setNewHabitReminder] = useState('09:00 AM');

  // New Planned Meal form state
  const [plannedTitle, setPlannedTitle] = useState('');
  const [plannedMealType, setPlannedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [plannedFoodId, setPlannedFoodId] = useState(foodDbService.getAllFoods()[0]?.id || 'bhaat_boiled');
  const [plannedGrams, setPlannedGrams] = useState(100);

  // Confirming meal modal state
  const [confirmingMealId, setConfirmingMealId] = useState<string | null>(null);
  const [actualEatenGrams, setActualEatenGrams] = useState<number>(100);

  // Last 7 days for completion history
  const last7Days = React.useMemo(() => {
    const days: { dateStr: string; label: string; dayName: string }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({
        dateStr,
        label: i === 0 ? 'Today' : dayName,
        dayName,
      });
    }
    return days;
  }, []);

  const handleToggle = (habit: HabitItem) => {
    toggleHabit(habit.id, activeDate);
    const wasCompleted = habit.completedDates.includes(activeDate);
    if (!wasCompleted) {
      setSuccessMsg(`Great job! Completed "${habit.title}" for ${isToday ? 'today' : activeDate}. Keep building positive routines! 🌟`);
    } else {
      setSuccessMsg(`Marked "${habit.title}" as pending for ${isToday ? 'today' : activeDate}.`);
    }
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSaveNewHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    addHabit({
      title: newHabitTitle.trim(),
      titleBn: newHabitTitleBn.trim() || newHabitTitle.trim(),
      category: newHabitCategory,
      enabled: true,
      reminderTime: newHabitReminder || undefined,
    });

    setSuccessMsg(`Added new custom habit: "${newHabitTitle}"!`);
    setIsAddHabitModalOpen(false);
    setNewHabitTitle('');
    setNewHabitTitleBn('');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSaveEditHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit) return;

    updateHabit(editingHabit.id, {
      title: editingHabit.title,
      titleBn: editingHabit.titleBn,
      reminderTime: editingHabit.reminderTime,
      enabled: editingHabit.enabled,
    });

    setEditingHabit(null);
    setSuccessMsg('Habit updated successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleStartConfirmMeal = (mealId: string, defaultGrams: number) => {
    setConfirmingMealId(mealId);
    setActualEatenGrams(defaultGrams);
  };

  const handleSaveConfirmedMeal = () => {
    if (!confirmingMealId) return;
    const meal = plannedMeals.find(p => p.id === confirmingMealId);
    if (!meal) return;

    confirmPlannedMealAsEaten(confirmingMealId, today, meal.mealType, actualEatenGrams);
    setSuccessMsg(`Confirmed "${meal.foodName}" (${actualEatenGrams}g) as eaten! Saved to your Daily Food Log.`);
    setConfirmingMealId(null);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleSaveNewPlannedMeal = (e: React.FormEvent) => {
    e.preventDefault();
    const food = foodDbService.getFoodById(plannedFoodId);
    if (!food) return;

    const factor = plannedGrams / 100;
    const nutrients = {
      calories: Math.round(food.per100g.calories * factor),
      protein: Math.round(food.per100g.protein * factor * 10) / 10,
      carbs: Math.round(food.per100g.carbs * factor * 10) / 10,
      fat: Math.round(food.per100g.fat * factor * 10) / 10,
      fibre: Math.round(food.per100g.fibre * factor * 10) / 10,
      vitamins: food.per100g.vitamins,
      minerals: food.per100g.minerals,
    };

    addPlannedMeal({
      title: plannedTitle.trim() || `${food.nameEn} (${plannedMealType})`,
      mealType: plannedMealType,
      foodItemId: food.id,
      foodName: `${food.nameEn} (${food.nameBn})`,
      grams: plannedGrams,
      nutrients,
      source: food.source,
      gapsAddressed: [food.category, `${food.per100g.calories} kcal baseline`],
    });

    setSuccessMsg(`Planned meal added: "${food.nameEn}"! It will not count until you confirm you ate it.`);
    setIsAddPlannedMealModalOpen(false);
    setPlannedTitle('');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const enabledHabits = habits.filter(h => h.enabled);
  const completedTodayCount = enabledHabits.filter(h => h.completedDates.includes(today)).length;
  const progressPercent = enabledHabits.length > 0 
    ? Math.round((completedTodayCount / enabledHabits.length) * 100) 
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold">Active Routine Items & Planned Meals 🍌</h1>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-400/20">
                Asia/Dhaka Local Time
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-1">
              Customizable daily habits checklist, reminders, and planned meals. Planned items never count as consumed until confirmed.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 shrink-0 text-center">
            <div className="text-[11px] text-emerald-200 font-medium">Today&apos;s Habits Progress</div>
            <div className="text-xl font-black text-white">{completedTodayCount} / {enabledHabits.length}</div>
            <div className="w-24 bg-white/20 h-1.5 rounded-full overflow-hidden mt-1 mx-auto">
              <div 
                className="bg-emerald-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>{successMsg}</span>
          </div>
        </div>
      )}

      {/* FEATURE 1: Customizable Daily Habits Section */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-stone-900">Customizable Daily Habits Checklist</h2>
              <span className="text-xs text-stone-400 font-medium">({enabledHabits.length} active)</span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Check off daily habits. Resets midnight Asia/Dhaka. Distinct from food calories and nutrient intake.
            </p>
          </div>

          <button
            onClick={() => setIsAddHabitModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Habit</span>
          </button>
        </div>

        {/* 7-Day Completion Header */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-3 py-1.5 bg-stone-50 rounded-lg text-[11px] font-semibold text-stone-500">
          <div className="col-span-6">Habit & Reminder</div>
          <div className="col-span-4 flex justify-between px-2 text-center">
            {last7Days.map(d => (
              <span key={d.dateStr} className={`w-6 ${d.dateStr === today ? 'text-emerald-700 font-bold' : ''}`}>
                {d.label}
              </span>
            ))}
          </div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Habits List */}
        <div className="space-y-2.5">
          {enabledHabits.map(habit => {
            const isDoneToday = habit.completedDates.includes(today);

            return (
              <div 
                key={habit.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isDoneToday 
                    ? 'bg-emerald-50/50 border-emerald-200/80' 
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex flex-col sm:grid sm:grid-cols-12 gap-3 items-start sm:items-center">
                  {/* Left: Checkbox & Name */}
                  <div className="sm:col-span-6 flex items-start space-x-3">
                    <button
                      onClick={() => handleToggle(habit)}
                      className="mt-0.5 shrink-0 text-stone-400 hover:text-emerald-600 transition-colors cursor-pointer"
                      title={isDoneToday ? 'Mark as incomplete' : 'Mark as completed today'}
                    >
                      {isDoneToday ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-300 hover:text-emerald-500" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold ${isDoneToday ? 'text-emerald-950 line-through text-stone-500' : 'text-stone-900'}`}>
                          {habit.title}
                        </span>
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                          {habit.titleBn}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-stone-400 mt-0.5">
                        <span className="capitalize">{habit.category}</span>
                        {habit.reminderTime && (
                          <span className="flex items-center space-x-1 text-stone-500 font-medium">
                            <span>•</span>
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>{habit.reminderTime}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: 7-Day History Dots */}
                  <div className="sm:col-span-4 w-full flex justify-between px-2 items-center">
                    {last7Days.map(d => {
                      const completed = habit.completedDates.includes(d.dateStr);
                      const isCurrent = d.dateStr === today;
                      return (
                        <div
                          key={d.dateStr}
                          title={`${d.dateStr}: ${completed ? 'Completed' : 'Missed'}`}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                            completed 
                              ? 'bg-emerald-600 text-white shadow-2xs' 
                              : isCurrent 
                                ? 'border-2 border-dashed border-stone-300 text-stone-400' 
                                : 'bg-stone-100 text-stone-300'
                          }`}
                        >
                          {completed ? '✓' : '·'}
                        </div>
                      );
                    })}
                  </div>

                  {/* Right: Actions */}
                  <div className="sm:col-span-2 w-full flex justify-end items-center space-x-1.5">
                    <button
                      onClick={() => setEditingHabit(habit)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Edit Habit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FEATURE 6: Planned Meals vs Actual Meals Section */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-stone-900">Planned Meals (পরিকল্পিত খাবার)</h2>
              <span className="text-xs text-stone-400 font-medium">({plannedMeals.length} planned)</span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Plan meals in advance (breakfast, school snacks, dinner, morning banana). Planned items do not count until confirmed.
            </p>
          </div>

          <button
            onClick={() => setIsAddPlannedMealModalOpen(true)}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Plan a Meal</span>
          </button>
        </div>

        {plannedMeals.length === 0 ? (
          <div className="text-center py-10 text-stone-400 text-xs">
            No planned meals right now. Click &quot;Plan a Meal&quot; to schedule breakfast, school snacks, or dinner.
          </div>
        ) : (
          <div className="space-y-3">
            {plannedMeals.map(meal => (
              <div 
                key={meal.id} 
                className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-stone-900 text-sm">{meal.title}</span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
                      {meal.mealType}
                    </span>
                    <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-medium">
                      Not yet consumed
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 mt-1">
                    Food: <strong>{meal.foodName}</strong> ({meal.grams}g planned) • Estimated: <strong>{meal.nutrients.calories} kcal</strong>, <strong>{meal.nutrients.protein}g protein</strong>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Source: {meal.source} • Gaps: {meal.gapsAddressed.join(', ')}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleStartConfirmMeal(meal.id, meal.grams)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>I Ate This Today</span>
                  </button>
                  <button
                    onClick={() => deletePlannedMeal(meal.id)}
                    className="px-3 py-2 bg-stone-200 hover:bg-red-50 hover:text-red-600 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirming Actual Portion Modal */}
      {confirmingMealId && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-sm">Confirm Actual Portion Eaten</h3>
              <button onClick={() => setConfirmingMealId(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Did you eat the planned amount, or a different portion? Adjust below before logging to your verified intake.
            </p>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Actual Quantity Consumed (grams)</label>
              <input
                type="number"
                min="1"
                value={actualEatenGrams}
                onChange={e => setActualEatenGrams(parseFloat(e.target.value) || 1)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-emerald-700 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setConfirmingMealId(null)}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveConfirmedMeal}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Confirm & Log to Intake
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Habit Modal */}
      {isAddHabitModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form onSubmit={handleSaveNewHabit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-sm">Add New Daily Habit</h3>
              <button type="button" onClick={() => setIsAddHabitModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Habit Title (English)</label>
              <input
                type="text"
                required
                value={newHabitTitle}
                onChange={e => setNewHabitTitle(e.target.value)}
                placeholder="e.g. Eat Green Vegetables at Lunch"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Habit Title (Bangla)</label>
              <input
                type="text"
                value={newHabitTitleBn}
                onChange={e => setNewHabitTitleBn(e.target.value)}
                placeholder="e.g. দুপুরে টাটকা শাকসবজি খাওয়া"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                <select
                  value={newHabitCategory}
                  onChange={e => setNewHabitCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none"
                >
                  <option value="nutrition">Nutrition</option>
                  <option value="routine">Routine</option>
                  <option value="hydration">Hydration</option>
                  <option value="wellness">Wellness</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Reminder Time</label>
                <input
                  type="text"
                  value={newHabitReminder}
                  onChange={e => setNewHabitReminder(e.target.value)}
                  placeholder="e.g. 01:30 PM"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsAddHabitModalOpen(false)}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Save Habit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Habit Modal */}
      {editingHabit && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form onSubmit={handleSaveEditHabit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-sm">Edit Habit</h3>
              <button type="button" onClick={() => setEditingHabit(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Title (English)</label>
              <input
                type="text"
                required
                value={editingHabit.title}
                onChange={e => setEditingHabit({ ...editingHabit, title: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Title (Bangla)</label>
              <input
                type="text"
                value={editingHabit.titleBn}
                onChange={e => setEditingHabit({ ...editingHabit, titleBn: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Reminder Time</label>
              <input
                type="text"
                value={editingHabit.reminderTime || ''}
                onChange={e => setEditingHabit({ ...editingHabit, reminderTime: e.target.value })}
                placeholder="e.g. 08:00 AM"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setEditingHabit(null)}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Update Habit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Planned Meal Modal */}
      {isAddPlannedMealModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form onSubmit={handleSaveNewPlannedMeal} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-sm">Plan a Meal in Advance</h3>
              <button type="button" onClick={() => setIsAddPlannedMealModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Plan Title (Optional)</label>
              <input
                type="text"
                value={plannedTitle}
                onChange={e => setPlannedTitle(e.target.value)}
                placeholder="e.g. Morning Banana Habit or Healthy School Tiffin"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Meal Target</label>
                <select
                  value={plannedMealType}
                  onChange={e => setPlannedMealType(e.target.value as any)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snack">School / Snack</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Planned Grams</label>
                <input
                  type="number"
                  min="1"
                  value={plannedGrams}
                  onChange={e => setPlannedGrams(parseFloat(e.target.value) || 100)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Select Food from Verified Catalog</label>
              <select
                value={plannedFoodId}
                onChange={e => setPlannedFoodId(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none"
              >
                {foodDbService.getAllFoods().map(food => (
                  <option key={food.id} value={food.id}>
                    {food.nameEn} ({food.nameBn}) - {food.per100g.calories} kcal/100g
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsAddPlannedMealModalOpen(false)}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Save Planned Meal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
