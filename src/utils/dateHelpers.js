export function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function getLast30Days() {
  const days = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    days.push(`${year}-${month}-${day}`);
  }
  return days;
}

export function getLast7Days() {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    days.push(`${year}-${month}-${day}`);
  }
  return days;
}

export function calculateAge(birthdayString) {
  const [year, month, day] = birthdayString.split('-').map(Number);
  const birthday = new Date(year, month - 1, day);
  const now = new Date();
  let age = now.getFullYear() - birthday.getFullYear();
  const monthDiff = now.getMonth() - birthday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthday.getDate())) {
    age--;
  }
  return age;
}

export function calculateStreak(loggedDates) {
  if (!loggedDates || loggedDates.length === 0) return 0;

  const uniqueSorted = [...new Set(loggedDates)].sort().reverse();
  const today = todayKey();
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  if (uniqueSorted[0] !== today && uniqueSorted[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueSorted.length; i++) {
    const current = new Date(uniqueSorted[i - 1] + 'T00:00:00');
    const prev = new Date(uniqueSorted[i] + 'T00:00:00');
    const diffMs = current.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getLast30DaysData(weightLog, nutritionLogs, mealTemplates) {
  const days = getLast30Days();

  return days.map((dateKey) => {
    const weight = weightLog?.[dateKey] != null ? weightLog[dateKey] : null;

    let calories = null;
    const dayLog = nutritionLogs?.[dateKey];
    if (dayLog) {
      const meals = Array.isArray(dayLog) ? dayLog : dayLog.meals || [];
      let total = 0;
      meals.forEach((meal) => {
        const items = meal.items || [];
        items.forEach((item) => {
          if (item.manualMacros) {
            total += item.manualMacros.calories || 0;
          } else {
            const template = (mealTemplates || []).find((t) =>
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
      });
      calories = Math.round(total);
    }

    return {
      date: dateKey.slice(5), // "MM-DD"
      weight,
      calories,
    };
  });
}
