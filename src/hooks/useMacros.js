import { useContext, useCallback } from 'react';
import { NutritionContext } from '../contexts/NutritionContext';
import { AppContext } from '../contexts/AppContext';
import { todayKey } from '../utils/dateHelpers';

export function useMacros() {
  const { logs, mealTemplates } = useContext(NutritionContext);
  const { profile } = useContext(AppContext);

  const getDayMacros = useCallback(
    (dateString) => {
      const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      const dayLog = logs[dateString];
      if (!dayLog) return totals;

      const meals = Array.isArray(dayLog) ? dayLog : dayLog.meals || [];

      meals.forEach((meal) => {
        const template = mealTemplates.find((t) => t.id === meal.templateId);
        const items = meal.items || [];

        items.forEach((item) => {
          let itemCals = 0;
          let itemProtein = 0;
          let itemCarbs = 0;
          let itemFat = 0;
          const qty = item.quantity || 1;

          if (item.manualMacros) {
            itemCals = (item.manualMacros.calories || 0) * qty;
            itemProtein = (item.manualMacros.protein || 0) * qty;
            itemCarbs = (item.manualMacros.carbs || 0) * qty;
            itemFat = (item.manualMacros.fat || 0) * qty;
          } else if (template) {
            const templateItem = (template.items || []).find(
              (ti) => ti.name === item.name
            );
            if (templateItem) {
              if (templateItem.trackingType === 'per100g' && templateItem.per100g) {
                const factor = qty / 100;
                itemCals = (templateItem.per100g.calories || 0) * factor;
                itemProtein = (templateItem.per100g.protein || 0) * factor;
                itemCarbs = (templateItem.per100g.carbs || 0) * factor;
                itemFat = (templateItem.per100g.fat || 0) * factor;
              } else if (templateItem.trackingType === 'perUnit' && templateItem.perUnit) {
                itemCals = (templateItem.perUnit.calories || 0) * qty;
                itemProtein = (templateItem.perUnit.protein || 0) * qty;
                itemCarbs = (templateItem.perUnit.carbs || 0) * qty;
                itemFat = (templateItem.perUnit.fat || 0) * qty;
              }
            }
          }

          totals.calories += itemCals;
          totals.protein += itemProtein;
          totals.carbs += itemCarbs;
          totals.fat += itemFat;
        });
      });

      return {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
      };
    },
    [logs, mealTemplates]
  );

  const getTodayMacros = useCallback(() => {
    return getDayMacros(todayKey());
  }, [getDayMacros]);

  const getProgress = useCallback(
    (dateString) => {
      const macros = getDayMacros(dateString);
      const calorieTarget = profile?.calorieTarget || 0;
      const proteinTarget = profile?.proteinTarget || 0;
      const carbTarget = profile?.carbTarget || 0;
      const fatTarget = profile?.fatTarget || 0;

      return {
        calories: calorieTarget > 0
          ? Math.round((macros.calories / calorieTarget) * 100)
          : 0,
        protein: proteinTarget > 0
          ? Math.round((macros.protein / proteinTarget) * 100)
          : 0,
        carbs: carbTarget > 0
          ? Math.round((macros.carbs / carbTarget) * 100)
          : 0,
        fat: fatTarget > 0
          ? Math.round((macros.fat / fatTarget) * 100)
          : 0,
      };
    },
    [getDayMacros, profile]
  );

  return { getDayMacros, getTodayMacros, getProgress };
}
