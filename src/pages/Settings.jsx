import { useState, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import { useCardio } from '../contexts/CardioContext'
import { calculateAge, calculateStreak, todayKey } from '../utils/dateHelpers'
import { calculateBMI, bmiCategory, calculateTDEE, weightInUnit } from '../utils/calculations'

export default function Settings() {
  const { profile, updateProfile, getLatestWeight } = useApp()
  const { logDaily, dailyLog } = useCardio()

  // Profile fields
  const [name, setName] = useState(profile.name)
  const [birthday, setBirthday] = useState(profile.birthday)
  const [heightValue, setHeightValue] = useState(profile.height?.value || '')
  const [heightUnit, setHeightUnit] = useState(profile.height?.unit || 'cm')
  const [weightUnit, setWeightUnit] = useState(profile.weightUnit || 'kg')

  // Goals
  const [goalWeight, setGoalWeight] = useState(
    profile.goalWeight != null ? weightInUnit(profile.goalWeight, profile.weightUnit) : ''
  )
  const [calorieTarget, setCalorieTarget] = useState(profile.calorieTarget || '')
  const [proteinTarget, setProteinTarget] = useState(profile.proteinTarget || '')
  const [carbTarget, setCarbTarget] = useState(profile.carbTarget || '')
  const [fatTarget, setFatTarget] = useState(profile.fatTarget || '')
  const [stepTarget, setStepTarget] = useState(profile.stepTarget || 10000)

  // Activity level for TDEE
  const [activityLevel, setActivityLevel] = useState('moderate')

  // Import/export
  const importRef = useRef(null)
  const appleHealthRef = useRef(null)
  const [importStatus, setImportStatus] = useState('')
  const [appleHealthStatus, setAppleHealthStatus] = useState('')

  // Calculated values
  const latestWeight = getLatestWeight()
  const heightCm = profile.height?.value || 0
  const age = profile.birthday ? calculateAge(profile.birthday) : null
  const bmi = latestWeight && heightCm ? calculateBMI(latestWeight, heightCm) : null
  const bmiCat = bmi ? bmiCategory(bmi) : null
  const tdee = latestWeight && heightCm && age
    ? calculateTDEE(latestWeight, heightCm, age, activityLevel)
    : null

  function handleSaveProfile() {
    updateProfile({
      name,
      birthday,
      height: { value: parseFloat(heightValue) || 0, unit: heightUnit },
      weightUnit,
    })
  }

  function handleSaveGoals() {
    let goalWKg = null
    if (goalWeight) {
      goalWKg = parseFloat(goalWeight)
      if (weightUnit === 'lbs') {
        goalWKg = goalWKg / 2.20462
      }
      goalWKg = Math.round(goalWKg * 10) / 10
    }
    updateProfile({
      goalWeight: goalWKg,
      calorieTarget: parseInt(calorieTarget) || null,
      proteinTarget: parseInt(proteinTarget) || null,
      carbTarget: parseInt(carbTarget) || null,
      fatTarget: parseInt(fatTarget) || null,
      stepTarget: parseInt(stepTarget) || 10000,
    })
  }

  function handleExport() {
    const data = {}
    const keys = ['trackr_prefs', 'trackr_gym', 'trackr_nutrition', 'trackr_cardio']
    keys.forEach((key) => {
      const val = localStorage.getItem(key)
      if (val) {
        try {
          data[key] = JSON.parse(val)
        } catch {
          data[key] = val
        }
      }
    })
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trackr-export-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        const confirmed = window.confirm(
          'This will overwrite your existing data. Are you sure?'
        )
        if (!confirmed) return

        const keys = ['trackr_prefs', 'trackr_gym', 'trackr_nutrition', 'trackr_cardio']
        keys.forEach((key) => {
          if (data[key]) {
            localStorage.setItem(key, JSON.stringify(data[key]))
          }
        })
        setImportStatus('Import successful! Refresh the page to see changes.')
      } catch (err) {
        setImportStatus('Error: Invalid JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleClearData() {
    const confirmed = window.confirm(
      'This will permanently delete ALL your data. Are you sure?'
    )
    if (!confirmed) return

    const keys = ['trackr_prefs', 'trackr_gym', 'trackr_nutrition', 'trackr_cardio']
    keys.forEach((key) => localStorage.removeItem(key))
    window.location.reload()
  }

  function handleAppleHealthImport(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setAppleHealthStatus('Parsing XML...')

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(event.target.result, 'text/xml')
        const records = doc.querySelectorAll('Record')

        const stepsByDate = {}
        const caloriesByDate = {}

        records.forEach((record) => {
          const type = record.getAttribute('type')
          const startDate = record.getAttribute('startDate')
          const value = parseFloat(record.getAttribute('value')) || 0

          if (!startDate) return

          // Extract date as YYYY-MM-DD from the startDate string
          const dateStr = startDate.slice(0, 10)

          if (type === 'HKQuantityTypeIdentifierStepCount') {
            stepsByDate[dateStr] = (stepsByDate[dateStr] || 0) + value
          } else if (type === 'HKQuantityTypeIdentifierActiveEnergyBurned') {
            caloriesByDate[dateStr] = (caloriesByDate[dateStr] || 0) + value
          }
        })

        let importedSteps = 0
        let importedCalories = 0
        let skipped = 0

        const allDates = new Set([...Object.keys(stepsByDate), ...Object.keys(caloriesByDate)])

        allDates.forEach((date) => {
          // Skip if date already has data
          if (dailyLog[date]) {
            skipped++
            return
          }

          const steps = Math.round(stepsByDate[date] || 0)
          const caloriesBurned = Math.round(caloriesByDate[date] || 0)

          logDaily(date, { steps, caloriesBurned })

          if (stepsByDate[date]) importedSteps++
          if (caloriesByDate[date]) importedCalories++
        })

        setAppleHealthStatus(
          `Imported ${importedSteps} days of step data, ${importedCalories} days of calorie data. ${skipped} days skipped (already had data).`
        )
      } catch (err) {
        setAppleHealthStatus('Error parsing Apple Health XML. Please check the file format.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Settings</h1>

      {/* Profile */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Profile
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Birthday</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Height ({heightUnit})</label>
            <input
              type="number"
              value={heightValue}
              onChange={(e) => setHeightValue(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-48"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Weight unit</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setWeightUnit('kg')}
                className={`px-3 py-1 rounded text-sm ${weightUnit === 'kg' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
              >
                KG
              </button>
              <button
                type="button"
                onClick={() => setWeightUnit('lbs')}
                className={`px-3 py-1 rounded text-sm ${weightUnit === 'lbs' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
              >
                LBS
              </button>
            </div>
          </div>
          <button onClick={handleSaveProfile} className="bg-gray-800 text-white px-3 py-1 rounded text-sm">
            Save Profile
          </button>
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Goals
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Goal weight ({weightUnit})</label>
            <input
              type="number"
              step="0.1"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-48"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Daily calorie target (kcal)</label>
            <input
              type="number"
              value={calorieTarget}
              onChange={(e) => setCalorieTarget(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-48"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Protein (g)</label>
              <input
                type="number"
                value={proteinTarget}
                onChange={(e) => setProteinTarget(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Carbs (g)</label>
              <input
                type="number"
                value={carbTarget}
                onChange={(e) => setCarbTarget(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Fat (g)</label>
              <input
                type="number"
                value={fatTarget}
                onChange={(e) => setFatTarget(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Daily step target</label>
            <input
              type="number"
              value={stepTarget}
              onChange={(e) => setStepTarget(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-48"
            />
          </div>
          <button onClick={handleSaveGoals} className="bg-gray-800 text-white px-3 py-1 rounded text-sm">
            Save Goals
          </button>
        </div>
      </div>

      {/* Calculated info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Calculated Info
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Age</span>
            <span className="font-medium">{age != null ? `${age} years` : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">BMI</span>
            <span className="font-medium">
              {bmi != null ? `${bmi} (${bmiCat})` : '—'}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-gray-600">Estimated TDEE</span>
              <div className="flex gap-1 mt-1">
                {['sedentary', 'light', 'moderate', 'active', 'very_active'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setActivityLevel(level)}
                    className={`px-1 py-0.5 rounded text-xs ${
                      activityLevel === level ? 'bg-blue-600 text-white' : 'border border-gray-300'
                    }`}
                  >
                    {level.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <span className="font-medium">{tdee != null ? `${tdee} kcal/day` : '—'}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Set your own calorie target in the Goals section above.
          </p>
        </div>
      </div>

      {/* Data management */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Data Management
        </h2>
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleExport} className="bg-gray-800 text-white px-3 py-1 rounded text-sm">
              Export all data
            </button>
            <button
              onClick={() => importRef.current?.click()}
              className="border border-gray-300 px-3 py-1 rounded text-sm"
            >
              Import data
            </button>
            <input
              ref={importRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <button onClick={handleClearData} className="border border-red-300 text-red-500 px-3 py-1 rounded text-sm">
              Clear all data
            </button>
          </div>
          {importStatus && (
            <p className={`text-sm ${importStatus.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
              {importStatus}
            </p>
          )}
        </div>
      </div>

      {/* Apple Health import */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
          Advanced — Apple Health Import
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          Import step count and active energy data from an Apple Health XML export.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => appleHealthRef.current?.click()}
            className="border border-gray-300 px-3 py-1 rounded text-sm"
          >
            Choose XML file
          </button>
          <input
            ref={appleHealthRef}
            type="file"
            accept=".xml"
            onChange={handleAppleHealthImport}
            className="hidden"
          />
          {appleHealthStatus && (
            <p className={`text-sm ${appleHealthStatus.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
              {appleHealthStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
