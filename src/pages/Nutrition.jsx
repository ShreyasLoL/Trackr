import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { useNutrition } from '../contexts/NutritionContext'
import { useMacros } from '../hooks/useMacros'
import MacroBar from '../components/MacroBar'
import { todayKey } from '../utils/dateHelpers'

export default function Nutrition() {
  const { profile } = useApp()
  const {
    mealTemplates, logs, addMealTemplate, updateMealTemplate,
    deleteMealTemplate, logMeal, updateWater, getTodayLog,
  } = useNutrition()
  const { getTodayMacros } = useMacros()

  const today = todayKey()
  const todayMacros = getTodayMacros()
  const todayLog = getTodayLog()

  // Water
  const [water, setWater] = useState(todayLog.water || 0)

  // Meal logging mode
  const [logMode, setLogMode] = useState('template')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [templateQuantities, setTemplateQuantities] = useState({})

  // One-off entry
  const [oneOffName, setOneOffName] = useState('')
  const [oneOffCalories, setOneOffCalories] = useState('')
  const [oneOffProtein, setOneOffProtein] = useState('')
  const [oneOffCarbs, setOneOffCarbs] = useState('')
  const [oneOffFat, setOneOffFat] = useState('')

  // Template creation
  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [newTplName, setNewTplName] = useState('')
  const [newTplItems, setNewTplItems] = useState([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemType, setNewItemType] = useState('per100g')
  const [newItemCalories, setNewItemCalories] = useState('')
  const [newItemProtein, setNewItemProtein] = useState('')
  const [newItemCarbs, setNewItemCarbs] = useState('')
  const [newItemFat, setNewItemFat] = useState('')

  // Template editing
  const [editingTemplateId, setEditingTemplateId] = useState(null)
  const [editTplName, setEditTplName] = useState('')
  const [editTplItems, setEditTplItems] = useState([])

  function handleWaterClick(glasses) {
    setWater(glasses)
    updateWater(today, glasses)
  }

  // Template meal logging
  const selectedTemplate = mealTemplates.find((t) => t.id === selectedTemplateId)

  function computeTemplateMealMacros() {
    if (!selectedTemplate) return { calories: 0, protein: 0, carbs: 0, fat: 0 }
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    selectedTemplate.items.forEach((item) => {
      const qty = parseFloat(templateQuantities[item.name]) || 0
      if (item.trackingType === 'per100g' && item.per100g) {
        totals.calories += (qty / 100) * item.per100g.calories
        totals.protein += (qty / 100) * item.per100g.protein
        totals.carbs += (qty / 100) * item.per100g.carbs
        totals.fat += (qty / 100) * item.per100g.fat
      } else if (item.trackingType === 'perUnit' && item.perUnit) {
        totals.calories += qty * item.perUnit.calories
        totals.protein += qty * item.perUnit.protein
        totals.carbs += qty * item.perUnit.carbs
        totals.fat += qty * item.perUnit.fat
      }
    })
    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat),
    }
  }

  function handleLogTemplateMeal() {
    if (!selectedTemplate) return
    const items = selectedTemplate.items.map((item) => ({
      name: item.name,
      quantity: parseFloat(templateQuantities[item.name]) || 0,
      manualMacros: null,
    }))
    logMeal(today, {
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      items,
    })
    setTemplateQuantities({})
    setSelectedTemplateId('')
  }

  function handleLogOneOff() {
    if (!oneOffName.trim()) return
    logMeal(today, {
      templateId: null,
      templateName: 'One-off',
      items: [
        {
          name: oneOffName.trim(),
          quantity: 1,
          manualMacros: {
            calories: parseInt(oneOffCalories) || 0,
            protein: parseInt(oneOffProtein) || 0,
            carbs: parseInt(oneOffCarbs) || 0,
            fat: parseInt(oneOffFat) || 0,
          },
        },
      ],
    })
    setOneOffName('')
    setOneOffCalories('')
    setOneOffProtein('')
    setOneOffCarbs('')
    setOneOffFat('')
  }

  // Template CRUD
  function handleAddItem() {
    if (!newItemName.trim()) return
    const item = {
      name: newItemName.trim(),
      trackingType: newItemType,
    }
    const macros = {
      calories: parseFloat(newItemCalories) || 0,
      protein: parseFloat(newItemProtein) || 0,
      carbs: parseFloat(newItemCarbs) || 0,
      fat: parseFloat(newItemFat) || 0,
    }
    if (newItemType === 'per100g') {
      item.per100g = macros
    } else {
      item.perUnit = macros
    }
    setNewTplItems([...newTplItems, item])
    setNewItemName('')
    setNewItemCalories('')
    setNewItemProtein('')
    setNewItemCarbs('')
    setNewItemFat('')
  }

  function handleSaveNewTemplate() {
    if (!newTplName.trim() || newTplItems.length === 0) return
    addMealTemplate({
      id: Date.now().toString(),
      name: newTplName.trim(),
      items: newTplItems,
    })
    setNewTplName('')
    setNewTplItems([])
    setShowNewTemplate(false)
  }

  function handleStartEdit(tpl) {
    setEditingTemplateId(tpl.id)
    setEditTplName(tpl.name)
    setEditTplItems([...tpl.items])
  }

  function handleSaveEdit() {
    updateMealTemplate(editingTemplateId, {
      name: editTplName,
      items: editTplItems,
    })
    setEditingTemplateId(null)
  }

  // Compute today's logged meals macros
  function getMealMacros(meal) {
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    const template = mealTemplates.find((t) => t.id === meal.templateId)
    meal.items.forEach((item) => {
      if (item.manualMacros) {
        totals.calories += item.manualMacros.calories
        totals.protein += item.manualMacros.protein
        totals.carbs += item.manualMacros.carbs
        totals.fat += item.manualMacros.fat
      } else if (template) {
        const tplItem = template.items.find((ti) => ti.name === item.name)
        if (tplItem) {
          const qty = item.quantity || 0
          if (tplItem.trackingType === 'per100g' && tplItem.per100g) {
            totals.calories += (qty / 100) * tplItem.per100g.calories
            totals.protein += (qty / 100) * tplItem.per100g.protein
            totals.carbs += (qty / 100) * tplItem.per100g.carbs
            totals.fat += (qty / 100) * tplItem.per100g.fat
          } else if (tplItem.trackingType === 'perUnit' && tplItem.perUnit) {
            totals.calories += qty * tplItem.perUnit.calories
            totals.protein += qty * tplItem.perUnit.protein
            totals.carbs += qty * tplItem.perUnit.carbs
            totals.fat += qty * tplItem.perUnit.fat
          }
        }
      }
    })
    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat),
    }
  }

  const templateMealMacros = computeTemplateMealMacros()

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Today's macro summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Today's Macros
        </h2>
        <div className="space-y-3">
          <MacroBar label="Calories" current={todayMacros.calories} target={profile.calorieTarget || 0} unit="kcal" color="red" />
          <MacroBar label="Protein" current={todayMacros.protein} target={profile.proteinTarget || 0} unit="g" color="green" />
          <MacroBar label="Carbs" current={todayMacros.carbs} target={profile.carbTarget || 0} unit="g" color="yellow" />
          <MacroBar label="Fat" current={todayMacros.fat} target={profile.fatTarget || 0} unit="g" color="blue" />
        </div>
      </div>

      {/* Water tracker */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
          Water
        </h2>
        <div className="flex gap-1">
          {Array.from({ length: 8 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleWaterClick(i + 1)}
              className={`w-8 h-8 rounded text-xs font-medium ${
                i < water
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-400'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Log a meal */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Log a Meal
        </h2>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setLogMode('template')}
            className={`px-3 py-1 rounded text-sm ${logMode === 'template' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
          >
            From template
          </button>
          <button
            onClick={() => setLogMode('oneoff')}
            className={`px-3 py-1 rounded text-sm ${logMode === 'oneoff' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
          >
            One-off entry
          </button>
        </div>

        {logMode === 'template' && (
          <div className="space-y-3">
            <select
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(e.target.value)
                setTemplateQuantities({})
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
            >
              <option value="">Select a meal template...</option>
              {mealTemplates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            {selectedTemplate && (
              <>
                {selectedTemplate.items.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="text-sm flex-1">{item.name}</span>
                    <input
                      type="number"
                      value={templateQuantities[item.name] || ''}
                      onChange={(e) =>
                        setTemplateQuantities({
                          ...templateQuantities,
                          [item.name]: e.target.value,
                        })
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                      placeholder={item.trackingType === 'per100g' ? 'grams' : 'count'}
                    />
                    <span className="text-xs text-gray-400">
                      {item.trackingType === 'per100g' ? 'g' : 'units'}
                    </span>
                  </div>
                ))}
                <div className="text-xs text-gray-500 border-t border-gray-100 pt-2">
                  Preview: {templateMealMacros.calories} kcal · {templateMealMacros.protein}g P ·{' '}
                  {templateMealMacros.carbs}g C · {templateMealMacros.fat}g F
                </div>
                <button onClick={handleLogTemplateMeal} className="bg-gray-800 text-white px-3 py-1 rounded text-sm">
                  Log Meal
                </button>
              </>
            )}
          </div>
        )}

        {logMode === 'oneoff' && (
          <div className="space-y-3">
            <input
              type="text"
              value={oneOffName}
              onChange={(e) => setOneOffName(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
              placeholder="Food name"
            />
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-xs text-gray-500 block">Calories</label>
                <input
                  type="number"
                  value={oneOffCalories}
                  onChange={(e) => setOneOffCalories(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block">Protein (g)</label>
                <input
                  type="number"
                  value={oneOffProtein}
                  onChange={(e) => setOneOffProtein(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block">Carbs (g)</label>
                <input
                  type="number"
                  value={oneOffCarbs}
                  onChange={(e) => setOneOffCarbs(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block">Fat (g)</label>
                <input
                  type="number"
                  value={oneOffFat}
                  onChange={(e) => setOneOffFat(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
              </div>
            </div>
            <button onClick={handleLogOneOff} className="bg-gray-800 text-white px-3 py-1 rounded text-sm">
              Log Entry
            </button>
          </div>
        )}
      </div>

      {/* Today's meal log */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Today's Meals
        </h2>
        {todayLog.meals.length === 0 ? (
          <p className="text-sm text-gray-400">No meals logged today.</p>
        ) : (
          <div className="space-y-3">
            {todayLog.meals.map((meal, idx) => {
              const macros = getMealMacros(meal)
              return (
                <div key={idx} className="border-b border-gray-100 pb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{meal.templateName}</span>
                    <span className="text-xs text-gray-500">
                      {macros.calories} kcal · {macros.protein}g P · {macros.carbs}g C · {macros.fat}g F
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {meal.items.map((item) => item.name).join(', ')}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Meal templates manager */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Meal Templates
        </h2>

        {mealTemplates.length === 0 && !showNewTemplate && (
          <p className="text-sm text-gray-400 mb-3">No templates yet.</p>
        )}

        {mealTemplates.map((tpl) => (
          <div key={tpl.id} className="border-b border-gray-100 pb-3 mb-3">
            {editingTemplateId === tpl.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTplName}
                  onChange={(e) => setEditTplName(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
                {editTplItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span>{item.name}</span>
                    <span className="text-gray-400">({item.trackingType})</span>
                    <button
                      onClick={() => setEditTplItems(editTplItems.filter((_, j) => j !== i))}
                      className="text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <button onClick={handleSaveEdit} className="bg-gray-800 text-white px-3 py-1 rounded text-sm">
                    Save
                  </button>
                  <button onClick={() => setEditingTemplateId(null)} className="border border-gray-300 px-3 py-1 rounded text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-medium">{tpl.name}</span>
                  <div className="text-xs text-gray-400 mt-1">
                    {tpl.items.map((it) => it.name).join(', ')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleStartEdit(tpl)} className="text-xs text-blue-600">
                    Edit
                  </button>
                  <button onClick={() => deleteMealTemplate(tpl.id)} className="text-xs text-red-500">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {showNewTemplate ? (
          <div className="space-y-3 border border-gray-200 rounded-lg p-3">
            <input
              type="text"
              value={newTplName}
              onChange={(e) => setNewTplName(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
              placeholder="Template name"
            />

            {/* Current items */}
            {newTplItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs border-b border-gray-50 pb-1">
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-400">({item.trackingType})</span>
                <span className="text-gray-400">
                  {item.trackingType === 'per100g'
                    ? `${item.per100g.calories}kcal/100g`
                    : `${item.perUnit.calories}kcal/unit`
                  }
                </span>
                <button
                  onClick={() => setNewTplItems(newTplItems.filter((_, j) => j !== i))}
                  className="text-red-500 ml-auto"
                >
                  ×
                </button>
              </div>
            ))}

            {/* Add item form */}
            <div className="border border-dashed border-gray-200 rounded p-2 space-y-2">
              <p className="text-xs text-gray-500 font-medium">Add item:</p>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                placeholder="Item name"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewItemType('per100g')}
                  className={`px-2 py-1 rounded text-xs ${newItemType === 'per100g' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
                >
                  Per 100g
                </button>
                <button
                  type="button"
                  onClick={() => setNewItemType('perUnit')}
                  className={`px-2 py-1 rounded text-xs ${newItemType === 'perUnit' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
                >
                  Per unit
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1">
                <input type="number" value={newItemCalories} onChange={(e) => setNewItemCalories(e.target.value)} className="border border-gray-300 rounded px-1 py-1 text-xs" placeholder="Cal" />
                <input type="number" value={newItemProtein} onChange={(e) => setNewItemProtein(e.target.value)} className="border border-gray-300 rounded px-1 py-1 text-xs" placeholder="Protein" />
                <input type="number" value={newItemCarbs} onChange={(e) => setNewItemCarbs(e.target.value)} className="border border-gray-300 rounded px-1 py-1 text-xs" placeholder="Carbs" />
                <input type="number" value={newItemFat} onChange={(e) => setNewItemFat(e.target.value)} className="border border-gray-300 rounded px-1 py-1 text-xs" placeholder="Fat" />
              </div>
              <button onClick={handleAddItem} className="border border-gray-300 px-2 py-1 rounded text-xs">
                + Add item
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={handleSaveNewTemplate} className="bg-gray-800 text-white px-3 py-1 rounded text-sm">
                Save Template
              </button>
              <button onClick={() => { setShowNewTemplate(false); setNewTplItems([]) }} className="border border-gray-300 px-3 py-1 rounded text-sm">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNewTemplate(true)}
            className="border border-dashed border-gray-300 px-3 py-1 rounded text-sm text-gray-500"
          >
            + New template
          </button>
        )}
      </div>
    </div>
  )
}
