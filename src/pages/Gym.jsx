import { useState, useMemo } from 'react'
import { useGym } from '../contexts/GymContext'
import { useCardio } from '../contexts/CardioContext'
import { useWorkout } from '../hooks/useWorkout'
import { useMuscleMap } from '../hooks/useMuscleMap'
import { usePR } from '../hooks/usePR'
import SetRow from '../components/SetRow'
import ExerciseSearch from '../components/ExerciseSearch'
import BodyMapSVG from '../components/BodyMapSVG'
import { todayKey, formatDate, getLast7Days } from '../utils/dateHelpers'
import { getMusclesFromExercises } from '../data/exerciseMap'

export default function Gym() {
  const { workouts, prs, templates, addTemplate, deleteTemplate, getRecentWorkouts } = useGym()
  const { addSession, logDaily, getRecentSessions, getTodayLog: getCardioTodayLog } = useCardio()
  const {
    activeWorkout, isActive, startWorkout, addExercise, addSet,
    updateSet, toggleSetDone, finishWorkout, cancelWorkout, elapsedMinutes,
  } = useWorkout()
  const { getMusclesForDate, getRecoveryStatus } = useMuscleMap()
  const { getPRDisplay } = usePR()

  const [tab, setTab] = useState('weights')
  const [showPostWorkout, setShowPostWorkout] = useState(false)
  const [completedWorkoutMuscles, setCompletedWorkoutMuscles] = useState([])
  const [completedExercises, setCompletedExercises] = useState([])

  // Template creation
  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateExercises, setNewTemplateExercises] = useState([])

  // Cardio form
  const [cardioType, setCardioType] = useState('Walk')
  const [cardioDuration, setCardioDuration] = useState('')
  const [cardioDistance, setCardioDistance] = useState('')
  const [cardioNotes, setCardioNotes] = useState('')

  // Daily stats form
  const cardioToday = getCardioTodayLog()
  const [dailySteps, setDailySteps] = useState(cardioToday.steps || '')
  const [dailyCalBurned, setDailyCalBurned] = useState(cardioToday.caloriesBurned || '')

  const recentWorkouts = getRecentWorkouts(5)
  const recentSessions = getRecentSessions(5)

  // Recovery status body map
  const allMuscleIds = [
    'chest', 'front-deltoid', 'biceps', 'forearms', 'abs', 'quads', 'tibialis',
    'traps', 'rear-deltoid', 'triceps', 'lats', 'lower-back', 'glutes', 'hamstrings', 'calves',
  ]

  const recoveryColorMap = useMemo(() => {
    const map = {}
    allMuscleIds.forEach((id) => {
      const status = getRecoveryStatus(id)
      if (status === 'trained_today') map[id] = '#EF4444'
      else if (status === 'recovering') map[id] = '#F97316'
      else map[id] = '#22C55E'
    })
    return map
  }, [workouts])

  const recoveryActiveMuscles = allMuscleIds

  function handleStartFromTemplate(template) {
    startWorkout(template.name, template.exercises)
  }

  function handleFinishWorkout() {
    const completed = finishWorkout()
    if (completed) {
      const exerciseNames = completed.exercises.map((e) => e.name)
      const muscles = getMusclesFromExercises(exerciseNames)
      setCompletedWorkoutMuscles(muscles)
      setCompletedExercises(completed.exercises)
      setShowPostWorkout(true)
    }
  }

  function handleSaveTemplate() {
    if (!newTemplateName.trim() || newTemplateExercises.length === 0) return
    addTemplate({
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      exercises: newTemplateExercises,
    })
    setNewTemplateName('')
    setNewTemplateExercises([])
    setShowNewTemplate(false)
  }

  function handleSaveCardio() {
    addSession({
      id: Date.now().toString(),
      date: todayKey(),
      type: cardioType,
      durationMinutes: parseInt(cardioDuration) || 0,
      distanceKm: cardioDistance ? parseFloat(cardioDistance) : null,
      notes: cardioNotes || null,
    })
    setCardioDuration('')
    setCardioDistance('')
    setCardioNotes('')
  }

  function handleSaveDailyStats() {
    logDaily(todayKey(), {
      steps: parseInt(dailySteps) || 0,
      caloriesBurned: parseInt(dailyCalBurned) || 0,
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('weights')}
          className={`px-3 py-1 rounded text-sm ${tab === 'weights' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
        >
          Weights
        </button>
        <button
          onClick={() => setTab('cardio')}
          className={`px-3 py-1 rounded text-sm ${tab === 'cardio' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
        >
          Cardio
        </button>
      </div>

      {tab === 'weights' && (
        <>
          {/* Plan templates */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Templates
            </h2>
            <div className="flex flex-wrap gap-2 mb-2">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartFromTemplate(t)}
                    disabled={isActive}
                    className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t.name}
                  </button>
                  <button
                    onClick={() => deleteTemplate(t.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                    title="Delete template"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => setShowNewTemplate(!showNewTemplate)}
                className="border border-dashed border-gray-300 px-3 py-1 rounded text-sm text-gray-500"
              >
                + New template
              </button>
            </div>

            {showNewTemplate && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="Template name (e.g. Push day)"
                />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Exercises:</p>
                  {newTemplateExercises.map((ex, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm mb-1">
                      <span>{ex}</span>
                      <button
                        onClick={() => setNewTemplateExercises(newTemplateExercises.filter((_, j) => j !== i))}
                        className="text-xs text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {newTemplateExercises.length === 0 && (
                    <p className="text-xs text-gray-400">No exercises added</p>
                  )}
                </div>
                <ExerciseSearch
                  onSelect={(name) => setNewTemplateExercises([...newTemplateExercises, name])}
                  placeholder="Add exercise..."
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveTemplate} className="bg-gray-800 text-white px-3 py-1 rounded text-sm">
                    Save Template
                  </button>
                  <button onClick={() => setShowNewTemplate(false)} className="border border-gray-300 px-3 py-1 rounded text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active workout */}
          {isActive && activeWorkout && (
            <div className="bg-white border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-base font-medium text-gray-900">{activeWorkout.name}</h2>
                  <p className="text-xs text-gray-500">{elapsedMinutes} min elapsed</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleFinishWorkout} className="bg-gray-800 text-white px-3 py-1 rounded text-sm">
                    Finish
                  </button>
                  <button onClick={cancelWorkout} className="border border-gray-300 px-3 py-1 rounded text-sm text-red-500">
                    Cancel
                  </button>
                </div>
              </div>

              {activeWorkout.exercises.map((exercise, exIdx) => {
                const muscleGroups = getMusclesFromExercises([exercise.name])
                return (
                  <div key={exIdx} className="mb-4 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">{exercise.name}</span>
                      {muscleGroups.map((m) => (
                        <span key={m} className="text-xs bg-blue-100 text-blue-600 px-1 rounded">
                          {m}
                        </span>
                      ))}
                    </div>
                    {exercise.sets.map((set, setIdx) => (
                      <SetRow
                        key={setIdx}
                        setNumber={setIdx + 1}
                        reps={set.reps}
                        weight={set.weight}
                        done={set.done}
                        onRepsChange={(val) => updateSet(exIdx, setIdx, { reps: parseInt(val) || 0 })}
                        onWeightChange={(val) => updateSet(exIdx, setIdx, { weight: parseFloat(val) || 0 })}
                        onToggleDone={() => toggleSetDone(exIdx, setIdx)}
                      />
                    ))}
                    <button
                      onClick={() => addSet(exIdx, { reps: 0, weight: 0 })}
                      className="text-xs text-blue-600 mt-1"
                    >
                      + Add set
                    </button>
                  </div>
                )
              })}

              <div className="border-t border-gray-100 pt-3">
                <ExerciseSearch
                  onSelect={(name) => addExercise(name)}
                  placeholder="Add exercise..."
                />
              </div>
            </div>
          )}

          {/* Start empty workout if no template */}
          {!isActive && (
            <div className="mb-6">
              <button
                onClick={() => startWorkout('Quick workout', [])}
                className="border border-gray-300 px-3 py-1 rounded text-sm"
              >
                Start empty workout
              </button>
            </div>
          )}

          {/* Post-workout panel */}
          {showPostWorkout && (
            <div className="bg-white border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-sm font-medium text-green-700">Great work! You trained:</h2>
                <button
                  onClick={() => setShowPostWorkout(false)}
                  className="text-xs text-gray-400"
                >
                  Dismiss
                </button>
              </div>
              <BodyMapSVG activeMuscles={completedWorkoutMuscles} />
              <div className="mt-3 space-y-1">
                {completedExercises.map((ex, i) => {
                  const prDisplay = getPRDisplay(ex.name)
                  return (
                    <div key={i} className="text-sm flex justify-between">
                      <span>{ex.name}</span>
                      {prDisplay && (
                        <span className="text-blue-600 text-xs font-medium">PR: {prDisplay}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Weekly muscle volume */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Muscle Recovery Status
            </h2>
            <BodyMapSVG activeMuscles={recoveryActiveMuscles} colorMap={recoveryColorMap} />
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Fresh (48h+)
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Recovering
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Today
              </div>
            </div>
          </div>

          {/* Workout history */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Workout History
            </h2>
            {recentWorkouts.length === 0 ? (
              <p className="text-sm text-gray-400">No workouts yet.</p>
            ) : (
              <div className="space-y-2">
                {recentWorkouts.map((w) => (
                  <div key={w.id} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                    <div>
                      <span className="font-medium">{w.name}</span>
                      <span className="text-gray-400 ml-2">{formatDate(w.date)}</span>
                    </div>
                    <span className="text-gray-500">{w.exercises.length} exercises</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PR board */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              PR Board
            </h2>
            {Object.keys(prs).length === 0 ? (
              <p className="text-sm text-gray-400">No PRs yet. Start lifting!</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200">
                    <th className="pb-2">Exercise</th>
                    <th className="pb-2">Weight</th>
                    <th className="pb-2">Reps</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(prs).map(([name, pr]) => (
                    <tr key={name} className="border-b border-gray-50">
                      <td className="py-1 font-medium">{name}</td>
                      <td className="py-1">{pr.weight} kg</td>
                      <td className="py-1">{pr.reps}</td>
                      <td className="py-1 text-gray-500">{pr.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 'cardio' && (
        <>
          {/* Log cardio form */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Log Cardio Session
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Type</label>
                <select
                  value={cardioType}
                  onChange={(e) => setCardioType(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                >
                  {['Walk', 'Run', 'Cycle', 'Swim', 'HIIT', 'Other'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm text-gray-600 block mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={cardioDuration}
                    onChange={(e) => setCardioDuration(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-600 block mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cardioDistance}
                    onChange={(e) => setCardioDistance(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Notes</label>
                <input
                  type="text"
                  value={cardioNotes}
                  onChange={(e) => setCardioNotes(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                  placeholder="Optional"
                />
              </div>
              <button onClick={handleSaveCardio} className="bg-gray-800 text-white px-3 py-1 rounded text-sm">
                Save Session
              </button>
            </div>
          </div>

          {/* Daily stats form */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Daily Stats
            </h2>
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-1">Steps</label>
                <input
                  type="number"
                  value={dailySteps}
                  onChange={(e) => setDailySteps(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-1">Calories burned</label>
                <input
                  type="number"
                  value={dailyCalBurned}
                  onChange={(e) => setDailyCalBurned(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
              </div>
            </div>
            <button onClick={handleSaveDailyStats} className="bg-gray-800 text-white px-3 py-1 rounded text-sm">
              Save
            </button>
          </div>

          {/* Session history */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Session History
            </h2>
            {recentSessions.length === 0 ? (
              <p className="text-sm text-gray-400">No cardio sessions yet.</p>
            ) : (
              <div className="space-y-2">
                {recentSessions.map((s) => (
                  <div key={s.id} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                    <div>
                      <span className="font-medium">{s.type}</span>
                      <span className="text-gray-400 ml-2">{formatDate(s.date)}</span>
                    </div>
                    <span className="text-gray-500">
                      {s.durationMinutes} min
                      {s.distanceKm ? ` · ${s.distanceKm} km` : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
