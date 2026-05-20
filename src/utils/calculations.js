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
