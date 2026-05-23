import { useState, useMemo, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import { useGym } from '../contexts/GymContext'
import { useNutrition } from '../contexts/NutritionContext'
import { useCardio } from '../contexts/CardioContext'

const CELL_SIZE = 11
const CELL_GAP = 2
const TOTAL_CELL = CELL_SIZE + CELL_GAP

const COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function dateToKey(d) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTooltipDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

function buildHeatmapData(weightLog, nutritionLogs, gymWorkouts, cardioSessions) {
  const days = []
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = dateToKey(d)

    let score = 0
    const details = {
      weight: false,
      nutrition: false,
      workout: null,
      cardio: null,
    }

    // Weight
    if (weightLog && weightLog[key] != null) {
      score++
      details.weight = true
    }

    // Nutrition
    if (nutritionLogs && nutritionLogs[key]) {
      const dayLog = nutritionLogs[key]
      const meals = Array.isArray(dayLog) ? dayLog : dayLog.meals || []
      if (meals.length > 0) {
        score++
        details.nutrition = true
      }
    }

    // Gym workout
    const dayWorkouts = (gymWorkouts || []).filter((w) => w.date === key)
    if (dayWorkouts.length > 0) {
      score++
      details.workout = dayWorkouts[0].name
    }

    // Cardio session
    const daySessions = (cardioSessions || []).filter((s) => s.date === key)
    if (daySessions.length > 0) {
      score++
      details.cardio = `${daySessions[0].type} ${daySessions[0].durationMinutes || ''}min`.trim()
    }

    days.push({ date: key, score: Math.min(score, 4), details, dayOfWeek: d.getDay() })
  }

  return days
}

function computeStats(days) {
  const activeDays = days.filter((d) => d.score > 0).length

  // Current streak (from today backwards)
  let currentStreak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].score > 0) currentStreak++
    else break
  }

  // Longest streak
  let longestStreak = 0
  let streak = 0
  for (const d of days) {
    if (d.score > 0) {
      streak++
      longestStreak = Math.max(longestStreak, streak)
    } else {
      streak = 0
    }
  }

  // Consistency (last 90 days)
  const last90 = days.slice(-90)
  const active90 = last90.filter((d) => d.score > 0).length
  const consistency = Math.round((active90 / 90) * 100)

  return { activeDays, currentStreak, longestStreak, consistency }
}

export default function Heatmap() {
  const { profile } = useApp()
  const { workouts } = useGym()
  const { logs: nutritionLogs } = useNutrition()
  const { sessions: cardioSessions } = useCardio()

  const [tooltip, setTooltip] = useState(null)
  const svgContainerRef = useRef(null)

  const days = useMemo(
    () => buildHeatmapData(profile.weightLog, nutritionLogs, workouts, cardioSessions),
    [profile.weightLog, nutritionLogs, workouts, cardioSessions]
  )

  const stats = useMemo(() => computeStats(days), [days])

  // Build weeks grid
  // First day's dayOfWeek: 0=Sun, 1=Mon, ...
  // We want Mon=row 0, so map: Mon=0, Tue=1, ..., Sun=6
  // JS getDay: Sun=0, Mon=1, ..., Sat=6
  // Remap: rowIndex = (jsDay + 6) % 7  (Mon=0, Tue=1, ..., Sun=6)
  const weeks = useMemo(() => {
    const grid = []
    let currentWeek = new Array(7).fill(null)
    let weekIdx = 0

    days.forEach((day, i) => {
      const rowIdx = (day.dayOfWeek + 6) % 7 // Mon=0 ... Sun=6
      if (i > 0 && rowIdx === 0) {
        grid.push(currentWeek)
        currentWeek = new Array(7).fill(null)
        weekIdx++
      }
      currentWeek[rowIdx] = day
    })
    grid.push(currentWeek) // push last week
    return grid
  }, [days])

  // Month labels with positions
  const monthPositions = useMemo(() => {
    const positions = []
    let lastMonth = -1
    weeks.forEach((week, colIdx) => {
      const firstDay = week.find((d) => d != null)
      if (firstDay) {
        const [, m] = firstDay.date.split('-').map(Number)
        if (m !== lastMonth) {
          positions.push({ label: MONTH_LABELS[m - 1], x: colIdx * TOTAL_CELL })
          lastMonth = m
        }
      }
    })
    return positions
  }, [weeks])

  const svgWidth = weeks.length * TOTAL_CELL + 30 // 30px for day labels
  const svgHeight = 7 * TOTAL_CELL + 20 // 20px for month labels

  function handleMouseEnter(e, day) {
    if (!day || !svgContainerRef.current) return
    const rect = svgContainerRef.current.getBoundingClientRect()
    setTooltip({
      x: e.clientX - rect.left + 10,
      y: e.clientY - rect.top - 10,
      day,
    })
  }

  function handleMouseLeave() {
    setTooltip(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Activity</h1>
        <p className="text-sm text-gray-500">Your training consistency over the last year</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <p className="text-lg font-semibold text-gray-900">{stats.activeDays}</p>
          <p className="text-xs text-gray-500">Days active</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <p className="text-lg font-semibold text-gray-900">{stats.currentStreak}</p>
          <p className="text-xs text-gray-500">Current streak</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <p className="text-lg font-semibold text-gray-900">{stats.longestStreak}</p>
          <p className="text-xs text-gray-500">Longest streak</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <p className="text-lg font-semibold text-gray-900">{stats.consistency}%</p>
          <p className="text-xs text-gray-500">Consistency (90d)</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="overflow-x-auto" ref={svgContainerRef} style={{ position: 'relative' }}>
          <svg width={svgWidth} height={svgHeight}>
            {/* Month labels */}
            {monthPositions.map((mp, i) => (
              <text
                key={i}
                x={mp.x + 30}
                y={10}
                fontSize={10}
                fill="#6b7280"
              >
                {mp.label}
              </text>
            ))}

            {/* Day labels */}
            {DAY_LABELS.map((label, rowIdx) => (
              <text
                key={rowIdx}
                x={0}
                y={20 + rowIdx * TOTAL_CELL + CELL_SIZE - 1}
                fontSize={9}
                fill="#9ca3af"
              >
                {rowIdx % 2 === 0 ? label : ''}
              </text>
            ))}

            {/* Grid cells */}
            {weeks.map((week, colIdx) =>
              week.map((day, rowIdx) => {
                if (!day) return null
                return (
                  <rect
                    key={`${colIdx}-${rowIdx}`}
                    x={30 + colIdx * TOTAL_CELL}
                    y={20 + rowIdx * TOTAL_CELL}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    rx={2}
                    fill={COLORS[day.score]}
                    onMouseEnter={(e) => handleMouseEnter(e, day)}
                    onMouseLeave={handleMouseLeave}
                    style={{ cursor: 'pointer' }}
                  />
                )
              })
            )}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              style={{
                position: 'absolute',
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translateY(-100%)',
                pointerEvents: 'none',
              }}
              className="bg-gray-800 text-white text-xs rounded px-2 py-1.5 shadow-lg whitespace-nowrap z-10"
            >
              <p className="font-medium mb-1">{formatTooltipDate(tooltip.day.date)}</p>
              {tooltip.day.score === 0 ? (
                <p className="text-gray-300">Nothing logged</p>
              ) : (
                <div className="space-y-0.5">
                  {tooltip.day.details.weight && <p>✅ Weight logged</p>}
                  {tooltip.day.details.nutrition && <p>✅ Nutrition logged</p>}
                  {tooltip.day.details.workout && <p>✅ Workout: {tooltip.day.details.workout}</p>}
                  {tooltip.day.details.cardio && <p>✅ Cardio: {tooltip.day.details.cardio}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
          <span>Less</span>
          {COLORS.map((color, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: color,
                borderRadius: 2,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
