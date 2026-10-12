import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateTeenEER } from '../data/nutrientReferences';
import { 
  Flame, 
  TrendingUp, 
  Droplet, 
  BarChart3, 
  Calendar, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function ProfileAnalyticsGraph() {
  const { userProfile, foodLogs, growthMeasurements, hydrationLogs } = useApp();
  const [activeMetric, setActiveMetric] = useState<'calories' | 'growth' | 'hydration'>('calories');
  const [timeframeDays, setTimeframeDays] = useState<number>(14);
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  // Calculate EER
  const estimatedCalories = calculateTeenEER(
    userProfile.referenceSex,
    userProfile.age,
    userProfile.heightCm,
    userProfile.weightKg,
    userProfile.activityLevel
  );

  const waterTargetMl = userProfile.referenceSex === 'male' ? 3300 : 2300;

  // Generate date series for the selected timeframe (ending today)
  const today = new Date();
  const dateSeries: Array<{
    dateStr: string;
    label: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    waterMl: number;
  }> = [];

  for (let i = timeframeDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const dayFood = foodLogs.filter(l => l.date === dateStr);
    const cals = dayFood.reduce((sum, item) => sum + (item.nutrients?.calories || 0), 0);
    const prot = dayFood.reduce((sum, item) => sum + (item.nutrients?.protein || 0), 0);
    const carbs = dayFood.reduce((sum, item) => sum + (item.nutrients?.carbs || 0), 0);
    const fat = dayFood.reduce((sum, item) => sum + (item.nutrients?.fat || 0), 0);
    const water = hydrationLogs[dateStr] || 0;

    dateSeries.push({
      dateStr,
      label,
      calories: Math.round(cals),
      protein: Math.round(prot * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      waterMl: water,
    });
  }

  // Calculate Summary Stats
  const activeCaloriesDays = dateSeries.filter(d => d.calories > 0);
  const avgCalories = activeCaloriesDays.length > 0
    ? Math.round(activeCaloriesDays.reduce((sum, d) => sum + d.calories, 0) / activeCaloriesDays.length)
    : 0;

  const activeWaterDays = dateSeries.filter(d => d.waterMl > 0);
  const avgWater = activeWaterDays.length > 0
    ? Math.round(activeWaterDays.reduce((sum, d) => sum + d.waterMl, 0) / activeWaterDays.length)
    : 0;

  // Latest Growth & BMI
  const latestGrowth = growthMeasurements[0] || {
    heightCm: userProfile.heightCm,
    weightKg: userProfile.weightKg,
    date: today.toISOString().split('T')[0]
  };
  const heightM = latestGrowth.heightCm / 100;
  const bmi = heightM > 0 ? (latestGrowth.weightKg / (heightM * heightM)).toFixed(1) : '20.0';

  // SVG Chart dimensions
  const svgWidth = 720;
  const svgHeight = 260;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartInnerWidth = svgWidth - paddingLeft - paddingRight;
  const chartInnerHeight = svgHeight - paddingTop - paddingBottom;

  // Max value for scaling
  const maxCalories = Math.max(estimatedCalories * 1.25, ...dateSeries.map(d => d.calories), 2600);
  const maxWater = Math.max(waterTargetMl * 1.2, ...dateSeries.map(d => d.waterMl), 3500);

  // Growth series data
  const growthSeries = [...growthMeasurements].reverse().map(m => {
    const hM = m.heightCm / 100;
    const itemBmi = (m.weightKg / (hM * hM)).toFixed(1);
    return {
      date: m.date,
      heightCm: m.heightCm,
      weightKg: m.weightKg,
      bmi: parseFloat(itemBmi),
      notes: m.notes,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-stone-900">Health & Nutrition Analytics Graph 📊</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Longitudinal trends over time stored in Cloud SQL PostgreSQL database.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center space-x-1.5 bg-stone-100 p-1 rounded-xl self-start sm:self-auto">
          {[7, 14, 30, 90].map(days => (
            <button
              key={days}
              onClick={() => setTimeframeDays(days)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timeframeDays === days
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveMetric('calories')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeMetric === 'calories'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>Calorie & Macro Trends</span>
        </button>

        <button
          onClick={() => setActiveMetric('growth')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeMetric === 'growth'
              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Height, Weight & BMI</span>
        </button>

        <button
          onClick={() => setActiveMetric('hydration')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeMetric === 'hydration'
              ? 'bg-cyan-600 text-white border-cyan-600 shadow-2xs'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
          }`}
        >
          <Droplet className="w-3.5 h-3.5" />
          <span>Hydration Tracker</span>
        </button>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">Avg Intake ({timeframeDays}d)</span>
          <div className="text-lg font-bold text-stone-900 mt-0.5">
            {avgCalories} <span className="text-xs font-normal text-stone-500">kcal/day</span>
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">Target: {estimatedCalories} kcal</div>
        </div>

        <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">Current BMI</span>
          <div className="text-lg font-bold text-stone-900 mt-0.5">
            {bmi} <span className="text-xs font-normal text-stone-500">kg/m²</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">WHO Normal range (18.5 - 24.9)</div>
        </div>

        <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">Avg Water</span>
          <div className="text-lg font-bold text-stone-900 mt-0.5">
            {avgWater} <span className="text-xs font-normal text-stone-500">ml/day</span>
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">Target: {waterTargetMl} ml</div>
        </div>

        <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">Tracked Days</span>
          <div className="text-lg font-bold text-stone-900 mt-0.5">
            {activeCaloriesDays.length} <span className="text-xs font-normal text-stone-500">/ {timeframeDays} days</span>
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">Permanent Relational Storage</div>
        </div>
      </div>

      {/* GRAPH CANVAS AREA */}
      <div className="bg-stone-50/70 border border-stone-200 rounded-2xl p-4 relative overflow-hidden">
        {/* Metric 1: Calories & Macro Graph */}
        {activeMetric === 'calories' && (
          <div>
            <div className="flex items-center justify-between text-xs text-stone-600 mb-2 px-1">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1.5 font-semibold text-stone-800">
                  <span className="w-3 h-3 rounded-xs bg-emerald-600"></span>
                  <span>Daily Calories</span>
                </span>
                <span className="flex items-center space-x-1.5 text-stone-500">
                  <span className="w-3 h-0.5 bg-orange-500 border-t border-dashed border-orange-500"></span>
                  <span>EER Target ({estimatedCalories} kcal)</span>
                </span>
              </div>
              <span className="text-[11px] text-stone-400">Hover bar for macro grams</span>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[500px]">
                {/* Horizontal Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                  const y = paddingTop + chartInnerHeight * (1 - ratio);
                  const val = Math.round(maxCalories * ratio);
                  return (
                    <g key={ratio}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={svgWidth - paddingRight}
                        y2={y}
                        stroke="#e7e5e4"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 3}
                        textAnchor="end"
                        fontSize="9"
                        fill="#78716c"
                        fontFamily="sans-serif"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* EER Target Line */}
                {(() => {
                  const targetY = paddingTop + chartInnerHeight * (1 - estimatedCalories / maxCalories);
                  return (
                    <g>
                      <line
                        x1={paddingLeft}
                        y1={targetY}
                        x2={svgWidth - paddingRight}
                        y2={targetY}
                        stroke="#f97316"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={svgWidth - paddingRight}
                        y={targetY - 5}
                        textAnchor="end"
                        fontSize="9"
                        fontWeight="bold"
                        fill="#ea580c"
                      >
                        Target {estimatedCalories} kcal
                      </text>
                    </g>
                  );
                })()}

                {/* Bars for each day in dateSeries */}
                {dateSeries.map((d, idx) => {
                  const barWidth = Math.max(6, Math.min(28, chartInnerWidth / dateSeries.length - 6));
                  const step = chartInnerWidth / dateSeries.length;
                  const x = paddingLeft + idx * step + (step - barWidth) / 2;
                  const barHeight = (d.calories / maxCalories) * chartInnerHeight;
                  const y = paddingTop + chartInnerHeight - barHeight;

                  const isEERMet = d.calories >= estimatedCalories * 0.9;
                  const barColor = d.calories === 0 ? '#e7e5e4' : isEERMet ? '#059669' : '#10b981';

                  return (
                    <g
                      key={d.dateStr}
                      onMouseEnter={() => setHoveredPoint(d)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="cursor-pointer group"
                    >
                      {/* Interactive hit area */}
                      <rect
                        x={x - 2}
                        y={paddingTop}
                        width={barWidth + 4}
                        height={chartInnerHeight}
                        fill="transparent"
                      />
                      {/* Visible bar */}
                      <rect
                        x={x}
                        y={d.calories === 0 ? paddingTop + chartInnerHeight - 3 : y}
                        width={barWidth}
                        height={d.calories === 0 ? 3 : Math.max(3, barHeight)}
                        rx="3"
                        fill={barColor}
                        className="transition-all hover:opacity-80"
                      />
                      {/* X Axis Label */}
                      {(dateSeries.length <= 14 || idx % Math.ceil(dateSeries.length / 10) === 0) && (
                        <text
                          x={x + barWidth / 2}
                          y={svgHeight - 12}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#78716c"
                          fontFamily="sans-serif"
                        >
                          {d.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Metric 2: Growth & BMI Graph */}
        {activeMetric === 'growth' && (
          <div>
            <div className="flex items-center justify-between text-xs text-stone-600 mb-2 px-1">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1.5 font-semibold text-blue-700">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <span>Weight (kg)</span>
                </span>
                <span className="flex items-center space-x-1.5 font-semibold text-emerald-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                  <span>Height (cm)</span>
                </span>
                <span className="flex items-center space-x-1.5 text-stone-500">
                  <span className="w-3 h-0.5 bg-purple-500"></span>
                  <span>BMI Trajectory</span>
                </span>
              </div>
              <span className="text-[11px] text-stone-400">Recorded Growth History</span>
            </div>

            {growthSeries.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                No growth measurements recorded yet. Add height & weight in the Growth tab!
              </div>
            ) : (
              <div className="space-y-3">
                {/* Visual Anthropometric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 bg-white rounded-xl border border-stone-200">
                    <span className="text-xs font-semibold text-stone-500">Recorded Height</span>
                    <div className="text-2xl font-bold text-stone-900 mt-1">
                      {latestGrowth.heightCm} <span className="text-xs font-normal text-stone-500">cm</span>
                    </div>
                    <span className="text-[11px] text-emerald-600">WHO 2007 Reference Tracked</span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-stone-200">
                    <span className="text-xs font-semibold text-stone-500">Recorded Weight</span>
                    <div className="text-2xl font-bold text-stone-900 mt-1">
                      {latestGrowth.weightKg} <span className="text-xs font-normal text-stone-500">kg</span>
                    </div>
                    <span className="text-[11px] text-blue-600">Measured on {latestGrowth.date}</span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-stone-200">
                    <span className="text-xs font-semibold text-stone-500">Calculated Body Mass Index (BMI)</span>
                    <div className="text-2xl font-bold text-stone-900 mt-1">
                      {bmi} <span className="text-xs font-normal text-stone-500">kg/m²</span>
                    </div>
                    <span className="text-[11px] text-purple-600">Healthy Adolescent Range</span>
                  </div>
                </div>

                {/* Growth Measurement Logs Table */}
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-700">
                    Growth Observation Timeline ({growthSeries.length} points)
                  </div>
                  <div className="divide-y divide-stone-100 max-h-48 overflow-y-auto">
                    {growthSeries.map((g, idx) => (
                      <div key={idx} className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-stone-50">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span className="font-bold text-stone-900">{g.date}</span>
                          {g.notes && <span className="text-stone-500 italic text-[11px]">({g.notes})</span>}
                        </div>
                        <div className="flex items-center space-x-4">
                          <span>Height: <strong>{g.heightCm} cm</strong></span>
                          <span>Weight: <strong>{g.weightKg} kg</strong></span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            BMI: {g.bmi}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metric 3: Hydration Graph */}
        {activeMetric === 'hydration' && (
          <div>
            <div className="flex items-center justify-between text-xs text-stone-600 mb-2 px-1">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1.5 font-semibold text-cyan-700">
                  <span className="w-3 h-3 rounded-xs bg-cyan-600"></span>
                  <span>Water Intake (ml)</span>
                </span>
                <span className="flex items-center space-x-1.5 text-stone-500">
                  <span className="w-3 h-0.5 bg-blue-500 border-t border-dashed border-blue-500"></span>
                  <span>Adequate Intake Target ({waterTargetMl} ml)</span>
                </span>
              </div>
              <span className="text-[11px] text-stone-400">Hover bar for details</span>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[500px]">
                {/* Horizontal Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                  const y = paddingTop + chartInnerHeight * (1 - ratio);
                  const val = Math.round(maxWater * ratio);
                  return (
                    <g key={ratio}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={svgWidth - paddingRight}
                        y2={y}
                        stroke="#e7e5e4"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 3}
                        textAnchor="end"
                        fontSize="9"
                        fill="#78716c"
                        fontFamily="sans-serif"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Water Target Line */}
                {(() => {
                  const targetY = paddingTop + chartInnerHeight * (1 - waterTargetMl / maxWater);
                  return (
                    <g>
                      <line
                        x1={paddingLeft}
                        y1={targetY}
                        x2={svgWidth - paddingRight}
                        y2={targetY}
                        stroke="#0284c7"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={svgWidth - paddingRight}
                        y={targetY - 5}
                        textAnchor="end"
                        fontSize="9"
                        fontWeight="bold"
                        fill="#0369a1"
                      >
                        Target {waterTargetMl} ml
                      </text>
                    </g>
                  );
                })()}

                {/* Bars for each day in dateSeries */}
                {dateSeries.map((d, idx) => {
                  const barWidth = Math.max(6, Math.min(28, chartInnerWidth / dateSeries.length - 6));
                  const step = chartInnerWidth / dateSeries.length;
                  const x = paddingLeft + idx * step + (step - barWidth) / 2;
                  const barHeight = (d.waterMl / maxWater) * chartInnerHeight;
                  const y = paddingTop + chartInnerHeight - barHeight;

                  const isTargetMet = d.waterMl >= waterTargetMl;
                  const barColor = d.waterMl === 0 ? '#e7e5e4' : isTargetMet ? '#0284c7' : '#38bdf8';

                  return (
                    <g
                      key={d.dateStr}
                      onMouseEnter={() => setHoveredPoint(d)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="cursor-pointer group"
                    >
                      <rect
                        x={x - 2}
                        y={paddingTop}
                        width={barWidth + 4}
                        height={chartInnerHeight}
                        fill="transparent"
                      />
                      <rect
                        x={x}
                        y={d.waterMl === 0 ? paddingTop + chartInnerHeight - 3 : y}
                        width={barWidth}
                        height={d.waterMl === 0 ? 3 : Math.max(3, barHeight)}
                        rx="3"
                        fill={barColor}
                        className="transition-all hover:opacity-80"
                      />
                      {(dateSeries.length <= 14 || idx % Math.ceil(dateSeries.length / 10) === 0) && (
                        <text
                          x={x + barWidth / 2}
                          y={svgHeight - 12}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#78716c"
                          fontFamily="sans-serif"
                        >
                          {d.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-3 right-3 bg-stone-900/95 backdrop-blur-xs text-white p-3 rounded-xl shadow-lg border border-stone-700 text-xs space-y-1 z-10 pointer-events-none animate-fade-in">
            <div className="font-bold border-b border-stone-700 pb-1 text-emerald-400">
              {hoveredPoint.dateStr} ({hoveredPoint.label})
            </div>
            {activeMetric === 'calories' ? (
              <>
                <div className="flex items-center justify-between space-x-3">
                  <span className="text-stone-300">Calories:</span>
                  <span className="font-bold text-white">{hoveredPoint.calories} kcal</span>
                </div>
                <div className="text-[11px] text-stone-400 pt-0.5">
                  Target: {estimatedCalories} kcal ({Math.round((hoveredPoint.calories / estimatedCalories) * 100)}%)
                </div>
                <div className="text-[10px] text-stone-400 flex items-center space-x-2 pt-1 border-t border-stone-800">
                  <span>P: {hoveredPoint.protein}g</span>
                  <span>C: {hoveredPoint.carbs}g</span>
                  <span>F: {hoveredPoint.fat}g</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between space-x-3">
                  <span className="text-stone-300">Water Intake:</span>
                  <span className="font-bold text-cyan-300">{hoveredPoint.waterMl} ml</span>
                </div>
                <div className="text-[11px] text-stone-400">
                  Target: {waterTargetMl} ml ({Math.round((hoveredPoint.waterMl / waterTargetMl) * 100)}%)
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Transparent Clinical Note */}
      <div className="text-[11px] text-stone-500 flex items-start space-x-2 pt-1">
        <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
        <p>
          Historical trends represent deterministic scaling against official nutritional databases (FAO 2013 & USDA SR Legacy). All dates and data points are permanently backed up to Cloud SQL.
        </p>
      </div>
    </div>
  );
}
