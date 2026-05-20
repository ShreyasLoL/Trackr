import { useState } from 'react'
import { useApp } from '../contexts/AppContext'

export default function Onboarding() {
  const { updateProfile, logWeight } = useApp()

  const [name, setName] = useState('')
  const [birthday, setBirthday] = useState('')
  const [heightMode, setHeightMode] = useState('cm')
  const [heightCm, setHeightCm] = useState('')
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')
  const [weight, setWeight] = useState('')
  const [goalWeight, setGoalWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState('kg')

  const isValid = name.trim() && birthday && weight

  function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return

    let finalHeightCm
    if (heightMode === 'cm') {
      finalHeightCm = parseFloat(heightCm) || 0
    } else {
      const ft = parseFloat(heightFt) || 0
      const inches = parseFloat(heightIn) || 0
      finalHeightCm = Math.round(ft * 30.48 + inches * 2.54)
    }

    let weightKg = parseFloat(weight)
    if (weightUnit === 'lbs') {
      weightKg = weightKg / 2.20462
    }
    weightKg = Math.round(weightKg * 10) / 10

    let goalWeightKg = null
    if (goalWeight) {
      goalWeightKg = parseFloat(goalWeight)
      if (weightUnit === 'lbs') {
        goalWeightKg = goalWeightKg / 2.20462
      }
      goalWeightKg = Math.round(goalWeightKg * 10) / 10
    }

    updateProfile({
      name: name.trim(),
      birthday,
      height: { value: finalHeightCm, unit: heightMode === 'cm' ? 'cm' : 'ft' },
      weightUnit,
      goalWeight: goalWeightKg,
      onboarded: true,
    })
    logWeight(weightKg)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Welcome to Trackr</h1>
        <p className="text-sm text-gray-500 mb-6">Set up your profile to get started.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="Your name"
            />
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Birthday *</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setHeightMode('cm')}
                className={`px-3 py-1 rounded text-sm ${heightMode === 'cm' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
              >
                cm
              </button>
              <button
                type="button"
                onClick={() => setHeightMode('ft')}
                className={`px-3 py-1 rounded text-sm ${heightMode === 'ft' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
              >
                ft/in
              </button>
            </div>
            {heightMode === 'cm' ? (
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="Height in cm"
              />
            ) : (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="Feet"
                />
                <input
                  type="number"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="Inches"
                />
              </div>
            )}
          </div>

          {/* Weight unit toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight unit</label>
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

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current weight ({weightUnit}) *
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder={`Weight in ${weightUnit}`}
            />
          </div>

          {/* Goal weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal weight ({weightUnit}) — optional
            </label>
            <input
              type="number"
              step="0.1"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="Optional"
            />
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-2 rounded text-sm font-medium ${
              isValid
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Get Started
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          All data is stored locally on your device.
        </p>
      </div>
    </div>
  )
}
