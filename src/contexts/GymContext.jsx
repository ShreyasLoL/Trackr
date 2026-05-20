import { createContext, useContext, useCallback, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { detectPRs } from "../hooks/usePR";

const initialState = {
  workouts: [],
  prs: {},
  templates: [],
};

export const GymContext = createContext();

export function useGym() {
  return useContext(GymContext);
}

export function GymProvider({ children }) {
  const [state, setState] = useLocalStorage("trackr_gym", initialState);

  const saveWorkout = useCallback(
    (workoutObject) => {
      setState((prev) => {
        const updatedPRs = detectPRs(workoutObject.exercises, prev.prs);
        return {
          ...prev,
          workouts: [...prev.workouts, workoutObject],
          prs: updatedPRs,
        };
      });
    },
    [setState]
  );

  const addTemplate = useCallback(
    (templateObject) => {
      setState((prev) => ({
        ...prev,
        templates: [...prev.templates, templateObject],
      }));
    },
    [setState]
  );

  const updateTemplate = useCallback(
    (id, updates) => {
      setState((prev) => ({
        ...prev,
        templates: prev.templates.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      }));
    },
    [setState]
  );

  const deleteTemplate = useCallback(
    (id) => {
      setState((prev) => ({
        ...prev,
        templates: prev.templates.filter((t) => t.id !== id),
      }));
    },
    [setState]
  );

  const getWorkoutsForDate = useCallback(
    (dateString) => {
      return state.workouts.filter((w) => w.date === dateString);
    },
    [state.workouts]
  );

  const getRecentWorkouts = useCallback(
    (n) => {
      return [...state.workouts]
        .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0))
        .slice(0, n);
    },
    [state.workouts]
  );

  const getPR = useCallback(
    (exerciseName) => {
      return state.prs[exerciseName] || null;
    },
    [state.prs]
  );

  const value = useMemo(
    () => ({
      workouts: state.workouts,
      prs: state.prs,
      templates: state.templates,
      saveWorkout,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      getWorkoutsForDate,
      getRecentWorkouts,
      getPR,
    }),
    [
      state.workouts,
      state.prs,
      state.templates,
      saveWorkout,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      getWorkoutsForDate,
      getRecentWorkouts,
      getPR,
    ]
  );

  return <GymContext.Provider value={value}>{children}</GymContext.Provider>;
}
