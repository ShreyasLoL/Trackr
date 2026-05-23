import { useState, useMemo } from 'react'
import { useApp } from '../contexts/AppContext'
import { useGym } from '../contexts/GymContext'
import { useNutrition } from '../contexts/NutritionContext'
import { useCardio } from '../contexts/CardioContext'
import { useMacros } from '../hooks/useMacros'
import { useStreak } from '../hooks/useStreak'
import StatCard from '../components/StatCard'
import MacroBar from '../components/MacroBar'
import { todayKey, formatDate, getLast30Days, getLast7Days, getLast30DaysData } from '../utils/dateHelpers'
import { weightInUnit } from '../utils/calculations'
import {
  ComposedChart, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

export default function Dashboard() {
  const { profile, logWeight, updateProfile, getLatestWeight } = useApp()
  const { getRecentWorkouts, workouts } = useGym()
  const { updateWater, getTodayLog: getNutritionTodayLog, logs: nutritionLogs, mealTemplates } = useNutrition()
  const { logDaily, getTodayLog: getCardioTodayLog, dailyLog: cardioDailyLog } = useCardio()
  const { getTodayMacros, getProgress } = useMacros()
  const { streak } = useStreak()

  const today = todayKey()
  const latestWeight = getLatestWeight()
  const todayMacros = getTodayMacros()
  const todayProgress = getProgress(today)
  const cardioToday = getCardioTodayLog()
  const nutritionToday = getNutritionTodayLog()
  const recentWorkouts = getRecentWorkouts(3)

  // Count workouts this week (last 7 days)
  const last7 = getLast7Days()
  const workoutsThisWeek = workouts.filter((w) => last7.includes(w.date)).length

  // Greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // Quick log state
  const [quickWeight, setQuickWeight] = useState(
    latestWeight != null ? weightInUnit(latestWeight, profile.weightUnit) : ''
  )
  const [quickWater, setQuickWater] = useState(nutritionToday.water || 0)
  const [quickMood, setQuickMood] = useState(profile.moodLog?.[today] || 0)
  const [quickSteps, setQuickSteps] = useState(cardioToday.steps || '')
  const [quickCalBurned, setQuickCalBurned] = useState(cardioToday.caloriesBurned || '')

  function handleQuickSave() {
    if (quickWeight) {
      let wKg = parseFloat(quickWeight)
      if (profile.weightUnit === 'lbs') {
        wKg = wKg / 2.20462
      }
      logWeight(Math.round(wKg * 10) / 10)
    }
    updateWater(today, quickWater)
    if (quickMood > 0) {
      updateProfile({ moodLog: { ...profile.moodLog, [today]: quickMood } })
    }
    const steps = parseInt(quickSteps) || 0
    const calBurned = parseInt(quickCalBurned) || 0
    if (steps || calBurned) {
      logDaily(today, { steps, caloriesBurned: calBurned })
    }
  }

  // Chart data
  const last30 = getLast30Days()

  const weightChartData = useMemo(() => {
    return last30
      .filter((d) => profile.weightLog[d] != null)
      .map((d) => ({
        date: d.slice(5),
        weight: weightInUnit(profile.weightLog[d], profile.weightUnit),
      }))
  }, [profile.weightLog, profile.weightUnit, last30])

  // Calories vs weight chart data
  const last30DaysData = useMemo(() => {
    return getLast30DaysData(profile.weightLog, nutritionLogs, mealTemplates)
  }, [profile.weightLog, nutritionLogs, mealTemplates])

  const hasEnoughDualData = useMemo(() => {
    let count = 0
    last30DaysData.forEach((d) => { if (d.weight != null && d.calories != null) count++ })
    return count >= 3
  }, [last30DaysData])

  // Steps chart data (last 7 days)
  const stepsChartData = useMemo(() => {
    return last7.map((d) => ({
      date: d.slice(5),
      steps: cardioDailyLog[d]?.steps || 0,
    }))
  }, [cardioDailyLog, last7])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {greeting}, {profile.name}
        </h1>
        <p className="text-sm text-gray-500">{formatDate(today)}</p>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="mb-4 text-sm text-gray-700">
          🔥 <span className="font-medium">{streak}-day streak</span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
        <StatCard
          label="Weight"
          value={latestWeight != null ? weightInUnit(latestWeight, profile.weightUnit) : '—'}
          unit={profile.weightUnit}
        />
        <StatCard
          label="Calories"
          value={`${todayMacros.calories} / ${profile.calorieTarget || '—'}`}
          unit="kcal"
        />
        <StatCard
          label="Steps"
          value={cardioToday.steps || 0}
        />
        <StatCard
          label="Workouts"
          value={workoutsThisWeek}
          delta="this week"
        />
      </div>

      {/* Quick log form */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Today's Log
        </h2>
        <div className="space-y-3">
          {/* Weight */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 w-28">Weight ({profile.weightUnit})</label>
            <input
              type="number"
              step="0.1"
              value={quickWeight}
              onChange={(e) => setQuickWeight(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
            />
          </div>

          {/* Water */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">Water (glasses)</label>
            <div className="flex gap-1">
              {Array.from({ length: 8 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQuickWater(i + 1)}
                  className={`w-8 h-8 rounded text-xs font-medium ${
                    i < quickWater
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">Energy / Mood</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setQuickMood(val)}
                  className={`w-8 h-8 rounded-full text-xs font-medium ${
                    val <= quickMood
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-400'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 w-28">Steps</label>
            <input
              type="number"
              value={quickSteps}
              onChange={(e) => setQuickSteps(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
            />
          </div>

          {/* Calories burned */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 w-28">Cal burned</label>
            <input
              type="number"
              value={quickCalBurned}
              onChange={(e) => setQuickCalBurned(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
            />
          </div>

          <button
            type="button"
            onClick={handleQuickSave}
            className="bg-gray-800 text-white px-3 py-1 rounded text-sm"
          >
            Save
          </button>
        </div>
      </div>

      {/* Macro summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Macros Today
        </h2>
        <div className="space-y-3">
          <MacroBar
            label="Calories"
            current={todayMacros.calories}
            target={profile.calorieTarget || 0}
            unit="kcal"
            color="red"
          />
          <MacroBar
            label="Protein"
            current={todayMacros.protein}
            target={profile.proteinTarget || 0}
            unit="g"
            color="green"
          />
          <MacroBar
            label="Carbs"
            current={todayMacros.carbs}
            target={profile.carbTarget || 0}
            unit="g"
            color="yellow"
          />
          <MacroBar
            label="Fat"
            current={todayMacros.fat}
            target={profile.fatTarget || 0}
            unit="g"
            color="blue"
          />
        </div>
      </div>

      {/* Recent workouts */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Recent Workouts
        </h2>
        {recentWorkouts.length === 0 ? (
          <p className="text-sm text-gray-400">No workouts yet.</p>
        ) : (
          <div className="space-y-2">
            {recentWorkouts.map((w) => (
              <div key={w.id} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                <div>
                  <span className="font-medium text-gray-800">{w.name}</span>
                  <span className="text-gray-400 ml-2">{formatDate(w.date)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Weight trend */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Weight Trend (30 days)
          </h2>
          {weightChartData.length < 2 ? (
            <p className="text-sm text-gray-400">Start logging to see trends.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#3B82F6" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Calories vs Weight chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Calories vs Weight (30 Days)
          </h2>
          {!hasEnoughDualData ? (
            <p className="text-sm text-gray-400">Start logging to see trends.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={last30DaysData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="weight"
                  orientation="left"
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v}kg`}
                />
                <YAxis
                  yAxisId="calories"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip
                  formatter={(value, name) =>
                    name === 'weight' ? [`${value}kg`, 'Weight'] : [`${value} kcal`, 'Calories']
                  }
                />
                <Legend />
                <Line
                  yAxisId="weight"
                  type="monotone"
                  dataKey="weight"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={true}
                  name="weight"
                />
                <Bar
                  yAxisId="calories"
                  dataKey="calories"
                  fill="#FCD34D"
                  opacity={0.6}
                  name="calories"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Steps trend */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Steps (7 days)
          </h2>
          {stepsChartData.every((d) => d.steps === 0) ? (
            <p className="text-sm text-gray-400">Start logging to see trends.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stepsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="steps" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
