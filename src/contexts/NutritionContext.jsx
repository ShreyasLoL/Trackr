import { createContext, useContext, useCallback, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { todayKey } from "../utils/dateHelpers";

const initialState = {
  mealTemplates: [],
  logs: {},
};

export const NutritionContext = createContext();

export function useNutrition() {
  return useContext(NutritionContext);
}

export function NutritionProvider({ children }) {
  const [state, setState] = useLocalStorage("trackr_nutrition", initialState);

  const addMealTemplate = useCallback(
    (templateObject) => {
      setState((prev) => ({
        ...prev,
        mealTemplates: [...prev.mealTemplates, templateObject],
      }));
    },
    [setState]
  );

  const updateMealTemplate = useCallback(
    (id, updates) => {
      setState((prev) => ({
        ...prev,
        mealTemplates: prev.mealTemplates.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      }));
    },
    [setState]
  );

  const deleteMealTemplate = useCallback(
    (id) => {
      setState((prev) => ({
        ...prev,
        mealTemplates: prev.mealTemplates.filter((t) => t.id !== id),
      }));
    },
    [setState]
  );

  const logMeal = useCallback(
    (dateString, mealLogObject) => {
      setState((prev) => {
        const existing = prev.logs[dateString] || { meals: [], water: 0 };
        return {
          ...prev,
          logs: {
            ...prev.logs,
            [dateString]: {
              ...existing,
              meals: [...existing.meals, mealLogObject],
            },
          },
        };
      });
    },
    [setState]
  );

  const updateWater = useCallback(
    (dateString, glasses) => {
      setState((prev) => {
        const existing = prev.logs[dateString] || { meals: [], water: 0 };
        return {
          ...prev,
          logs: {
            ...prev.logs,
            [dateString]: {
              ...existing,
              water: glasses,
            },
          },
        };
      });
    },
    [setState]
  );

  const getLogForDate = useCallback(
    (dateString) => {
      return state.logs[dateString] || { meals: [], water: 0 };
    },
    [state.logs]
  );

  const getTodayLog = useCallback(() => {
    return getLogForDate(todayKey());
  }, [getLogForDate]);

  const value = useMemo(
    () => ({
      mealTemplates: state.mealTemplates,
      logs: state.logs,
      addMealTemplate,
      updateMealTemplate,
      deleteMealTemplate,
      logMeal,
      updateWater,
      getLogForDate,
      getTodayLog,
    }),
    [
      state.mealTemplates,
      state.logs,
      addMealTemplate,
      updateMealTemplate,
      deleteMealTemplate,
      logMeal,
      updateWater,
      getLogForDate,
      getTodayLog,
    ]
  );

  return (
    <NutritionContext.Provider value={value}>
      {children}
    </NutritionContext.Provider>
  );
}
