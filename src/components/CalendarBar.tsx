import React from 'react';
import { useApp } from '../context/AppContext';
import { getTodayDateString } from '../utils/calculations';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';

export function CalendarBar() {
  const { 
    selectedDate, 
    setSelectedDate, 
    goToPreviousDay, 
    goToNextDay, 
    goToToday, 
    foodLogs,
    setActiveTab
  } = useApp();

  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;

  // Calculate relative day description
  const getRelativeDayLabel = () => {
    const today = new Date(todayStr + 'T12:00:00');
    const selected = new Date(selectedDate + 'T12:00:00');
    const diffTime = selected.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 0) return { label: 'Today', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (diffDays === -1) return { label: 'Yesterday', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (diffDays === 1) return { label: 'Tomorrow', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (diffDays < -1) return { label: `${Math.abs(diffDays)} days ago`, color: 'bg-stone-100 text-stone-700 border-stone-300' };
    return { label: `In ${diffDays} days`, color: 'bg-purple-100 text-purple-800 border-purple-300' };
  };

  const dayInfo = getRelativeDayLabel();

  // Format date nicely (e.g. "Monday, Oct 12, 2026")
  const formatDateFriendly = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const logsForSelectedDate = foodLogs.filter(l => l.date === selectedDate);
  const totalCalories = logsForSelectedDate.reduce((sum, item) => sum + (item.nutrients?.calories || 0), 0);

  return (
    <div className="bg-white border-y border-stone-200/90 shadow-2xs px-4 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Navigation and Date Picker */}
        <div className="flex items-center space-x-2 sm:space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-1.5 text-stone-700">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CalendarIcon className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-stone-900 hidden sm:inline">Active Date:</span>
          </div>

          {/* Previous Day Button */}
          <button
            onClick={goToPreviousDay}
            title="Previous Day"
            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors border border-stone-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Date Picker Input Container */}
          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={e => e.target.value && setSelectedDate(e.target.value)}
              className="bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
            />
          </div>

          {/* Next Day Button */}
          <button
            onClick={goToNextDay}
            title="Next Day"
            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors border border-stone-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Today Button (quick return) */}
          {!isToday && (
            <button
              onClick={goToToday}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold transition-colors flex items-center space-x-1 shadow-2xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Go to Today</span>
            </button>
          )}

          {/* Relative Badge */}
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${dayInfo.color} hidden sm:inline-flex items-center`}>
            {dayInfo.label}
          </span>
        </div>

        {/* Right: Summary for this date & Quick Add */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end text-xs">
          <div className="flex items-center space-x-2 text-stone-600">
            <span className="font-medium text-stone-500">
              {formatDateFriendly(selectedDate)}:
            </span>
            {logsForSelectedDate.length === 0 ? (
              <span className="inline-flex items-center space-x-1 text-stone-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>0 meals logged</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{logsForSelectedDate.length} item{logsForSelectedDate.length > 1 ? 's' : ''} ({totalCalories} kcal)</span>
              </span>
            )}
          </div>

          <button
            onClick={() => setActiveTab('food-log')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Food on this Date</span>
          </button>
        </div>
      </div>
    </div>
  );
}
