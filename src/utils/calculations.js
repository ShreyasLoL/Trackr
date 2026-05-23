export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

export function bmiCategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function calculateTDEE(weightKg, heightCm, ageYears, activityLevel) {
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;

  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const multiplier = multipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

export function calculateMacroCalories(protein, carbs, fat) {
  return protein * 4 + carbs * 4 + fat * 9;
}

export function weightInUnit(weightKg, unit) {
  if (unit === 'lbs') {
    return Math.round(weightKg * 2.20462 * 10) / 10;
  }
  return Math.round(weightKg * 10) / 10;
}

export function calculateBMR(weightKg, heightCm, ageYears) {
  // Mifflin-St Jeor equation (female variant — using -161)
  // BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161);
}

export function calculateTDEEFromBMR(bmr, activityLevel) {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const multiplier = multipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

export function calculateTargetCalories(tdee, goalMode) {
  const deltas = {
    extreme_fat_loss: -750,
    fat_loss: -400,
    maintenance: 0,
    weight_gain: 300,
    extreme_weight_gain: 600,
  };
  const delta = deltas[goalMode] || 0;
  const target = tdee + delta;
  return Math.max(1200, Math.round(target));
}

export function getGoalModeLabel(goalMode) {
  const labels = {
    extreme_fat_loss: 'Extreme Fat Loss',
    fat_loss: 'Fat Loss',
    maintenance: 'Maintenance',
    weight_gain: 'Weight Gain',
    extreme_weight_gain: 'Extreme Weight Gain',
  };
  return labels[goalMode] || goalMode;
}

export function getGoalModeDelta(goalMode) {
  const deltas = {
    extreme_fat_loss: '-750 kcal from TDEE',
    fat_loss: '-400 kcal from TDEE',
    maintenance: 'No change from TDEE',
    weight_gain: '+300 kcal from TDEE',
    extreme_weight_gain: '+600 kcal from TDEE',
  };
  return deltas[goalMode] || '';
}

export function calculateMealCalories(mealItems, mealTemplates) {
  let total = 0;
  mealItems.forEach((item) => {
    if (item.manualMacros) {
      total += item.manualMacros.calories || 0;
    } else {
      const template = mealTemplates.find((t) =>
        (t.items || []).some((ti) => ti.name === item.name)
      );
      if (template) {
        const tplItem = template.items.find((ti) => ti.name === item.name);
        if (tplItem) {
          const qty = item.quantity || 0;
          if (tplItem.trackingType === 'per100g' && tplItem.per100g) {
            total += (qty / 100) * (tplItem.per100g.calories || 0);
          } else if (tplItem.trackingType === 'perUnit' && tplItem.perUnit) {
            total += qty * (tplItem.perUnit.calories || 0);
          }
        }
      }
    }
  });
  return Math.round(total);
}
